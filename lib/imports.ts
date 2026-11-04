import type {Dataset,Material,Equipment} from './types';
import type {WorkspaceState,ImportKind} from './domain';
export function parseCSV(text:string):Record<string,string>[] {
 const rows:string[][]=[];let row:string[]=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(Boolean))rows.push(row);row=[];cell='';}else cell+=c;}
 if(quoted)throw Error('Unclosed quoted CSV field');row.push(cell);if(row.some(Boolean))rows.push(row);if(rows.length<2)throw Error('CSV needs a header and at least one data row');const headers=rows.shift()!.map(s=>s.replace(/^\uFEFF/,'').trim());if(headers.some(h=>!h)||new Set(headers).size!==headers.length)throw Error('Headers must be nonempty and unique');return rows.map((r,i)=>{if(r.length!==headers.length)throw Error(`Row ${i+2}: column count does not match header`);return Object.fromEntries(headers.map((h,j)=>[h,r[j].trim()]));});
}
const numeric=new Set(['onHand','currentMin','currentMax','quantity','amount','leadDays']);
export function normalizeImport(rows:Record<string,unknown>[]){return rows.map((row,i)=>Object.fromEntries(Object.entries(row).map(([k,v])=>{if(!numeric.has(k))return [k,v];if(v===''||v===null)throw Error(`Row ${i+2}: ${k} is missing, not zero`);const n=Number(v);if(!Number.isFinite(n))throw Error(`Row ${i+2}: invalid ${k}`);return [k,n];})));}
export async function hashFile(text:string){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');}
export function projectDataset(seed:Dataset,state:WorkspaceState):Dataset {
 if(!state.importBatches.length)return seed;const data:Dataset=structuredClone(seed);const materialMap=new Map(data.materials.map(m=>[m.id,m])),assetMap=new Map(data.equipment.map(a=>[a.id,a]));
 const history=new Map<string,Record<string,unknown>>(),procurement=new Map<string,Record<string,unknown>>();
 for(const batch of state.importBatches)for(const row of batch.rows){const key=batch.kind==='bom'?`${row.assetId}:${row.materialId}`:String(row.id);const exception=state.exceptions.find(e=>e.batchId===batch.id&&e.businessKey===key);if(exception&&!(exception.status==='Resolved'&&exception.disposition==='accept-source'))continue;
 if(batch.kind==='materials'){
  const id=String(row.id),old=materialMap.get(id);if(old){if(typeof row.name==='string')old.name=row.name;if(['A','B','C','S','Unknown'].includes(String(row.criticality)))old.criticality=row.criticality as Material['criticality'];if(typeof row.currentMin==='number')old.currentMin=row.currentMin;if(typeof row.currentMax==='number')old.currentMax=row.currentMax;}
  else {const m:Material={id,name:String(row.name||id),unit:String(row.unit),onHand:0,currentMin:Number(row.currentMin||0),currentMax:Number(row.currentMax||0),mrpType:'Imported',criticality:['A','B','C','S'].includes(String(row.criticality))?row.criticality as Material['criticality']:'Unknown',locations:[],daily:[],historyDays:data.historyDays,lastIssue:null,issueRows:0,suspectRows:0,attributed:{},totalIssued:0,leadDays:[],currency:null,amountMean:null,amountMedian:null,lineUnitEstimate:null,procurementRows:0};data.materials.push(m);materialMap.set(id,m);}
 }else if(batch.kind==='equipment'){const id=String(row.id);let a=assetMap.get(id);if(!a){a={id,name:String(row.name||id),criticality:'Unknown',materialIds:[],notificationCount:0,notifications:[],maintenance:[],cyclingRelevant:false,supportedIssueRows:0};data.equipment.push(a);assetMap.set(id,a);}if(typeof row.name==='string')a.name=row.name;if(['A','B','C','S'].includes(String(row.criticality)))a.criticality=row.criticality as Equipment['criticality'];
 }else if(batch.kind==='bom'){const a=assetMap.get(String(row.assetId)),m=materialMap.get(String(row.materialId));if(a&&m){if(!a.materialIds.includes(m.id))a.materialIds.push(m.id);if(!m.locations.includes(a.id))m.locations.push(a.id);}}
 else if(batch.kind==='movements')history.set(key,row);
 else if(batch.kind==='procurement')procurement.set(key,row);
 else if(batch.kind==='maintenance'){const a=assetMap.get(String(row.assetId));if(a){const rec={id:key,text:String(row.text||row.activity||'Imported historical maintenance'),cycle:String(row.cycle||''),start:String(row.date||row.start||''),nextDate:row.nextDate?String(row.nextDate):null};a.maintenance=a.maintenance.filter(m=>m.id!==key);a.maintenance.push(rec);}}
 }
 // Imports are historical analytics only. Opening physical stock always stays seed/zero.
 for(const row of history.values()){const m=materialMap.get(String(row.materialId));if(!m)continue;const date=String(row.date);if(date<data.historyStart||date>data.cutoff)continue;const qty=Number(row.quantity);const old=m.daily.find(d=>d[0]===date);if(old)old[1]+=qty;else m.daily.push([date,qty]);m.totalIssued+=qty;m.issueRows++;m.lastIssue=!m.lastIssue||date>m.lastIssue?date:m.lastIssue;}
 for(const row of procurement.values()){const m=materialMap.get(String(row.materialId));if(!m)continue;if(typeof row.leadDays==='number'&&row.leadDays>=0)m.leadDays.push(row.leadDays);m.procurementRows++;}
 data.audit={...data.audit,workspaceImportVersion:state.version,publishedBatches:state.importBatches.length,importNote:'Reviewed normalized rows update analytics. Opening stock is never replayed from imports. New material stock starts at zero.'};return data;
}
