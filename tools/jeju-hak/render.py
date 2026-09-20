#!/usr/bin/env python3
"""Compile one content/identity authority into the static lecture and discovery metadata."""
from pathlib import Path
from html import escape
import json,re,hashlib,sys
ROOT=Path(__file__).resolve().parents[2];SRC=Path(__file__).parent;OUT=ROOT/'pages/jeju_hak'
d=json.loads((SRC/'content.json').read_text());raw=(SRC/'deck.html').read_text()
for k,v in d.items():
 if isinstance(v,str):raw=raw.replace('{{'+k+'}}',escape(v))
def punctuate(m):
 opening,tag,inner,closing=m.groups()
 inner=re.sub(r'([,.])\s+(?=(?:<[^>]+>)*[^\s<])',r'\1<br>',inner)
 if tag.startswith('h') and '<br>' in inner:
  opening=opening[:-1]+f' data-typography-break="approved" data-typography-lines="{inner.count("<br>")+1}">'
 return opening+inner+closing
raw=re.sub(r'(<(h[1-3]|p)\b[^>]*>)(.*?)(</\2>)',punctuate,raw,flags=re.S)
sections=re.findall(r'<section\b.*?</section>',raw,re.S)
assert len(sections)==15
outline=[[] for _ in d['parts']];compiled=[]
for i,s in enumerate(sections,1):
 s=s.replace('<section ',f'<section id="slide-{i:02}" tabindex="-1" ',1)
 title=re.search(r'<h[12][^>]*>(.*?)</h[12]>',s,re.S).group(1);title=re.sub('<[^>]+>','',title.replace('<br>',' ')).strip()
 part=int(re.search(r'data-part="(\d+)"',s).group(1));outline[part-1].append(f'<a class="outline-link" href="#slide-{i:02}"><span>{i:02}</span>{title}</a>')
 s=s.replace('</section>',f'<span class="slide-index">{i:02} / {len(sections):02}</span></section>');compiled.append(s)
canonical=d['canonical'];image=canonical+'assets/og.jpg'
graph={'@context':'https://schema.org','@graph':[{'@type':'WebPage','@id':canonical,'url':canonical,'name':d['title'],'description':d['description'],'inLanguage':'ko','mainEntity':{'@id':canonical+'#lecture'},'author':{'@id':d['creator_id']},'relatedLink':[d['related_url']]},{'@type':'CreativeWork','@id':canonical+'#lecture','url':canonical,'name':d['title'],'description':d['description'],'learningResourceType':'슬라이드','educationalUse':'교육','creator':{'@id':d['creator_id']},'image':image},{'@type':'Person','@id':d['creator_id'],'name':'김준호','alternateName':'미리내맨','url':d['creator_url']}]}
meta=f'<title>{escape(d["title"])}</title>\n<meta name="description" content="{escape(d["description"])}">\n<link rel="canonical" href="{canonical}">'
for k,v in {'type':'website','title':d['title'],'description':d['description'],'url':canonical,'image':image,'image:type':'image/jpeg','image:width':'1200','image:height':'630','image:alt':d['image_alt'],'locale':'ko_KR','site_name':'미리내맨'}.items():meta+=f'\n<meta property="og:{k}" content="{escape(v)}">'
for k,v in {'card':'summary_large_image','title':d['title'],'description':d['description'],'image':image,'image:alt':d['image_alt']}.items():meta+=f'\n<meta name="twitter:{k}" content="{escape(v)}">'
def svg(content):return f'<svg viewBox="0 0 24 24" width="20" height="20" data-icon="true" fill="none" stroke="currentColor" focusable="false" aria-hidden="true">{content}</svg>'
icons={'menu':svg('<path d="M4 6h16M4 12h16M4 18h16"/>'),'full':svg('<path d="M4 9V4h5m6 0h5v5m0 6v5h-5M9 20H4v-5"/>'),'share':svg('<path d="M9 15l6-6M8 7l2-2a5 5 0 0 1 7 7l-2 2M16 17l-2 2a5 5 0 0 1-7-7l2-2"/>'),'close':svg('<path d="m6 6 12 12M18 6 6 18"/>')}
version=hashlib.sha256(''.join((OUT/f).read_text() for f in ['styles.css','presentation.js','motion.js']).encode()).hexdigest()[:12]
html=f'''<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#1e1914"><meta name="color-scheme" content="dark light">{meta}
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><link rel="preload" href="assets/lecture-sans.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="styles.css?v={version}">
<script type="application/ld+json">{json.dumps(graph,ensure_ascii=False)}</script>
<script id="deck-settings" type="application/json">{json.dumps({'parts':d['parts']},ensure_ascii=False)}</script>
<script type="module" src="presentation.js?v={version}"></script>
<noscript><link rel="stylesheet" href="reading.css"></noscript></head><body>
<a class="skip-link" href="#stage">발표 내용으로 건너뛰기</a><div class="app">
<header class="app-header"><a class="brand" href="https://mirinaeman.com/archive/"><span class="brand-mark">{{ M }}</span><span>MIRINAEMAN / LECTURE</span></a><span class="header-title">Coding is the Body of the Message</span><div class="header-actions js-only"><button class="icon-button" id="share" aria-label="현재 슬라이드 링크 복사" title="현재 슬라이드 링크 복사">{icons['share']}</button><button class="icon-button" id="fullscreen" aria-label="전체화면" aria-pressed="false">{icons['full']}</button><button class="icon-button" id="menu" aria-label="목차 열기" aria-expanded="false" aria-controls="outline">{icons['menu']}</button></div></header>
<main id="stage-viewport" class="stage-viewport"><div class="stage-wrap"><div id="stage" class="stage" aria-label="코딩은 메시지의 몸이다 — 15장 강의">{''.join(compiled)}<div id="curtain" class="transition-curtain" aria-hidden="true"></div></div></div></main>
<footer class="toolbar js-only"><div class="progress-label"><span id="position" class="position"></span><span id="current-part" class="current-part"></span></div><div class="segments" id="segments" aria-label="슬라이드 바로가기"></div><div class="nav-group"><span class="hint">← → / SPACE</span><button class="nav-button" id="previous" aria-label="이전 슬라이드">← 이전</button><button class="nav-button next" id="next" aria-label="다음 슬라이드">다음 →</button></div></footer>
</div><p id="status" class="sr-only" role="status" aria-live="polite"></p><p id="notice" class="notice" role="status" aria-live="polite"></p>
<dialog id="outline" class="dialog" aria-labelledby="outline-title"><div class="dialog-head"><h2 id="outline-title">생각에서 서비스까지</h2><button class="icon-button" data-close aria-label="목차 닫기">{icons['close']}</button></div><nav class="outline-grid" aria-label="강의 목차">{''.join(f'<div class="outline-group"><h3>PART {i+1:02} / {escape(part)}</h3>'+''.join(outline[i])+'</div>' for i,part in enumerate(d['parts']))}</nav><div class="outline-footer"><a href="{d['creator_url']}">김준호 · 미리내맨</a><label class="motion-option"><input id="reduce-motion" type="checkbox"> 모션 줄이기</label><span>방향키로 이동 · ESC로 닫기</span></div></dialog>
<dialog id="share-dialog" class="dialog" aria-labelledby="share-title"><div class="dialog-head"><h2 id="share-title">현재 슬라이드 공유</h2><button class="icon-button" data-close aria-label="공유 창 닫기">{icons['close']}</button></div><div class="share-field"><label for="share-url">아래 주소를 선택해 복사하세요.</label><input id="share-url" readonly></div></dialog>
</body></html>'''
if '--check' in sys.argv:
 assert (OUT/'index.html').read_text()==html,'Lecture output differs: run tools/jeju-hak/render.py'
 print('Lecture render: PASS')
else:(OUT/'index.html').write_text(html);print('Rendered 15 lecture scenes')
