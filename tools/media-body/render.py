"""Compile complete readable HTML from the original lecture and bounded scene figures."""
from pathlib import Path
import hashlib,json,re,sys
from html import escape
from visuals import render,points

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
PAGE=ROOT/'pages/media'
SOURCE=json.loads((HERE/'source.json').read_text())
SITE=json.loads((HERE/'site.json').read_text())
N=len(SOURCE['slides'])

def safe(v): return escape(str(v),quote=True)
def prose(v):
    # Explicit sentence rhythm; preserve decimal numbers and URLs.
    v=re.sub(r'(\d+\.\d+)(?=[가-힣])',lambda m:m[1]+'\u00a0',v)
    return re.sub(r'([,.])\s+(?=\S)',r'\1<br>',safe(v)).replace('\n','<br>')

def title(v,serif=False):
    rows=v.split('\n')
    return '<br class="row-break">'.join(f'<span class="title-row {"serif" if serif or i==len(rows)-1 else ""}"><span class="title-ink">{safe(row)}</span></span>' for i,row in enumerate(rows))

scenes=[]
for i,s in enumerate(SOURCE['slides'],1):
    appendix=s['media']['mode']=='appendix'
    phase=next(p for p in SITE['phases'] if p['start']<=i<=p['end'])
    layout='reference' if appendix else 'hero' if i==1 else 'closing' if i==36 else 'standard'
    h='h1' if i==1 else 'h2'
    heading=title(s['title'].replace('\n',' '),True) if appendix else title(s['title'],i==1)
    p=points(s['points'],'scene-facts')
    # All source titles, leads and points stay in the static document.
    scenes.append(f'<section class="scene layout-{layout} scene-{i}" id="slide-{i:02}" data-scene="{i}" data-kind="{s["media"]["mode"]}" tabindex="-1" aria-labelledby="title-{i}"><div class="scene-meta"><span>{safe(phase["name"])} <span class="meta-slash">/</span> {safe(s["chapter"])}</span><span>{i:02} / {N:02}</span></div><header class="scene-heading"><{h} id="title-{i}" data-typography-break="approved" data-typography-lines="{1 if appendix else len(s["title"].split(chr(10)))}">{heading}</{h}><p class="lead">{prose(s["lead"])}</p></header><div class="scene-visual">{render(s,i,SITE["phases"])}</div><footer class="scene-foot">{p}</footer></section>')

icons={'menu':'M4 6h16M4 12h16M4 18h16','full':'M4 9V4h5m6 0h5v5m0 6v5h-5M9 20H4v-5','replay':'M4 10a8 8 0 1 1 1 8M4 4v6h6','share':'M9 15l6-6M8 7l2-2a5 5 0 0 1 7 7l-2 2M16 17l-2 2a5 5 0 0 1-7-7l2-2','close':'m6 6 12 12M18 6 6 18','read':'M4 4h6q2 0 2 2q0-2 2-2h6v15h-6q-2 0-2 2q0-2-2-2H4z'}
def icon(n):return f'<svg data-icon="ui" width="24" height="24" focusable="false" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="{icons[n]}"/></svg>'
controls=''.join(f'<button type="button" class="icon-button" id="{k}" aria-label="{label}">{icon(k)}</button>' for k,label in [('replay','현재 장면 연출 다시 보기'),('read','읽기 모드 전환'),('full','전체화면'),('share','페이지 공유'),('menu','목차 열기')])
outline=''.join(f'<section><h3>{p["name"]}</h3>'+''.join(f'<a href="#slide-{i:02}"><span>{i:02}</span>{safe(s["title"].replace(chr(10)," "))}</a>' for i,s in enumerate(SOURCE['slides'],1) if p['start']<=i<=p['end'])+'</section>' for p in SITE['phases'])
canonical=SITE['canonical'];og=canonical+'assets/og.jpg';name=SITE['title'];desc=SITE['description']
meta=f'<title>{safe(name)}</title><meta name="description" content="{safe(desc)}"><link rel="canonical" href="{canonical}">'
for key,value in {'type':'website','title':name,'description':desc,'url':canonical,'image':og,'image:type':'image/jpeg','image:width':'1200','image:height':'630','image:alt':'매체는 메시지의 몸 — 열린 문과 빈 의자가 남은 검은 무대','locale':'ko_KR','site_name':'미리내맨'}.items():meta+=f'<meta property="og:{key}" content="{safe(value)}">'
for key,value in {'card':'summary_large_image','title':name,'description':desc,'image':og,'image:alt':'매체는 메시지의 몸 — 열린 문과 빈 의자가 남은 검은 무대'}.items():meta+=f'<meta name="twitter:{key}" content="{safe(value)}">'
person='https://mirinaeman.com/profile/#person'
schema={'@context':'https://schema.org','@graph':[{'@type':'WebPage','@id':canonical,'url':canonical,'name':name,'description':desc,'inLanguage':'ko','mainEntity':{'@id':canonical+'#lecture'},'author':{'@id':person}},{'@type':'LearningResource','@id':canonical+'#lecture','name':name,'description':desc,'learningResourceType':'인터랙티브 강의 슬라이드','educationalUse':'강의','inLanguage':'ko','url':canonical,'image':og,'creator':{'@id':person},'about':[{'@type':'Thing','name':x} for x in ['미디어 철학','단문 인과 체인','함축','관객의 해석','인간의 판단']]},{'@type':'Person','@id':person,'name':'김준호','alternateName':'미리내맨','url':'https://mirinaeman.com/profile/'}]}
version=hashlib.sha256(''.join((PAGE/f).read_text() if (PAGE/f).exists() else '' for f in ['styles.css','deck.js','motion.js']).encode()).hexdigest()[:12]
settings={**SITE,'count':N,'version':version,'runtimes':{'gsap':'assets/vendor/gsap-3.15.0.min.js','flip':'assets/vendor/Flip-3.15.0.min.js'}}
template=(HERE/'src/layout.html').read_text()
replacements={'META':meta,'SCHEMA':json.dumps(schema,ensure_ascii=False),'VERSION':version,'SETTINGS':json.dumps(settings,ensure_ascii=False).replace('</','<\\/'),'CONTROLS':controls,'SCENES':''.join(scenes),'COUNT':str(N),'OUTLINE':outline,'CLOSE':icon('close'),'PHASES':''.join(f'<button type="button" data-go="{p["start"]}">{p["name"]}</button>' for p in SITE['phases'])}
for key,value in replacements.items():template=template.replace('{{'+key+'}}',value)
if '--check' in sys.argv:
    assert (PAGE/'index.html').read_text()==template,'Generated index differs; run render.py'
    print('Generated source: PASS')
else:
    (PAGE/'index.html').write_text(template)
    (PAGE/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: '+canonical+'sitemap.xml\n')
    (PAGE/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>'+canonical+'</loc></url></urlset>\n')
    print(f'Rendered {N} complete scenes')
