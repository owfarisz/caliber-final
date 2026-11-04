import {inventoryTaskContext} from '../lib/brief-context.ts';
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {initializeWorkspace,stockPosition,requestFulfillment} from '../lib/domain.ts';
import {guidedCases} from '../lib/demo-cases.ts';import {seedGuidedDemo} from '../lib/demo-seed.ts';import {supplierBrief,sourceEvidence,assumedVendorRating} from '../lib/supplier.ts';
const data=JSON.parse(readFileSync(new URL('../public/data/snapshot.json',import.meta.url),'utf8'));
test('five source-compatible cases cover distinct operational stages without changing source',()=>{const before=JSON.stringify(data);const cases=guidedCases(data);assert.equal(cases.length,5);const state=seedGuidedDemo(data,initializeWorkspace(data));assert.equal(state.requests.length,5);assert.equal(state.scenarios.length,5);assert.ok(state.pos.length>=2);assert.ok(state.ledger.length>=3);assert.ok(state.maintenance.length);assert.ok(state.verification.length);assert.ok(state.requests.some(r=>requestFulfillment(r,state).status==='Fulfilled'));assert.ok(state.requests.some(r=>requestFulfillment(r,state).status==='Partially Fulfilled'));assert.equal(JSON.stringify(data),before);assert.equal(seedGuidedDemo(data,state),state);for(const c of cases){const p=stockPosition(state,data,c.materialId);assert.ok(p.available>=0);assert.ok(p.onHand>=0);}});
test('supplier ranking is source backed and keeps absent performance ratings null',()=>{const b=supplierBrief('4100000142',data.cutoff,'2027-03-29');assert.ok(b.recommended);assert.equal(b.performanceRating,null);assert.ok(b.bandLow!<=b.bandHigh!);assert.ok(b.candidates.every(c=>c.performanceRating===null&&c.orders===c.sourceRows.length));assert.equal(sourceEvidence.counts.canonicalProcurement,6189);assert.ok(b.negotiationStart<=b.negotiationEnd!);const urgent=supplierBrief('4100000142',data.cutoff,'2026-10-01');assert.equal(urgent.urgent,true);assert.ok(urgent.latestOrderDate!<data.cutoff);});
test('unknown and mixed currency evidence are never averaged together',()=>{const unknown=supplierBrief('missing',data.cutoff,'2026-10-01');assert.equal(unknown.recommended,null);assert.equal(unknown.bandLow,null);assert.equal(unknown.negotiationEnd,null);const rows=sourceEvidence.records.filter(r=>r.materialId==='4100000142').slice(0,2);const mixed=[{...rows[0],currency:'IDR',priceProxy:100},{...rows[1],currency:'USD',priceProxy:1}];const b=supplierBrief('4100000142',data.cutoff,'2027-03-29',mixed);assert.ok(b.bandLow===100||b.bandLow===1);assert.notEqual(b.bandLow,50.5);});

test("synthetic vendor ratings are deterministic, bounded and explicitly unobserved",()=>{for(const id of [...new Set(sourceEvidence.records.map(r=>r.supplierId))]){const r=assumedVendorRating(id);assert.deepEqual(r,assumedVendorRating(id));assert.equal(r.observed,false);assert.match(r.source,/ASSUMPTION/);assert.match(r.note,/Demo assumption/);for(const score of [r.quality,r.delivery,r.communication,r.overall])assert.ok(score>=1&&score<=5);}});
test("guided demo preserves existing operational workspaces",()=>{const seeded=seedGuidedDemo(data,initializeWorkspace(data));const existing={...seeded,commandKeys:{}};assert.equal(seedGuidedDemo(data,existing),existing);});


test('inventory brief uses only active task dates and keeps procurement identity',()=>{
 const s=seedGuidedDemo(data,initializeWorkspace(data));
 const c=guidedCases(data)[2];
 const active=inventoryTaskContext(s,c.assetId,c.materialId,'2027-03-29');
 assert.equal(active.existingPR?.id,'DEMO-PR-3');
 assert.equal(active.existingPR?.requestId,active.request?.id);
 const request=active.request!;
 const clarified={...s,requests:s.requests.map(r=>r.id===request.id?{...r,status:'Needs Clarification' as const}:r)};
 assert.equal(inventoryTaskContext(clarified,c.assetId,c.materialId,'2027-03-29').pending,false);
 assert.equal(inventoryTaskContext(clarified,c.assetId,c.materialId,'2027-03-29').waiting,true);
 const closed={...s,requests:s.requests.map(r=>r.id===request.id?{...r,lines:r.lines.map(l=>({...l,approvedQuantity:0}))}:r)};
 assert.equal(inventoryTaskContext(closed,c.assetId,c.materialId,'2027-03-29').request,undefined);
 assert.equal(inventoryTaskContext(closed,c.assetId,c.materialId,'2027-03-29').existingPR,undefined);
 const later={...request,id:'NEW-TASK',lines:request.lines.map(l=>({...l,id:'NEW-LINE',needBy:'2027-03-29'}))};
 const withNew={...closed,requests:[...closed.requests,later]};
 const next=inventoryTaskContext(withNew,c.assetId,c.materialId,'2027-04-01');
 assert.equal(next.request?.id,'NEW-TASK');assert.equal(next.needBy,'2027-03-29');assert.equal(next.existingPR,undefined);
 const rejected={...s,requests:s.requests.map(r=>r.id===request.id?{...r,status:'Rejected' as const}:r)};
 assert.equal(inventoryTaskContext(rejected,c.assetId,c.materialId,'2027-03-29').needBy,'2027-03-29');
});


test('each scoped demo seeds only its scenario while retaining the full Excel portfolio',()=>{
 for(const c of guidedCases(data)){
  const scoped={...data,demoCaseId:c.id};const state=seedGuidedDemo(scoped,initializeWorkspace(scoped));
  assert.equal(state.requests.length,1);assert.equal(state.scenarios.length,1);
  assert.ok(state.requests.every(r=>r.assetId===c.assetId));assert.ok(state.observations.every(r=>r.assetId===c.assetId));
  assert.ok(state.ledger.every(r=>r.materialId===c.materialId));assert.ok(state.pos.every(r=>r.materialId===c.materialId));
  assert.equal(scoped.materials.length,7481);assert.equal(scoped.equipment.length,data.equipment.length);
  assert.equal(seedGuidedDemo(scoped,state),state);
 }
});
