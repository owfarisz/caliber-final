import type {Dataset,Material} from './types';
import {stockPosition,timePhasedReadiness,type WorkspaceState} from './domain';
import {addDays,simulateCondition,type ConditionScenarioInput} from './monitoring';
const order={A:0,B:1,C:2,S:3,Unknown:4};
function quantile(values:number[],p:number){if(!values.length)return null;const x=[...values].sort((a,b)=>a-b);return x[Math.min(x.length-1,Math.floor((x.length-1)*p))];}
export function materialPlan(data:Dataset,state:WorkspaceState,m:Material,horizon=30){
 const position=stockPosition(state,data,m.id),active=state.activePolicies.find(p=>p.materialId===m.id);const known=m.issueRows>0&&m.historyDays>0;
 const rate=known?m.totalIssued/m.historyDays:null;const expected=rate===null?null:rate*horizon;
 const lead=quantile(m.leadDays,.8);const leadDays=lead===null?30:Math.max(1,Math.ceil(lead));
 // Nonparametric history windows preserve zero-demand days and intermittent demand.
 const daily=new Map(m.daily);const windows:number[]=[];if(known)for(let start=0;start+horizon<=m.historyDays;start+=Math.max(1,Math.floor(horizon/2))){let sum=0;for(let d=0;d<horizon;d++)sum+=daily.get(addDays(data.historyStart,start+d))||0;windows.push(sum);}
 const lower=quantile(windows,.1),upper=quantile(windows,.9);
 const floor=active?.strategicFloor||0;const recommendedMin=rate===null?null:Math.max(floor,Math.ceil(rate*leadDays));const recommendedMax=rate===null?null:Math.max(recommendedMin!,Math.ceil(rate*(leadDays+horizon)));
 const min=active?.min??m.currentMin,max=active?.max??m.currentMax;
 const reorderQuantity=recommendedMax===null?null:Math.max(0,Math.ceil(recommendedMax-position.position));
 const readiness=timePhasedReadiness(state,data,m.id,addDays(state.asOfDate,horizon));
 const override=state.masterOverrides.find(o=>o.materialId===m.id);const criticality=override?.criticality||m.criticality;
 const status=readiness.shortage>0?'Committed shortage':position.available<min?'Below active minimum':!known?'Demand unknown':max>0&&position.onHand>max?'Above active maximum':'Within policy';
 const existing=state.prs.filter(p=>p.materialId===m.id);
 return {name:override?.name||m.name,unit:m.unit,criticality,...position,expected,lower,upper,leadDays,leadBasis:lead===null?'Assumed 30 days':'Historical P80',importedMin:m.currentMin,importedMax:m.currentMax,activeMin:min,activeMax:max,policyVersion:active?.version||0,recommendedMin,recommendedMax,reorderQuantity,status,readiness,existing,orderBy:readiness.earliestGap?addDays(readiness.earliestGap,-leadDays):null,confidence:known?(m.suspectRows?'Review duplicate issue rows':'Historical intermittent demand'):'No issue history — unknown',priceProxy:m.lineUnitEstimate,currency:m.currency};
}
export function inventoryPlan(data:Dataset,state:WorkspaceState,horizon=30){return data.materials.map(m=>materialPlan(data,state,m,horizon)).sort((a,b)=>Number(b.readiness.shortage>0)-Number(a.readiness.shortage>0)||order[a.criticality]-order[b.criticality]||a.materialId.localeCompare(b.materialId));}
export function simulate(data:Dataset,state:WorkspaceState,input:ConditionScenarioInput){
 const projection=simulateCondition(data,state,input);const m=data.materials.find(m=>m.id===input.materialId)!;const p=stockPosition(state,data,m.id);const readiness=timePhasedReadiness(state,data,m.id,addDays(state.asOfDate,input.horizonDays));
 const inbound=state.pos.filter(po=>po.materialId===m.id&&addDays(po.eta,input.supplyDelayDays)<=input.needBy).reduce((n,po)=>n+po.quantity-po.receivedQuantity,0);
 const approvedBefore=state.requests.flatMap(r=>r.lines.map(l=>({r,l}))).filter(({l})=>l.materialId===m.id&&l.needBy<=input.needBy).reduce((n,{r,l})=>{const issued=-state.ledger.filter(x=>x.requestId===r.id&&x.lineId===l.id&&x.effectiveDate<=state.asOfDate).reduce((q,x)=>q+x.quantity,0);return n+Math.max(0,l.approvedQuantity-issued)},0);
 const candidateShortage=Math.max(0,input.quantity-(p.onHand+inbound-approvedBefore));
 const price=input.priceProxy&&m.lineUnitEstimate!==null?m.lineUnitEstimate:null;
 const alternatives=(['Current operation','Changed / no action','Changed + mitigation'] as const).map((name,index)=>{const purchaseQuantity=index===2?candidateShortage:0;const purchase=price===null?null:purchaseQuantity*price;const averageStock=Math.max(0,p.onHand-(index===2?input.quantity:0)/2);const holding=price===null?null:averageStock*price*input.holdingRate*input.horizonDays/365;const intervention=index===2?input.interventionCost:0;const crossing=index===0?projection.crossing.baseline:index===1?projection.crossing.changed:projection.crossing.mitigation;const conditionalShortage=crossing&&candidateShortage>0?input.shortageEventCost:0;const total=purchase===null||holding===null||intervention===null||conditionalShortage===null?null:purchase+holding+intervention+conditionalShortage;return {name,purchaseQuantity,purchase,holding,intervention,conditionalShortage,total,currency:m.currency,crossing};});
 return {...projection,readiness:{...readiness,candidateShortage,datedInbound:inbound,availableAtNeed:p.onHand+inbound-approvedBefore,needBy:input.needBy},alternatives,priceBasis:price===null?'Unknown cost':'Opt-in historical PO line amount / PR quantity proxy',assumptions:[...projection.assumptions,'Candidate demand is additional to approved commitments. Simulation itself reserves nothing.','Shared conditional shortage event cost counted once per alternative; this is not expected loss.','Holding cost uses assumed average physical stock, not a reorder quantity. Historical price proxy is opt-in.']};
}
