"""Compile semantic originals plus a presenter-controlled scene body."""
from pathlib import Path
from html import escape as e
import json,re,hashlib
from bs4 import BeautifulSoup,Comment
from content import SITE,SCENES
from illustrations import diagram
T=Path(__file__).parent;R=T.parents[1];P=R/'pages/ImageAgent'

def choices(s,key,cls):return ''.join(f'<span class="{cls}" data-at="{i}">{e(x[key])}</span>' for i,x in enumerate(s['steps']))
def visual(s):
 kind=s['kind'];svg=diagram(kind)
 if svg:return f'<div class="canvas">{svg}</div>'
 if kind=='words':return '<div class="typographic"><div class="word-cloud">'+''.join(f'<span>{x}</span>' for x in ['cinematic','emotional','beautiful','dramatic','moody','detailed'])+'</div>'+choices(s,'sentence','big-word')+'</div>'
 if kind in ['translation','source','dsl']:
  title='EXECUTION' if kind=='translation' else 'SCENE VALUE' if kind=='dsl' else '한국어 / 수정 원본'
  return f'<div class="typographic translation-pair"><div class="pair"><span class="pair-label">{title}</span>{choices(s,"result","pair-copy")}</div></div>'
 if kind in ['pipeline','lock','closing']:
  return '<div class="typographic">'+choices(s,'relation','pair-label')+choices(s,'sentence','big-word')+'</div><div class="flow-steps">'+''.join(f'<div class="flow-step" data-step="{i}"><b>{i+1:02}</b><strong>{e(x["relation"].split(" / ")[-1])}</strong></div>' for i,x in enumerate(s['steps']))+'</div>'
 return '<div class="typographic">'+choices(s,'sentence','big-word')+'</div>'
sections=[]
for i,s in enumerate(SCENES):
 chain='<ol class="chain-list">'+''.join(f'<li class="chain-node" data-step="{j}" data-flip-id="chain-{i}-{j}"><span class="node-marker" aria-hidden="true">{j+1:02}</span><div><p class="sentence">{e(x["sentence"])}</p><span class="relation">{e(x["relation"])}</span></div></li>' for j,x in enumerate(s['steps']))+'</ol>'
 if s.get('note'):chain+=f'<p class="causal-note">{e(s["note"])}</p>'
 link=f'<a class="bottom-link" href="{SITE[s["link"]]}" target="_blank" rel="noopener noreferrer">{"앨범 커버 사례 열기" if s["link"]=="album" else "이미지 하네스 에이전트 열기"} ↗</a>' if s.get('link') else ''
 caption='착용자 기준 왼쪽 렌즈 = 화면 오른쪽' if s['kind'] in ['glasses','patch','negative','chain'] else '설명용 도식 · 실제 AI 생성 결과와 구분'
 sections.append(f'<section class="scene kind-{s["kind"]}" data-kind="{s["kind"]}" id="scene-{i+1}" data-scene="{i}" data-beats="{len(s["steps"])}" aria-label="{i+1}장 {e(s["title"])}"><header class="scene-heading"><span class="eyebrow">{e(s["label"])}</span><h2>{e(s["title"])}</h2><p class="lead">{e(s["lead"])}</p></header><div class="composition" data-experience-host="causal-chain" data-experience-fallback="original-reading"><div class="copy">{chain}</div><div class="visual"><span class="visual-label">SENTENCE → SCENE</span>{visual(s)}<div class="result">{choices(s,"result","result-line")}</div><p class="caption">{caption}</p>{link}</div></div></section>')
original=json.loads((T/'original.json').read_text());articles=[]
for item in original:
 soup=BeautifulSoup(item['html'],'html.parser')
 for n in soup.select('[style]'):del n['style']
 for n in soup.select('[class]'):
  n['class']='source-inline' if n.name in ['span','em','strong','b'] else 'source-block'
 for n in soup.select('[id]'):del n['id']
 for n in soup.select('h1'):n.name='h2'
 for n in soup.select('h2 br'):n.replace_with(' ')
 articles.append(f'<section class="original-section" id="original-{item["id"]}"><span class="reader-number">{item["id"]:02} / {len(original)}</span>{soup}</section>')
meta=f'<title>{e(SITE["title"])}</title><meta name="description" content="{e(SITE["description"])}"><link rel="canonical" href="{SITE["canonical"]}">'
for group in ['og','twitter']:
 vals={'title':SITE['title'],'description':SITE['description'],'image':SITE['canonical']+SITE['image'],'image:alt':SITE['image_alt']}
 if group=='og':vals.update({'type':'website','url':SITE['canonical'],'image:type':'image/jpeg','image:width':'1200','image:height':'630'})
 else:vals['card']='summary_large_image'
 meta+=''.join(f'<meta {"property" if group=="og" else "name"}="{group}:{k}" content="{e(v)}">' for k,v in vals.items())
ld={'@context':'https://schema.org','@type':'CreativeWork','@id':SITE['canonical']+'#lecture','url':SITE['canonical'],'name':SITE['title'],'description':SITE['description'],'inLanguage':'ko','learningResourceType':'Presentation','creator':{'@type':'Person','name':SITE['author'],'url':'https://mirinaeman.com/pages/profile/'},'isRelatedTo':{'@type':'CreativeWork','name':'미디어는 메시지의 몸이다 — 생성의 판단법','url':SITE['related']}}
meta+='<script type="application/ld+json">'+json.dumps(ld,ensure_ascii=False)+'</script>'
config={**SITE,'scenes':[{**{k:s[k] for k in ['slug','label','steps']},'beats':len(s['steps'])} for s in SCENES]}
css=(T/'src/styles.css').read_text();js='\n'.join((T/'src'/f).read_text() for f in ['state.js','motion.js','deck.js'])
html=f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#ffffff"><meta name="color-scheme" content="light">{meta}<link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><style>{css}</style></head><body><a class="skip" href="#reading">원문 읽기</a><header class="toolbar"><a class="brand" href="https://mirinaeman.com/pages/profile/">MIRINAEMAN <span>/ IMAGE HARNESS</span></a><nav aria-label="발표 도구"><button id="motion-toggle" aria-pressed="true">모션 켜짐</button><button id="read-toggle" aria-pressed="false">원문 읽기</button><button id="fullscreen">전체 화면</button><button id="share">페이지 공유</button></nav></header><h1 class="sr-only">{e(SITE['title'])}</h1><main id="stage" tabindex="-1" aria-label="단문 인과체인 19장 프레젠테이션">{''.join(sections)}</main><article id="reading" tabindex="-1"><header class="reader-intro"><span class="eyebrow">동서울대학교 · 김준호 교수</span><h2>{e(SITE['title'])}</h2><p>{e(SITE['description'])}</p><p>단문 인과체인은 앞에서 정한 대상과 조건을 다음 문장의 기준으로 이어가는 표현 방식입니다. 대상의 속성을 정하는 의존 관계와 조건에 따른 결과를 설명하는 인과 관계를 구분합니다.</p><button id="start">발표 시작</button></header>{''.join(articles)}<footer class="reader-outro"><p>이 강의는 ‘메시지를 수정 가능한 구조로 만든다’는 제작 판단을 이미지에 적용합니다.</p><a href="{SITE['related']}">미디어는 메시지의 몸이다 — 생성의 판단법 →</a></footer></article><footer class="transport"><button id="previous" aria-label="이전 단계">←</button><div class="position"><label for="scene-select" class="sr-only">장면 선택</label><select id="scene-select">{''.join(f'<option value="{i}">{i+1:02} / {len(SCENES)} · {e(s["title"])}</option>' for i,s in enumerate(SCENES))}</select><span class="beat-status" id="beat-status"></span></div><div class="progress" aria-hidden="true"><span></span></div><span class="key-hint">클릭 · → 다음 연결</span><button id="next" aria-label="다음 단계">→</button></footer><div id="announcement" role="status" class="sr-only"></div><dialog id="share-dialog"><p>페이지 주소</p><input id="share-url" readonly aria-label="복사할 페이지 주소"><button id="close-share">닫기</button></dialog><script id="stage-config" type="application/json">{json.dumps(config,ensure_ascii=False)}</script><script>{js}</script></body></html>'''
soup=BeautifulSoup(html,'html.parser')
for comment in soup.find_all(string=lambda text:isinstance(text,Comment)):comment.extract()
for txt in list(soup.find_all(string=True)):
 if txt.find_parent(['script','style']) or not txt.strip():continue
 parts=re.split(r'(?<=[,.])\s+(?=\S)',str(txt))
 if len(parts)>1:
  for j,part in enumerate(parts):
   if j:txt.insert_before(soup.new_tag('br'))
   txt.insert_before(part)
  txt.extract()
for h in soup.select('h1,h2,h3'):
 if h.find('br'):h['data-typography-break']='approved';h['data-typography-lines']=str(len(h.find_all('br'))+1);h['data-typography-reason']='owner-punctuation-reading-rhythm'
(P/'index.html').write_text(str(soup))
(T/'scenes.json').write_text(json.dumps(config,ensure_ascii=False,indent=2))
(P/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: '+SITE['canonical']+'sitemap.xml\n')
(P/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>'+SITE['canonical']+'</loc></url></urlset>')
favicon='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#6553dd"/><path d="M14 23H27V41H14ZM37 23H50V41H37ZM27 32H37" fill="none" stroke="white" stroke-width="4"/></svg>'
(P/'assets/favicon.svg').write_text(favicon)
(P/'favicon.svg').write_text(favicon)
(P/'DEPLOY.txt').write_text('Canonical: '+SITE['canonical']+'\nRebuild: python3 tools/image-agent/render.py\nRuntime files are static. Preserve the ImageAgent path and its case.\n')
print(json.dumps({'slides':len(SCENES),'states':sum(len(s['steps']) for s in SCENES),'bytes':(P/'index.html').stat().st_size}))
