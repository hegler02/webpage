"""Expose existing authored introductions without changing artwork destinations."""
import html
import json
from html.parser import HTMLParser
from public_routes import PROFILE, manifest, public_url


class Metadata(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_title = False
        self.title = ''
        self.description = ''
        self.canonical = ''

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'title':
            self.in_title = True
        if tag == 'meta' and attrs.get('name') == 'description':
            self.description = attrs.get('content', '')
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = attrs.get('href', '')

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False

    def handle_data(self, value):
        if self.in_title:
            self.title += value


def outputs():
    data = manifest()
    origin = data['public_home'].rstrip('/')
    hub = '/archive/image-cinema/'
    entries = []
    for path in reversed(data['editorial_pages']):
        doc = Metadata()
        doc.feed((PROFILE / path.strip('/') / 'index.html').read_text(encoding='utf-8'))
        if not doc.title or not doc.description or doc.canonical != origin + path:
            raise ValueError(f'Incomplete introduction metadata: {path}')
        if path != hub:
            entries.append((path, doc))
    e = html.escape
    cards = ''.join(
        f'<a class="card" href="{e(origin + path)}"><div class="card-body">'
        f'<h2>{e(doc.title)}</h2><p>{e(doc.description)}</p></div></a>'
        for path, doc in entries
    )
    url = public_url('notes')
    description = '미리내맨의 작품은 어떤 생각과 경험에서 시작됐을까. 노래, 이미지 시네마, 웹툰과 웹 작품의 소개·제작 해설을 읽습니다.'
    schema = json.dumps({'@context': 'https://schema.org', '@type': 'CollectionPage',
        'name': '작품해설', 'url': url, 'description': description,
        'mainEntity': {'@type': 'ItemList', 'numberOfItems': len(entries),
            'itemListElement': [{'@type': 'ListItem', 'position': i, 'name': doc.title, 'url': origin + path}
                for i, (path, doc) in enumerate(entries, 1)]}}, ensure_ascii=False)
    page = f'''<!doctype html>
<html lang="ko" data-lang="ko" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>작품해설 | 미리내맨 김준호</title>
<meta name="description" content="{e(description)}"><meta name="site-home" content="{e(data['public_home'])}">
<link rel="canonical" href="{url}"><link rel="icon" href="../favicon.svg" type="image/svg+xml">
<meta property="og:type" content="website"><meta property="og:title" content="작품해설 | 미리내맨 김준호">
<meta property="og:description" content="{e(description)}"><meta property="og:url" content="{url}">
<meta property="og:image" content="{origin}/assets/images/profile-hero.webp"><meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="../styles.css"><script defer src="../navigation.js"></script><script defer src="../app.js"></script>
<script type="application/ld+json">{schema}</script>
</head>
<body>
<a class="skip" href="#main">본문으로 이동</a><site-navigation data-page="notes"></site-navigation>
<main id="main">
<section class="page-hero"><div class="wrap"><span class="eyebrow">WORK NOTES</span><h1>작품해설</h1>
<p class="lede">{e(description)}</p><div class="actions"><a class="button" href="{origin + hub}">이미지 시네마의 창작 관점 읽기</a></div></div></section>
<section class="section"><div class="wrap"><div class="grid two">{cards}</div></div></section>
</main>
<footer class="footer"><div class="wrap"><p>© Joonho Kim · mirinaeman.com</p><p><a href="{public_url('archive')}">전체 작품 감상하기</a></p></div></footer>
</body></html>
'''
    return {PROFILE / 'notes/index.html': page}
