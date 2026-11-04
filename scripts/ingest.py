"""Reproducible, non-destructive six-workbook ingestion. Run with --source PATH if relocated."""
from pathlib import Path
import argparse, pandas as pd, numpy as np, json, sqlite3, hashlib, re, shutil
APP=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--source',type=Path,default=APP.parents[1]/'case/Supporting Data');args=parser.parse_args()
FILES={'locations':'FuncLoc list','bom':'BoM','movements':'Movement Material','notifications':'Notif History','maintenance':'Mitem & Mplan','procurement':'PR PO'}
OUT=APP/'data';OUT.mkdir(exist_ok=True);db=sqlite3.connect(OUT/'demo.sqlite');tables={};sources=[]
def text(v):return None if pd.isna(v) else str(v).strip()
def iso(v):return None if pd.isna(v) else pd.Timestamp(v).strftime('%Y-%m-%d')
def native(v):
 if isinstance(v,np.integer):return int(v)
 if isinstance(v,np.floating):return float(v)
 if isinstance(v,(pd.Timestamp,)):return iso(v)
 raise TypeError(type(v).__name__)
def save(name,df):df.to_sql(name,db,if_exists='replace',index=False)
for name,stem in FILES.items():
 f=args.source/(stem+'.xlsx');d=pd.read_excel(f,dtype=object,sheet_name='Data').dropna(how='all');d=d.loc[:,~d.columns.str.startswith('Unnamed')]
 for c in d:
  d[c]=d[c].map(lambda x:x.strip() if isinstance(x,str) else x)
 d.insert(0,'source_row',range(2,len(d)+2));save('raw_'+name,d)
 tables[name]=d;sources.append({'file':stem+'.xlsx','sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'rows':len(d)})
b=tables['bom'];m=tables['movements'];n=tables['notifications'];l=tables['locations'];t=tables['maintenance'];p=tables['procurement']
bc=b.drop_duplicates(subset=list(b.columns[1:]));pc=p.drop_duplicates(subset=list(p.columns[1:]));bm=bc.drop_duplicates('Material No')
rank={'A':0,'B':1,'C':2,'S':3,'Unknown':4}
locations={text(r['Functional Location']):{'id':text(r['Functional Location']),'name':r['FunctLocDescrip.'],'criticality':text(r['FuncLoc Criticallity']) or 'Unknown','materialIds':[],'notificationCount':0,'notifications':[],'maintenance':[],'cyclingRelevant':bool(re.search('PUMP|COMPRESSOR|MOTOR',r['FunctLocDescrip.'],re.I)),'supportedIssueRows':0} for _,r in l.iterrows()}
save('functional_locations',pd.DataFrame([{'id':v['id'],'name':v['name'],'criticality':v['criticality']} for v in locations.values()]))
assign=bc.rename(columns={'Functional Loc.':'location_id','Material No':'material_id','Installed Qty':'installed_qty'})[['source_row','location_id','material_id','installed_qty','Unit']].rename(columns={'Unit':'unit'})
save('bom_assignments',assign)
matloc=assign.groupby('material_id').location_id.apply(list).to_dict();pairs=set(zip(assign.location_id,assign.material_id))
for matid,locs in matloc.items():
 for loc in locs:locations[loc]['materialIds'].append(matid)
history_start=pd.to_datetime(m['Posting Date']).min();cutoff=pd.to_datetime(m['Posting Date']).max();days=(cutoff-history_start).days+1
order_groups=n.dropna(subset=['Order']).groupby('Order')['Functional Location'].agg(lambda x:sorted(set(x)))
order_count=n.dropna(subset=['Order']).groupby('Order').size()
order_loc={k:v[0] for k,v in order_groups.items() if len(v)==1}
mov=m.rename(columns={'Posting Date':'date','Material Number':'material_id','Quantity':'quantity','Base Unit':'unit','Order':'order_id','Movement Type':'movement_type'}).copy()
mov['date']=mov.date.map(iso);mov['quantity']=pd.to_numeric(mov.quantity)
mov['suspect_duplicate']=m.duplicated(list(m.columns[1:]),keep=False).astype(int)
mov['attributed_location']=mov.order_id.map(order_loc)
mov['attribution_status']=mov.order_id.map(lambda v:'ambiguous_order' if len(order_groups.get(v,[]))>1 else 'unmatched_order' if v not in order_loc else 'unique_location')
for idx,r in mov.iterrows():
 if r.attribution_status=='unique_location':
  if (r.attributed_location,r.material_id) in pairs:
   mov.at[idx,'attribution_status']='supported';locations[r.attributed_location]['supportedIssueRows']+=1
  else:mov.at[idx,'attribution_status']='location_bom_mismatch';mov.at[idx,'attributed_location']=None
save('material_movements',mov[['source_row','date','movement_type','material_id','quantity','unit','order_id','suspect_duplicate','attributed_location','attribution_status']])
notify=n.rename(columns={'Notification':'id','Order':'order_id','Functional Location':'location_id','Notification Date':'date','Notification Type':'type','Description':'description','Priority':'priority'})
for _,r in notify.iterrows():
 locations[r.location_id]['notificationCount']+=1
 locations[r.location_id]['notifications'].append({'id':r.id,'date':iso(r.date),'type':r.type,'priority':r.priority,'description':r.description,'order':text(r.order_id)})
save('notifications',notify[['source_row','id','order_id','location_id','date','type','priority','description','Created On','Required Start','Required End','Completion by Date','Status']])
maint=[]
for _,r in t.iterrows():
 label=r['Cycle Descriptions'].upper().strip();match=re.fullmatch(r'(?:(\d+)\s+)?(YEARLY|MONTHLY|MONTH|WEEKLY|WEEK)',label)
 count=int(match.group(1) or 1) if match else None;unit='MONTH' if match and 'YEAR' in match.group(2) else 'MONTH' if match and 'MONTH' in match.group(2) else 'WEEK' if match else None
 if match and 'YEAR' in match.group(2):count*=12
 start=pd.Timestamp(r['Start of cycle']);nextdate=start
 if count:
  delta=pd.DateOffset(months=count) if unit=='MONTH' else pd.DateOffset(weeks=count)
  while nextdate<=cutoff:nextdate+=delta
 else:nextdate=None
 item={'id':r['Maintenance Item'],'plan_id':r['Maintenance Plan'],'location_id':r['Functional Location'],'text':r['Maint. item text'],'cycle':r['Cycle Descriptions'],'interval':count,'interval_unit':unit,'start':iso(start),'nextDate':iso(nextdate),'source_row':int(r.source_row)}
 maint.append(item);locations[item['location_id']]['maintenance'].append({k:item[k] for k in ['id','text','cycle','start','nextDate']})
save('maintenance_items',pd.DataFrame(maint))
proc=pc.rename(columns={'PR-Material':'material_id','PR-Quantity':'pr_quantity','PR-UoM':'unit','PO-Item Amount':'amount','PO-Currency':'currency'}).copy()
proc['lead_days_proxy']=(pd.to_datetime(proc['PO-Delivery Date'])-pd.to_datetime(proc['PR-Date'])).dt.days
proc['lead_proxy_valid']=(proc.lead_days_proxy>=0).astype(int)
save('procurement_lines',proc)
daily=mov.groupby(['material_id','date']).quantity.sum();issued=mov.groupby('material_id').quantity.sum();mg=mov.groupby('material_id');pg=proc.groupby('material_id')
attributed=mov[mov.attribution_status=='supported'].groupby(['material_id','attributed_location']).quantity.sum()
materials=[]
for _,r in bm.iterrows():
 mid=r['Material No'];locs=matloc[mid];crit=min([locations[x]['criticality'] for x in locs],key=lambda x:rank[x]);md=mg.get_group(mid) if mid in mg.groups else None;pdg=pg.get_group(mid) if mid in pg.groups else None
 ds=[[dt,float(q)] for (_,dt),q in daily.items() if _==mid] if md is not None else []
 # Grouped lookup above preserves observed daily sums; absent days are zeros only under stated window-coverage assumption.
 amounts=pd.to_numeric(pdg.amount) if pdg is not None else None
 mat={'id':mid,'name':r['Material Desc.'],'unit':r.Unit,'onHand':float(r.Stock),'currentMin':float(r['Min.Qty']),'currentMax':float(r['Max.Qty']),'mrpType':r['MRP Type'],'criticality':crit,'locations':locs,'daily':ds,'historyDays':days,'lastIssue':max(md.date) if md is not None else None,'issueRows':len(md) if md is not None else 0,'suspectRows':int(md.suspect_duplicate.sum()) if md is not None else 0,'attributed':{loc:float(q) for (mt,loc),q in attributed.items() if mt==mid},'totalIssued':float(issued.get(mid,0)),'leadDays':[int(x) for x in pdg.lead_days_proxy if x>=0] if pdg is not None else [],'currency':pdg.currency.iloc[0] if pdg is not None else None,'amountMean':float(amounts.mean()) if amounts is not None else None,'amountMedian':float(amounts.median()) if amounts is not None else None,'lineUnitEstimate':float(amounts.sum()/pd.to_numeric(pdg.pr_quantity).sum()) if pdg is not None else None,'procurementRows':len(pdg) if pdg is not None else 0}
 materials.append(mat)
save('materials',pd.DataFrame([{k:v for k,v in x.items() if k not in ['daily','locations','attributed','leadDays']} for x in materials]))
save('inventory_snapshots',pd.DataFrame([{'material_id':x['id'],'on_hand':x['onHand'],'stock_as_of':None,'scope':'unknown_source_scope'} for x in materials]))
save('inventory_policies',pd.DataFrame([{'material_id':x['id'],'current_min':x['currentMin'],'current_max':x['currentMax']} for x in materials]))
save('material_daily',daily.rename('quantity').reset_index())
lineage=[]
for name,raw in [('bom',b),('procurement',p)]:
 cols=list(raw.columns[1:]);canon=raw.groupby(cols,dropna=False).source_row.transform('min')
 for sr,cr in zip(raw.source_row,canon):lineage.append({'source':name,'source_row':int(sr),'canonical_source_row':int(cr),'treatment':'retained' if sr==cr else 'exact_export_copy'})
save('canonical_lineage',pd.DataFrame(lineage))
anomalies=[]
for _,r in mov[mov.suspect_duplicate==1].iterrows():anomalies.append({'source':'movements','source_row':int(r.source_row),'issue':'suspected_repeat','action':'retain; no transaction item key'})
for _,r in proc[proc.lead_days_proxy<0].iterrows():anomalies.append({'source':'procurement','source_row':int(r.source_row),'issue':'negative_lead_proxy','action':'exclude from duration only'})
for _,r in l[l['FuncLoc Criticallity'].isna()].iterrows():anomalies.append({'source':'locations','source_row':int(r.source_row),'issue':'unknown_criticality','action':'retain null; do not infer from code'})
save('quality_exceptions',pd.DataFrame(anomalies));save('source_manifest',pd.DataFrame(sources))
auditpath=APP.parents[1]/'prototype codex/audit/profile.json'
audit=json.loads(auditpath.read_text()) if auditpath.exists() else {}
audit['policyConfigured']={'belowMin':int(((bm.Stock<bm['Min.Qty'])&(bm['Max.Qty']>0)).sum()),'aboveMax':int(((bm.Stock>bm['Max.Qty'])&(bm['Max.Qty']>0)).sum()),'within':int(((bm.Stock>=bm['Min.Qty'])&(bm.Stock<=bm['Max.Qty'])&(bm['Max.Qty']>0)).sum()),'zeroPolicy':int(((bm['Min.Qty']==0)&(bm['Max.Qty']==0)).sum())}
audit['supportedAttribution']=int((mov.attribution_status=='supported').sum());audit.pop('top_links',None)
dataset={'version':'caliber-final-'+hashlib.sha256(''.join(x['sha256'] for x in sources).encode()).hexdigest()[:12],'cutoff':iso(cutoff),'historyStart':iso(history_start),'historyDays':days,'stockAsOf':None,'materials':materials,'equipment':sorted([x for x in locations.values() if x['materialIds']],key=lambda x:(-x['supportedIssueRows'],rank[x['criticality']],x['id'])),'audit':audit,'sources':sources}
save('app_snapshot',pd.DataFrame([{'id':1,'payload':json.dumps(dataset,default=native,separators=(',',':'),allow_nan=False)}]))
for sql in ['CREATE UNIQUE INDEX IF NOT EXISTS mat_id ON materials(id)','CREATE UNIQUE INDEX IF NOT EXISTS loc_id ON functional_locations(id)','CREATE UNIQUE INDEX IF NOT EXISTS bom_pair ON bom_assignments(location_id,material_id)','CREATE INDEX IF NOT EXISTS move_material ON material_movements(material_id)','CREATE INDEX IF NOT EXISTS proc_material ON procurement_lines(material_id)']:db.execute(sql)
db.commit();assert db.execute('PRAGMA integrity_check').fetchone()[0]=='ok';db.execute('VACUUM');db.close()
(OUT/'snapshot.json').write_text(json.dumps(dataset,default=native,separators=(',',':'),allow_nan=False))
(OUT/'manifest.json').write_text(json.dumps({'sources':sources,'datasetVersion':dataset['version'],'cutoff':dataset['cutoff'],'historyDays':days},indent=2))
pub=APP/'public';pub.mkdir(exist_ok=True);shutil.copy2(OUT/'demo.sqlite',pub/'demo.sqlite')
print(json.dumps({'materials':len(materials),'equipment':len(dataset['equipment']),'historyDays':days,'sqliteBytes':(OUT/'demo.sqlite').stat().st_size,'policy':audit['policyConfigured'],'supportedIssues':audit['supportedAttribution']}))
