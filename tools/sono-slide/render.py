"""Render the bilingual lecture from its single content authority."""
from pathlib import Path
from html import escape
import json,re,hashlib,sys
R=Path(__file__).resolve().parents[2];S=Path(__file__).parent;P=R/'pages/sono_slide'
d=json.loads((S/'content.json').read_text());ko=d['i18n']['ko']
def t(key,tag='p',cls=''):
 return f'<{tag} data-i18n="{key}"'+(f' class="{cls}"' if cls else '')+'>'+ko[key]+f'</{tag}>'
def label(s):return f'<p class="eyebrow">{s}</p>'
def head(n,kicker):return '<header class="slide-head">'+label(kicker)+t(f's{n}_title','h2','title reveal')+'</header>'
def panel(i,title,body,cls=''):
 return f'<article class="panel reveal {cls}"><span class="ordinal">{i:02}</span>'+t(title,'h3')+t(body)+'</article>'
def screen(name,alt):
 return f'<figure class="screen reveal"><div class="screen-chrome"><span></span><span></span><span></span><b>{alt}</b></div><img src="assets/{name}.webp" width="1800" height="800" alt="{alt}" loading="lazy" decoding="async">'+t('screenshot_note','figcaption')+'</figure>'
def section(n,cls,body,motion='scene'):
 part=1 if n<5 else 2 if n<13 else 3
 return f'<section id="slide-{n:02}" class="slide {cls}" data-part="{part}" data-motion="{motion}" tabindex="-1">{body}<span class="slide-index">{n:02} / 17</span></section>'
slides=[]
slides.append(section(1,'hero',f'<div class="hero-copy">{label("AI MUSIC / A PERSONAL MEDIUM")}{t("s1_title","h1","display reveal")}{t("s1_lead","p","lead reveal")}<div class="signature">{t("s1_speaker")}</div></div><figure class="record-art reveal"><img src="assets/album-home.webp" width="960" height="540" alt="내가 집으로 가는 줄 알았지 — 실제 발표 작품 이미지"><figcaption><span>SIDE A / MY STORY</span><span>01—17</span></figcaption><div class="record-label"><span>PRIVATE<br>MUSIC</span><i aria-hidden="true"></i></div></figure>', 'chapter'))
slides.append(section(2,'manifesto',label('01 / THE MESSAGE')+t('s2_title','h2','manifesto-title reveal')+'<div class="statement-rule"></div>'+t('s2_lead','p','statement-copy reveal'),'statement'))
slides.append(section(3,'shift',head(3,'01 / PUBLIC → PRIVATE')+'<div class="content comparison two"><article class="panel reveal public"><span class="panel-kicker">PUBLIC</span>'+t('listen','h3')+t('public_detail')+'</article><article class="panel reveal private"><span class="panel-kicker">PRIVATE</span>'+t('speak','h3')+t('private_detail')+'</article></div>','compare'))
slides.append(section(4,'',head(4,'01 / A CHANGE OF CENTER')+'<div class="content three">'+''.join(panel(i,f's4_c{i}_t',f's4_c{i}_p','featured' if i==2 else '') for i in range(1,4))+'</div>','compare'))
slides.append(section(5,'chapter amber',label('PART 02 / DESIGN THE SONG')+t('s5_title','h2','chapter-title reveal')+'<div class="chapter-footer"><span>LYRICS / GENRE / VOCAL / PURPOSE</span><span>02—03</span></div>','chapter'))
slides.append(section(6,'',head(6,'02 / FOUR DECISIONS')+'<div class="content four question-cards">'+''.join(panel(i,f's6_c{i}_t',f's6_c{i}_p') for i in range(1,5))+'</div>','sequence'))
slides.append(section(7,'media-slide',head(7,'02 / THE PRODUCTION BRIEF')+'<div class="content media-grid"><div class="media-copy reveal"><span class="wordmark">SUNO<span>↗</span></span>'+t('s7_p','p','lead')+'</div>'+screen('suno-start','Suno · Start')+'</div>'))
slides.append(section(8,'media-slide',head(8,'02 / CREATE → LISTEN → REFINE')+'<div class="content media-grid reversed">'+screen('suno-revise','Suno · Create')+'<div class="media-copy reveal">'+t('s8_lead','p','lead')+'<div class="revision-loop" aria-hidden="true">01 → 02 → 03</div></div></div>'))
arrangement=''
for i,name in enumerate(['Verse','Pre-Chorus','Chorus','Bridge'],1):
 arrangement+=f'<article class="arrange-cell reveal {"chorus" if i==3 else ""}"><span class="ordinal">{i:02}</span><h3>{name}</h3>'+t(f's9_c{i}_p')+'<span class="track-mark" aria-hidden="true"></span></article>'
slides.append(section(9,'',head(9,'02 / SONG ARRANGEMENT')+'<div class="content arrangement">'+arrangement+'</div>'+t('structure_note','p','takeaway'),'sequence'))
slides.append(section(10,'',head(10,'02 / FIVE LAYERS')+'<div class="content brief-grid"><div class="brief-anchor reveal"><span>THE<br>BRIEF<span class="anchor-dot">.</span></span>'+t('brief_note')+'</div><ol class="brief-list">'+''.join(f'<li class="reveal"><span>{i:02}</span>'+t(f's10_{i}')+'</li>' for i in range(1,6))+'</ol></div>','sequence'))
slides.append(section(11,'',head(11,'02 / PURPOSE SHAPES FORM')+'<div class="content four purpose">'+''.join(panel(i,f's11_c{i}_t',f's11_c{i}_p') for i in range(1,5))+'</div>','compare'))
slides.append(section(12,'',head(12,'02 / THREE WAYS TO SPEAK')+'<div class="content three modes">'+''.join(f'<article class="panel reveal"><span class="ordinal">0{i}</span><h3>{name}</h3>'+t(f's12_c{i}_p')+'</article>' for i,name in enumerate(['Instrumental','Vocal','Hybrid'],1))+'</div>'+t('s12_lead','p','takeaway'),'compare'))
slides.append(section(13,'workflow',head(13,'PART 03 / FROM IDEA TO RELEASE')+'<div class="content media-grid"><ol class="workflow-list">'+''.join(f'<li class="reveal"><span>{i:02}</span>'+t(f's13_{i}')+'</li>' for i in range(1,6))+'</ol>'+screen('suno-publish','Suno · Library')+'</div>','chapter'))
names=['home','photo','fan','blues'];routes=['home-was-inside','jjigeodallan-malboda','too-many-screws-left','sara-vs-natasha'];albums=[]
for i,(name,route) in enumerate(zip(names,routes),1):
 albums.append(f'<a class="album reveal" href="https://mirinaeman.com/pages/{route}/" target="_blank" rel="noopener noreferrer"><figure><img src="assets/album-{name}.webp" width="960" height="540" alt="{escape(ko[f"s14_c{i}_t"])}" loading="lazy"><span class="album-number">0{i}</span></figure><div class="album-copy">'+t(f's14_c{i}_t','h3')+t('s14_p'+('' if i==1 else str(i)))+t('open_work','span','album-open')+'</div></a>')
slides.append(section(14,'',head(14,'03 / THE RELEASE SHELF')+'<div class="content four albums">'+''.join(albums)+'</div>'+t('case_note','p','takeaway'),'sequence'))
slides.append(section(15,'agent-slide',head(15,'03 / SOUND DESIGN LAB')+'<div class="content media-grid"><div class="media-copy reveal"><div class="agent-mark" aria-hidden="true">{ S }</div>'+t('lab_note','p','lead')+'<a class="cta" href="https://chatgpt.com/g/g-69f690a099f881918507ce23174fc75e-sound-design-lab-v2" target="_blank" rel="noopener noreferrer">'+t('s15_link','span')+'<span aria-hidden="true">↗</span></a></div>'+screen('sound-lab','Sound Design Lab V2')+'</div>'))
slides.append(section(16,'practice',head(16,'03 / YOUR TURN')+'<div class="content practice-sheet reveal"><span class="sheet-label">WRITE YOUR CHORUS</span>'+t('practice_prompt','p','practice-quote')+t('practice_step','p','lead')+'<div class="sheet-line" aria-hidden="true"></div><div class="practice-tags"><span>STORY</span><span>MESSAGE</span><span>GENRE</span><span>VOCAL</span></div></div>','statement'))
slides.append(section(17,'final amber',label('THE SONG IS YOURS')+t('s17_title','h2','final-title reveal')+t('s17_lead','p','final-lead reveal')+'<div class="final-footer"><span>Q&amp;A</span><a href="https://mirinaeman.com/archive/">'+t('archive','span')+'</a><a href="https://mirinaeman.com/profile/">'+t('profile','span')+'</a></div>','chapter'))
canonical=d['canonical'];og=canonical+'assets/og.jpg'
meta=f'<title>{escape(d["title"])}</title><meta name="description" content="{escape(d["description"])}"><link rel="canonical" href="{canonical}">'
for k,v in {'type':'website','title':d['title'],'description':d['description'],'url':canonical,'image':og,'image:type':'image/jpeg','image:width':'1200','image:height':'630','image:alt':'Suno로 원하는 노래 만들기 — 나의 이야기를 나의 노래로','locale':'ko_KR','site_name':'미리내맨'}.items():meta+=f'<meta property="og:{k}" content="{escape(v)}">'
for k,v in {'card':'summary_large_image','title':d['title'],'description':d['description'],'image':og,'image:alt':'Suno로 원하는 노래 만들기 — 나의 이야기를 나의 노래로'}.items():meta+=f'<meta name="twitter:{k}" content="{escape(v)}">'
person='https://mirinaeman.com/profile/#person'
graph={'@context':'https://schema.org','@graph':[{'@type':'WebPage','@id':canonical,'url':canonical,'name':d['title'],'description':d['description'],'inLanguage':['ko','en'],'mainEntity':{'@id':canonical+'#lecture'},'author':{'@id':person}},{'@type':'CreativeWork','@id':canonical+'#lecture','name':d['title'],'url':canonical,'description':d['description'],'learningResourceType':'슬라이드','educationalUse':'교육','image':og,'inLanguage':['ko','en'],'creator':{'@id':person}},{'@type':'Person','@id':person,'name':'김준호','alternateName':'미리내맨','url':'https://mirinaeman.com/profile/'}]}
def icon(name):
 paths={'menu':'M4 6h16M4 12h16M4 18h16','full':'M4 9V4h5m6 0h5v5m0 6v5h-5M9 20H4v-5','share':'M9 15l6-6M8 7l2-2a5 5 0 0 1 7 7l-2 2M16 17l-2 2a5 5 0 0 1-7-7l2-2','close':'m6 6 12 12M18 6 6 18'}
 return f'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" data-icon="true"><path d="{paths[name]}"/></svg>'
outline=[]
for part,(a,b) in enumerate([(1,4),(5,12),(13,17)],1):
 links=''.join(f'<a class="outline-link" href="#slide-{i:02}"><span>{i:02}</span><span data-outline-key="s{i}_title">'+re.sub('<[^>]+>',' ',ko[f's{i}_title'])+'</span></a>' for i in range(a,b+1))
 outline.append(f'<div class="outline-group"><h3 data-part-title="{part}">{d["parts"]["ko"][part-1]}</h3>{links}</div>')
version=hashlib.sha256(''.join((P/f).read_text() for f in ['styles.css','presentation.js','motion.js']).encode()).hexdigest()[:12]
html=f'''<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#10100f">{meta}
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><link rel="preload" href="assets/lecture-sans.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="styles.css?v={version}">
<script type="application/ld+json">{json.dumps(graph,ensure_ascii=False)}</script><script id="deck-settings" type="application/json">{json.dumps({'parts':d['parts'],'i18n':d['i18n']},ensure_ascii=False)}</script>
<script type="module" src="presentation.js?v={version}"></script></head><body>
<a class="skip-link" href="#stage" data-i18n="skip">{ko['skip']}</a><div class="app">
<header class="app-header"><a class="brand" href="https://mirinaeman.com/archive/"><span class="brand-mark">{{ M }}</span><span>MIRINAEMAN / MUSIC</span></a><span class="header-title">SUNO / A PERSONAL MEDIUM</span><div class="header-actions js-only"><div class="language" role="group" aria-label="Language"><button id="lang-ko" aria-pressed="true">KO</button><button id="lang-en" aria-pressed="false">EN</button></div><button class="icon-button" id="share" aria-label="현재 슬라이드 링크 복사">{icon('share')}</button><button class="icon-button" id="fullscreen" aria-label="전체화면" aria-pressed="false">{icon('full')}</button><button class="icon-button" id="menu" aria-label="목차 열기" aria-expanded="false" aria-controls="outline">{icon('menu')}</button></div></header>
<main id="stage-viewport" class="stage-viewport"><div class="stage-wrap"><div id="stage" class="stage" aria-label="Suno — 17장 강의">{''.join(slides)}<div id="curtain" class="transition-curtain" aria-hidden="true"></div></div></div></main>
<footer class="toolbar js-only"><div class="progress-label"><span id="position" class="position"></span><span id="current-part" class="current-part"></span></div><div class="segments" id="segments" aria-label="슬라이드 바로가기"></div><div class="nav-group"><span class="hint">← → / SPACE</span><button class="nav-button" id="previous" aria-label="이전 슬라이드">{t('previous','span')}</button><button class="nav-button next" id="next" aria-label="다음 슬라이드">{t('next','span')}</button></div></footer>
</div><p id="status" class="sr-only" role="status" aria-live="polite"></p><p id="notice" class="notice" role="status" aria-live="polite"></p>
<dialog id="outline" class="dialog" aria-labelledby="outline-title"><div class="dialog-head">{t('menu_title','h2')}<button class="icon-button" data-close aria-label="닫기">{icon('close')}</button></div><nav class="outline-grid" aria-label="강의 목차">{''.join(outline)}</nav><div class="outline-footer"><a href="https://mirinaeman.com/profile/">{t('profile','span')}</a><label class="motion-option"><input id="reduce-motion" type="checkbox">{t('motion_label','span')}</label>{t('key_hint','span')}</div></dialog>
<dialog id="share-dialog" class="dialog" aria-labelledby="share-title"><div class="dialog-head"><h2 id="share-title">Share</h2><button class="icon-button" data-close aria-label="닫기">{icon('close')}</button></div><div class="share-field"><label for="share-url">URL</label><input id="share-url" readonly></div></dialog>
</body></html>'''
html=html.replace('<h2 data-i18n="menu_title"','<h2 id="outline-title" data-i18n="menu_title"')
# Only authored semantic line breaks; mark for the existing repository typography gate.
html=re.sub(r'<(h[1-3])([^>]*)>(.*?)</\1>',lambda m:'<'+m[1]+m[2]+(' data-typography-break="approved"' if '<br>' in m[3] else '')+'>'+m[3]+'</'+m[1]+'>',html,flags=re.S)
if '--check' in sys.argv:
 assert (P/'index.html').read_text()==html,'Suno lecture drift: run tools/sono-slide/render.py'
 print('Suno lecture render: PASS')
else:(P/'index.html').write_text(html);print('Rendered 17 bilingual scenes')
