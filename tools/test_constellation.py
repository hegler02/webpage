"""Protect automatic registration, source integrity and the public-data boundary."""
import copy
import json
import unittest
from urllib.parse import urlparse
from constellation_data import build_graph, PROFILE

class ConstellationTests(unittest.TestCase):
    def setUp(self):
        self.catalog=json.loads((PROFILE/'data/message-bodies.json').read_text())
        self.g=build_graph(self.catalog)
    def test_catalog_is_the_only_work_list(self):
        expected={b['body_id'] for b in self.catalog['bodies'] if b['status'] in ('DEPLOYED','GOLDEN')}
        self.assertEqual(expected,{n['id'].removeprefix('work:') for n in self.g['nodes'] if n['kind']=='work'})
        extra=copy.deepcopy(self.catalog['bodies'][0]);extra.update(body_id='registration-test',title='등록 검증',canonical_url='https://mirinaeman.com/registration-test/')
        self.catalog['bodies'].append(extra)
        g=build_graph(self.catalog)
        self.assertIn('work:registration-test',{n['id'] for n in g['nodes']})
        self.assertTrue(any(e['source']=='work:registration-test' for e in g['edges']))
        extra['status']='DRAFT'
        self.assertNotIn('work:registration-test',{n['id'] for n in build_graph(self.catalog)['nodes']})
    def test_graph_has_evidence_and_no_dangling_edges(self):
        ids={n['id'] for n in self.g['nodes']}
        self.assertEqual(len(ids),len(self.g['nodes']))
        for e in self.g['edges']:
            self.assertIn(e['source'],ids);self.assertIn(e['target'],ids)
            self.assertTrue(e['reason']);self.assertEqual(urlparse(e['evidence']).scheme,'https')
        for id in self.g['featured']:self.assertIn(id,ids)
    def test_internal_catalog_fields_never_escape(self):
        self.catalog['bodies'][0].update(incidents=['SECRET-INTERNAL'],approvals=['SECRET-INTERNAL'],source_revision='SECRET-INTERNAL')
        self.assertNotIn('SECRET-INTERNAL',json.dumps(build_graph(self.catalog)))
    def test_research_is_bibliography_and_title_grouping(self):
        papers=[n for n in self.g['nodes'] if n['kind']=='paper']
        self.assertEqual(len(papers),16)
        for p in papers:self.assertEqual(p['sourceLabel'],'논문 · 서지 기록')
        for e in self.g['edges']:
            if e['target'].startswith('topic:'):self.assertEqual(e['label'],'제목 기반 주제')
    def test_local_assets_exist(self):
        for n in self.g['nodes']:
            if n.get('image'):self.assertTrue((PROFILE.parents[1]/n['image'].lstrip('/')).is_file(),n['id'])

if __name__=='__main__':unittest.main()
