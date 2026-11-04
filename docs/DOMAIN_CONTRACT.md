# Domain contract

Pure exports in `lib/domain.ts`: `initializeWorkspace(dataset)`, `applyCommand(state,dataset,command)`, `stockPosition(state,dataset,materialId)`, `requestFulfillment(request,state)`, `timePhasedReadiness(state,dataset,materialId,horizonDate?)`. Commands return a new state or throw `DomainError` with `code`. No persistence or clock side effects.

`Command = { type, role:'Inventory'|'Technician', actor:string, idempotencyKey:string, expectedVersion:number, payload }`. Use PascalCase names below. Quantity fields are `quantity`. IDs are supplied or generated from the command key. State arrays use `id`; lines use `id,materialId,quantity,approvedQuantity,needBy`. All state and payload types are exported. Source stock is Dataset opening stock plus operational ledger only.

State fields: `schemaVersion:2,datasetVersion,version,epoch,asOfDate,scope,requests,reservations,prs,pos,ledger,activePolicies,masterOverrides,observations,maintenance,verification,scenarios,importBatches,exceptions,audit,commandKeys`. Dates ISO date strings. Seed exceptions are evidence warnings, never guessed source data. No historical open PO is initialized.

Commands/payload:
- SubmitRequest: `{id?,assetId,origin:string,rationale,scopeConfirmed:true,lines:[{id?,materialId,quantity,needBy}],scenarioId?,evidence?}`. Origin is immutable/unique. Duplicate origin returns original state. Technician only.
- ReviseRequest: `{requestId,rationale,scopeConfirmed:true,lines:[...]}`; only Draft/Needs Clarification, stable origin, revision increments. Technician.
- ReviewRequest: `{requestId,decision:'Approved'|'Partially Approved'|'Rejected'|'Needs Clarification'|'Under Review',reason,lines?:[{lineId,approvedQuantity}]}`. Inventory.
- Reserve: `{requestId,lineId,quantity,id?}`; ReleaseReservation `{reservationId,quantity?,reason}`. Inventory.
- ProceedReorder: `{id?,materialId,quantity,needBy,reason,requestId?,lineId?,origin?}` creates/amends one pending draft PR per origin; quantity is desired total procurement scope. Inventory.
- ConfirmDemoPO: `{id?,prId,supplier,quantity,eta,unitPrice?,currency?,reason?}`. Inventory; entered pricing optional.
- PostReceipt `{id?,poId,quantity,effectiveDate,reason?}`; PostIssue `{id?,requestId,lineId,quantity,effectiveDate,reason?}`; PostReturn `{id?,issueId,quantity,effectiveDate,reason}`; PostAdjustment `{id?,materialId,quantity,effectiveDate,reason}` (signed); ReverseMovement `{id?,movementId,effectiveDate,reason}`. Inventory.
- AcceptPolicy `{materialId,min,max,strategicFloor?,expectedPolicyVersion,reason}`; EditMaster `{materialId,name?,criticality?,reason}`. Immutable IDs/UoM. Inventory.
- RecordObservation `{id?,assetId,metric,value,unit,observedAt,source,reason?}`. Metrics velocityVibration/mm/s, bearingTemperature/degC, pressureDifferential/bar, thermalPerformance/%. Technician.
- RecordMaintenance `{id?,assetId,activity,start,end,failureMode,action,followup,issueIds?}`; RecordVerification `{id?,assetId,maintenanceId?,reference,observedAt,metric?,value?,unit?,notes?}`. Technician; neither mutates stock/condition.
- SaveScenario `{id?,assetId,revision,input,output,baselineVersion,workspaceVersion,inputHash}`. Technician; no commitments.
- PublishImport `{hash,kind,rows,source}`; kinds materials/equipment/bom/movements/procurement/maintenance. Rows are normalized records; material/equipment rows require id; bom assetId/materialId; movements id/materialId/quantity/date; procurement id/materialId/quantity/date; maintenance id/assetId. Existing differing business keys become explicit exceptions. Historical imports never alter opening quantities. Inventory.
- ResolveException `{exceptionId,disposition:'accept-source'|'retain-existing'|'exclude',source,reason}`. Inventory; records decision without silently rewriting seed.
- AdvanceDate `{date,reason}`; ResetWorkspace `{confirmation:'RESET',reason}`. Inventory.

`stockPosition` returns `{materialId,onHand,reserved,available,inbound,commitments,position}`; outstanding approved commitments counted once regardless of reservations. `requestFulfillment` returns `{status:'Unfulfilled'|'Partially Fulfilled'|'Fulfilled'|'No Approved Scope',approved,issued,outstanding,lines:[{lineId,approved,issued,outstanding}]}`; approval status remains on request independently. Returns decrease net issued.

`timePhasedReadiness` returns `{materialId,openingAvailable,earliestGap:string|null,shortage:number,events:[{date,supply,demand,balance,shortage}],covered:boolean}`. Timeline starts with physical onHand, future confirmed PO remainder is dated by ETA, each outstanding approved line enters once on needBy. Reservations are allocation, not extra demand. Future receipts do not cover prior gaps. `horizonDate` filters events.

Replay same key/payload returns input state unchanged even if its expectedVersion is old. Changed reuse rejects. Other stale commands reject before mutation. All validations finish on a cloned state before a new version is returned; failures leave input untouched.

Procurement amendment: ProceedReorder on an existing origin reopens its PR for review, retaining any confirmed PO and inbound. ConfirmDemoPO then amends that same PO ID/total (cannot reduce below received quantity), so pending actions and inbound never duplicate. Reversal/issue validation also checks the historical effective-date stock timeline.
