"""Render the approved editorial body from catalog identity and authored context."""
import argparse
import json
from urllib.parse import urljoin, urlsplit
from context_graph import PROFILE, esc, prose
from public_routes import editorial_url, public_url

BODY_ID = 'unfold-your-turn'
DESTINATION = PROFILE / 'archive' / BODY_ID


def outbound(url):
    return ' target="_blank" rel="noopener noreferrer"' if urlsplit(url).netloc != 'mirinaeman.com' else ''


def render():
    c = json.loads((PROFILE / 'data/unfold-context.json').read_text())
    catalog = {b['body_id']: b for b in json.loads((PROFILE / 'data/message-bodies.json').read_text())['bodies']}
    b = catalog[c['body_id']]
    creator = json.loads((PROFILE / 'data/creator-profile.json').read_text())
    url = editorial_url(BODY_ID)
    watch = b['canonical_url']
    work_id = watch + c['entity_fragment']
    person_id = creator['url'] + '#person'
    hub = editorial_url('image-cinema')
    asset = json.loads((DESTINATION / 'media.assets.json').read_text())['assets'][0]['delivery']
    og = urljoin(url, asset['path'])
    related = [{**r, **catalog[r['body_id']], 'intro': editorial_url(r['body_id'])} for r in c['related']]
    graph = [
        {'@type': 'WebPage', '@id': url, 'url': url, 'name': c['title'], 'description': c['description'], 'inLanguage': 'ko', 'author': {'@id': person_id}, 'mainEntity': {'@id': work_id}, 'relatedLink': [watch, hub, *[r['intro'] for r in related]]},
        {'@type': 'Person', '@id': person_id, 'name': creator['name'], 'alternateName': creator['aliases'][0], 'url': creator['url']},
        {'@type': 'CreativeWork', '@id': work_id, 'url': watch, 'name': b['title'], 'description': b['message_sentence'], 'creator': {'@id': person_id}, 'isBasedOn': c['source']['url'], 'hasPart': [{'@id': watch + v['fragment']} for v in c['versions']]},
        {'@type': 'Article', '@id': url + '#commentary', 'headline': c['title'], 'description': c['description'], 'author': {'@id': person_id}, 'about': {'@id': work_id}, 'isPartOf': {'@id': url}, 'mainEntityOfPage': {'@id': url}, 'citation': c['source']['url'], 'articleBody': c['lead'] + '\n' + '\n'.join(s['heading'] + '\n' + '\n'.join(s['paragraphs']) for s in c['sections'])},
        *[{'@type': 'CreativeWork', '@id': watch + v['fragment'], 'name': v['name'], 'description': v['description'], 'creator': {'@id': person_id}, 'isPartOf': {'@id': work_id}} for v in c['versions']],
    ]
    metadata = [('name', 'description', c['description'])]
    metadata += [('property', 'og:' + k, v) for k, v in {'type': 'website', 'title': c['title'], 'description': c['description'], 'url': url, 'image': og, 'image:type': asset['mime'], 'image:width': asset['width'], 'image:height': asset['height'], 'image:alt': b['thumbnail']['alt']}.items()]
    metadata += [('name', 'twitter:' + k, v) for k, v in {'card': 'summary_large_image', 'title': c['title'], 'description': c['description'], 'image': og, 'image:alt': b['thumbnail']['alt']}.items()]
    head = ''.join(f'<meta {attr}="{key}" content="{esc(value)}">' for attr, key, value in metadata)
    sections = ''.join('<h2>' + esc(s['heading']) + '</h2>' + ''.join('<p>' + prose(p) + '</p>' for p in s['paragraphs']) for s in c['sections'])
    versions = ''.join('<h3>' + esc(v['name']) + '</h3><p>' + prose(v['description']) + '</p>' for v in c['versions'])
    links = ''.join('<h3 data-typography-break="approved">' + prose(r['title']) + '</h3><p>' + prose(r['reason']) + '</p><p><a href="' + esc(r['intro']) + '">작품 소개 읽기</a></p>' for r in related)
    schema = json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False).replace('<', '\\u003c')
    return f'''<!doctype html><html lang="ko" data-lang="ko" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(c['title'])}</title>{head}<link rel="canonical" href="{url}"><meta name="robots" content="index,follow,max-image-preview:large"><meta name="site-home" content="{public_url('home')}"><link rel="icon" href="../../favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="../../styles.css"><link rel="stylesheet" href="../image-cinema/context.css"><script type="application/ld+json">{schema}</script><script defer src="../../navigation.js"></script><script defer src="../../app.js"></script><script defer src="../jeju-we/share.js"></script></head><body><a class="skip" href="#main">본문으로 이동</a><site-navigation data-page="archive"></site-navigation><main id="main"><section class="page-hero"><div class="wrap"><span class="eyebrow">{esc(c['eyebrow'])}</span><h1>{esc(c['heading'])}</h1><div class="context-prose"><p>{prose(c['lead'])}</p><p>글과 창작 판단 · <a href="{creator['url']}">{esc(creator['name'])}({esc(creator['aliases'][0])})</a></p></div><div class="actions"><a class="button primary" href="{watch}"{outbound(watch)}>노래·웹툰·시네마 감상하기 ↗</a><button class="button" id="share-page" type="button">페이지 공유</button></div><p id="share-status" role="status"></p></div></section><section class="section"><div class="wrap context-prose"><figure><img src="{asset['path']}" width="{asset['width']}" height="{asset['height']}" alt="{esc(b['thumbnail']['alt'])}"></figure>{sections}<p><a href="{esc(c['source']['url'])}"{outbound(c['source']['url'])}>{esc(c['source']['label'])} ↗</a></p><h2>두 목소리로 감상하기</h2>{versions}<p>음악 · 미리내맨 / Suno로 제작<br>원화 · AI 생성 이미지</p><p><a class="button primary" href="{watch}"{outbound(watch)}>두 버전과 웹툰 만나기 ↗</a></p></div></section><section class="section"><div class="wrap context-prose"><h2>이어지는 작품</h2>{links}<p><a href="{hub}">창작노트</a>에서 이미지 시네마와 관객의 해석 여백을 더 읽을 수 있습니다.</p></div></section></main><footer class="footer"><div class="wrap"><p>© {esc(creator['name'])} · 미리내맨</p><a href="{public_url('archive')}">전체 아카이브</a></div></footer></body></html>'''


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    output = render()
    path = DESTINATION / 'index.html'
    if args.check:
        assert path.read_text() == output, 'Unfold introduction drift'
    else:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(output)
    print('Unfold introduction: PASS')
