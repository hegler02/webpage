"""Compile the approved 12-scene lecture; preserve the complete original reading body."""
from pathlib import Path
from html import escape as e
import json,re
from bs4 import BeautifulSoup
R=Path(__file__).resolve().parents[2]; T=Path(__file__).parent; P=R/'pages/media_message_deck_deploy'
def atom(text,cls='',start=None,end=None,key=None):
 attrs=(f' data-from="{start}"' if start is not None else '')+(f' data-until="{end}"' if end is not None else '')
 return f'<span class="atom {cls}" data-flip-id="{key or text}"{attrs}>{e(text)}</span>'
def only(text,at,cls='statement'):
 return f'<p class="{cls}" data-at="{at}">{e(text)}</p>'
def rows(items,cls):
 return f'<div class="{cls}">'+''.join(f'<div class="item" data-flip-id="{cls}-{i}"><span class="item-no">{i+1:02}</span><strong>{e(a)}</strong><p>{e(b)}</p></div>' for i,(a,b) in enumerate(items))+'</div>'
scenes=[]
def scene(slug,label,beats,content,notes):scenes.append(dict(slug=slug,label=label,beats=beats,content=content,notes=notes))
scene('body','THE MESSAGE',3,'<div class="title-assembly">'+atom('미디어는','frame-word',1,key='medium')+atom('메시지','message',key='message')+atom('의 몸이다.','frame-word',1,key='body')+'</div><p class="undertone" data-from="2">게슈탈트는 그 몸이 살아 있는지 검증하는 법이다.</p>', ['단어 하나를 충분히 보여준다. 청중에게 무엇을 남기고 싶은지 묻는다.','메시지가 몸을 얻는 순간을 보여준다.','게슈탈트를 완성된 전체의 판단 기준으로 연결한다.'])
scene('judgment','THE JUDGMENT',4,'<p class="stage-kicker">오늘 배울 것은</p><div class="judgment-title">'+atom('생성의','quiet')+atom('판단법','accent')+'</div>'+rows([('메시지','무엇을 남길 것인가?'),('구조','어떤 순서로 전달할 것인가?'),('검증','그 몸이 살아 있는가?')],'judgment-questions'),['디자인 팁을 나열하기 전에 판단의 기준이 필요하다.','남길 메시지를 먼저 말한다.','전달 순서를 정한다.','완성된 전체가 의도대로 읽히는지 검증한다.'])
scene('late','START EARLIER',3,'<p class="stage-kicker">대부분의 생성은 너무 늦은 단계에서 시작한다.</p><div class="surface-words">'+atom('레이아웃','surface-word',end=1)+atom('글자 수','surface-word',end=1)+atom('색상','surface-word',end=1)+'</div><div class="question-reveal" data-from="1"><span class="whisper">그 전에</span><p class="statement">무엇을 <em>남길 것인가?</em></p></div><p class="undertone" data-from="2">메시지와 인과를 먼저 정한다.<br>레이아웃은 그 다음에 따라온다.</p>', ['청중이 익숙한 제작 출발점을 먼저 보여준다.','표면을 걷어내고 빠져 있던 질문을 드러낸다.','원문에 제시된 제작 순서를 정리한다.'])
scene('gestalt','THE LIVING BODY',3,'<p class="stage-kicker">미디어는 메시지가 입는 몸이다.</p><div class="meaning-field">'+''.join(atom(x,'meaning-word',key='meaning-'+str(i)) for i,x in enumerate(['메시지','순서','장면','컷','리듬','기억']))+'</div>'+only('같은 단어들.',0,'undertone')+only('관계가 생기면 읽히는 방식이 달라진다.',1,'undertone')+only('게슈탈트는 그 몸이 살아 있는지 검증하는 법이다.',2,'undertone'),['단어는 있으나 관계가 느슨한 상태를 보여준다.','같은 단어를 배치만 바꿔 읽을 수 있는 순서로 조립한다.','전체가 하나의 의미로 읽히는지 청중에게 묻는다.'])
levels=['전체','시퀀스','씬','컷','비트']; examples=[['덱','섹션','장표','컴포넌트','문장'],['작품','시퀀스','장면','쇼트','프레임'],['서비스','플로우','섹션','UI','클릭']]
scene('anatomy','THE ANATOMY',6,'<p class="stage-kicker">모든 미디어는 같은 해부학을 가진다.</p><div class="anatomy-lens">'+''.join(f'<div class="level" data-flip-id="level-{i}" data-level="{i}"><span class="level-number">L{i}</span><strong>{x}</strong></div>' for i,x in enumerate(levels))+'</div><div class="anatomy-examples">'+''.join(f'<p><span>{name}</span>'+''.join(f'<b data-level="{i}">{word}</b>' for i,word in enumerate(words))+'</p>' for name,words in zip(['슬라이드','영상','웹'],examples))+'</div>', ['전체에서 출발한다.','전체 안에서 시퀀스의 역할을 찾는다.','시퀀스 안에서 씬의 주장을 찾는다.','씬 안에서 컷의 역할을 찾는다.','컷 안에서 비트의 리듬을 찾는다.','축소해서 전체 구조와 세 매체의 대응을 함께 본다.'])
pipeline=['메시지 정의','전체 서사구조','시퀀스 역할','씬의 단일 주장','컷의 역할','미디어 문법 번역','HTML/CSS 구현','접근성·반응형 검증']
scene('pipeline','THE ORDER',9,'<p class="stage-kicker">생성에는 올바른 순서가 있다.</p><div class="pipeline-hero">'+''.join(f'<div class="pipeline-focus" data-at="{i}"><span class="huge-number">{i+1:02}</span><strong>{x}</strong></div>' for i,x in enumerate(pipeline))+'</div><ol class="pipeline-index">'+''.join(f'<li data-flip-id="step-{i}" data-index="{i}"><span>{i+1:02}</span><strong>{x}</strong></li>' for i,x in enumerate(pipeline))+'</ol>', [x+' 단계의 역할을 설명한다.' for x in pipeline]+['여덟 단계를 한 화면으로 회수한다. 구현보다 앞선 판단들이 보이도록 한다.'])
curve='<svg data-illustration="recognition-curve" width="1000" height="300" class="curve" viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true"><path d="M30 255 C170 255 205 100 360 65 S500 190 610 170 S760 230 970 40" pathLength="1"/></svg>'
scene('sequence','THE RECOGNITION',3,'<p class="stage-kicker">서사는 나열이 아니라</p><p class="statement">인식의 <em>곡선</em>이다.</p><div class="recognition">'+curve+''.join(atom(x,'curve-word',key='curve-'+str(i)) for i,x in enumerate(['질문','긴장','전환','증거','적용','통찰']))+'</div><p class="undertone" data-from="2">순서가 의미를 만든다.</p>', ['단어가 나열된 상태를 먼저 보여준다.','질문에서 통찰까지 인식의 변화가 이어지는 모습을 보여준다. 곡선은 개념도다.','강의의 순서를 인식의 변화로 판단한다.'])
scene('one','ONE THING',3,'<div class="one-formula">'+atom('1','one-number',key='one')+'<div class="one-copy" data-from="1"><span>슬라이드</span><span>씬</span><strong>주장</strong></div></div><p class="undertone" data-from="2">“그리고”가 필요하면,<br>이미 두 장이다.</p>', ['숫자 하나만 남긴다. 잠시 멈춘다.','한 슬라이드·한 씬·한 주장을 같은 숫자로 묶는다.','복합 주장을 분리하는 제작 원칙을 제시한다.'])
scene('evidence','MAKE IT CLEAR',3,'<p class="stage-kicker">무엇을 기억해야 하는가?</p><div class="competing-claims">'+atom('시장 규모','claim',key='market')+atom('경쟁사 비교','claim secondary-claim',end=1,key='competition')+atom('가격 정책','claim secondary-claim',end=1,key='price')+'</div><p class="market-conclusion" data-from="2">시장은 <em>충분히 크다.</em></p>'+only('한 장에 세 역할이 섞여 청중의 시선이 분산된다.',0,'undertone')+only('한 장은 시장 규모만 증명한다.',1,'undertone')+only('경쟁과 가격은 다음 장으로 분리한다.',2,'undertone'), ['세 역할이 한 장에서 경쟁하게 보여준다.','경쟁과 가격을 분리하고 시장 규모만 남긴다.','남겨야 할 정보를 단일 주장으로 바꾼다. 기억은 0개라는 원문 표현은 강조를 위한 수사다.'])
roles=[('주장','이 씬의 핵심을 말한다'),('증거','믿어야 할 이유를 준다'),('연결','다음 씬으로 넘어간다'),('강조','감정적 무게를 더한다'),('구조','복잡한 정보를 정리한다'),('여백','집중할 위치를 만든다')]
scene('roles','EVERY ELEMENT HAS A JOB',3,'<p class="stage-kicker">컷은 장식이 아니라</p><p class="statement"><em>역할</em>이다.</p>'+rows(roles,'role-grid')+'<p class="undertone" data-from="2">각 요소는 메시지 안에서 해야 할 일이 있다.</p>', ['컷의 역할을 선언한다.','여섯 가지 역할로 화면의 요소를 해부한다.','여백만 강조하며 집중할 위치를 만드는 기능을 시연한다.'])
qs=['청중이 딱 하나만 기억할 문장은?','이 장표의 단일 주장은?','각 요소의 역할은 주장·증거·연결 중 무엇인가?','이 장표가 없어지면 덱이 무너지는가?']
scene('practice','YOUR TURN',4,'<p class="stage-kicker">지금 만드는 슬라이드 하나를 해부하라.</p><div class="practice-track">'+''.join(f'<span data-index="{i}">{x}</span>' for i,x in enumerate(['메시지','씬','컷','검증']))+'</div><div class="practice-question">'+''.join(only(q,i) for i,q in enumerate(qs))+'</div><p class="undertone">내 슬라이드에 이 질문을 적용한다.</p>', ['자기 주제에서 한 문장을 고른다.','그 문장이 이 장표의 단일 주장인지 확인한다.','각 요소의 역할을 이름 붙인다.','장표를 제거해 보고 전체 서사에서의 역할을 판단한다.'])
scene('final','WHAT REMAINS',4,'<p class="stage-kicker" data-until="3">메시지는</p><div class="final-questions">'+atom('어떤 몸을 입고,','final-line',end=3,key='f-body')+atom('어떤 순서로,','final-line',1,3,key='f-order')+atom('어떤 흔적을 남기는가?','final-line',2,key='f-memory')+'</div><p class="undertone" data-from="3">이 질문에서 생성이 시작된다.</p>', ['몸을 묻는다.','순서를 묻는다.','남는 흔적을 묻는다.','마지막 질문 하나에 머문다. 청중의 답을 기다린다.'])
site={'title':'미디어는 메시지의 몸이다 — 생성의 판단법','description':'김준호의 12장 웹 프레젠테이션. 메시지·구조·검증을 클릭으로 조립하며 배우는 생성의 판단법.','canonical':'https://mirinaeman.com/pages/media_message_deck_deploy/','author':'김준호','related':'https://mirinaeman.com/pages/media/','image':'assets/og.jpg','image_alt':'검은 무대 위에 크게 놓인 메시지의 몸이라는 제목','runtime':{'gsap':'assets/vendor/gsap-3.15.0.min.js','flip':'assets/vendor/Flip-3.15.0.min.js'},'motion':{'duration':0.95,'enter':0.72,'exit':0.28,'stagger':0.07,'travel':64,'ease':'expo.inOut','arrival':'power3.out'}}
(T/'site.json').write_text(json.dumps(site,ensure_ascii=False,indent=2));(T/'scenes.json').write_text(json.dumps(scenes,ensure_ascii=False,indent=2))
original=json.loads((T/'original.json').read_text());articles=[]
for item in original:
 soup=BeautifulSoup(item['html'],'html.parser')
 for n in soup.select('[style]'):del n['style']
 for h in soup.select('h1'):h.name='h2'
 for br in soup.select('h1 br,h2 br,h3 br'):br.replace_with(' ')
 articles.append(f'<section class="original-section" id="original-{item["id"]}"><span class="reader-number">{item["id"]:02}</span>{soup}</section>')
meta=f'<title>{e(site["title"])}</title><meta name="description" content="{e(site["description"])}"><link rel="canonical" href="{site["canonical"]}">'
for group in ['og','twitter']:
 vals={'title':site['title'],'description':site['description'],'image':site['canonical']+site['image'],'image:alt':site['image_alt']}
 if group=='og':vals.update({'type':'website','url':site['canonical'],'image:type':'image/jpeg','image:width':'1200','image:height':'630'})
 else:vals['card']='summary_large_image'
 meta+=''.join(f'<meta {"property" if group=="og" else "name"}="{group}:{k}" content="{e(v)}">' for k,v in vals.items())
ld={'@context':'https://schema.org','@type':'CreativeWork','@id':site['canonical']+'#lecture','url':site['canonical'],'name':site['title'],'description':site['description'],'inLanguage':'ko','learningResourceType':'Presentation','creator':{'@type':'Person','name':site['author'],'url':'https://mirinaeman.com/pages/profile/'},'isRelatedTo':{'@type':'CreativeWork','name':'매체는 메시지의 몸 — 미디어 철학','url':site['related']}}
meta+='<script type="application/ld+json">'+json.dumps(ld,ensure_ascii=False)+'</script>'
sections=''
for i,s in enumerate(scenes):
 sections+=f'<section class="scene scene-{s["slug"]}" id="scene-{i+1}" data-scene="{i}" data-beats="{s["beats"]}" aria-label="{i+1}장 {e(original[i]["title"])}"><span class="scene-label">{s["label"]}</span><div class="composition" data-experience-host="message-stage" data-experience-fallback="original-reading">{s["content"]}</div></section>'
config={**site,'scenes':[{k:s[k] for k in ['slug','label','beats','notes']} for s in scenes]}
css=(T/'src/styles.css').read_text();js='\n'.join((T/'src'/f).read_text() for f in ['state.js','motion.js','deck.js'])
html=f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#050505"><meta name="color-scheme" content="dark">{meta}<link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><style>{css}</style></head><body>
<a class="skip" href="#reading">원문 읽기</a><header class="toolbar"><a class="brand" href="https://mirinaeman.com/pages/profile/">MIRINAEMAN <span>/ MESSAGE BODY</span></a><nav aria-label="발표 도구"><button id="motion-toggle" aria-pressed="true">모션 켜짐</button><button id="read-toggle" aria-pressed="false">원문 읽기</button><button id="fullscreen" aria-label="전체 화면">전체 화면</button><button id="share">공유</button></nav></header>
<h1 class="sr-only">{e(site['title'])}</h1><main id="stage" tabindex="-1" aria-label="클릭으로 진행하는 12장 프레젠테이션">{sections}</main>
<article id="reading" tabindex="-1"><header class="reader-intro"><p class="eyebrow">미리내맨 · 김준호</p><h2>미디어는 메시지의 몸이다</h2><p>{site['description']}</p><p>초기 12장 원문을 보존했습니다. 발표 화면에서는 같은 내용을 단계별로 조립합니다.</p><button id="start">발표 시작</button></header>{''.join(articles)}<footer class="reader-outro"><p>매체별 표현 방식으로 이어지는 강의</p><a href="{site['related']}">매체는 메시지의 몸 — 미디어 철학 →</a></footer></article>
<footer class="transport"><button id="previous" aria-label="이전 단계">←</button><div class="position"><label class="sr-only" for="scene-select">장면 선택</label><select id="scene-select">{''.join(f'<option value="{i}">{i+1:02} / {len(scenes)} · {e(s["label"])}</option>' for i,s in enumerate(scenes))}</select><span id="beat-status"></span></div><div id="beat-dots" aria-hidden="true"></div><span class="key-hint">클릭 · → 다음 단계</span><button id="next" aria-label="다음 단계">→</button></footer>
<div id="announcement" role="status" class="sr-only"></div><dialog id="share-dialog"><p>페이지 주소</p><input id="share-url" readonly aria-label="복사할 페이지 주소"><button id="close-share">닫기</button></dialog>
<script id="stage-config" type="application/json">{json.dumps(config,ensure_ascii=False)}</script><script>{js}</script></body></html>'''
# Owner punctuation rhythm, without changing machine strings or source wording.
soup=BeautifulSoup(html,'html.parser')
for text in list(soup.find_all(string=True)):
 if text.parent.name in ['script','style'] or text.find_parent(['script','style']):continue
 if not text.strip():continue
 parts=re.split(r'(?<=[,.])\s+(?=\S)',str(text))
 if len(parts)>1:
  for j,part in enumerate(parts):
   if j:text.insert_before(soup.new_tag('br'))
   text.insert_before(part)
  text.extract()
for h in soup.select('h1,h2,h3'):
 if h.find('br'):
  h['data-typography-break']='approved';h['data-typography-lines']=str(len(h.find_all('br'))+1)
(P/'index.html').write_text(str(soup))
(P/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: '+site['canonical']+'sitemap.xml\n')
(P/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>'+site['canonical']+'</loc></url></urlset>')
(P/'assets/favicon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#050505"/><path d="M16 46V18l16 17 16-17v28" fill="none" stroke="#ffcf70" stroke-width="5"/></svg>')
print(f'Compiled {len(scenes)} scenes / {sum(s["beats"] for s in scenes)} controlled states / {len(original)} original sections')
