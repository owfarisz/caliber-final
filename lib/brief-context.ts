import {requestFulfillment,type WorkspaceState} from './domain';

export function inventoryTaskContext(state:WorkspaceState,assetId:string,materialId:string,fallbackDate:string){
 const candidates=state.requests.filter(r=>r.assetId===assetId&&r.status!=='Rejected').flatMap(request=>request.lines.filter(l=>l.materialId===materialId).map(line=>({request,line}))).filter(({request,line})=>['Submitted','Under Review','Needs Clarification','Draft'].includes(request.status)||requestFulfillment(request,state).lines.some(l=>l.lineId===line.id&&l.outstanding>0)).sort((a,b)=>a.line.needBy.localeCompare(b.line.needBy));
 const selected=candidates[0];const request=selected?.request,line=selected?.line;
 const existingPR=request&&line?state.prs.find(p=>p.requestId===request.id&&p.lineId===line.id&&p.materialId===materialId):undefined;
 return {request,line,existingPR,needBy:line?.needBy||fallbackDate,pending:!!request&&['Submitted','Under Review'].includes(request.status),waiting:!!request&&['Draft','Needs Clarification'].includes(request.status)};
}
