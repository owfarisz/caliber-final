import test from 'node:test';
import assert from 'node:assert/strict';
import {equipmentKind,inferEquipment} from '../lib/equipment-kind.ts';
import type {Equipment} from '../lib/types.ts';
const asset=(id:string,name:string):Equipment=>({id,name,criticality:'A',materialIds:[],notificationCount:0,notifications:[],maintenance:[],cyclingRelevant:false,supportedIssueRows:0});
test('specific descriptions distinguish motor-operated valves and fans',()=>{assert.equal(equipmentKind('MOTOR OPERATED GATE VALVE'),'valve');assert.equal(equipmentKind('MOTOR FOR PP-408B'),'motor');assert.equal(equipmentKind('PROPYLENE FAN'),'fan');assert.equal(equipmentKind('BFW PUMP'),'pump');assert.equal(equipmentKind('CRACKING FURNACE BF-105'),'furnace');});
test('code-only labels infer from classifiable peers and disclose denominator',()=>{const e=asset('PX_PP-999','PX_PP-999');const peers=Array.from({length:6},(_,i)=>asset('PX_PP-'+i,'PROCESS PUMP'));const result=inferEquipment(e,[e,...peers]);assert.equal(result.kind,'pump');assert.equal(result.inferred,true);assert.match(result.basis,/6 of 6 classifiable peers/);});
test('mixed or unsupported code family never silently becomes a compressor',()=>{const e=asset('PX_KC-999','PX_KC-999');const peers=Array.from({length:8},(_,i)=>asset('PX_KC-'+i,i<4?'COMPRESSOR':'FAN'));assert.equal(inferEquipment(e,[e,...peers]).kind,null);assert.equal(inferEquipment(asset('UNKNOWN','XYZ'),[]).kind,null);});
test('measurement tag fallback is explicitly tentative',()=>{const e=asset('PX_DPT-1557A','DIFF. PRESSURE');const result=inferEquipment(e,[e]);assert.equal(result.kind,'instrument');assert.equal(result.confidence,'Inferred · tentative');});
