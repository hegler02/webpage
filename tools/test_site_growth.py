#!/usr/bin/env python3
"""A new record of any kind reaches every place at once, and waits for a decision before it can ship."""
import copy
import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from constellation_data import PROFILE
from constellation_links import problems
from galaxy_layout import load as load_layout
from render_site import Site


def read(name):
    return json.loads((PROFILE / name).read_text(encoding='utf-8'))


class Growth(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalog = read('data/message-bodies.json')
        cls.records = read('data/records.json')
        cls.links = read('data/constellation-links.json')
        cls.layout = load_layout()

    def grown(self):
        catalog, records = copy.deepcopy(self.catalog), copy.deepcopy(self.records)
        song = copy.deepcopy(next(b for b in catalog['bodies'] if b['body_id'] == 'songbirds'))
        song.update(body_id='growth-test-song', title='성장 시험 노래', canonical_url='https://mirinaeman.com/pages/growth-test-song/', latest_deployed_at='2099-01-01T00:00:00Z', tags=['jeju', 'audio'])
        catalog['bodies'].append(song)
        records['records'].append({'id': 'paper:growth-test-paper', 'kind': 'paper', 'group': 'article', 'title': '메타버스 성장 시험 논문', 'summary': '시험 학술지 · 1(1)', 'year': '2099', 'url': 'https://example.org/paper', 'added': '2099-01-02', 'tags': ['metaverse', 'education']})
        return catalog, records

    def test_new_records_reach_every_page(self):
        catalog, records = self.grown()
        out = {p.relative_to(PROFILE).as_posix(): c for p, c in Site(catalog, records, self.links, self.layout).outputs().items()}
        for record, page, listing in [('work:growth-test-song', 'work/growth-test-song/index.html', 'work/index.html'), ('paper:growth-test-paper', 'research/growth-test-paper/index.html', 'research/index.html')]:
            self.assertIn(page, out, f'{record} has its own page')
            href = '/' + page.removesuffix('index.html')
            self.assertIn(f'href="{href}"', out[listing], f'{record} is listed')
            self.assertIn(f'https://mirinaeman.com{href}', out['sitemap.xml'], f'{record} is in the sitemap')
            star = next(n for n in json.loads(out['galaxy/graph.json'])['nodes'] if n['id'] == record)
            self.assertEqual(len(star['p']), 3, f'{record} has a place in the sky')
            self.assertTrue(star['kin'], f'{record} has neighbours by its tags')
        latest = out['index.html'].split('latest-bodies', 1)[1]
        self.assertLess(latest.index('/research/growth-test-paper/'), latest.index('/work/growth-test-song/'), 'home shows the newest first, whatever its kind')
        self.assertIn('/galaxy/?node=paper%3Agrowth-test-paper', out['research/growth-test-paper/index.html'])
        self.assertIn('topic:metaverse', out['galaxy/graph.json'], 'a research title joins its topic by itself')

    def test_new_records_wait_for_a_decision(self):
        catalog, records = self.grown()
        found = ' '.join(problems(copy.deepcopy(self.links), catalog, records))
        self.assertIn('growth-test-song', found)
        self.assertIn('paper:growth-test-paper', found)
        links = copy.deepcopy(self.links)
        links['pairs'].append({'a': 'growth-test-song', 'b': 'songbirds', 'label': '같은 새소리', 'reason': '시험용 연결입니다.', 'status': 'proposed'})
        links['solo'].append({'id': 'paper:growth-test-paper', 'why': '시험용입니다.'})
        self.assertEqual(problems(links, catalog, records), [], 'a proposal or a reason to stand alone is enough to ship')

    def test_proposals_stay_private(self):
        catalog, records = self.grown()
        links = copy.deepcopy(self.links)
        links['pairs'].append({'a': 'growth-test-song', 'b': 'songbirds', 'label': '같은 새소리', 'reason': '비공개 제안입니다.', 'status': 'proposed'})
        approved = next(c for c in links['constellations'] if c['status'] == 'approved')
        approved['members'].append({'id': 'paper:growth-test-paper', 'reason': '승인 전 별자리 제안입니다.', 'status': 'proposed'})
        out = json.dumps({str(k): v for k, v in Site(catalog, records, links, self.layout).outputs().items()}, ensure_ascii=False)
        self.assertNotIn('비공개 제안입니다.', out)
        self.assertNotIn('승인 전 별자리 제안입니다.', out)

    def test_new_post_arrives_by_itself(self):
        post = {'id': 'post-99999', 'title': '성장 시험 글', 'url': 'https://mirinaeverse.com/growth-test/', 'date': '2099-01-01', 'image': '/assets/images/og-home.jpg', 'summary': '시험 글입니다.', 'tags': ['이미지 시네마'], 'links': ['/pages/songbirds/', '/notes/']}
        before = Site(self.catalog, self.records, self.links, self.layout, posts=[])
        site = Site(self.catalog, self.records, self.links, self.layout, posts=[post])
        out = {p.relative_to(PROFILE).as_posix(): c for p, c in site.outputs().items()}
        star = next(n for n in json.loads(out['galaxy/graph.json'])['nodes'] if n['id'] == 'post:99999')
        self.assertEqual((star['k'], star['u'], star['page']), ('post', post['url'], ''), 'a post is a star that opens the post')
        self.assertTrue(star['kin'], 'a post settles near what shares its tags')
        self.assertTrue(any({e['a'], e['b']} == {'post:99999', 'work:songbirds'} for e in site.edges), 'a link in the post is a connection')
        self.assertEqual(problems(copy.deepcopy(self.links), self.catalog, self.records), [], 'a post never holds up a release')
        self.assertNotIn('growth-test', out['sitemap.xml'])
        self.assertIn('https://mirinaeverse.com/growth-test/', out['work/songbirds/index.html'], 'the linked record shows the post')
        self.assertEqual(site.by_id['work:snail-time-jeju']['kin'], before.by_id['work:snail-time-jeju']['kin'], "a post leaves the records' neighbours alone")
        for n in site.nodes:
            if n['id'] in self.layout:
                self.assertEqual(n['p'], self.layout[n['id']], n['id'])

    def test_existing_stars_stay_put(self):
        catalog, records = self.grown()
        site = Site(catalog, records, self.links, self.layout)
        for n in site.nodes:
            if n['id'] in self.layout:
                self.assertEqual(n['p'], self.layout[n['id']], n['id'])


if __name__ == '__main__':
    unittest.main()
