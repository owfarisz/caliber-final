import type {Database,SqlJsStatic} from 'sql.js';
import type {Dataset} from './types';
import {initializeWorkspace,applyCommand,type WorkspaceState,type Command} from './domain';
import {projectDataset} from './imports';
import {seedGuidedDemo} from './demo-seed';
declare global {interface Window {initSqlJs:(options:{locateFile:(file:string)=>string})=>Promise<SqlJsStatic>}}
const STORE='root-sync-devnyadev-v1';
function openStore(store:string):Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const r=indexedDB.open(store,1);r.onupgradeneeded=()=>r.result.createObjectStore('workspace');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function readBytes(store:string):Promise<Uint8Array|null>{const db=await openStore(store);return new Promise((resolve,reject)=>{const tx=db.transaction('workspace','readonly');const r=tx.objectStore('workspace').get('bytes');r.onsuccess=()=>resolve(r.result?new Uint8Array(r.result):null);r.onerror=()=>reject(r.error);tx.oncomplete=()=>db.close();});}
async function saveBytes(bytes:Uint8Array,store:string):Promise<void>{const db=await openStore(store);return new Promise((resolve,reject)=>{const tx=db.transaction('workspace','readwrite');tx.objectStore('workspace').put(bytes,'bytes');tx.oncomplete=()=>{db.close();resolve();};tx.onabort=tx.onerror=()=>{db.close();reject(tx.error||new Error('Workspace could not be saved'));};});}
const collections=['requests','reservations','prs','pos','ledger','activePolicies','masterOverrides','observations','maintenance','verification','scenarios','importBatches','exceptions','audit','commandKeys'] as const;
export function materializeWorkspace(db:Database,state:WorkspaceState){
 db.run('BEGIN');try{
 db.run('CREATE TABLE IF NOT EXISTS workspace_meta (id INTEGER PRIMARY KEY, schema_version INTEGER NOT NULL, dataset_version TEXT NOT NULL, payload TEXT NOT NULL)');
 db.run('INSERT OR REPLACE INTO workspace_meta VALUES(1,?,?,?)',[2,state.datasetVersion,JSON.stringify(state)]);
 for(const name of collections){const table='runtime_'+name;db.run(`CREATE TABLE IF NOT EXISTS ${table}(id TEXT PRIMARY KEY,payload TEXT NOT NULL)`);db.run(`DELETE FROM ${table}`);const value=state[name];const list=Array.isArray(value)?value:Object.entries(value||{}).map(([id,v])=>({id,value:v}));const stmt=db.prepare(`INSERT INTO ${table} VALUES(?,?)`);for(let i=0;i<list.length;i++){const row=list[i] as any;stmt.run([String(row.id||row.key||i),JSON.stringify(row)]);}stmt.free();}
 db.run('CREATE TABLE IF NOT EXISTS runtime_request_items(id TEXT PRIMARY KEY,request_id TEXT NOT NULL,material_id TEXT NOT NULL,quantity REAL NOT NULL,approved_quantity REAL NOT NULL,need_by TEXT NOT NULL)');db.run('DELETE FROM runtime_request_items');
 for(const r of state.requests)for(const line of r.lines)db.run('INSERT INTO runtime_request_items VALUES(?,?,?,?,?,?)',[line.id,r.id,line.materialId,line.quantity,line.approvedQuantity,line.needBy]);
 db.run('COMMIT');}catch(e){db.run('ROLLBACK');throw e;}
}
export class WorkspaceRepository {
 private store:string;private db:Database;private sql:SqlJsStatic;private seed:Dataset;private busy=false;private release:()=>void=()=>{};
 state:WorkspaceState;dataset:Dataset;writable:boolean;
 private constructor(store:string,db:Database,sql:SqlJsStatic,dataset:Dataset,state:WorkspaceState,writable:boolean,release:()=>void){this.store=store;this.db=db;this.sql=sql;this.seed=dataset;this.dataset=projectDataset(dataset,state);this.state=state;this.writable=writable;this.release=release;}
 static async load(base:string,demoCaseId?:string){
 const store=STORE+(demoCaseId?':'+demoCaseId:':all');
 const SQL=await window.initSqlJs({locateFile:file=>`${base}/assets/${file}`});
 let writable=false,release=()=>{};
 if(navigator.locks){await new Promise<void>((resolve,reject)=>{navigator.locks.request(store,{mode:'exclusive',ifAvailable:true},async lock=>{if(!lock){resolve();return;}writable=true;await new Promise<void>(r=>{release=r;resolve();});}).catch(reject);});}
 try{let bytes=await readBytes(store);if(!bytes){const r=await fetch(`${base}/demo.sqlite`);if(!r.ok)throw Error('Seed database is unavailable');bytes=new Uint8Array(await r.arrayBuffer());}
 const db=new SQL.Database(bytes);const snapshot=db.exec('SELECT payload FROM app_snapshot WHERE id=1');if(!snapshot.length)throw Error('Invalid seed database');const dataset=JSON.parse(String(snapshot[0].values[0][0])) as Dataset;if(demoCaseId)dataset.demoCaseId=demoCaseId;
 const exists=db.exec("SELECT name FROM sqlite_master WHERE name='workspace_meta'").length;const saved=exists?db.exec('SELECT payload FROM workspace_meta WHERE id=1'):[];const state=saved.length?JSON.parse(String(saved[0].values[0][0])) as WorkspaceState:seedGuidedDemo(dataset,initializeWorkspace(dataset));
 if(state.schemaVersion!==2||state.datasetVersion!==dataset.version)throw Error('Workspace version mismatch. Export your saved database before upgrading.');
 if(!saved.length&&writable){materializeWorkspace(db,state);await saveBytes(db.export(),store);}
 return new WorkspaceRepository(store,db,SQL,dataset,state,writable,release);
 }catch(e){release();throw e;}
 }
 async execute(command:Command):Promise<WorkspaceState>{if(!this.writable)throw Error('Another tab owns this workspace. Close it and reload to edit.');if(this.busy)throw Error('A command is still saving. Please wait.');this.busy=true;let candidate:Database|undefined;
 try{let next=applyCommand(this.state,this.dataset,command);if(command.type==='ResetWorkspace'&&command.payload.reason==='Load guided demo examples')next=seedGuidedDemo(this.seed,next);if(next===this.state)return this.state;const projected=projectDataset(this.seed,next);candidate=new this.sql.Database(this.db.export());materializeWorkspace(candidate,next);await saveBytes(candidate.export(),this.store);this.db.close();this.db=candidate;candidate=undefined;this.state=next;this.dataset=projected;return next;}finally{candidate?.close();this.busy=false;}}
 export(){return this.db.export();}
 query(sql:string,params:(string|number)[]=[]){const stmt=this.db.prepare(sql);try{stmt.bind(params);const rows:Record<string,any>[]=[];while(stmt.step())rows.push(stmt.getAsObject());return rows;}finally{stmt.free();}}
 close(){this.release();this.db.close();}
}
