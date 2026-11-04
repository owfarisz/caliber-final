import type {Dataset} from './types';
import {applyCommand,type WorkspaceState,type Command} from './domain';
import {guidedCases} from './demo-cases';
import {addDays} from './monitoring';
import {simulate} from './planning';
import {supplierBrief} from './supplier';
export const DEMO_MARKER='guided-demo:v1:done';
export function seedGuidedDemo(data:Dataset,initial:WorkspaceState):WorkspaceState {
 if(initial.commandKeys[DEMO_MARKER])return initial;const cases=guidedCases(data);if(cases.length!==5)return initial;
 // Preserve existing work: callers must explicitly reset before replacing it.
 if(initial.requests.length||initial.ledger.length||initial.scenarios.length)return initial;
 let s=initial;let serial=0;const run=(type:Command['type'],payload:unknown,role:'Inventory'|'Technician'='Inventory',key?:string)=>{s=applyCommand(s,data,{type,payload,role,actor:'guided-demo-model',idempotencyKey:key||`guided-demo:v1:${++serial}`,expectedVersion:s.version} as Command);};
 for(const [i,c] of cases.entries()){
  const day=s.asOfDate,req=`DEMO-REQ-${i+1}`,line=`DEMO-LINE-${i+1}`;
  run('RecordObservation',{id:`DEMO-OBS-${i+1}`,assetId:c.assetId,metric:c.metric,value:c.value,unit:c.metric==='velocityVibration'?'mm/s':'bar',observedAt:day,source:'SIMULATED · guided model example',reason:c.signal},'Technician');
  const input={assetId:c.assetId,horizonDays:c.needDays>90?180:30,runtimeHours:20,loadPercent:105,throughputPercent:105,foulingRate:1.4,maintenanceDelayDays:7,supplyDelayDays:0,materialId:c.materialId,quantity:c.quantity,needBy:addDays(day,c.needDays),priceProxy:false,holdingRate:.2,interventionCost:null,shortageEventCost:null};const result=simulate(data,s,input);
  run('SaveScenario',{id:`DEMO-SCN-${i+1}`,assetId:c.assetId,revision:1,input,output:result,baselineVersion:0,workspaceVersion:s.version,inputHash:result.inputHash},'Technician');
  const quantity=i===4?2:c.quantity;
  run('SubmitRequest',{id:req,assetId:c.assetId,origin:`guided-demo:${c.id}`,scenarioId:`DEMO-SCN-${i+1}`,rationale:`SIMULATED DEMO · ${c.title}. ${c.story}`,scopeConfirmed:true,lines:[{id:line,materialId:c.materialId,quantity,needBy:addDays(day,c.needDays)}]},'Technician');
  if(i===0)continue;
  run('ReviewRequest',{requestId:req,decision:'Approved',reason:'SIMULATED DEMO · technician scope reviewed',lines:[{lineId:line,approvedQuantity:quantity}]});
  if(i===1){run('Reserve',{id:'DEMO-RES-2',requestId:req,lineId:line,quantity:2});run('RecordMaintenance',{id:'DEMO-MA-2',assetId:c.assetId,activity:'Cleaning-first intervention',start:day,end:day,failureMode:'Fouling hypothesis',action:'SIMULATED DEMO · inspect and clean exchanger; no material issue posted',followup:'Measure differential pressure before deciding to open equipment'},'Technician');continue;}
  if(i===2||i===3){
   if(i===3)run('Reserve',{id:'DEMO-RES-4',requestId:req,lineId:line,quantity:6});
   const vendor=supplierBrief(c.materialId,day,addDays(day,c.needDays)).recommended;
   run('ProceedReorder',{id:`DEMO-PR-${i+1}`,requestId:req,lineId:line,materialId:c.materialId,quantity:2,needBy:addDays(day,c.needDays),reason:'SIMULATED DEMO · close confirmed shortage'});
   run('ConfirmDemoPO',{id:`DEMO-PO-${i+1}`,prId:`DEMO-PR-${i+1}`,quantity:2,supplier:vendor?.supplier||'Demo supplier (unconfirmed)',eta:addDays(day,i===2?20:5),reason:'SIMULATED DEMO · illustrative confirmation; not a source open PO'});
   if(i===3){run('PostReceipt',{id:'DEMO-RECEIPT-4',poId:'DEMO-PO-4',quantity:1,effectiveDate:day,reason:'SIMULATED DEMO · partial receipt'});run('PostIssue',{id:'DEMO-ISSUE-4',requestId:req,lineId:line,quantity:1,effectiveDate:day,reason:'SIMULATED DEMO · staged intervention'});}
  }
  if(i===4)run('PostIssue',{id:'DEMO-ISSUE-5',requestId:req,lineId:line,quantity:2,effectiveDate:day,reason:'SIMULATED DEMO · completed prior task; plan the next shutdown separately'});
 }
 run('RecordVerification',{id:'DEMO-VERIFY-2',assetId:cases[1].assetId,maintenanceId:'DEMO-MA-2',reference:'SIMULATED DEMO · post-cleaning verification pending full acceptance',observedAt:s.asOfDate,notes:'No automatic condition recovery or parts consumption is inferred.'},'Technician',DEMO_MARKER);
 return s;
}
