"""Render the first-party work introduction from approved content and catalog identity."""
import argparse
import html
import json
from pathlib import Path
from public_routes import public_url, editorial_url

ROOT = Path(__file__).resolve().parents[1]
PROFILE = ROOT / 'pages/profile'
DATA = PROFILE / 'data/hwasan-pan-v6-intro.json'
OUTPUT = PROFILE / 'work/hwasan-pan-v6/index.html'
START = '<!-- HWASAN_INTRO_START -->'
END = '<!-- HWASAN_INTRO_END -->'


def render():
    d = json.loads(DATA.read_text())
    catalog = json.loads((PROFILE / 'data/message-bodies.json').read_text())
    body = next(b for b in catalog['bodies'] if b['body_id'] == d['body_id'])
    source = d['approved_discovery']
    url = editorial_url(d['body_id'])
    title = body['title'] + ' 작품 소개 | 미리내맨'
    desc = '미리내맨의 무협소설 화산인수에서 이어지는 메인 테마곡 판을 바꿔 v6, 이미지 시네마와 독립 웹툰 문 열어라의 공식 작품 소개.'
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
    paragraphs = ''.join(f'<p>{e(source[key])}</p>' for key in ['summary', 'meaning'])
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
<section class="section"><div class="wrap"><div class="section-head"><div><span class="eyebrow">STORY & MUSIC</span><h2>함께 여는 내일</h2></div>
<p>창작자 미리내맨 · 메인 테마곡 〈판을 바꿔〉 v6 · 재생 시간 약 3분 17초</p></div>
<div class="grid two"><article class="card"><div class="card-body"><h3>이미지 시네마</h3><p>{e(source['cinema'])}</p><p>각 인물의 선택과 행동이 다음 장면으로 이어집니다. 문을 여는 이야기는 음악과 이미지 사이에서 함께 여는 내일의 의미를 만듭니다.</p></div></article>
<article class="card"><div class="card-body"><h3>독립 웹툰 〈문 열어라〉</h3><p>{e(source['webtoon'])}</p><p>감상 페이지에서 음악과 이미지 시네마를 재생하고, 웹툰은 자신의 속도로 읽을 수 있습니다.</p></div></article></div></div></section>
<section class="section"><div class="wrap"><div class="section-head"><div><span class="eyebrow">ORIGINAL WORLD</span><h2>화산인수에서 이어지는 이야기</h2></div>
<p>〈판을 바꿔〉는 미리내맨의 장편 무협소설 〈화산인수〉를 바탕으로 만든 주제곡입니다. 원작과 캐릭터의 이야기는 <a href="https://mirinaeman.com/pages/hwasan/">화산인수 원작 페이지</a>에서 이어집니다.</p></div>
<p><a href="{public_url('archive')}" data-route-key="archive">전체 작품 아카이브</a></p></div></section>
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
