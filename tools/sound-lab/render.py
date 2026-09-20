"""Render accessible static scenes and a progressively enhanced assembly presentation."""
from pathlib import Path
from html import escape as esc
import hashlib,json,re,sys

ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).parent
PAGE=ROOT/'pages/sound_design_lab'
D=json.loads((HERE/'content.json').read_text())
GROUPS={g['id']:g for g in D['groups']}
N=len(D['scenes'])
def safe(s):return esc(str(s),quote=True)
def copy(s):return safe(s).replace('\n','<br>')
def word(s):
    glyphs=''.join(f'<span class="glyph" aria-hidden="true">{safe(c) if c!=" " else "&nbsp;"}</span>' for c in s)
    return f'<em class="type-word" data-keyword="{safe(s)}" aria-label="{safe(s)}">{glyphs}</em>'
def heading(s):
    return re.sub(r'\{([^}]+)\}',lambda m:word(m[1]),copy(s))
def chip(s,cls=''):return f'<span class="chip {cls}">{safe(s)}</span>'
def ordinal(i):return f'<span class="ordinal">{i:02}</span>'
def line(path):return f'<path class="wire" pathLength="1" d="{path}"/>'
def svg(paths):return '<svg class="wires" viewBox="0 0 1728 592" aria-hidden="true">'+''.join(line(p) for p in paths)+'</svg>'
def diagram(s):
    geometry=dict(left=32,right=1356,row=104,top=68,node_width=340,node_height=80,core_x=624,core_y=140,core_w=480,core_h=308)
    g=geometry;out=[];paths=[]
    for side,items in [('input',s['inputs']),('output',s['outputs'])]:
        x=g['left'] if side=='input' else g['right'];width=340 if side=='output' else 284
        for i,item in enumerate(items):
            y=g['top']+i*g['row'];mid=y+g['node_height']/2
            out.append(f'<div class="circuit-node module {side}" data-assemble style="--x:{x}px;--y:{y}px;--w:{width}px;--h:{g["node_height"]}px">{ordinal(i+1)}<strong>{safe(item)}</strong></div>')
            paths.append(f'M {x+width if side=="input" else g["core_x"]+g["core_w"]} {mid if side=="input" else 294} H {480 if side=="input" else 1232} V {294 if side=="input" else mid} H {g["core_x"] if side=="input" else x}')
    core=f'<div class="circuit-core module" data-assemble style="--x:{g["core_x"]}px;--y:{g["core_y"]}px;--w:{g["core_w"]}px;--h:{g["core_h"]}px"><span class="micro">SOUND DESIGN LAB V2</span><strong>DECODE</strong><p>의도 · 중심축 · 사용 맥락</p><span class="core-bottom">해석 → 조합 → 검수</span></div>'
    return '<div class="circuit">'+svg(paths)+''.join(out)+core+'</div>'
def field(f):
    key,label,placeholder=f
    return f'<label class="field" for="{key}"><span>{safe(label)}</span><textarea id="{key}" name="{key}" data-field="{key}" rows="1" maxlength="600" placeholder="{safe(placeholder)}" spellcheck="false"></textarea></label>'
def group_nav(active):
    return '<ol class="build-path">'+''.join(f'<li class="{"current" if g["id"]==active else ""}"><a href="#slide-{g["slide"]:02}" data-group-link="{g["id"]}"><span class="step-number">{g["step"]:02}</span><strong>{g["label"]}</strong><span class="completion-dot" data-group-dot="{g["id"]}" aria-hidden="true"></span></a></li>' for g in D['groups'])+'</ol>'
def body(s):
    k=s['kind'];items=s.get('items',[])
    if k=='hero':
        return '<div class="hero-art"><p class="hero-display" data-display aria-hidden="true">HARNESS<span class="hero-dot">.</span></p><div class="hero-system">'+''.join(f'<div class="hero-unit module" data-assemble><span>{a}</span><strong>{b}</strong></div>' for a,b in items)+'</div><div class="hero-credit"><span>김준호 교수 · 미리내맨</span><span>SOUND DESIGN LAB V2 / 30 SCENES</span></div></div>'
    if k=='compare':
        return '<div class="comparison">'+''.join(f'<article class="comparison-half module half-{i}" data-assemble><span class="micro">{a}</span><p class="comparison-type">{copy(b)}</p><p class="sub">{c}</p></article>' for i,(a,b,c) in enumerate(items))+'</div>'
    if k=='diagnosis':
        return '<div class="faults">'+''.join(f'<article class="fault module" data-assemble>{ordinal(i)}<span class="fault-gap" aria-hidden="true"></span><h3>{a}</h3><p>{b}</p></article>' for i,(a,b) in enumerate(items,1))+'</div>'
    if k=='statement':
        return f'<div class="statement-art"><span class="statement-display" data-display aria-hidden="true">{s["display"]}</span><div class="statement-rail"><span>INPUT</span><i></i><span>DECODE</span><i></i><span>OUTPUT</span></div></div>'
    if k=='system':return diagram(s)
    if k=='signals':
        paths=[f'M 864 76 V 140 H {x} V 200' for x in [198,642,1086,1530]]
        return '<div class="signals">'+svg(paths)+'<div class="request-label module" data-assemble>ONE REQUEST</div><div class="signal-row">'+''.join(f'<article class="signal module" data-assemble>{ordinal(i)}<h3>{a}</h3><p>{b}</p><span class="sub">{c}</span></article>' for i,(a,b,c) in enumerate(items,1))+'</div></div>'
    if k=='decode':
        return '<div class="decode-lanes">'+''.join(f'<div class="decode-lane module" data-assemble><span class="lane-source">{a}</span><span class="lane-arrow" aria-hidden="true">→</span><strong>{b}</strong><span class="lane-arrow" aria-hidden="true">→</span><span class="lane-result">{c}</span></div>' for a,b,c in items)+'</div>'
    if k=='core':
        return '<div class="identity-layout">'+''.join(f'<article class="identity-{i} module" data-assemble><h3>{a}</h3><p>{b}</p></article>' for i,(a,b) in enumerate(items))+'</div>'
    if k=='lenses':
        return '<div class="lens-grid">'+''.join(f'<article class="lens module lens-{i}" data-assemble>{ordinal(i)}<h3>{a}</h3><p>{b}</p><span class="lens-corner" aria-hidden="true">+</span></article>' for i,(a,b) in enumerate(items,1))+'</div>'
    if k=='brief':
        return f'<div class="brief-layout"><blockquote class="input-slip module" data-assemble><span class="micro">INPUT / 요청 예시</span><p>“{s["input"]}”</p><span class="input-arrow" aria-hidden="true">↘</span></blockquote><dl class="brief-sheet">'+''.join(f'<div class="brief-row module" data-assemble><dt>{a}</dt><dd>{b}</dd></div>' for a,b in items)+'</dl></div>'
    if k=='routes':
        return '<div class="routing"><div class="route-tabs" role="group" aria-label="사운드 요청 유형">'+''.join(f'<button type="button" class="route-tab" data-route="{i}" aria-pressed="{str(i==0).lower()}">{ordinal(i+1)}<span>{a}</span><span aria-hidden="true">↗</span></button>' for i,(a,b,c) in enumerate(items))+'</div><div class="route-pages">'+''.join(f'<article class="route-page module" data-route-page="{i}"><span class="micro">OUTPUT CONTRACT / {a.upper()}</span><h3>{a}</h3><div class="route-mistake"><span>이것만으로는 부족</span><p>{b}</p></div><div class="route-answer"><span>설계할 요소</span><p>{c}</p></div></article>' for i,(a,b,c) in enumerate(items))+'</div></div>'
    if k=='contract':
        return '<div class="contract-strip">'+''.join(f'<article class="contract-part module" data-assemble><strong class="contract-number">{i}</strong><h3>{a}</h3><p>{b}</p></article>' for i,(a,b) in enumerate(items,1))+'</div>'
    if k=='qa':
        return '<div class="qa-layout"><div class="qa-seal module" data-assemble><span class="micro">REVIEW THE RESULT</span><strong>QA<span>?</span></strong><p>생성 → 검토 → 수정</p></div><ol class="qa-questions">'+''.join(f'<li class="module" data-assemble><span class="review-mark" aria-hidden="true">{i:02}</span><p>{a}</p></li>' for i,a in enumerate(items,1))+'</ol></div>'
    if k=='workshop':
        g=GROUPS[s['group']]
        return f'<div class="workbench"><aside class="build-overview module" data-assemble><span class="micro">MY HARNESS / BUILD MAP</span>{group_nav(g["id"])}</aside><form class="worksheet module fields-{len(g["fields"])}" data-assemble aria-label="Canvas {g["step"]} {g["label"]}"><div class="worksheet-heading"><h3>{g["label"]}</h3><span>CANVAS {g["step"]:02} / {len(GROUPS):02}</span></div><div class="fields">'+''.join(field(f) for f in g['fields'])+'</div><p class="save-note" data-save-status>입력은 이 브라우저에 저장됩니다.</p></form></div>'
    if k=='transfer':
        return '<div class="transfer-grid">'+''.join(f'<article class="domain module" data-assemble>{ordinal(i)}<h3>{a}</h3><p>{b}</p><span class="domain-arrow" aria-hidden="true">↓</span><strong>{c}</strong></article>' for i,(a,b,c) in enumerate(items,1))+'</div>'
    if k=='minimum':
        return '<div class="minimum-grid">'+''.join(f'<article class="minimum-part module" data-assemble><strong>{a}</strong><span>{b}</span></article>' for a,b in items)+'</div>'
    if k=='rubric':
        return '<table class="rubric"><caption class="sr-only">하네스 설계 평가 기준</caption><thead><tr><th scope="col">기준</th><th scope="col">A 수준</th><th scope="col">확인 질문</th></tr></thead><tbody>'+''.join(f'<tr class="module" data-assemble><th scope="row">{a}</th><td>{b}</td><td>{c}</td></tr>' for a,b,c in items)+'</tbody></table>'
    if k=='final':
        return '<div class="final-layout"><div class="summary-grid">'+''.join(f'<a href="#slide-{g["slide"]:02}" class="summary-cell module" data-assemble><span class="micro">{g["step"]:02} / {g["label"]}</span><p data-summary="{g["id"]}">아직 작성하지 않았어요.</p></a>' for g in D['groups'])+f'</div><div class="final-actions"><p><strong data-completed-count>0</strong><span> / {len(GROUPS)} 단계 작성</span></p><button type="button" class="primary" data-open-canvas>설계안 전체 보기 · 복사 ↗</button></div></div>'
    raise ValueError(k)

slides=[]
for s in D['scenes']:
    phase=next(i for i,p in enumerate(D['phases'],1) if p['start']<=s['id']<=p['end'])
    tag='h1' if s['id']==1 else 'h2'
    tone=s.get('tone','paper')
    notes=' '.join(next(x for x in json.loads((HERE/'source-content.json').read_text())['slides'] if x['id']==s['id'])['notes'])
    slides.append(f'<section class="scene {s["kind"]} tone-{tone}" id="slide-{s["id"]:02}" data-scene="{s["id"]}" data-kind="{s["kind"]}" data-phase="{phase}" tabindex="-1" aria-labelledby="title-{s["id"]:02}"><div class="scene-meta"><span>{s["label"]}</span><span class="folio">{s["id"]:02} / {N:02}</span></div><header class="scene-head"><{tag} class="scene-title" id="title-{s["id"]:02}" data-typography-break="approved">{heading(s["title"])}</{tag}></header><div class="scene-body">{body(s)}</div><footer class="scene-note"><span class="note-dash" aria-hidden="true"></span><p>{s["note"]}</p></footer><template class="speaker-note">{safe(notes)}</template></section>')

canonical=D['canonical'];title=D['title'];desc=D['description'];og=canonical+'assets/og.jpg';og_alt='HARNESS — 감각을 구조로, 구조를 결과로 · Sound Design Lab V2'
meta=f'<title>{safe(title)}</title><meta name="description" content="{safe(desc)}"><link rel="canonical" href="{canonical}">'
for k,v in {'type':'website','title':title,'description':desc,'url':canonical,'image':og,'image:type':'image/jpeg','image:width':'1200','image:height':'630','image:alt':og_alt,'locale':'ko_KR','site_name':'미리내맨'}.items():meta+=f'<meta property="og:{k}" content="{safe(v)}">'
for k,v in {'card':'summary_large_image','title':title,'description':desc,'image':og,'image:alt':og_alt}.items():meta+=f'<meta name="twitter:{k}" content="{safe(v)}">'
person='https://mirinaeman.com/profile/#person'
schema={'@context':'https://schema.org','@graph':[{'@type':'WebPage','@id':canonical,'url':canonical,'name':title,'description':desc,'inLanguage':'ko','author':{'@id':person},'mainEntity':{'@id':canonical+'#lecture'}},{'@type':'CreativeWork','@id':canonical+'#lecture','name':title,'description':desc,'image':og,'url':canonical,'inLanguage':'ko','learningResourceType':'슬라이드','educationalUse':'교육','creator':{'@id':person}},{'@type':'Person','@id':person,'name':'김준호','alternateName':'미리내맨','url':'https://mirinaeman.com/profile/'}]}
version=hashlib.sha256(''.join((PAGE/f).read_text() if (PAGE/f).exists() else '' for f in ['styles.css','presentation.js','motion.js','workbook.js']).encode()).hexdigest()[:12]
icons={'menu':'M4 6h16M4 12h16M4 18h16','full':'M4 9V4h5m6 0h5v5m0 6v5h-5M9 20H4v-5','replay':'M4 10a8 8 0 1 1 1 8M4 4v6h6','share':'M9 15l6-6M8 7l2-2a5 5 0 0 1 7 7l-2 2M16 17l-2 2a5 5 0 0 1-7-7l2-2','close':'m6 6 12 12M18 6 6 18','notes':'M5 4h14v16H5zM8 8h8M8 12h8M8 16h4'}
def icon(n):return f'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="{icons[n]}"/></svg>'
buttons=''.join(f'<button type="button" class="icon-button" id="{id}" aria-label="{label}">{icon(name)}</button>' for id,label,name in [('replay','현재 장면 연출 다시 보기','replay'),('share','현재 슬라이드 링크 복사','share'),('fullscreen','전체화면','full'),('menu','목차 열기','menu')])
outline=''.join('<section class="outline-section"><h3>'+p['name']+'</h3>'+''.join(f'<a href="#slide-{s["id"]:02}"><span>{s["id"]:02}</span><strong>{safe(s["title"].replace("{","").replace("}","").replace(chr(10)," "))}</strong></a>' for s in D['scenes'] if p['start']<=s['id']<=p['end'])+'</section>' for p in D['phases'])
settings=json.dumps({k:D[k] for k in ['canonical','title','phases','groups']},ensure_ascii=False).replace('</',r'<\/')
html=f'''<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f8f9fb">{meta}<link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><link rel="preload" href="assets/lecture-sans.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="styles.css?v={version}"><script type="application/ld+json">{json.dumps(schema,ensure_ascii=False)}</script><script type="application/json" id="lab-settings">{settings}</script><script defer src="assets/vendor/gsap-3.15.0.min.js"></script><script type="module" src="presentation.js?v={version}"></script></head>
<body><a class="skip-link" href="#stage">발표 내용으로 건너뛰기</a><div class="app"><header class="app-header"><a class="brand" aria-label="미리내맨 아카이브" href="https://mirinaeman.com/archive/"><span class="brand-symbol" aria-hidden="true">↗</span><span>SOUND DESIGN LAB <b>V2</b></span></a><span class="app-subtitle">THE ASSEMBLY LECTURE</span><div class="app-actions js-only"><button type="button" class="text-button" data-open-canvas>내 설계안</button>{buttons}</div></header><main class="viewport"><div class="stage-shell"><div class="stage" id="stage" aria-label="Sound Design Lab V2 30장 강의">{''.join(slides)}<div class="motion-layer" aria-hidden="true"></div></div></div></main><footer class="toolbar js-only"><div class="position"><strong id="position">01</strong><span>/ {N:02}</span></div><nav class="phase-nav" aria-label="강의 구간">{''.join(f'<button type="button" data-go="{p["start"]}"><span>{i:02}</span>{p["name"]}</button>' for i,p in enumerate(D['phases'],1))}</nav><div class="toolbar-actions"><span class="key-hint">← → / SPACE</span><button type="button" id="previous" aria-label="이전 슬라이드">←</button><button type="button" id="next" class="primary" aria-label="다음 슬라이드">다음 →</button></div><div class="progress-track" aria-hidden="true"><span id="progress"></span></div></footer></div>
<dialog id="outline" aria-labelledby="outline-title"><div class="dialog-top"><h2 id="outline-title">강의 설계도</h2><button type="button" class="icon-button" data-close aria-label="목차 닫기">{icon('close')}</button></div><nav class="outline-grid" aria-label="전체 슬라이드">{outline}</nav><div class="dialog-bottom"><label><input type="checkbox" id="reduce-motion"> 움직임 줄이기</label><button type="button" id="notes-button">발표자 노트</button><a href="https://mirinaeman.com/profile/">김준호 · 미리내맨 ↗</a></div></dialog>
<dialog id="canvas-dialog" aria-labelledby="canvas-title"><div class="dialog-top"><div><p class="micro">MY GPT HARNESS</p><h2 id="canvas-title">나의 설계안</h2></div><button type="button" class="icon-button" data-close aria-label="설계안 닫기">{icon('close')}</button></div><p class="canvas-help">작성한 내용은 이 브라우저에 저장됩니다. 다른 기기로 옮기려면 전체 내용을 복사하세요.</p><label class="sr-only" for="canvas-export">작성한 전체 설계안</label><textarea id="canvas-export" readonly spellcheck="false"></textarea><div class="dialog-bottom"><p id="canvas-count"></p><button type="button" class="primary" id="copy-canvas">설계안 복사</button></div></dialog>
<dialog id="share-dialog" aria-labelledby="share-title"><div class="dialog-top"><h2 id="share-title">현재 장면 공유</h2><button type="button" class="icon-button" data-close aria-label="공유 닫기">{icon('close')}</button></div><label for="share-url">이 주소를 복사하세요.</label><input id="share-url" readonly></dialog>
<dialog id="notes-dialog" aria-labelledby="notes-title"><div class="dialog-top"><h2 id="notes-title">발표자 노트</h2><button type="button" class="icon-button" data-close aria-label="발표자 노트 닫기">{icon('close')}</button></div><p id="notes-copy"></p></dialog><p id="announcement" class="sr-only" role="status" aria-live="polite"></p><p id="notice" role="status" aria-live="polite"></p><noscript><p class="no-script">읽기 모드입니다. 슬라이드 내용은 아래로 스크롤해 볼 수 있습니다. 작성 내용 자동 저장은 JavaScript가 필요합니다.</p></noscript></body></html>'''
if '--check' in sys.argv:
    assert (PAGE/'index.html').read_text()==html,'Run tools/sound-lab/render.py'
    print('Sound Lab generated source: PASS')
else:
    (PAGE/'index.html').write_text(html)
    print(f'Rendered {N} scenes')
