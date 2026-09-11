"""Render the first-party work introduction from approved content and catalog identity."""
import argparse
import html
import json
import re
from pathlib import Path
from public_routes import public_url, editorial_url

ROOT = Path(__file__).resolve().parents[1]
PROFILE = ROOT / 'pages/profile'
DATA = PROFILE / 'data/hwasan-pan-v6-intro.json'
OUTPUT = PROFILE / 'work/hwasan-pan-v6/index.html'
START = '<!-- HWASAN_INTRO_START -->'
END = '<!-- HWASAN_INTRO_END -->'
READING_STYLE = 'max-width:var(--measure)'
PARAGRAPH_STYLE = 'margin-block-end:var(--rhythm-heading)'
LINK_PATTERN = re.compile(r'\[([^\]]+)\]\((https://[^\s)]+)\)')


def inline_copy(text):
    parts = []
    start = 0
    for match in LINK_PATTERN.finditer(text):
        parts.append(html.escape(text[start:match.start()]))
        parts.append(f'<a href="{html.escape(match[2], quote=True)}">{html.escape(match[1])}</a>')
        start = match.end()
    parts.append(html.escape(text[start:]))
    return ''.join(parts)


def reading_copy(text):
    # Existing statement-line is a block role; preserve punctuation rhythm
    # without changing typography tokens or splitting URLs and metadata.
    return ''.join(f'<span class="statement-line">{inline_copy(line)}</span>'
                   for line in re.split(r'(?<=[,.])\s+', text))


def render_block(block):
    if block['type'] == 'paragraph':
        return f'<p style="{PARAGRAPH_STYLE}">{reading_copy(block["text"])}</p>'
    if block['type'] == 'list':
        return '<ul>' + ''.join(f'<li>{reading_copy(item)}</li>' for item in block['items']) + '</ul>'
    if block['type'] == 'comparison':
        cards = []
        for column, heading in enumerate(block['headings'], start=1):
            rows = ''.join(f'<dt>{html.escape(row[0])}</dt><dd>{reading_copy(row[column])}</dd>'
                           for row in block['rows'])
            cards.append(f'<article class="card"><div class="card-body"><h3>{html.escape(heading)}</h3><dl>{rows}</dl></div></article>')
        return '<div class="grid two">' + ''.join(cards) + '</div>'
    raise ValueError(f'Unknown editorial block: {block["type"]}')


def render_section(section):
    section_id = html.escape(section['id'], quote=True)
    heading = html.escape(section['heading'])
    blocks = ''.join(render_block(block) for block in section['blocks'])
    return (f'<section class="section" id="{section_id}" aria-labelledby="{section_id}-title">'
            f'<div class="wrap"><div style="{READING_STYLE}">'
            f'<h2 id="{section_id}-title" style="{PARAGRAPH_STYLE}">{heading}</h2>{blocks}</div></div></section>')


def render():
    d = json.loads(DATA.read_text())
    catalog = json.loads((PROFILE / 'data/message-bodies.json').read_text())
    body = next(b for b in catalog['bodies'] if b['body_id'] == d['body_id'])
    source = d['approved_discovery']
    url = editorial_url(d['body_id'])
    editorial = d['editorial']
    title = editorial['title']
    desc = editorial['description']
    og = 'https://mirinaeman.com/assets/images/hwasan-pan-v6-og.jpg'
    graph = json.loads(json.dumps(source['json_ld']['@graph']))
    # Describe the linked work without presenting this editorial page as a video player.
    graph[0] = {'@type': 'WebPage', '@id': url, 'url': url, 'name': title,
                'description': desc, 'inLanguage': 'ko',
                'creator': graph[0]['creator'], 'about': graph[0]['mainEntity']}
    for node in graph:
        if node.get('@type') == 'VideoObject':
            node['thumbnailUrl'] = og
            node['uploadDate'] = d['video_publication']['date']
    schema = json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False).replace('<', '\\u003c')
    e = html.escape
    overview, *sections = editorial['sections']
    paragraphs = ''.join(render_block(block) for block in overview['blocks']
                         if block['type'] == 'paragraph' and not LINK_PATTERN.fullmatch(block['text']))
    editorial_html = ''.join(render_section(section) for section in sections)
    text = f'''<!doctype html>
<html lang="ko" data-lang="ko" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)}</title><meta name="description" content="{e(desc)}">
<meta name="site-home" content="https://mirinaeman.com/">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="{url}"><link rel="icon" href="../../favicon.svg" type="image/svg+xml">
<meta property="og:type" content="website"><meta property="og:locale" content="ko_KR">
<meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{url}"><meta property="og:image" content="{og}">
<meta property="og:image:type" content="image/jpeg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="화산인수 판을 바꿔의 산문 오프닝">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{e(title)}">
<meta name="twitter:description" content="{e(desc)}"><meta name="twitter:image" content="{og}">
<meta name="twitter:image:alt" content="화산인수 판을 바꿔의 산문 오프닝">
<script type="application/ld+json">{schema}</script>
<link rel="stylesheet" href="../../styles.css"><script defer src="../../navigation.js"></script><script defer src="../../app.js"></script>
</head>
<body><a class="skip" href="#main">본문으로 이동</a><site-navigation data-page="work"></site-navigation>
<main id="main">
<section class="page-hero"><div class="wrap"><span class="eyebrow">HWASAN INSU · V6</span>
<h1>{e(body['title'])}</h1>{paragraphs}
<div class="actions"><a class="button primary" href="{e(body['canonical_url'])}">작품 감상하기</a></div></div></section>
<section class="section"><div class="wrap"><figure><img src="../../assets/images/hwasan-pan-v6-og.jpg" width="1200" height="630" alt="화산인수 판을 바꿔의 산문 오프닝" loading="lazy"></figure></div></section>
{editorial_html}
</main><footer class="footer"><div class="wrap"><p>© 미리내맨 · mirinaeman.com</p></div></footer></body></html>
'''
    card = f'''{START}<article class="card feature"><img class="card-media" src="../{e(body['thumbnail']['path'])}" alt="{e(body['thumbnail']['alt'])}" loading="lazy"><div class="card-body"><span class="tag">MUSIC · IMAGE CINEMA · WEBTOON</span><h2>{e(body['title'])}</h2><p>{e(body['message_sentence'])}</p><div class="actions"><a class="button" href="{url}">작품 소개</a></div></div></article>{END}'''
    work = PROFILE / 'work/index.html'
    original = work.read_text()
    if START in original:
        updated = original[:original.index(START)] + card + original[original.index(END) + len(END):]
    else:
        anchor = '<div class="grid two"><article class="card feature">'
        assert original.count(anchor) == 1
        updated = original.replace(anchor, '<div class="grid two">' + card + '<article class="card feature">', 1)
    return {OUTPUT: text, work: updated}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    check = parser.parse_args().check
    for path, value in render().items():
        if check:
            assert path.exists() and path.read_text() == value, f'Generated introduction drift: {path}'
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(value)
    print('Hwasan introduction: PASS' if check else 'Hwasan introduction rendered')
