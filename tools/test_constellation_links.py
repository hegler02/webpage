#!/usr/bin/env python3
"""New records must be placed, proposals stay private, approved links reach the public graph."""
import copy
import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from constellation_data import PROFILE, build_graph
from constellation_links import CATALOG, load, problems


def new_body(catalog, body_id='registration-test'):
    body = copy.deepcopy(catalog['bodies'][0])
    body['body_id'] = body_id
    body['canonical_url'] = f'https://mirinaeman.com/pages/{body_id}/'
    catalog['bodies'].append(body)


class Links(unittest.TestCase):
    def setUp(self):
        self.catalog = json.loads(CATALOG.read_text(encoding='utf-8'))
        self.links = load()

    def test_current_data_is_clean(self):
        self.assertEqual([], problems(self.links, self.catalog))

    def test_a_new_record_stops_the_release_until_placed(self):
        new_body(self.catalog)
        self.assertTrue(any('registration-test' in line for line in problems(self.links, self.catalog)))
        self.links['constellations'][0]['members'].append({'id': 'registration-test', 'reason': '시험용 이유입니다.'})
        self.assertEqual([], problems(self.links, self.catalog))

    def test_solo_also_counts_as_a_decision(self):
        new_body(self.catalog)
        self.links['solo'].append({'id': 'registration-test', 'why': '묶을 근거를 찾지 못했습니다.'})
        self.assertEqual([], problems(self.links, self.catalog))

    def test_bad_entries_are_refused(self):
        bad = copy.deepcopy(self.links)
        bad['constellations'][0]['members'].append({'id': 'no-such-record', 'reason': '이유'})
        self.assertTrue(any('no-such-record' in line for line in problems(bad, self.catalog)))
        bad = copy.deepcopy(self.links)
        bad['constellations'][0]['members'][0]['reason'] = ' '
        self.assertTrue(any('이유' in line for line in problems(bad, self.catalog)))
        bad = copy.deepcopy(self.links)
        bad['solo'][0]['why'] = ''
        self.assertTrue(problems(bad, self.catalog))
        bad = copy.deepcopy(self.links)
        bad['constellations'][0]['status'] = 'maybe'
        self.assertTrue(problems(bad, self.catalog))

    def test_proposals_never_reach_the_public_graph(self):
        for c in self.links['constellations']:
            c['status'] = 'proposed'
        for p in self.links['pairs']:
            p['status'] = 'proposed'
        graph = build_graph(self.catalog, links=self.links)
        self.assertFalse([n for n in graph['nodes'] if n['kind'] == 'constellation'])
        self.assertNotIn(self.links['pairs'][0]['reason'], json.dumps(graph, ensure_ascii=False))

    def test_approved_links_reach_the_public_graph(self):
        c = self.links['constellations'][0]
        c['status'] = 'approved'
        p = self.links['pairs'][0]
        p['status'] = 'approved'
        graph = build_graph(self.catalog, links=self.links)
        self.assertIn('constellation:' + c['id'], {n['id'] for n in graph['nodes']})
        members = {e['source'] for e in graph['edges'] if e['target'] == 'constellation:' + c['id']}
        self.assertEqual({'work:' + m['id'] for m in c['members']}, members)
        self.assertTrue(any(e['label'] == p['label'] for e in graph['edges']))
        self.assertTrue(all(e['evidence'].startswith('https://') for e in graph['edges']))

    def test_committed_graph_matches_only_approved_data(self):
        graph = json.loads((PROFILE / 'galaxy/graph.json').read_text(encoding='utf-8'))
        approved = {'constellation:' + c['id'] for c in self.links['constellations'] if c['status'] == 'approved'}
        self.assertEqual(approved, {n['id'] for n in graph['nodes'] if n['k'] == 'constellation'})
        for c in self.links['constellations']:
            for m in c['members']:
                if m.get('status') == 'proposed':
                    self.assertNotIn(m['reason'], json.dumps(graph, ensure_ascii=False))


if __name__ == '__main__':
    unittest.main(verbosity=0)
