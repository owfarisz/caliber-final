import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultInput,calculate,simulate,validateInput} from '../lib/engine.ts';
import type {Dataset,Material,ScenarioInput} from '../lib/types.ts';
const material:Material={id:'M',name:'Part',unit:'EA',onHand:2,currentMin:4,currentMax:10,mrpType:'VB',criticality:'A',locations:['E'],daily:[['2026-01-01',2],['2026-09-01',4]],historyDays:100,lastIssue:'2026-09-01',issueRows:2,suspectRows:0,attributed:{E:3},totalIssued:6,leadDays:[20,40],currency:'USD',amountMean:20,amountMedian:18,lineUnitEstimate:5,procurementRows:2};
const dataset:Dataset={version:'test',cutoff:'2026-09-30',historyStart:'2026-01-01',historyDays:100,stockAsOf:null,materials:[material],equipment:[{id:'E',name:'Pump',criticality:'A',materialIds:['M'],notificationCount:0,notifications:[],maintenance:[],cyclingRelevant:true,supportedIssueRows:1}],audit:{},sources:[]};
const input:ScenarioInput={...defaultInput,functionalLocation:'E',operatingHoursPerDay:16,startStopCyclesPerDay:2};
test('known history produces coherent uncertainty and conservative critical floor',()=>{const p=calculate(material,input,dataset);assert.ok(p.expected!>0);assert.ok(p.lower!<=p.upper!);assert.ok(p.min>=4);assert.equal(p.min,p.reorderPoint);assert.ok(p.max>=p.min);assert.ok(p.safetyStock!>=0);assert.equal(p.reorderQuantity,p.max-2);});
test('only below or equal Min orders; below Max alone does not',()=>{const p=calculate(material,input,dataset);assert.equal(calculate({...material,onHand:p.min},input,dataset).reorderQuantity,p.max-p.min);assert.equal(calculate({...material,onHand:p.min+1},input,dataset).reorderQuantity,0);});
test('missing history retains policy but does not invent demand or probability',()=>{const p=calculate({...material,daily:[],issueRows:0,lastIssue:null},input,dataset);assert.equal(p.expected,null);assert.equal(p.stockoutProbability,null);assert.equal(p.safetyStock,null);assert.equal(p.slowMoving,null);assert.equal(p.min,4);assert.equal(p.max,10);});
test('shared-material scenario scales only attributable half and is reproducible',()=>{const x={...input,operatingHoursPerDay:24};const a=simulate(dataset,x);assert.deepEqual(a,simulate(dataset,x));assert.equal(a.scenario[0].multiplier,1.25);assert.equal(a.baseline[0].multiplier,1);assert.equal(a.scenario[0].expected,a.baseline[0].expected!*1.25);assert.equal(material.onHand,2);});
test('zero runtime removes only attributable demand and noncycling ignores cycles',()=>{assert.equal(calculate(material,{...input,operatingHoursPerDay:0,startStopCyclesPerDay:0},dataset).multiplier,.5);const d={...dataset,equipment:[{...dataset.equipment[0],cyclingRelevant:false}]};assert.equal(calculate(material,{...input,startStopCyclesPerDay:6},d).multiplier,1);});
test('future replenishment cannot change pre-receipt stockout risk',()=>{const p=calculate({...material,onHand:0},input,dataset);assert.ok(p.stockoutProbability!>0);assert.equal(p.mitigatedPreReceiptRisk,p.stockoutProbability);});
test('monetary outputs require explicit amount interpretation and currency',()=>{assert.equal(calculate(material,input,dataset).purchaseCost,null);assert.equal(calculate(material,{...input,priceBasis:'unit_amount'},dataset).unitPrice,20);assert.equal(calculate(material,{...input,priceBasis:'line_total'},dataset).unitPrice,5);assert.equal(calculate({...material,currency:null},{...input,priceBasis:'unit_amount'},dataset).unitPrice,null);});
test('monetary estimates off also suppresses illustrative shortage currency values',()=>{assert.equal(calculate(material,input,dataset).shortageExposure,null);});
test('invalid IDs, nonfinite values and impossible runtime are rejected',()=>{for(const change of [{functionalLocation:'missing'},{operatingHoursPerDay:NaN},{operatingHoursPerDay:25},{operatingHoursPerDay:0,startStopCyclesPerDay:2},{horizonDays:0},{leadTimeOverride:-2},{serviceLevel:1},{holdingCostRateAnnual:Infinity},{priceBasis:'bogus'}])assert.throws(()=>validateInput({...input,...change} as ScenarioInput,dataset));});
test('slow movement is historical and requires a covered configured threshold',()=>{const m={...material,lastIssue:'2026-01-01'};assert.equal(calculate(m,{...input,slowMovingDays:90},dataset).slowMoving,true);assert.equal(calculate(m,{...input,slowMovingDays:null},dataset).slowMoving,null);assert.equal(calculate(m,{...input,slowMovingDays:180},dataset).slowMoving,null);});
test('missing procurement uses visible 60-day fallback; override takes precedence',()=>{const m={...material,leadDays:[]};assert.equal(calculate(m,input,dataset).leadDays,60);assert.match(calculate(m,input,dataset).leadBasis,/assum/i);assert.equal(calculate(m,{...input,leadTimeOverride:12},dataset).leadDays,12);});
test('unchanged simulation matches baseline and zero current policies are flagged',()=>{const s=simulate(dataset,input);assert.deepEqual(s.baseline,s.scenario);assert.ok(calculate({...material,currentMin:0,currentMax:0},input,dataset).reasons.some(x=>/unconfigured/i.test(x)));});
test('common random draws keep increasing exposure monotone for every material',()=>{
 for(let i=0;i<35;i++){
  const m={...material,id:'comparison-'+i,criticality:'C' as const,currentMin:0,currentMax:0,attributed:{E:6}};
  const baseline=calculate(m,input,dataset),stress=calculate(m,{...input,operatingHoursPerDay:17},dataset);
  assert.ok(stress.min>=baseline.min,`ROP fell for ${m.id}`);
  assert.ok(stress.max>=baseline.max,`Max fell for ${m.id}`);
  assert.ok(stress.stockoutProbability!>=baseline.stockoutProbability!,`Risk fell for ${m.id}`);
 }
});
