import type {Kind} from '../components/EquipmentVisual';
import type {Equipment} from './types';
export const kindNames:Record<Kind,string>={compressor:'Compressor',exchanger:'Heat exchanger',pump:'Pump',motor:'Electric motor',valve:'Valve',tank:'Storage tank',vessel:'Process vessel',fan:'Industrial fan',instrument:'Field instrument',furnace:'Furnace',pipe:'Pipe section'};
export function equipmentKind(name:string):Kind|null {
 const s=name.toUpperCase();
 if(/\bVALVE\b/.test(s))return 'valve';
 if(/\bMOTOR\b/.test(s))return 'motor';
 if(/\bPUMP\b/.test(s))return 'pump';
 if(/\bFAN\b|\bBLOWER\b/.test(s))return 'fan';
 if(/\bCOMPRESSOR\b/.test(s))return 'compressor';
 if(/\b(EXCHANGER|CONDENSER|COOLER|REBOILER)\b/.test(s))return 'exchanger';
 if(/\bTANK\b/.test(s))return 'tank';
 if(/\b(VESSEL|DRUM|SEPARATOR|SCRUBBER|COLUMN)\b/.test(s))return 'vessel';
 if(/\bFURNACE\b/.test(s))return 'furnace';
 if(/^PIPE[- ]/.test(s))return 'pipe';
 if(/\b(TRANSMITTER|GAUGE|THERMOCOUPLE|THERMOWELL|FLOWMETER|INDICATOR)\b/.test(s))return 'instrument';
 return null;
}
export type EquipmentInference={kind:Kind|null;basis:string;confidence:'Description match'|'Inferred · strong pattern'|'Inferred · tentative'|'Unclassified';inferred:boolean};
const prefixOf=(id:string)=>id.split('_').at(-1)!.split('-')[0]+(/-M$/.test(id)?'-M':'');
export function inferEquipment(e:Equipment,all:Equipment[]):EquipmentInference{
 const direct=equipmentKind(e.name);
 if(direct)return {kind:direct,basis:`Source description: ${e.name}. Model represents the family, not its exact construction.`,confidence:'Description match',inferred:false};
 const prefix=prefixOf(e.id),peers=all.filter(x=>prefixOf(x.id)===prefix),votes=new Map<Kind,number>();
 for(const p of peers){const kind=equipmentKind(p.name);if(kind)votes.set(kind,(votes.get(kind)||0)+1);}
 const ranked=[...votes].sort((a,b)=>b[1]-a[1]),known=ranked.reduce((s,x)=>s+x[1],0),best=ranked[0];
 if(best&&best[1]>=5&&best[1]/known>=.8){const examples=peers.filter(x=>equipmentKind(x.name)===best[0]).slice(0,2).map(x=>`${x.id}: ${x.name}`).join('; ');return {kind:best[0],basis:`Tag family ${prefix}: ${best[1]} of ${known} classifiable peers (${peers.length} total) indicate ${kindNames[best[0]].toLowerCase()}. Examples: ${examples}.`,confidence:'Inferred · strong pattern',inferred:true};}
 // Conservative functional categories: supplied tag families and descriptions,
 // not a claim about exact assembly, dimensions or instrumentation standard.
 const instruments=['PIT','PGI','FIT','LIT','TIT','TEL','DPT'];
 if(instruments.includes(prefix)){const examples=peers.slice(0,2).map(x=>x.name).join('; ');return {kind:'instrument',basis:`Tag family ${prefix} with measurement descriptions in this dataset (${examples}). Generic field-instrument representation; specific sensor design unconfirmed.`,confidence:'Inferred · tentative',inferred:true};}
 return {kind:null,basis:`No sufficiently consistent equipment-family evidence for ${e.id}. Shared spare parts alone do not establish an asset type.`,confidence:'Unclassified',inferred:true};
}
