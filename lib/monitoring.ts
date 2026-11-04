import type {Dataset} from './types';
import type {WorkspaceState,Metric} from './domain';
export const METRICS={
 velocityVibration:{label:'Velocity vibration RMS',unit:'mm/s',attention:4.5,critical:7.1,lowerBad:false,min:0,max:50},
 bearingTemperature:{label:'Bearing temperature',unit:'°C',attention:80,critical:95,lowerBad:false,min:-20,max:200},
 pressureDifferential:{label:'Pressure differential',unit:'bar',attention:1.2,critical:1.8,lowerBad:false,min:0,max:20},
 thermalPerformance:{label:'Thermal performance',unit:'%',attention:75,critical:60,lowerBad:true,min:0,max:100}
} as const;
export type AssetClass='rotating'|'exchanger'|'unsupported';
export function assetClass(id:string,name=''):AssetClass {return /(?:_HE-|heat exchanger)/i.test(id+' '+name)?'exchanger':/(?:_PP-|pump|compressor)/i.test(id+' '+name)?'rotating':'unsupported';}
export function addDays(date:string,days:number){return new Date(Date.parse(date+'T00:00:00Z')+days*86400000).toISOString().slice(0,10);}
export function demoAssets(data:Dataset){return [data.equipment.find(e=>e.id==='PX_PP-1155C')||data.equipment.find(e=>assetClass(e.id,e.name)==='rotating'),data.equipment.find(e=>e.id==='PX_HE-388A')||data.equipment.find(e=>assetClass(e.id,e.name)==='exchanger')].filter(Boolean) as Dataset['equipment'];}
export function metricStatus(metric:Metric,value:number):'Normal'|'Attention'|'Critical'{const d=METRICS[metric];return d.lowerBad?(value<=d.critical?'Critical':value<=d.attention?'Attention':'Normal'):(value>=d.critical?'Critical':value>=d.attention?'Attention':'Normal');}
export interface Sample {date:string;metric:Metric;value:number;unit:string;source:string}
export function observations(data:Dataset,state:WorkspaceState,assetId:string,cursor=state.asOfDate):Sample[]{
 const seed=demoAssets(data).find(e=>e.id===assetId);const rows:Sample[]=[];
 if(seed){const cls=assetClass(seed.id,seed.name);for(let n=0;n<30;n++){const date=addDays(data.cutoff,n-29);if(date>cursor)continue;const wave=Math.sin(n*1.7)*0.08;const values:Partial<Record<Metric,number>>=cls==='rotating'?{velocityVibration:3+n*.065+wave,bearingTemperature:71+n*.39+wave}:{pressureDifferential:.7+n*.022+wave*.2,thermalPerformance:88-n*.49+wave};for(const [metric,value] of Object.entries(values))rows.push({date,metric:metric as Metric,value:Math.round(value*100)/100,unit:METRICS[metric as Metric].unit,source:'Simulated demo reading'});}}
 for(const o of state.observations.filter(o=>o.assetId===assetId&&o.observedAt.slice(0,10)<=cursor))rows.push({date:o.observedAt.slice(0,10),metric:o.metric,value:o.value,unit:o.unit,source:o.source});
 return rows.sort((a,b)=>a.date.localeCompare(b.date));
}
export function condition(data:Dataset,state:WorkspaceState,assetId:string,cursor=state.asOfDate){const rows=observations(data,state,assetId,cursor);const latest=Object.keys(METRICS).map(m=>rows.filter(r=>r.metric===m).at(-1)).filter(Boolean) as Sample[];const fresh=latest.filter(r=>Date.parse(cursor)-Date.parse(r.date)<=3*86400000);const statuses=fresh.map(r=>metricStatus(r.metric,r.value));return {status:statuses.includes('Critical')?'Critical':statuses.includes('Attention')?'Attention':statuses.length?'Normal':'Unknown',fresh:!!fresh.length,latest,rows,assumption:'Illustrative demo thresholds; not calibrated engineering limits. Freshness window: 3 days.'};}
export interface ConditionScenarioInput {assetId:string;horizonDays:number;runtimeHours:number;loadPercent:number;throughputPercent:number;foulingRate:number;maintenanceDelayDays:number;supplyDelayDays:number;materialId:string;quantity:number;needBy:string;priceProxy:boolean;holdingRate:number;interventionCost:number|null;shortageEventCost:number|null}
export function scenarioHash(input:unknown){const s=JSON.stringify(input);let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return (h>>>0).toString(16);}
export function simulateCondition(data:Dataset,state:WorkspaceState,input:ConditionScenarioInput){
 const asset=data.equipment.find(e=>e.id===input.assetId);if(!asset)throw Error('Select a valid asset');const cls=assetClass(asset.id,asset.name);if(cls==='unsupported')throw Error('No condition model is defined for this asset class');
 const bounds:[number,number,number,string][]=[[input.horizonDays,1,180,'Horizon'],[input.runtimeHours,0,24,'Runtime'],[input.loadPercent,80,110,'Load'],[input.throughputPercent,80,110,'Throughput'],[input.foulingRate,0,3,'Fouling'],[input.maintenanceDelayDays,0,60,'Maintenance delay'],[input.supplyDelayDays,0,180,'Supply delay'],[input.quantity,1,100000,'Quantity'],[input.holdingRate,0,1,'Holding rate']];for(const [v,min,max,label] of bounds)if(!Number.isFinite(v)||v<min||v>max)throw Error(`${label} must be between ${min} and ${max}`);
 if(!asset.materialIds.includes(input.materialId))throw Error('Candidate material must belong to the selected asset BoM');if(!/^\d{4}-\d{2}-\d{2}$/.test(input.needBy)||input.needBy<state.asOfDate)throw Error('Need-by must be a current or future date');
 const c=condition(data,state,asset.id);if(!c.fresh)throw Error('Fresh condition evidence is required. Record a current observation first.');
 const metric:Metric=cls==='rotating'?'velocityVibration':'pressureDifferential';const observation=c.latest.find(r=>r.metric===metric);if(!observation||Date.parse(state.asOfDate)-Date.parse(observation.date)>3*86400000)throw Error('A fresh primary metric is required');
 const factor=cls==='rotating'?(input.runtimeHours/16)*(input.loadPercent/100)**2:(input.throughputPercent/100)*input.foulingRate;
 const slope=cls==='rotating'?.025:.009;const series=Array.from({length:input.horizonDays+1},(_,day)=>{const baseline=observation.value+slope*day;const changed=observation.value+slope*factor*day;const mitigation=day<=input.maintenanceDelayDays?changed:Math.max(0,observation.value*.72+slope*(day-input.maintenanceDelayDays)*.6);return {date:addDays(state.asOfDate,day),day,baseline,changed,mitigation,lower:changed*.85,upper:changed*1.15};});
 const crossing=(key:'baseline'|'changed'|'mitigation')=>series.find(p=>p[key]>=METRICS[metric].critical)?.date||null;
 return {inputHash:scenarioHash(input),workspaceVersion:state.version,baselineVersion:0,metric,unit:METRICS[metric].unit,series,crossing:{baseline:crossing('baseline'),changed:crossing('changed'),mitigation:crossing('mitigation')},assumptions:['Deterministic illustrative projection, not a calibrated failure probability.','Shaded ±15% range is an assumption envelope, not a statistical confidence interval.','Candidate BoM parts require technician confirmation; a threshold crossing does not prove part failure.','Maintenance recovery shown only in the scenario; recording maintenance does not change observed condition.'],class:cls};
}
