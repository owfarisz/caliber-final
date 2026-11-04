import type {Dataset, Material, ScenarioInput, PolicyResult, Simulation} from './types';

export const defaultInput:ScenarioInput={functionalLocation:'PX_PP-1155C',operatingHoursPerDay:20,startStopCyclesPerDay:3,horizonDays:90,reviewPeriodDays:30,serviceLevel:null,leadTimeOverride:null,slowMovingDays:180,priceBasis:'unconfirmed',holdingCostRateAnnual:.18,downtimeLossPerEvent:100000};

export function validateInput(input:ScenarioInput,dataset:Dataset):ScenarioInput {
 if(!input || typeof input!=='object') throw new Error('Scenario input is required');
 if(!dataset.equipment.some(e=>e.id===input.functionalLocation)) throw new Error('Unknown functional location');
 const range=(name:keyof ScenarioInput,min:number,max:number,nullable=false)=>{const v=input[name];if(nullable&&v===null)return;if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw new Error(`Invalid ${name}: expected ${min}–${max}`);};
 range('operatingHoursPerDay',0,24);range('startStopCyclesPerDay',0,12);range('horizonDays',1,730);range('reviewPeriodDays',0,365);range('serviceLevel',.5,.9999,true);range('leadTimeOverride',1,730,true);range('slowMovingDays',1,3650,true);range('holdingCostRateAnnual',0,1);range('downtimeLossPerEvent',0,1e12);
 if(input.operatingHoursPerDay===0&&input.startStopCyclesPerDay>0)throw new Error('Zero runtime requires zero start–stop cycles');
 if(!['unconfirmed','unit_amount','line_total'].includes(input.priceBasis))throw new Error('Invalid price basis');
 return {...input};
}
function rng(key:string){let s=2166136261;for(const c of key)s=Math.imul(s^c.charCodeAt(0),16777619);return ()=>{s+=0x6D2B79F5;let t=Math.imul(s^(s>>>15),1|s);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};}
const mean=(a:number[])=>a.reduce((s,v)=>s+v,0)/a.length;
function quantile(a:number[],p:number){const b=[...a].sort((x,y)=>x-y);return b[Math.min(b.length-1,Math.ceil(p*b.length)-1)];}
// Exponential waiting times generate an exact Poisson event count. Positive-day
// issue sizes are empirical marks; runtime sensitivity changes occurrence rate.
function demand(rate:number,days:number,sizes:number[],random:()=>number){let clock=0,total=0;if(rate<=0||days<=0)return 0;while(true){clock+=-Math.log(Math.max(Number.MIN_VALUE,1-random()))/rate;if(clock>days)return total;total+=sizes[Math.floor(random()*sizes.length)];}}

export function calculate(material:Material,input:ScenarioInput,dataset:Dataset):PolicyResult {
 const equipment=dataset.equipment.find(e=>e.id===input.functionalLocation);
 const serviceLevel=input.serviceLevel??({A:.99,B:.975,C:.95,S:.9,Unknown:.95}[material.criticality]);
 const attributableShare=material.totalIssued>0?Math.max(0,Math.min(1,(material.attributed[input.functionalLocation]??0)/material.totalIssued)):0;
 const cycleFactor=equipment?.cyclingRelevant?Math.max(0,1+.15*(input.startStopCyclesPerDay/2-1)):1;
 const multiplier=1+attributableShare*(input.operatingHoursPerDay/16*cycleFactor-1);
 const leads=material.leadDays.filter(x=>Number.isFinite(x)&&x>=0);
 const leadDays=input.leadTimeOverride??(leads.length?mean(leads):60);
 const leadBasis=input.leadTimeOverride!==null?'User-assumed lead time':leads.length?'PR-to-PO delivery date proxy':'Assumed 60-day lead time';
 const sizes=material.daily.map(x=>x[1]).filter(x=>Number.isFinite(x)&&x>0);
 const known=material.issueRows>0&&material.historyDays>0&&sizes.length>0;
 const reasons=['Inventory position uses on-hand only; open supply and allocations are unconfirmed.',leadBasis+'.','Stock measurement date and scope are unknown.'];
 if(material.currentMin===0&&material.currentMax===0)reasons.push('Recorded zero Min–Max is unconfigured; review policy.');
 if(material.suspectRows>0)reasons.push(`${material.suspectRows} suspected duplicate issue rows retained; no transaction key confirms duplication.`);
 if(attributableShare>0)reasons.push(`${(attributableShare*100).toFixed(1)}% of historical quantity is attributable to the selected asset; runtime/cycle sensitivities are hypothetical.`);
 else reasons.push('No supported selected-asset demand attribution; material demand is unchanged.');
 if(!equipment?.cyclingRelevant)reasons.push('Cycling effect not applied for this equipment.');
 if(leadDays+input.reviewPeriodDays>input.horizonDays)reasons.push('Selected schedule is assumed to continue through the lead-time plus review-period window.');
 let expected:number|null=null,lower:number|null=null,upper:number|null=null,safetyStock:number|null=null,stockoutProbability:number|null=null;
 let min=Math.max(0,material.currentMin),max=Math.max(min,material.currentMax);
 if(known){
  const rate=sizes.length/material.historyDays*multiplier;
  expected=material.totalIssued/material.historyDays*input.horizonDays*multiplier;
  const seed=dataset.version+':'+material.id,lt:number[]=[],review:number[]=[],forecast:number[]=[];
  // Independent per-draw streams keep the same lead sample and marked events
  // across schedule comparisons. More exposure cannot lower a sampled demand.
  for(let i=0;i<512;i++){
   const lead=input.leadTimeOverride??(leads.length?leads[Math.floor(rng(seed+':lead:'+i)()*leads.length)]:60);
   const l=demand(rate,lead,sizes,rng(seed+':demand:'+i));
   lt.push(l);review.push(l+demand(rate,input.reviewPeriodDays,sizes,rng(seed+':review:'+i)));
   forecast.push(demand(rate,input.horizonDays,sizes,rng(seed+':forecast:'+i)));
  }
  min=Math.ceil(quantile(lt,serviceLevel));
  if(material.criticality==='A'||material.criticality==='B'){min=Math.max(min,material.currentMin);reasons.push('Recorded Min retained as an assumed conservative critical-spare floor.');}
  max=Math.max(min,Math.ceil(quantile(review,serviceLevel)));
  safetyStock=Math.max(0,min-Math.ceil(rate*mean(sizes)*leadDays));
  lower=quantile(forecast,.1);upper=quantile(forecast,.9);
  stockoutProbability=lt.filter(d=>d>material.onHand).length/512;
  reasons.push('512 seeded compound-Poisson / empirical-size draws; stationary history coverage assumed. Risk is a model estimate, not calibrated probability.');
 }else reasons.push('Insufficient issue history: forecast and risk unassessed; recorded policy is a provisional fallback.');
 const reorderQuantity=material.onHand<=min?Math.max(0,max-material.onHand):0;
 const excess=Math.max(0,material.onHand-max);
 let slowMoving:boolean|null=null;
 if(known&&input.slowMovingDays!==null&&material.historyDays>=input.slowMovingDays&&material.lastIssue){const age=(Date.parse(dataset.cutoff)-Date.parse(material.lastIssue))/86400000;if(Number.isFinite(age)&&age>=0)slowMoving=age>=input.slowMovingDays;}
 const rawPrice=input.priceBasis==='unit_amount'?material.amountMean:input.priceBasis==='line_total'?material.lineUnitEstimate:null;
 const unitPrice=material.currency&&rawPrice!==null&&Number.isFinite(rawPrice)&&rawPrice>=0?rawPrice:null;
 if(unitPrice!==null)reasons.push(input.priceBasis==='unit_amount'?'Illustrative price: PO amount interpreted as unit amount.':'Illustrative price: PO line total divided by PR quantity; PR quantity is not confirmed PO quantity.');
 else reasons.push('Valuation unavailable until a price interpretation and single-currency basis are established.');
 const action=reorderQuantity>0?`Reorder ${reorderQuantity} ${material.unit} for review`:!known?'Review insufficient history':slowMoving&&(material.criticality==='A'||material.criticality==='B')?'Retain critical standby stock':excess>0?'Review potential excess':'Monitor inventory';
 return {materialId:material.id,expected,lower,upper,safetyStock,reorderPoint:min,min,max,reorderQuantity,stockoutProbability,excess,slowMoving,action,leadDays,leadBasis,multiplier,attributableShare,unitPrice,currency:material.currency,purchaseCost:unitPrice===null?null:reorderQuantity*unitPrice,holdingCost:unitPrice===null?null:excess*unitPrice*input.holdingCostRateAnnual*input.horizonDays/365,shortageExposure:input.priceBasis==='unconfirmed'||stockoutProbability===null||!material.currency?null:stockoutProbability*input.downtimeLossPerEvent,mitigatedPreReceiptRisk:stockoutProbability,serviceLevel,confidence:known?'Scenario estimate — uncalibrated':'Insufficient history',reasons};
}
export function simulate(dataset:Dataset,input:ScenarioInput):Simulation {
 const validated=validateInput(input,dataset);
 const baselineInput={...validated,operatingHoursPerDay:16,startStopCyclesPerDay:2};
 return {input:validated,baseline:dataset.materials.map(m=>calculate(m,baselineInput,dataset)),scenario:dataset.materials.map(m=>calculate(m,validated,dataset)),datasetVersion:dataset.version,assumptions:['Historical replay as of '+dataset.cutoff+'; stock date unknown.','On-hand-only inventory position; no confirmed receipt timing.','Baseline 16 hours/day, 2 starts/day; fixed illustrative normal operating rate 85%.','Runtime elasticity 1 and cycling sensitivity 0.15 are hypothetical, not trained failure physics.','Cycling-relevant equipment classified by description; 12 starts/day is an assumed demo limit.','A/B recorded Min floor; service targets A 99%, B 97.5%, C 95%, S 90% are planning assumptions.','No additive maintenance material quantities inferred from the location-only plan link.','Replenishment cannot reduce pre-receipt stockout risk; no realized savings claimed.','Shortage exposure is modeled stockout probability × illustrative consequence per event, denominated separately in each material currency.']};
}
