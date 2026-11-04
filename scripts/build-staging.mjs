import {build} from 'esbuild';
import {mkdir,copyFile,writeFile} from 'node:fs/promises';
const base=process.env.PAGES_BASE??'/caliber-final/stagging';
const out=process.env.PAGES_OUT||'staging-dist';
await mkdir(`${out}/assets`,{recursive:true});
await build({entryPoints:['scripts/staging-entry.tsx'],bundle:true,minify:true,jsx:'automatic',outfile:`${out}/assets/app.js`,loader:{'.woff2':'file','.woff':'file'},assetNames:'[name]-[hash]',define:{'process.env.NODE_ENV':'"production"','process.env.NEXT_PUBLIC_STATIC_BASE':JSON.stringify(base)},target:['es2022']});
await copyFile('public/demo.sqlite',`${out}/demo.sqlite`);
for(const name of ['sql-wasm.js','sql-wasm.wasm'])await copyFile(`node_modules/sql.js/dist/${name}`,`${out}/assets/${name}`);
const html=`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#263f77"><title>ROOTSYNC · Stagging</title><link rel="stylesheet" href="${base}/assets/app.css"></head><body><div id="root"></div><script src="${base}/assets/sql-wasm.js"></script><script type="module" src="${base}/assets/app.js"></script></body></html>`;
await writeFile(`${out}/index.html`,html);
for(const route of ['inventory','inventory/materials','inventory/transactions','inventory/procurement','inventory/data','technician','technician/scenarios','technician/requests']){await mkdir(`${out}/${route}`,{recursive:true});await writeFile(`${out}/${route}/index.html`,html);}
await writeFile(`${out}/404.html`,html);await writeFile(`${out}/.nojekyll`,'');
console.log(`Staging build ready: ${out} (${base})`);
