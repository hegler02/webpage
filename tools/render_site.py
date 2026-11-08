#!/usr/bin/env python3
"""Every public page comes from one graph, so a new record reaches all of them at once."""
import html
import json
import math
import re
from datetime import datetime
from html.parser import HTMLParser
from urllib.parse import quote, urlsplit

from constellation_data import PROFILE
from galaxy_layout import HUB
from records import KINDS, slug
from render_creator_profile import contact_block, film_block, person_schema
from site_graph import RECORD_KINDS, read_json, site_graph
from work_note_thumbnails import load as load_covers

ORIGIN = 'https://mirinaeman.com'
HOME_LATEST = 8
RAIL_ITEMS = 12
HUB_NOTE = '/archive/image-cinema/'
KIND_LABEL = {
    'song': ('노래', 'Song'), 'slide': ('슬라이드', 'Slide'), 'screen': ('영상', 'Screen'), 'story': ('이야기', 'Story'), 'knowledge': ('배움', 'Learning'),
    **{k: (v[1], v[2]) for k, v in KINDS.items()},
    'concept': ('생각', 'Idea'), 'topic': ('연구 주제', 'Research topic'), 'judgment': ('제작 판단', 'Judgment'), 'essay': ('글', 'Essay'), 'post': ('MIRINAEVERSE 글', 'MIRINAEVERSE post'), 'constellation': ('별자리', 'Constellation'), 'creator': ('창작자', 'Creator'),
}
OPEN_LABEL = {**{k: v[3] for k, v in KINDS.items()}, **{k: ('작품 보기', 'Open work') for k in ('song', 'slide', 'screen', 'story', 'knowledge')}}
TITLE = '김준호 | AI와 함께 메시지의 몸을 만드는 사람'
DESCRIPTION = '미디어융합 공학박사 김준호 교수의 AI 창작, 제품, 저술, 연구, 특허와 미리내운동을 소개하는 공식 프로필입니다.'


def e(value):
    return html.escape(str(value), quote=True)


def t(ko, en=None):
    """Both languages stay in the page; the stylesheet shows one."""
    if en is None:
        return e(ko)
    return f'<span data-ko>{e(ko)}</span><span data-en lang="en">{e(en)}</span>'


def label(pair):
    return t(*pair)


def lines(ko, en):
    def wrap(items):
        return ''.join(f'<span class="line">{e(x)}</span>' for x in items)
    return f'<span data-ko>{wrap(ko)}</span><span data-en lang="en">{wrap(en)}</span>'


def out_attrs(url):
    return ' target="_blank" rel="noopener noreferrer"'


SHARE = '/assets/images/og-home.jpg'
SHARE_ALT = '김준호의 이름과 작품들이 별로 이어진 미리내맨 은하수'


def page(path, key, title, description, main, image=SHARE, image_alt='', schema=None, og='website', dark=False, image_size=None):
    url = ORIGIN + path
    if image == SHARE:
        image_alt, image_size = image_alt or SHARE_ALT, image_size or ('image/jpeg', 1200, 630)
    head = [
        f'<title>{e(title)}</title>',
        f'<meta name="description" content="{e(description)}">',
        f'<meta name="site-home" content="{ORIGIN}/">',
        f'<link rel="canonical" href="{e(url)}">',
        '<link rel="icon" href="/favicon.ico" sizes="32x32">',
        '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
        '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
        f'<meta property="og:type" content="{og}">',
        '<meta property="og:locale" content="ko_KR">',
        f'<meta property="og:title" content="{e(title)}">',
        f'<meta property="og:description" content="{e(description)}">',
        f'<meta property="og:url" content="{e(url)}">',
        f'<meta property="og:image" content="{e(ORIGIN + image)}">',
    ]
    if image_size:
        kind, width, height = image_size
        head += [f'<meta property="og:image:type" content="{kind}">', f'<meta property="og:image:width" content="{width}">', f'<meta property="og:image:height" content="{height}">']
    if image_alt:
        head.append(f'<meta property="og:image:alt" content="{e(image_alt)}">')
    head += ['<meta name="twitter:card" content="summary_large_image">', f'<meta name="twitter:title" content="{e(title)}">', f'<meta name="twitter:description" content="{e(description)}">', f'<meta name="twitter:image" content="{e(ORIGIN + image)}">']
    if image_alt:
        head.append(f'<meta name="twitter:image:alt" content="{e(image_alt)}">')
    if schema:
        head.append('<script type="application/ld+json">' + json.dumps(schema, ensure_ascii=False).replace('<', '\\u003c') + '</script>')
    return f'''<!doctype html>
<html lang="ko" data-lang="ko" data-theme="dark">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
{chr(10).join(head)}
<script>(function(){{var r=document.documentElement,t,l;try{{t=localStorage.getItem('profile-theme');l=localStorage.getItem('profile-language')}}catch(e){{}}t=t==='night'?'dark':t==='morning'?'light':t;r.dataset.theme=t||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');if(l){{r.dataset.lang=l;r.lang=l}}}})()</script>
<link rel="stylesheet" href="/site/site.css">
<script defer src="/navigation.js"></script><script defer src="/app.js"></script><script defer src="/site/site.js"></script>
</head>
<body data-page="{key}">
<a class="skip" href="#main">본문으로 이동</a>
<site-navigation data-page="{key}"></site-navigation>
<main id="main" data-page="{key}"{' data-theme="dark"' if dark else ''}>
{main}
</main>
<footer class="foot"><p><a href="{ORIGIN}/archive/image-cinema/" data-context-nav>{t('창작노트', 'Creative notes')}</a> · <a href="/work/message-body-plugins/">{t('미리내맨 플러그인', 'Mirinaeman plugins')}</a></p><p>© Joonho Kim · mirinaeman.com</p><p>{t('인간의 판단이 최종 수용 권한을 갖습니다.', 'Human judgment retains final authority over acceptance.')}</p></footer>
</body>
</html>
'''


class Metadata(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_title = False
        self.title = ''
        self.description = ''

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.in_title = self.in_title or tag == 'title'
        if tag == 'meta' and attrs.get('name') == 'description':
            self.description = attrs.get('content', '')

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False

    def handle_data(self, value):
        if self.in_title:
            self.title += value


class Site:
    def __init__(self, catalog=None, records=None, links=None, layout=None, posts=None):
        g = site_graph(catalog, records, links, layout, posts)
        self.g = g
        self.nodes = g['nodes']
        self.by_id = {n['id']: n for n in self.nodes}
        self.edges = g['edges']
        self.manifest = g['manifest']
        self.near = {n['id']: [] for n in self.nodes}
        for edge in self.edges:
            self.near[edge['a']].append((edge, edge['b']))
            self.near[edge['b']].append((edge, edge['a']))
        self.records = [n for n in self.nodes if n['k'] in RECORD_KINDS]
        self.stars = sorted((n for n in self.nodes if n['k'] == 'constellation'), key=lambda n: n['t'])
        self.editorial = set(self.manifest['editorial_pages'])
        self.covers = load_covers()
        self.notes = []
        for path in reversed(self.manifest['editorial_pages']):
            doc = Metadata()
            doc.feed((PROFILE / path.strip('/') / 'index.html').read_text(encoding='utf-8'))
            self.notes.append(dict(path=path, title=doc.title.strip(), description=doc.description.strip(), cover=self.covers[path], body=path.rstrip('/').split('/')[-1]))
        self.note_of = {n['body']: n for n in self.notes}

    # Shared parts
    def image(self, n, cls=''):
        if not n.get('img'):
            return ''
        return f'<img{f" class={chr(34)}{cls}{chr(34)}" if cls else ""} src="{e(n["img"])}" alt="" loading="lazy" decoding="async">'

    def menu_of(self, n):
        return KINDS[n['k']][0] if n['k'] in KINDS else 'work'

    def stars_of(self, n):
        return [o for edge, o in self.near[n['id']] if self.by_id[o]['k'] == 'constellation']

    def link_of(self, n):
        # A post has no page here; it lives on Mirinaeverse.
        return n['page'] or (n['u'] if n['k'] == 'post' else '/galaxy/?node=' + quote(n['id'], safe=''))

    def away(self, n):
        return out_attrs(n['u']) if n['k'] == 'post' else ''

    def card(self, n, text=None):
        body = n['id'].removeprefix('work:') if n['id'].startswith('work:') else ''
        marks = f' data-body-id="{e(body)}"' if body else ''
        group = 'outside' if n['k'] in KINDS else n['k']
        words = ' '.join([n['t'], n['s'], *n['tags']]).lower()
        pic = n.get('img') and f'<img{f" data-body-thumbnail={chr(34)}{e(body)}{chr(34)}" if body else ""} src="{e(n["img"])}" alt="{e(n.get("alt", ""))}" width="960" height="540" loading="lazy" decoding="async">'
        summary = t(text['ko'], text['en']) if text else e(n['s'])
        return f'<a class="card" href="{e(n["page"])}"{marks} data-kind="{group}" data-stars="{e(" ".join(self.stars_of(n)))}" data-text="{e(words)}">{pic or ""}<div class="tx"><em>{label(KIND_LABEL[n["k"]])}</em><b>{e(n["t"])}</b><span class="sum">{summary}</span></div></a>'

    def row(self, n):
        return f'<li><a class="row" href="{e(n["page"])}"><span class="why">{label(KIND_LABEL[n["k"]])}</span><span class="to">{e(n["t"])}</span><span class="note">{e(n["s"])}</span></a></li>'

    def latest(self):
        return sorted(self.records, key=lambda n: (n.get('added', ''), n['id']), reverse=True)[:HOME_LATEST]

    def schema_list(self, name, path, items):
        return {'@context': 'https://schema.org', '@type': 'CollectionPage', 'name': name, 'url': ORIGIN + path,
                'mainEntity': {'@type': 'ItemList', 'numberOfItems': len(items), 'itemListElement': [{'@type': 'ListItem', 'position': i, 'name': n['t'], 'url': ORIGIN + n['page']} for i, n in enumerate(items, 1)]}}

    # Home
    def home(self):
        works = [n for n in self.records if self.menu_of(n) == 'work']
        count = {k: sum(n['k'] == k for n in self.records) for k in KINDS}
        doors = [
            ('/work/', ('작업', 'Work'), ('음악과 영상, 강의, 이야기와 제품. 만드는 행위가 어떤 관계와 태도를 갖는지 보여줍니다.', 'Music, film, lectures, stories, and products: how acts of making embody relation and attitude.'), (f'기록 {len(works)}개', f'{len(works)} records')),
            ('/galaxy/', ('은하수', 'Galaxy'), ('모든 기록이 맥락으로 이어진 지도.', 'A map where every record connects through context.'), (f'별자리 {len(self.stars)}개', f'{len(self.stars)} constellations')),
            ('/research/', ('연구', 'Research'), ('생각과 주장이 기록과 증거의 몸을 갖습니다.', 'Ideas and claims take on bodies of record and evidence.'), (f'책 {count["book"]}권 · 논문 {count["paper"]}편', f'{count["book"]} books · {count["paper"]} papers')),
            ('/mirinae/', ('미리내', 'Mirinae'), ('기술과 창작이 나눔의 거리를 줄입니다.', 'Technology and creation shorten the distance to sharing.'), ('2013년부터', 'Since 2013')),
            ('/about/', ('소개', 'About'), ('판단의 기준과 최종 책임이 한 사람의 태도를 드러냅니다.', 'Criteria for judgment and final responsibility reveal the person behind the work.'), ('판단과 프로필', 'Judgment and profile')),
        ]
        door_html = ''.join(f'<a class="door" href="{h}"><b>{label(a)}</b><span>{label(b)}</span><i>{label(c)}</i></a>' for h, a, b, c in doors)
        main = f'''<section class="opening" data-theme="dark"><div id="stage-slot" class="stage-slot"></div><div class="copy"><span class="eyebrow">{t('교수 · 저자 · 창작자 · 시스템 설계자', 'Professor · Author · Creator · System Designer')}</span><h1>{t('김준호', 'JOONHO KIM')}</h1><p class="say">{lines(['AI에게 판단을 맡기지 않고,', 'AI와 함께 메시지의 몸을 만드는 사람.'], ['I do not hand judgment to AI.', 'I work with AI to give messages a body.'])}</p><p class="more">{t('미디어융합 전공 공학박사 김준호는 음악, 영상, 출판, 제품, 연구와 사회적 가치를 하나의 인과관계로 연결합니다.', 'Joonho Kim, Ph.D. in media convergence, connects music, video, publishing, products, research, and social value through one causal body.')}</p><div class="btns"><a class="btn main" href="/galaxy/">{t('은하수 보기', 'Enter the galaxy')}</a><a class="btn" href="/work/">{t('작업 보기', 'View work')}</a></div></div></section>
<div class="page"><p class="state">{t('미디어는 메시지의 몸이다.', 'Media is the body of the message.')}</p>
<section class="sec"><h2>{t('한 사람을 이루는 관계', 'Relations that form one person')}</h2><p>{t('홈은 모든 내용을 쌓아놓는 곳이 아니라 각 관계로 들어가는 문입니다.', 'The home page is a set of doors into distinct relationships, not a pile of every detail.')}</p><div class="doors">{door_html}</div></section>
<section class="sec"><div class="band"><div><span class="eyebrow">{t('미리내운동', 'Mirinae Movement')}</span><h2>{t('한 사람의 선의가 다음 사람의 일상을 먼저 지불한다.', 'One person’s goodwill pays ahead for another person’s day.')}</h2><p>{t('2013년 시작한 선결제 나눔 운동입니다. 미리내맨이라는 이름도 여기서 나왔습니다.', 'A pay-it-forward movement begun in 2013. The name Mirinaeman comes from it.')}</p><div class="btns"><a class="btn" href="/mirinae/">{t('미리내 보기', 'About Mirinae')}</a></div></div><img src="/assets/images/mirinae-hero-v1.webp" alt="작은 나눔이 코발트 빛을 따라 다음 사람에게 이어지는 장면" loading="lazy"></div></section>
<section class="sec latest-bodies"><h2>{t('내 미디어 철학이 몸을 입는 순간', 'The moment my media philosophy takes a body')}</h2><p>{t('노래, 슬라이드, 화면과 이야기가 배포로 끝나지 않고 다음 창작을 바꾸는 기억으로 축적됩니다.', 'Songs, slides, screens, and stories accumulate as memory that changes the next creation.')}</p><div class="grid">{''.join(self.card(n) for n in self.latest())}</div><div class="btns"><a class="btn main" href="/work/">{t('전체 작업', 'All work')}</a><a class="btn" href="{ORIGIN}{HUB_NOTE}">{t('이미지 시네마 창작 연구', 'Image cinema notes')}</a></div></section>{self.channel_rails()}</div>'''
        schema = {'@context': 'https://schema.org', '@type': 'Person', 'name': '김준호', 'alternateName': 'JOONHO KIM', 'url': ORIGIN + '/', 'jobTitle': '교수 · 저자 · 창작자 · 시스템 설계자'}
        return page('/', 'home', TITLE, DESCRIPTION, main, schema=schema, og='profile')

    def channel_rails(self):
        """Videos and music of The Mirinaeman Project, then new Mirinaeverse posts; tools/update_channel.py keeps them current."""
        path = PROFILE / 'data/channel.json'
        data = read_json(path) if path.is_file() else {}
        # Each group ends with one way out to where everything lives.
        groups = [([('videos', ('새 영상 · The Mirinaeman Project', 'New videos · The Mirinaeman Project'), '영상 장면', 270, ''),
                    ('albums', ('음원 · The Mirinaeman Project', 'Music · The Mirinaeman Project'), '앨범 표지', 480, ' square')], ('YouTube에서 모두 보기', 'All on YouTube')),
                  ([('posts', ('새 글 · MIRINAEVERSE', 'New writing · MIRINAEVERSE'), '글 표지', 270, '')], ('MIRINAEVERSE에서 모두 보기', 'All on MIRINAEVERSE'))]
        out = ''
        for rails, more in groups:
            group = ''
            for name, title, alt, height, shape in rails:
                rail = data.get(name, {})
                if not rail.get('items'):
                    continue
                cards = ''
                for i in rail['items'][:RAIL_ITEMS]:
                    date = f'<small>{e(i["date"].replace("-", "."))}</small>' if i.get('date') else ''
                    cards += f'<li><a href="{e(i["url"])}"{out_attrs(i["url"])}><img src="{e(i["image"])}" alt="{e(i["title"])} {alt}" width="480" height="{height}" loading="lazy" decoding="async"><b>{e(i["title"])}</b>{date}</a></li>'
                arrows = '<button class="rail-arrow prev" type="button" data-rail="-1" aria-label="이전" hidden>‹</button><button class="rail-arrow next" type="button" data-rail="1" aria-label="다음">›</button>'
                group += f'<section class="sec releases" id="{name}"><h2>{t(*title)}</h2><div class="rail-wrap{shape}">{arrows}<ul class="rail{shape}" data-rail-track>{cards}</ul></div></section>'
                home = rail['home']
            if group:
                out += group[:-len('</section>')] + f'<div class="btns"><a class="btn" href="{e(home)}"{out_attrs(home)}>{t(*more)} ↗</a></div></section>'
        return out

    # Work
    def work(self):
        data = self.g['records']
        featured = [self.card(self.by_id[f['id']], f.get('text')) for f in data['featured'] if f['id'] in self.by_id]
        listed = sorted((n for n in self.records if self.menu_of(n) == 'work'), key=lambda n: (n.get('added', ''), n['id']), reverse=True)
        kinds = [('', '전체', 'All', len(listed)), ('song', '노래', 'Songs', 0), ('slide', '슬라이드', 'Slides', 0), ('screen', '영상', 'Screens', 0), ('story', '이야기', 'Stories', 0), ('knowledge', '배움', 'Learning', 0), ('outside', '연출·제품', 'Direction & products', 0), ('notes', '작품해설', 'Work notes', 0)]
        group = lambda n: 'outside' if n['k'] in KINDS else n['k']
        buttons = ''
        for k, ko, en, _ in kinds:
            number = len(listed) if not k else len([x for x in self.notes if x['path'] != HUB_NOTE]) if k == 'notes' else sum(group(n) == k for n in listed)
            buttons += f'<button type="button" data-kind="{k}" aria-pressed="{"true" if not k else "false"}">{t(ko, en)} {number}</button>'
        options = ''.join(f'<option value="{e(s["id"])}">{e(s["t"])}</option>' for s in self.stars)
        notes = ''.join(self.note_card(x) for x in self.notes if x['path'] != HUB_NOTE)
        main = f'''<div class="page"><span class="eyebrow">{t('작업', 'Work')}</span><h1>{t('창작은 축적될 때 하나의 세계가 된다.', 'Creation becomes a world through accumulation.')}</h1><p class="lead">{t('영상, 음악, 지역의 이야기와 제품을 각각의 매체에 맞는 몸으로 만듭니다.', 'Film, music, local stories, and products each take the body appropriate to their medium.')}</p>
<section class="sec"><h2>{t('메시지를 다양한 몸에 투영한 프로젝트', 'Projects that project messages into different bodies')}</h2><p>{t('노래, 이미지, 역사와 웹페이지가 각각 메시지를 경험하게 하는 몸이 됩니다.', 'Songs, images, history, and web pages each become bodies through which a message is experienced.')}</p><div class="grid">{''.join(featured)}</div></section>
<section class="sec" id="all"><h2>{t('전체 기록', 'All records')}</h2><p>{t('이야기는 매체를 만날 때 몸을 얻습니다. 각 메시지는 자신에게 맞는 몸으로 남습니다.', 'A story gains a body when it meets its medium. Each message keeps the body it requires.')}</p>
<div class="filters"><div class="chips" aria-label="{t('종류로 거르기')}">{buttons}</div><div class="finders"><select id="star" aria-label="별자리로 거르기"><option value="">{t('모든 별자리')}</option>{options}</select><input id="wq" type="search" placeholder="제목으로 찾기" aria-label="제목으로 찾기"><span class="count" id="wc" aria-live="polite"></span></div></div>
<div class="grid" id="wg">{''.join(self.card(n) for n in listed)}</div>
<div id="notes" hidden><p class="fine">{t('미리내맨의 작품은 어떤 생각과 경험에서 시작됐을까. 노래, 이미지 시네마, 웹툰과 웹 작품의 소개·제작 해설을 읽습니다. 표지 이미지는 각 해설의 내용을 바탕으로 AI로 제작했습니다.', 'Where did each work begin? Notes on the songs, image cinema, webtoons and web works. Cover images were made with AI from each note.')}</p><div class="grid notes-grid">{notes}</div></div></section>
<section class="sec"><p class="state small">{t('배포된 작업은 사라지지 않고 다음 몸의 기억이 된다.', 'Published work becomes memory for the next body.')}</p></section></div>'''
        return page('/work/', 'work', '작업 | 김준호', '노래, 영상, 강의, 이야기, 제품과 작품해설까지 김준호의 작업 기록 전체.', main, image='/assets/images/work-hero-v1.webp', schema=self.schema_list('작업', '/work/', listed))

    def note_card(self, note):
        cover = note['cover']
        return f'<a class="card note" href="{e(ORIGIN + note["path"])}"><img src="{e(cover["small"])}" srcset="{e(cover["small"])} 600w, {e(cover["image"])} 1200w" sizes="(max-width:820px) 100vw,40vw" width="1200" height="675" alt="{e(cover["alt"])}" loading="lazy" decoding="async"><div class="tx"><em>{t("작품해설", "Work note")}</em><b>{e(note["title"])}</b><span class="sum">{e(note["description"])}</span></div></a>'

    # Record
    def record(self, n):
        menu = self.menu_of(n)
        own = self.g['own'].get(n['id'], {})
        back = ('/research/', ('연구', 'Research')) if menu == 'research' else ('/work/', ('작업', 'Work'))
        buttons = []
        if n['u'] and OPEN_LABEL.get(n['k']) and urlsplit(n['u']).path not in ('/work/', '/research/'):
            ko, en = OPEN_LABEL[n['k']]
            if n['k'] == 'paper' and own.get('source_label'):
                ko = own['source_label'] + ' 보기'
            buttons.append(f'<a class="btn main" href="{e(n["u"])}"{out_attrs(n["u"])}>{t(ko, en)} ↗</a>')
        note = self.note_of.get(n['id'].removeprefix('work:'))
        if note:
            buttons.append(f'<a class="btn" href="{e(ORIGIN + note["path"])}">{t("해설 읽기", "Read the note")}</a>')
        buttons.append(f'<a class="btn" href="/galaxy/?node={quote(n["id"], safe="")}">{t("은하수에서 보기", "See in the galaxy")}</a>')
        meta = ' · '.join(x for x in [own.get('when') or n['y'], own.get('label'), own.get('degree'), '' if n['u'] else own.get('source_label')] if x)
        figure = f'<figure class="fig"><img src="{e(n["img"])}" alt="{e(n.get("alt", ""))}"></figure>' if n.get('img') and not own.get('video_id') else '<div></div>'
        if own.get('video_id'):
            figure = f'<div><figure class="fig video-shell"><img src="{e(n["img"])}" alt="{e(n.get("alt", ""))}"><button class="btn main video-load" type="button" data-video-id="{e(own["video_id"])}" data-title="{e(n["t"])}">{t("영상 불러오기", "Load video")}</button></figure><p class="fine">{t("선택하기 전에는 영상 제공자와 연결하지 않습니다.", "The video provider is not contacted before your choice.")}</p></div>'
        summary = t(n['s'], own['summary_en']) if own.get('summary_en') else e(n['s'])
        tags = f'<ul class="fields" aria-label="태그">{"".join(f"<li>{e(x)}</li>" for x in n["tags"])}</ul>' if n['tags'] else ''
        main = f'''<div class="page"><a class="back" href="{back[0]}">← {label(back[1])}</a>
<div class="record"><div><span class="eyebrow">{label(KIND_LABEL[n['k']])}{' · ' + e(meta) if meta else ''}</span><h1 class="rec-title">{e(n['t'])}</h1><p class="lead">{summary}</p>{tags}<div class="btns">{''.join(buttons)}</div></div>{figure}</div>
{self.context(n)}</div>'''
        kind = {'paper': 'ScholarlyArticle', 'book': 'Book', 'patent': 'CreativeWork', 'product': 'SoftwareApplication'}.get(n['k'], 'CreativeWork')
        schema = {'@context': 'https://schema.org', '@type': kind, 'name': n['t'], 'description': n['s'], 'url': ORIGIN + n['page'], 'author': {'@type': 'Person', 'name': '김준호', 'url': ORIGIN + '/about/'}}
        if n['u'] and urlsplit(n['u']).path not in ('/work/', '/research/'):
            schema['sameAs'] = n['u']
        return page(n['page'], menu, f'{n["t"]} | 김준호', n['s'], main, image=n.get('img') or SHARE, image_alt=n.get('alt', ''), schema=schema, og='article')

    def context(self, n, compact=False):
        """What surrounds a record: where it belongs, what it links to, and what resembles it."""
        relations = [(edge, self.by_id[o]) for edge, o in self.near[n['id']] if not edge['hub']]
        groups = [(edge, o) for edge, o in relations if o['k'] == 'constellation']
        others = [(edge, o) for edge, o in relations if o['k'] != 'constellation']
        parts = []
        if groups:
            rows = ''
            for edge, star in groups:
                mates = [self.by_id[o] for _, o in self.near[star['id']] if o != n['id']][:6]
                row_mates = ''.join(f'<a href="{e(self.link_of(m))}"{self.away(m)}>{e(m["t"])}</a>' for m in mates)
                rows += f'<li class="row"><a class="to" href="/galaxy/?node={quote(star["id"], safe="")}">{e(star["t"])}</a><span class="note">{e(edge["r"])}</span><span class="mates">{row_mates}</span></li>'
            parts.append(f'<section class="sec"><h2>{t("속한 별자리", "Constellations")}</h2><ul class="rows">{rows}</ul></section>')
        if others:
            # Links that share a label and a reason are one statement; say it once.
            same = {}
            for edge, o in others:
                same.setdefault((edge['l'], edge['r']), []).append(o)
            rows = ''
            for (name, reason), targets in same.items():
                if len(targets) == 1:
                    rows += f'<li><a class="row" href="{e(self.link_of(targets[0]))}"{self.away(targets[0])}><span class="why">{e(name)}</span><span class="to">{e(targets[0]["t"])}</span><span class="note">{e(reason)}</span></a></li>'
                else:
                    links = ''.join(f'<a href="{e(self.link_of(o))}"{self.away(o)}>{e(o["t"])}</a>' for o in targets)
                    rows += f'<li class="row"><span class="why">{e(name)}</span><span class="mates to">{links}</span><span class="note">{e(reason)}</span></li>'
            parts.append(f'<section class="sec"><h2>{t("이어지는 맥락", "Connected context")}</h2><ul class="rows">{rows}</ul></section>')
        taken = {o['id'] for _, o in relations}
        kin = [self.by_id[i] for i in n['kin'] if i not in taken and self.by_id[i]['k'] in RECORD_KINDS][:4]
        if kin:
            # Hand-written pages keep their own card styles, so the context added under them uses rows.
            body = f'<ul class="rows">{"".join(self.row(o) for o in kin)}</ul>' if compact else f'<div class="grid">{"".join(self.card(o) for o in kin)}</div>'
            parts.append(f'<section class="sec"><h2>{t("함께 볼 기록", "See also")}</h2>{body}</section>')
        note = self.note_of.get(n['id'].removeprefix('work:'))
        if note:
            parts.insert(0, f'<section class="sec"><h2>{t("작품해설", "Work note")}</h2><div class="grid notes-grid">{self.note_card(note)}</div></section>')
        return ''.join(parts)

    # Research
    def research(self):
        of = lambda kind: [n for n in self.records if n['k'] == kind]
        own = self.g['own']
        books = ''.join(f'<a href="{e(n["page"])}"><img src="{e(n["img"])}" alt="{e(n["alt"])}" loading="lazy" decoding="async">' + (f'<em>{e(own[n["id"]]["label"])}</em>' if own[n['id']].get('label') else '') + f'<b>{e(n["t"])}</b><span>{e(n["s"])}</span></a>' for n in of('book'))

        def row(n, when=None, mark=''):
            lang = ' lang="en"' if re.fullmatch(r'[\x00-\x7f°–’]+', n['t']) else ''
            return f'<a href="{e(n["page"])}"><time>{e(when or n["y"])}</time><div>{mark}<b{lang}>{e(n["t"])}</b><small>{e(n["s"])}</small></div></a>'
        papers = of('paper')
        order = lambda n: (-int(n['y'] or 0), n['id'])
        theses = sorted((n for n in papers if own[n['id']]['group'] == 'thesis'), key=order)
        articles = sorted((n for n in papers if own[n['id']]['group'] == 'article'), key=lambda n: (not n['key'], *order(n)))
        key_mark = f'<span class="mark">{t("주요 논문", "Key paper")}</span>'
        thesis_rows = ''.join(row(n, mark=f'<span class="mark">{t(own[n["id"]]["degree"], own[n["id"]]["degree_en"])}</span>') for n in theses)
        article_rows = ''.join(row(n, mark=key_mark if n['key'] else '') for n in articles)
        projects = sorted(of('project'), key=lambda n: (-int(n['y'] or 0)))
        project_rows = ''.join(row(n, when=own[n['id']]['when']) for n in projects)
        patent_rows = ''.join(f'<a href="{e(n["page"])}"><time>{t("특허", "Patent")}</time><div><b>{e(n["t"])}</b>' + (f'<small>{e(own[n["id"]]["number"])}</small>' if own[n['id']].get('number') else '') + '</div></a>' for n in of('patent'))
        tabs = [('books', ('책', 'Books'), len(of('book'))), ('papers', ('논문', 'Papers'), len(papers)), ('projects', ('연구 과제', 'Projects'), len(projects)), ('patents', ('특허', 'Patents'), len(of('patent')))]
        tab_html = ''.join(f'<button type="button" data-tab="{k}" aria-controls="{k}" aria-pressed="{"true" if i == 0 else "false"}">{label(name)} {count}</button>' for i, (k, name, count) in enumerate(tabs))
        main = f'''<div class="page"><span class="eyebrow">{t('연구', 'Research')}</span><h1>{t('주장은 증거의 몸을 가져야 한다.', 'Claims need a body of evidence.')}</h1><p class="lead">{t('생각은 기록될 때 다음 판단의 근거가 됩니다. 미디어, 생성형 AI, 창작과 교육에 관한 저서와 연구입니다.', 'Recorded thought becomes evidence for the next judgment. Books and research on media, generative AI, creation, and education.')}</p>
<ul class="fields" aria-label="연구 영역"><li>{t('생성형 AI 창작 연구', 'Generative AI creation')}</li><li>{t('메타버스와 몰입형 교육', 'Metaverse and immersive education')}</li><li>{t('스마트 양봉과 센서 시스템', 'Smart beekeeping and sensor systems')}</li><li>{t('실감콘텐츠와 XR 교육', 'Immersive content and XR education')}</li></ul>
<div class="tabs" id="research-tabs">{tab_html}</div>
<section class="panel" id="books" data-panel="books"><h2 class="sr">{t('책', 'Books')}</h2><p>{t('각 책은 서로 다른 독자와 질문을 향합니다.', 'Each book addresses a distinct reader and question.')}</p><div class="books">{books}</div></section>
<section class="panel" id="papers" data-panel="papers"><h2 class="sr">{t('논문', 'Papers')}</h2><p>{t(f'학위논문 {len(theses)}편을 먼저 제시하고, 공식 서지에서 확인한 학술논문 {len(articles)}편을 이어서 정리했습니다.', f'{len(theses)} degree theses come first, followed by {len(articles)} journal articles verified against official records.')}</p><h3 id="degree-theses-title">{t('학위논문', 'Degree theses')}</h3><div class="list" data-research-list="theses">{thesis_rows}</div><h3 id="journal-articles-title">{t('학술논문', 'Journal articles')}</h3><div class="list" data-research-list="articles">{article_rows}</div></section>
<section class="panel" id="projects" data-panel="projects"><h2 class="sr">{t('연구 과제', 'Projects')}</h2><p>{t('교육, XR, AI, IoT를 실제 시스템으로 연결한 주요 연구·개발 이력입니다.', 'Selected research and development connecting education, XR, AI, and IoT with working systems.')}</p><div class="list">{project_rows}</div></section>
<section class="panel" id="patents" data-panel="patents"><h2 class="sr">{t('특허', 'Patents')}</h2><div class="list">{patent_rows}</div></section></div>'''
        return page('/research/', 'research', '연구 | 김준호', '김준호의 저서, 학위·학술논문, 연구 과제와 특허 기록.', main, image='/assets/images/books-hero-v1.webp', schema=self.schema_list('연구', '/research/', [*of('book'), *papers, *projects, *of('patent')]))

    # Mirinae
    def mirinae(self):
        source = 'https://soundcloud.com/hegler02/mirinae-market'
        kin = self.by_id.get('work:mirinaeman-theme')
        main = f'''<div class="page"><span class="eyebrow">{t('미리내운동 · 2013년 김준호 창시', 'Mirinae Movement · Founded by Joonho Kim, 2013')}</span><h1>{t('한 사람의 선의가 다음 사람의 일상을 먼저 지불한다.', 'One person’s goodwill pays ahead for another person’s day.')}</h1><p class="lead">{t('미리내운동은 김준호가 2013년 창시한 선결제 나눔 운동입니다. 누군가 음식이나 서비스를 미리 내어두면, 필요한 사람이 미리내가게에서 사용할 수 있습니다. 미리내맨이라는 이름도 여기서 나왔습니다.', 'Founded by Joonho Kim in 2013, the Mirinae Movement is a pay-it-forward movement: one person prepays for food or a service so another person can use it later at a participating Mirinae store. The name Mirinaeman comes from it.')}</p>
<div class="btns"><a class="btn main" href="https://mirinaeverse.com"{out_attrs('')}>{t('미리내운동 공식 홈페이지', 'Mirinae Movement')} ↗</a><a class="btn" href="https://blog.naver.com/mirinaeverse"{out_attrs('')}>Blog ↗</a></div>
<img class="wide-img" src="/assets/images/mirinae-hero-v1.webp" alt="작은 나눔이 코발트 빛을 따라 다음 사람에게 이어지는 장면">
<section class="sec"><div class="band"><div><h2>{t('미리 낸 마음이 다음 사람에게 닿는다.', 'A gift paid forward reaches the next person.')}</h2><p>{t('미리내운동이 만든 것은 쿠폰이나 결제 방식만이 아닙니다. 선의를 부담 없이 주고받을 수 있도록 관계를 설계한 사회적 인터페이스입니다.', 'The movement created more than a coupon or payment method. It designed a social interface through which goodwill could be offered and received without burden.')}</p></div><img src="/assets/images/existing/mirinae-characters.webp" alt="나눔이 이어지는 미리내운동의 장면" loading="lazy"></div></section>
<section class="sec"><h2>{t('미리내운동 주제곡 · Mirinae Market', 'Theme song · Mirinae Market')}</h2><p>{t('한 사람의 선의가 다음 사람에게 이어지는 미리내운동의 마음을 음악으로 담았습니다.', 'The theme song gives musical form to the Mirinae Movement—a gift of goodwill passed from one person to the next.')}</p><div class="btns"><button class="btn main" type="button" data-soundcloud-url="{source}" data-title="미리내운동 주제곡 · Mirinae Market" aria-controls="mirinae-theme-player" aria-expanded="false">{t('주제곡 듣기', 'Listen to the theme song')}</button><a class="btn" href="{source}"{out_attrs('')}>{t('SoundCloud에서 열기', 'Open on SoundCloud')} ↗</a></div><div class="sound" id="mirinae-theme-player" data-soundcloud-shell aria-live="polite" hidden></div></section>
<section class="sec"><h2>{t('선의가 관계가 되는 세 단계', 'Three steps turn goodwill into a relationship')}</h2><p>{t('설명이 아니라 누구나 이해하고 참여할 수 있는 작동 방식입니다.', 'A legible mechanism lets anyone understand and participate.')}</p><ol class="steps"><li><em>01</em><b>{t('미리 낸다', 'A person prepays')}</b><span>{t('누군가 다음 사람을 위해 음식이나 서비스의 값을 먼저 냅니다.', 'Someone pays in advance for food or a service for the next person.')}</span></li><li><em>02</em><b>{t('가게가 기록한다', 'The store records it')}</b><span>{t('참여 가게는 사용할 수 있는 나눔을 보이게 기록합니다.', 'The participating store makes the available gift visible.')}</span></li><li><em>03</em><b>{t('다음 사람이 사용한다', 'The next person uses it')}</b><span>{t('필요한 사람은 신분을 증명하는 대신 준비된 나눔을 사용합니다.', 'A person in need uses the prepared gift without having to prove their identity.')}</span></li></ol></section>
<section class="sec"><h2>{t('시작과 확산을 기록한다.', 'Remembering its origin and spread.')}</h2><div class="list"><div><time>2013.05</time><div><b>{t('경남 산청 후후커피에서 첫 미리내가게가 시작됐습니다.', 'The first Mirinae store began at HooHoo Coffee in Sancheong, South Gyeongsang Province.')}</b></div></div><div><time>2014.01</time><div><b>{t('약 150개 가게로 확산되며 카페를 넘어 식당과 다양한 생활 업종이 참여했습니다.', 'The network reached about 150 stores and expanded beyond cafés into restaurants and everyday services.')}</b></div></div><div><time>2019</time><div><b>{t('회고 보도에서는 전국 400~500곳까지 참여한 것으로 소개됐습니다.', 'A retrospective report described participation growing to roughly 400–500 locations nationwide.')}</b></div></div></div></section>
<section class="sec"><h2>{t('영향과 한계를 함께 남깁니다.', 'Influence and limits belong in the same record.')}</h2><p>{t('모든 참여 가게가 계속 남아 있지는 않았고 자발적 운동이라 정확한 이용 결과를 모두 추적하지도 못했습니다. 그러나 대가 없이 먼저 내고 다음 사람에게 연결하는 방식은 여러 지역과 나눔 활동에 영향을 남겼습니다.', 'Not every participating store remained active, and the voluntary movement did not track every use. Its central practice—giving first and connecting that gift to the next person—nevertheless influenced sharing initiatives in many communities.')}</p><h3>{t('확인 자료', 'Sources')}</h3><ul class="facts"><li><a href="https://www.mk.co.kr/news/culture/5634402"{out_attrs('')}>매일경제 · 2013년 첫 가게와 초기 확산 ↗</a></li><li><a href="https://www.mt.co.kr/society/2014/01/23/2014012310328297179"{out_attrs('')}>머니투데이·뉴스1 · 2014년 150개 가게 ↗</a></li><li><a href="https://www.bizhankook.com/bk/article/17098"{out_attrs('')}>비즈한국 · 창시자 인터뷰와 전국 확산 회고 ↗</a></li></ul></section>
<section class="sec"><p class="state small">{t('기술은 나눔의 거리를 줄일 수 있다.', 'Technology can shorten the distance to sharing.')}</p><p>{t('기술과 창작은 선의를 대신하지 않습니다. 선의가 다음 사람에게 닿을 수 있는 거리를 줄입니다.', 'Technology and creativity do not replace goodwill. They shorten the distance it must travel to reach the next person.')}</p></section>
{f'<section class="sec"><h2>{t("여기서 이어지는 작업", "Work that grew from here")}</h2><div class="grid">{self.card(kin)}</div></section>' if kin else ''}</div>'''
        return page('/mirinae/', 'mirinae', '미리내운동 | 김준호', '미리내운동은 김준호가 2013년 창시한 선결제 나눔 운동입니다. 한 사람의 선의가 다음 사람의 일상을 먼저 지불합니다.', main, image='/assets/images/mirinae-hero-v1.webp', image_alt='작은 나눔이 코발트 빛을 따라 다음 사람에게 이어지는 장면')

    # About
    def about(self):
        data = read_json(PROFILE / 'data/creator-profile.json')
        main = f'''<div class="page"><span class="eyebrow">{t('소개', 'About')}</span><h1>{t('판단을 빌려주지 않는 사람.', 'A person who does not lend away judgment.')}</h1><p class="lead">{t(data['intro']['ko'], data['intro']['en'])} {t(data['practice']['ko'], data['practice']['en'])}</p>
<section class="sec"><div class="band"><div><h2>{t('AI가 질문하고, 증거와 코드가 답을 강제하며, 인간이 최종 판정한다.', 'AI asks at scale, evidence and code compel an answer, and humans make the final judgment.')}</h2><p>{lines(['기능이 작동해도 잘못된 태도를 경험하게 하면 실패입니다.', '판단이 결과를 바꾸지 못하면 주권도 아닙니다.'], ['A working feature still fails if it embodies the wrong attitude.', 'Judgment is not sovereign if it cannot change the outcome.'])}</p></div><img src="/assets/images/human-judgment.webp" alt="기록 문서와 디지털 설계도 사이에 놓인 열린 판단의 문" loading="lazy"></div></section>
<section class="sec"><h2>{t('모든 몸이 답해야 하는 네 질문', 'Four questions every body must answer')}</h2><p>{t('인간 판단은 다섯 번째 축이 아니라 이 몸을 받아들일 최종 주권입니다.', 'Human judgment is not a fifth axis; it is final sovereignty over acceptance.')}</p><ol class="steps"><li><em>RELATION</em><b>{t('어떤 관계를 몸으로 만드는가?', 'What relation does it embody?')}</b></li><li><em>ATTITUDE</em><b>{t('어떤 태도를 경험하게 하는가?', 'What attitude does it make tangible?')}</b></li><li><em>MEMORY</em><b>{t('실패를 추적하고 기억하는가?', 'Can it trace and remember failure?')}</b></li><li><em>TRANSFORMATION</em><b>{t('결과가 실제 구조를 바꾸는가?', 'Does the result change the structure?')}</b></li></ol></section>
<section class="sec"><h2>{t('주장은 증거의 몸을 가져야 한다.', 'Claims need a body of evidence.')}</h2><p>{t('수상과 현재 역할을 검증 가능한 단위로 분리했습니다.', 'Awards and current roles are separated into verifiable units.')}</p><div class="two"><div><h3>{t('현재 역할', 'Current roles')}</h3><ul class="facts"><li>동서울대학교 전기공학과 부교수 · 융합교육지원센터 책임교수</li><li>한국고등직업교육학회 부회장 · AIDX 혁신위원회 위원장</li><li>한국대학신문 ‘미래기술맛보기’ 연재</li><li>Genspark · Lovable 엠버서더</li></ul></div><div><h3>{t('수상', 'Awards')}</h3><ul class="facts"><li>한국색채대상 블루상 · 2024</li><li>한국색채대상 혁신상 · 2022</li><li>서울 혁신상 우수상 · 2014</li><li>ISAAC 국제학술대회 Best Paper Awards</li><li>경기도 슈퍼맨 창조 오디션 금상</li><li>서울과학기술대학교 석·박사 우수논문상</li></ul></div></div></section>
{contact_block(data)}
{film_block(data)}</div>'''
        return page('/about/', 'about', data['title'], data['description'], main, image=urlsplit(data['image']['url']).path, image_alt=data['image']['alt'], schema=person_schema(data), og='profile')

    # Galaxy
    def galaxy(self):
        real = sum(not x['hub'] for x in self.edges)
        legend = [('song', '노래', 'Songs'), ('slide', '슬라이드', 'Slides'), ('screen', '영상', 'Screens'), ('story', '이야기', 'Stories'), ('knowledge', '배움', 'Learning'), ('research', '연구', 'Research'), ('outside', '연출·제품', 'Direction & products'), ('post', '글', 'Writing'), ('thought', '생각·별자리', 'Ideas')]
        legend_html = ''.join(f'<button type="button" data-k="{k}" aria-pressed="false" style="--c:var(--k-{k})"><i></i>{t(a, b)}</button>' for k, a, b in legend)
        index = ''.join(f'<li><a href="{e(self.link_of(n))}"{self.away(n)}>{e(n["t"])}</a> <small>{label(KIND_LABEL[n["k"]])}</small></li>' for n in sorted(self.nodes, key=lambda n: (n['k'] != 'constellation', n['t'])) if n['id'] != HUB)
        main = f'''<div id="galaxy-page"><div id="stage-slot" class="slot-full"></div>
<header class="gx-head"><h1>{t('미리내맨 은하수', 'Mirinaeman Galaxy')}</h1><p>{t(f'별 {len(self.nodes)}개 · 맥락 {real}개', f'{len(self.nodes)} stars · {real} connections')}</p><div class="gx-actions"><button type="button" id="all">{t('은하수 전체 보기', 'Whole galaxy')}</button><button type="button" id="stars">{t('별자리 전체 보기', 'All constellations')}</button></div><div class="search"><input id="q" type="search" placeholder="작품과 생각 찾기" aria-label="작품과 생각 찾기" autocomplete="off"><div class="results" id="results" hidden></div></div></header>
<footer class="gx-foot"><div class="trail" id="trail" hidden></div><div class="legend" id="legend">{legend_html}</div></footer></div>
<section class="reading-index" aria-label="기록 목록"><h2>{t('모든 기록', 'All records')}</h2><ul>{index}</ul></section>'''
        schema = {'@context': 'https://schema.org', '@type': 'CollectionPage', 'url': ORIGIN + '/galaxy/', 'name': '미리내맨 은하수', 'description': '김준호의 작품과 개인적인 기록, 창작의 판단과 논문을 맥락으로 이어 읽는 공간.',
                  'mainEntity': {'@type': 'ItemList', 'numberOfItems': len(self.records), 'itemListElement': [{'@type': 'ListItem', 'position': i, 'name': n['t'], 'url': ORIGIN + n['page']} for i, n in enumerate(self.records, 1)]}}
        return page('/galaxy/', 'galaxy', '미리내맨 은하수 | 김준호', '김준호의 작품과 논문, 생각과 기록이 맥락으로 이어진 은하수.', main, image='/galaxy/assets/og.jpg', image_alt='별자리에서 이어 읽는 작품, 벌써 가을의 장면', image_size=('image/jpeg', 1200, 630), schema=schema, dark=True)

    def graph_json(self):
        keep = ('id', 'k', 't', 's', 'u', 'page', 'intro', 'y', 'img', 'alt', 'p', 'd', 'key', 'kin', 'tags', 'sec')
        nodes = [{k: n[k] for k in keep if k in n} for n in self.nodes]
        return json.dumps({'schemaVersion': 3, 'nodes': nodes, 'edges': self.edges}, ensure_ascii=False, separators=(',', ':')) + '\n'

    def map_svg(self):
        """A plain picture of the sky for other sites; mirinaeverse.com shows it on its first screen."""
        tokens = (PROFILE / 'site/tokens.css').read_text(encoding='utf-8')
        color = lambda k: (re.search(rf'--k-{k}:(#\w+)', tokens) or re.search(r'--k-creator:(#\w+)', tokens)).group(1)
        width, height = 800, 520
        reach = max(math.hypot(n['p'][0], n['p'][2]) for n in self.nodes if n['k'] != 'constellation') or 1
        def place(n):
            x, y, z = n['p']
            return round(width / 2 + x * width / 2 / reach * .96, 1), round(height / 2 + (z * .62 + y * .25) * height / 2 / (reach * .62) * .96, 1)
        spot = {n['id']: place(n) for n in self.nodes}
        out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}">']
        for x in self.edges:
            if x['hub']:
                continue
            (x1, y1), (x2, y2) = spot[x['a']], spot[x['b']]
            post = 'post' in (self.by_id[x['a']]['k'], self.by_id[x['b']]['k'])
            out.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color("post") if post else color("song")}" stroke-opacity="{.32 if post else .13}" stroke-width="{1 if post else .6}"/>')
        for n in sorted(self.nodes, key=lambda n: n['k'] == 'post'):
            cx, cy = spot[n['id']]
            k = n['k']
            out.append(f'<circle cx="{cx}" cy="{cy}" r="{4 if k == "post" else 5 if k == "creator" else 2.2}" fill="{color(k)}" fill-opacity="{1 if k in ("post", "creator") else .72}"/>')
        return ''.join(out) + '</svg>\n'

    def context_json(self):
        """Introductions are written by hand; the context around them arrives through the shared script."""
        blocks = {}
        for note in self.notes:
            n = self.by_id.get('work:' + note['body'])
            if not n:
                continue
            own_page = note['path'] == n['page']
            lead = '' if own_page else f'<a class="btn" href="{e(n["page"])}">{t("이 기록의 전체 맥락", "Full context of this record")}</a> '
            sky = f'<a class="btn" href="/galaxy/?node={quote(n["id"], safe="")}">{t("은하수에서 보기", "See in the galaxy")}</a>'
            blocks[note['path']] = f'<aside class="page-context" data-page-context><div class="btns">{lead}{sky}</div>{self.context_without_note(n)}</aside>'
        return json.dumps(blocks, ensure_ascii=False, separators=(',', ':')) + '\n'

    def context_without_note(self, n):
        keep_notes, self.note_of = self.note_of, {}
        try:
            return self.context(n, compact=True)
        finally:
            self.note_of = keep_notes

    def sitemap(self):
        data = self.manifest
        home = data['public_home'].rstrip('/')
        urls = [home + r['public_path'] for r in data['routes']]
        urls += [home + n['page'] for n in self.records]
        urls += [home + p for p in data.get('editorial_pages', [])]
        urls += [home + p for p in data.get('additional_sitemap_paths', [])]
        urls += [n['u'] for n in self.records if urlsplit(n['u']).netloc == 'mirinaeman.com']
        unique = list(dict.fromkeys(urls))
        body = ''.join(f'<url><loc>{e(u)}</loc></url>' for u in unique)
        return f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{body}</urlset>\n'

    def outputs(self):
        pages = {
            'index.html': self.home(), 'work/index.html': self.work(), 'research/index.html': self.research(),
            'mirinae/index.html': self.mirinae(), 'about/index.html': self.about(), 'galaxy/index.html': self.galaxy(),
            'galaxy/graph.json': self.graph_json(), 'galaxy/map.svg': self.map_svg(), 'site/editorial-context.json': self.context_json(), 'sitemap.xml': self.sitemap(),
        }
        for n in self.records:
            if n['page'] not in self.editorial:
                pages[n['page'].strip('/') + '/index.html'] = self.record(n)
        return {PROFILE / k: v for k, v in pages.items()}


def outputs(**kwargs):
    return Site(**kwargs).outputs()
