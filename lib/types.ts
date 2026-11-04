export type Criticality = 'A'|'B'|'C'|'S'|'Unknown';
export type PriceBasis = 'unconfirmed'|'unit_amount'|'line_total';
export interface Material {
 id:string; name:string; unit:string; onHand:number; currentMin:number; currentMax:number; mrpType:string; criticality:Criticality;
 locations:string[]; daily:[string,number][]; historyDays:number; lastIssue:string|null; issueRows:number; suspectRows:number;
 attributed:Record<string,number>; totalIssued:number; leadDays:number[]; currency:string|null; amountMean:number|null; amountMedian:number|null; lineUnitEstimate:number|null; procurementRows:number;
}
export interface Equipment {
 id:string; name:string; criticality:Criticality; materialIds:string[]; notificationCount:number;
 notifications:{id:string;date:string;type:string;priority:string;description:string;order:string|null}[];
 maintenance:{id:string;text:string;cycle:string;start:string;nextDate:string|null}[];
 cyclingRelevant:boolean; supportedIssueRows:number;
}
export interface Dataset {
 demoCaseId?:string;
 version:string; cutoff:string; historyStart:string; historyDays:number; stockAsOf:null;
 materials:Material[]; equipment:Equipment[]; audit:Record<string,any>; sources:{file:string;sha256:string;rows:number}[];
}
export interface ScenarioInput {
 functionalLocation:string; operatingHoursPerDay:number; startStopCyclesPerDay:number; horizonDays:number; reviewPeriodDays:number;
 serviceLevel:number|null; leadTimeOverride:number|null; slowMovingDays:number|null; priceBasis:PriceBasis; holdingCostRateAnnual:number; downtimeLossPerEvent:number;
}
export interface PolicyResult {
 materialId:string; expected:number|null; lower:number|null; upper:number|null; safetyStock:number|null; reorderPoint:number; min:number; max:number; reorderQuantity:number;
 stockoutProbability:number|null; excess:number; slowMoving:boolean|null; action:string; leadDays:number; leadBasis:string; multiplier:number; attributableShare:number;
 unitPrice:number|null; currency:string|null; purchaseCost:number|null; holdingCost:number|null; shortageExposure:number|null; mitigatedPreReceiptRisk:number|null;
 serviceLevel:number; confidence:string; reasons:string[];
}
export interface Simulation {input:ScenarioInput; baseline:PolicyResult[]; scenario:PolicyResult[]; assumptions:string[]; datasetVersion:string;}
