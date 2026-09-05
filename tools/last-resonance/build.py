"""Render the work from one content authority; runtime stays plain static."""
import json, re, html, hashlib
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
PUBLIC = ROOT / 'pages/last-resonance'
read = lambda name: json.loads((HERE/name).read_text())
esc = lambda value: html.escape(str(value), quote=True)
data = read('site.json')
toon = read('webtoon.packet.json')
music = read('media-identity.packet.json')
links = {s['id']:s for s in data['sources']}
nav = ''.join(f'<a href="#{n["id"]}">{esc(n["label"])}</a>' for n in data['navigation'])
chapters = ''.join(f'<a href="#page-{p["page"]:02}" aria-label="{p["page"]}장 {esc(p["title"])}">{p["page"]:02}</a>' for p in toon['pages'])
pages = []
for p in toon['pages']:
    number = p['page']; src=p['path'].replace('.png','.webp')
    text=''.join(f'<p>{esc(line)}</p>' for line in p['editable_text'])
    pages.append(f'''<article class="chapter" id="page-{number:02}" tabindex="-1">
      <header class="chapter-head"><span class="meta">{number:02} / {toon['page_count']:02}</span><h3>{esc(p['title'])}</h3></header>
      <a class="art-link" href="{src}" target="_blank" rel="noopener" aria-label="{number}장 원본 크기로 열기"><img src="{src}" alt="{esc(p['alt'])}" width="{p['width']}" height="{p['height']}" loading="lazy" decoding="async"></a>
      <details class="transcript"><summary>{number}장 대사 읽기</summary>{text}</details>
    </article>''')
    if str(number) in data['bridges']:
        pages.append(f'<div class="chapter-bridge"><p data-motion-caption>{esc(data["bridges"][str(number)])}</p></div>')
lyrics=re.sub(r'^\[.*?\]\s*', '', music['language']['lyrics'], flags=re.M).strip()
lyric_html=''.join('<p>'+esc(block).replace('\n','<br>')+'</p>' for block in lyrics.split('\n\n') if block.strip())
facts=[]
for fact in data['facts']:
    cites=' · '.join(f'<a href="{links[i]["url"]}" target="_blank" rel="noopener">{esc(links[i]["title"])}</a>' for i in fact['sources'])
    facts.append(f'<section class="fact"><h3>{esc(fact["title"])}</h3><p>{esc(fact["text"])}</p><p class="citations">{cites}</p></section>')
schema={'@context':'https://schema.org','@type':'MusicRecording','name':data['title'],'url':data['canonical'],'byArtist':{'@type':'Person','name':data['creator']},'duration':data['track']['duration'],'genre':'Progressive Rock','inLanguage':'ko','description':data['description'],'audio':{'@type':'AudioObject','contentUrl':data['canonical']+data['track']['src'],'encodingFormat':data['track']['mime']}}
page=f'''<!doctype html>
<html lang="ko" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(data['title'])} — {esc(data['creator'])}</title><meta name="description" content="{esc(data['description'])}"><meta name="color-scheme" content="dark"><meta name="theme-color" content="#08090a">
<link rel="canonical" href="{data['canonical']}"><link rel="icon" href="favicon.svg" type="image/svg+xml">
<meta property="og:type" content="website"><meta property="og:locale" content="ko_KR"><meta property="og:title" content="{esc(data['title'])}"><meta property="og:description" content="{esc(data['description'])}"><meta property="og:url" content="{data['canonical']}"><meta property="og:image" content="{data['canonical']+data['og']['path']}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="{data['og']['width']}"><meta property="og:image:height" content="{data['og']['height']}"><meta property="og:image:alt" content="{esc(data['og']['alt'])}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="{data['canonical']+data['og']['path']}">
<script type="application/ld+json">{json.dumps(schema,ensure_ascii=False)}</script>
<link rel="stylesheet" href="tokens.css"><link rel="stylesheet" href="styles.css"><script defer src="content.js"></script><script defer src="player.js"></script><script defer src="navigation.js"></script><script defer src="src/experience/host.js"></script></head>
<body><a class="skip" href="#main">본문으로 이동</a>
<header class="site-header"><div class="nav-shell"><a class="brand" href="{data['home']}">MIRINAEMAN</a><nav class="desktop-nav" aria-label="작품 메뉴">{nav}</nav><button class="menu-toggle" aria-expanded="false" aria-controls="mobile-menu">메뉴</button></div><nav id="mobile-menu" class="mobile-menu" aria-label="모바일 작품 메뉴" hidden>{nav}</nav></header>
<main id="main">
<section id="listen" class="hero" tabindex="-1"><div class="hero-art" aria-hidden="true"><img src="assets/webtoon/page-01.webp" alt="" width="1024" height="1536" fetchpriority="high"></div><canvas id="resonance-field" aria-hidden="true"></canvas><div class="hero-copy wrap"><p class="eyebrow">{esc(data['subtitle'])}</p><h1>{esc(data['title'])}</h1><p class="thesis"><span>문은 닫혀도,</span><span>노래는 남는다.</span></p><p class="lead">좋아하던 목소리를 품고,<br>아직 열리지 않은 문 앞에 선다.</p><div class="hero-actions"><button id="listen-button" class="button" aria-controls="player-dock">노래 듣기 · {data['track']['duration_label']}</button><a class="button" href="#webtoon">웹툰 읽기 · {toon['page_count']}장</a></div><p class="meta">{esc(data['creator'])} · 프로그레시브 록 · 판타지 웹툰</p><button id="resonance-toggle" class="quiet" aria-pressed="false">공명 켜기</button><span id="experience-status" class="meta" role="status"></span></div></section>
<section id="webtoon" class="reading wrap" tabindex="-1"><header class="section-intro"><p class="eyebrow">FANTASY WEBTOON</p><h2>마지막 공명</h2><p>음유시인 라온과 기록관 세린.<br>사라질 문과 남겨질 노래를 따라가는 열 장의 이야기.</p><p class="meta">Suno 공식 예고를 바탕으로 한 판타지 비유입니다.</p><nav class="chapter-nav" aria-label="웹툰 장 이동">{chapters}</nav></header>{''.join(pages)}</section>
<section id="lyrics" class="reading wrap text-section" tabindex="-1"><p class="eyebrow">LYRICS</p><h2>노래는 남는다</h2><div class="lyrics">{lyric_html}</div></section>
<section id="news" class="reading wrap text-section" tabindex="-1"><p class="eyebrow">BEHIND THE STORY</p><h2>Suno의 새 세대 예고</h2><p class="meta">자료 확인 <time datetime="{data['date']}">{data['date']}</time></p><p class="intro">새 모델 하나의 추가를 넘어, 앞으로 새 노래를 만들 수 있는 모델의 선택지가 달라지는 변화입니다.</p>{''.join(facts)}<aside class="note"><p>{esc(data['naming_note'])}</p></aside></section>
</main><footer class="reading wrap"><p>{esc(data['anchor'])}</p><a href="{data['home']}">미리내맨의 다른 작품</a></footer>
<section id="player-dock" class="player-dock" aria-label="마지막 공명 음악 재생기" hidden><div class="player-label"><span>{esc(data['title'])}</span><span id="playback-status" role="status">준비</span><button id="close-player" class="quiet" aria-label="재생을 멈추고 플레이어 닫기">닫기</button></div><audio id="audio" controls preload="none" aria-label="마지막 공명 재생"></audio><div id="playback-error" hidden><span>음원을 불러오지 못했습니다.</span> <button id="retry-play" class="quiet">다시 듣기</button> <a href="{data['track']['src']}">음원 직접 열기</a></div></section>
<noscript><p class="reading wrap">노래는 <a href="{data['track']['src']}">음원 직접 열기</a>로 들을 수 있습니다.</p></noscript></body></html>'''
(PUBLIC/'index.html').write_text(page)
(PUBLIC/'content.js').write_text('window.RESONANCE = Object.freeze('+json.dumps({'track':data['track'],'experience':data['experience'],'breakpoints':data['breakpoints']},ensure_ascii=False)+');\n')
(PUBLIC/'sitemap.xml').write_text(f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>{data["canonical"]}</loc></url></urlset>')
(PUBLIC/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: '+data['canonical']+'sitemap.xml\n')
(PUBLIC/'site.manifest.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
tokens=read('design.authority.json')['immutable']['css_custom_properties']
(PUBLIC/'styles.css').write_text(':root {\n'+''.join(f'  {k}: {v};\n' for k,v in tokens.items())+'}\n'+(HERE/'styles.css').read_text())
(PUBLIC/'DEPLOY.txt').write_text('Static page at '+data['canonical']+'\nServe this directory without changing its relative media paths. Root robots is managed by mirinaeman.com.\n')
print('Rendered last-resonance: ten chapters, one audio authority, sourced facts')
