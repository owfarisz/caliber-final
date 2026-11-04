from pathlib import Path
import sqlite3,json,unittest
ROOT=Path(__file__).resolve().parents[1]
class DataChecks(unittest.TestCase):
 def setUp(self):self.db=sqlite3.connect(ROOT/'data/demo.sqlite')
 def tearDown(self):self.db.close()
 def test_counts_and_keys(self):
  for table,count in [('materials',7481),('bom_assignments',20423),('procurement_lines',6189),('material_movements',17518),('functional_locations',14484),('notifications',5795),('maintenance_items',10153)]:
   self.assertEqual(self.db.execute(f'SELECT COUNT(*) FROM {table}').fetchone()[0],count)
  self.assertEqual(self.db.execute('PRAGMA integrity_check').fetchone()[0],'ok')
 def test_traceable_snapshot(self):
  d=json.loads(self.db.execute("SELECT payload FROM app_snapshot WHERE id=1").fetchone()[0])
  self.assertEqual(len(d['materials']),7481)
  self.assertEqual(sum(x['supportedIssueRows'] for x in d['equipment']),625)
  self.assertEqual(sum(x['issueRows'] for x in d['materials']),17518)
  self.assertEqual(sum(bool(x['daily']) for x in d['materials']),1930)
  for m in d['materials']:
   self.assertAlmostEqual(sum(q for _,q in m['daily']),m['totalIssued'])
   self.assertLessEqual(sum(m['attributed'].values()),m['totalIssued']+1e-8)
  self.assertIsNone(d['stockAsOf'])
 def test_reconcile_by_unit(self):
  a=self.db.execute('SELECT unit,SUM(quantity) FROM material_movements GROUP BY unit').fetchall()
  b=self.db.execute('SELECT "Base Unit",SUM(Quantity) FROM raw_movements GROUP BY "Base Unit"').fetchall()
  self.assertEqual(a,b)
 def test_no_duplicate_master_or_bridge(self):
  self.assertEqual(self.db.execute('SELECT COUNT(*) FROM (SELECT id FROM materials GROUP BY id HAVING COUNT(*)>1)').fetchone()[0],0)
  self.assertEqual(self.db.execute('SELECT COUNT(*) FROM (SELECT location_id,material_id FROM bom_assignments GROUP BY 1,2 HAVING COUNT(*)>1)').fetchone()[0],0)
if __name__=='__main__': unittest.main()
