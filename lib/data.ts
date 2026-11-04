import fs from 'node:fs';
import path from 'node:path';
import type { Dataset } from './types';
let cached:Promise<Dataset>|undefined;
export function getDataset():Promise<Dataset>{
 if(!cached) cached=(async()=>{
  // The ASM build avoids an external WASM asset path in a serverless bundle.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const initSqlJs=require('sql.js/dist/sql-asm.js');
  const SQL=await initSqlJs();
  const db=new SQL.Database(fs.readFileSync(path.join(process.cwd(),'data','demo.sqlite')));
  try{const rows=db.exec('SELECT payload FROM app_snapshot WHERE id = 1');if(!rows.length)throw new Error('Database snapshot is unavailable');return JSON.parse(String(rows[0].values[0][0])) as Dataset;}finally{db.close();}
 })().catch(error=>{cached=undefined;throw error;});
 return cached;
}
