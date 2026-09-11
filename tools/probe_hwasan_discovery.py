"""Observe public delivery; never infer indexing or AI citation from HTTP success."""
import argparse
import hashlib
import io
import json
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import urlopen
from urllib.robotparser import RobotFileParser
from xml.etree import ElementTree
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PROFILE = ROOT / 'pages/profile'
CANONICAL = 'https://mirinaeman.com/work/hwasan-pan-v6/'


class Document(HTMLParser):
    def __init__(self):
        super().__init__(); self.meta = {}; self.canonical = []; self.links = []; self.json = ''; self.structured = False; self.text = []; self.skip = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'meta': self.meta[a.get('property', a.get('name', ''))] = a.get('content', '')
        if tag == 'link' and a.get('rel') == 'canonical': self.canonical.append(a['href'])
        if tag == 'a' and 'href' in a: self.links.append(a['href'])
        if tag in ('script', 'style'): self.skip += 1
        if tag == 'script' and a.get('type') == 'application/ld+json': self.structured = True

    def handle_endtag(self, tag):
        if tag in ('script', 'style'): self.skip = max(0, self.skip - 1)
        if tag == 'script': self.structured = False

    def handle_data(self, data):
        if self.structured: self.json += data
        if not self.skip: self.text.append(data)


def request(url, evidence):
    try:
        response = urlopen(url, timeout=30)
    except HTTPError as error:
        response = error
    body = response.read()
    evidence.append({'url': url, 'final_url': response.url, 'status': response.status,
                     'content_type': response.headers.get('Content-Type'),
                     'x_robots_tag': response.headers.get('X-Robots-Tag'),
                     'sha256': hashlib.sha256(body).hexdigest()})
    assert response.status == 200, f'{url}: HTTP {response.status}'
    assert 'noindex' not in response.headers.get('X-Robots-Tag', '').lower()
    return body


def verify(local=False):
    evidence = []
    report = {'checked_at': datetime.now(timezone.utc).isoformat(),
              'scope': 'local-output' if local else 'unauthenticated-public-http',
              'canonical': CANONICAL, 'requests': evidence,
              'engine_retrieval': 'not measured: owner Search Console login required',
              'indexed': 'not measured', 'ai_citation': 'not measured'}
    try:
        paths = ['work/hwasan-pan-v6/index.html', 'robots.txt', 'sitemap.xml', 'assets/images/hwasan-pan-v6-og.jpg', 'work/index.html']
        urls = [CANONICAL, 'https://mirinaeman.com/robots.txt', 'https://mirinaeman.com/sitemap.xml', 'https://mirinaeman.com/assets/images/hwasan-pan-v6-og.jpg', 'https://mirinaeman.com/work/']
        data = [(PROFILE / p).read_bytes() if local else request(u, evidence) for p, u in zip(paths, urls)]
        doc = Document(); doc.feed(data[0].decode())
        assert doc.canonical == [CANONICAL]
        assert doc.meta['og:url'] == CANONICAL
        assert doc.meta['og:title'] == doc.meta['twitter:title']
        assert doc.meta['description'] == doc.meta['og:description'] == doc.meta['twitter:description']
        assert doc.meta['twitter:card'] == 'summary_large_image'
        assert doc.meta['og:image'] == doc.meta['twitter:image'] == urls[3]
        assert 'noindex' not in doc.meta['robots']
        visible = ' '.join(doc.text)
        for fact in ['화산인수', '판을 바꿔', '미리내맨', '문 열어라']: assert fact in visible, fact
        graph = json.loads(doc.json)['@graph']
        assert graph[0]['@id'] == CANONICAL and graph[0]['@type'] == 'WebPage'
        assert any(n['@type'] == 'MusicRecording' for n in graph)
        video = next(n for n in graph if n['@type'] == 'VideoObject')
        assert datetime.fromisoformat(video['uploadDate'])
        assert all(video.get(key) for key in ['name', 'thumbnailUrl', 'contentUrl'])
        parser = RobotFileParser(); parser.parse(data[1].decode().splitlines())
        for agent in ['Googlebot', 'bingbot', 'OAI-SearchBot']: assert parser.can_fetch(agent, CANONICAL), agent
        sitemap = ElementTree.fromstring(data[2])
        assert CANONICAL in [n.text for n in sitemap.iter() if n.tag.endswith('loc')]
        image = Image.open(io.BytesIO(data[3])); image.load(); assert image.format == 'JPEG' and image.size == (1200, 630)
        assert hashlib.sha256(data[3]).digest() == hashlib.sha256((PROFILE / paths[3]).read_bytes()).digest()
        work = Document(); work.feed(data[4].decode()); assert CANONICAL in work.links
        assert 'https://hwasan-pan-v6.mirinaeman.chatgpt.site/' in doc.links
        report.update({'result': 'PASS', 'seo_title': doc.meta['og:title'], 'seo_description': doc.meta['description'],
                       'json_ld_types': sorted(set(n['@type'] for n in graph)),
                       'note': 'Robots policy and this HTTP client are checked; real search crawlers and indexing are separate measurements.'})
    except Exception as error:
        report.update({'result': 'FAIL', 'error': str(error)})
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser(); parser.add_argument('--local', action='store_true'); parser.add_argument('--output')
    args = parser.parse_args(); report = verify(args.local)
    result = json.dumps(report, ensure_ascii=False, indent=2)
    if args.output: Path(args.output).write_text(result + '\n')
    print(result)
    raise SystemExit(report['result'] != 'PASS')

