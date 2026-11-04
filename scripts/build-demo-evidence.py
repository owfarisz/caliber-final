"""Rebuild source-only evidence from the audited XLSX-derived SQLite database."""
import sqlite3, json, collections, pathlib
root=pathlib.Path(__file__).resolve().parents[1]
c=sqlite3.connect(root/'public/demo.sqlite');c.row_factory=sqlite3.Row
data=json.loads(c.execute('select payload from app_snapshot').fetchone()[0])
selected=['4100000142','4100024158','4100014098','4100008783','4100014019']
records=[]
for r in c.execute('select * from procurement_lines'):
 if r['material_id'] not in selected:continue
 records.append(dict(materialId=r['material_id'],supplierId=r['PO-Supplier Code'],supplier=r['PO-Supplier Name'],currency=r['currency'],unit=r['unit'],quantity=r['pr_quantity'],lineAmount=r['amount'],priceProxy=r['amount']/r['pr_quantity'] if r['pr_quantity'] and r['amount'] is not None and r['amount']>0 else None,prDate=str(r['PR-Date'])[:10],requestedDate=str(r['PR-Delivery Date'])[:10],plannedDate=str(r['PO-Delivery Date'])[:10],leadDays=r['lead_days_proxy'] if r['lead_proxy_valid'] else None,sourceRow=r['source_row'],po=r['Purchase Order']))
monthly=collections.Counter()
for r in c.execute('select "PR-Date" as date from procurement_lines'):monthly[str(r['date'])[:7]]+=1
issue=collections.Counter()
for m in data['materials']:
 for date,quantity in m['daily']:issue[date[:7]]+=1 # material-day observations, not mixed UoM totals
evidence={'cutoff':data['cutoff'],'sources':data['sources'],'counts':{'materials':len(data['materials']),'bomAssets':len(data['equipment']),'functionalLocations':c.execute('select count(*) from functional_locations').fetchone()[0],'canonicalProcurement':c.execute('select count(*) from procurement_lines').fetchone()[0],'rawProcurement':c.execute('select count(*) from raw_procurement').fetchone()[0],'issueRows':c.execute('select count(*) from material_movements').fetchone()[0],'notifications':c.execute('select count(*) from notifications').fetchone()[0],'maintenanceItems':c.execute('select count(*) from maintenance_items').fetchone()[0]},'monthly':[{'month':month,'procurementLines':monthly[month],'activeMaterialDays':issue[month]} for month in sorted(set(monthly)|set(issue)) if len(month)==7 and month<='2026-09'],'records':records,'performanceRatingAvailable':False,'ratingNote':'No supplier evaluation rating, actual receipt performance, or cooperation-review field was supplied in the six Excel workbooks.'}
(root/'lib/source-evidence.json').write_text(json.dumps(evidence,separators=(',',':')))
print('Built source evidence:',len(records),'selected-material procurement records;',len(evidence['monthly']),'months')
