"""Render a readable concept hub and work introduction from one relationship source."""
import argparse,json
from pathlib import Path
from context_graph import load,person,concepts,work_node,esc,prose,PROFILE,CREATIVE_NOTES_LABEL,RELATED_WORKS_LABEL

def shell(d,title,desc,url,graph,content):
 og=url+'assets/og.jpg';alt='초가을 강변에서 각자의 시간을 보내는 다섯 세대 · 벌써, 가을'
 tags=[('name','description',desc),('name','robots','index,follow,max-image-preview:large'),('property','og:type','website'),('property','og:title',title),('property','og:description',desc),('property','og:url',url),('property','og:image',og),('property','og:image:type','image/jpeg'),('property','og:image:width','1200'),('property','og:image:height','630'),('property','og:image:alt',alt),('name','twitter:card','summary_large_image'),('name','twitter:title',title),('name','twitter:description',desc),('name','twitter:image',og),('name','twitter:image:alt',alt)]
 head=''.join(f'<meta {a}="{k}" content="{esc(v)}">' for a,k,v in tags)
 schema=json.dumps({'@context':'https://schema.org','@graph':graph},ensure_ascii=False).replace('<','\\u003c')
 return f'''<!doctype html><html lang="ko" data-lang="ko" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(title)}</title>{head}<link rel="canonical" href="{url}"><link rel="icon" href="../../favicon.svg" type="image/svg+xml"><meta name="site-home" content="https://mirinaeman.com/"><link rel="stylesheet" href="../../styles.css"><link rel="stylesheet" href="../image-cinema/context.css"><script type="application/ld+json">{schema}</script><script defer src="../../navigation.js"></script><script defer src="../../app.js"></script><script defer src="../jeju-we/share.js"></script></head><body><a class="skip" href="#main">본문으로 이동</a><site-navigation data-page="archive"></site-navigation><main id="main"><section class="page-hero"><div class="wrap"><span class="eyebrow">미리내맨의 창작 연구</span><h1 data-typography-break="approved">{prose(title)}</h1><div class="context-prose"><p>{prose(desc)}</p><p>글과 창작 판단 · <a href="{d['creator']['url']}">김준호(미리내맨)</a></p></div><div class="actions"><button class="button" id="share-page" type="button">페이지 공유</button><a class="button" href="https://mirinaeman.com/archive/">전체 아카이브</a></div><p id="share-status" role="status"></p></div></section>{content}</main><footer class="footer"><div class="wrap"><p>© 김준호 · 미리내맨</p><a href="{d['creator']['url']}">작가의 프로필과 공식 채널</a></div></footer></body></html>'''
def section(content,id=None):return '<section class="section"'+(f' id="{id}"' if id else '')+'><div class="wrap context-prose">'+content+'</div></section>'
def outputs():
 d=load();hub=d['hub_url'];intro=d['intro_url'];a=next(w for w in d['works'] if w['body_id']=='already-autumn');cs=concepts(d)
 cg=[person(d),*cs,*[work_node(d,w) for w in d['works']]]
 graph=[{'@type':'CollectionPage','@id':hub,'url':hub,'name':d['hub_title'],'description':d['hub_description'],'author':{'@id':d['creator']['id']},'about':[{'@id':c['@id']} for c in cs],'relatedLink':[intro,*[w.get('intro_url',w['url']) for w in d['works']]],'mainEntity':{'@type':'ItemList','itemListElement':[{'@type':'ListItem','position':i,'name':w['title'],'url':w.get('intro_url',w['url'])} for i,w in enumerate(d['works'],1)]}},*cg]
 content=section('<h2>감정에서 시작하는 미디어</h2><p>'+prose(d['practice'])+'</p>')
 for c in d['concepts']:content+=section('<h2>'+esc(c['name'])+'</h2><p>'+prose(c['text'])+'</p>',c['id'])
 for w in d['works']:
  content+=section('<h2 data-typography-break="approved">'+prose(w['title'])+'</h2><p>'+prose(w['summary'])+'</p><p>'+prose(w['reason'])+'</p><p>'+' · '.join('<a href="#'+i+'">'+esc(next(c['name'] for c in d['concepts'] if c['id']==i))+'</a>' for i in w['concepts'])+'</p><div class="actions"><a class="button" href="'+w.get('intro_url',w['url'])+'">'+('작품과 창작 맥락 읽기' if 'intro_url' in w else '노래 감상하기')+'</a></div>','work-'+w['body_id'])
 content+=section('<h2>연결을 축적하는 실험</h2><p>'+prose(d['research']['question'])+'</p><p>'+prose(d['research']['status'])+'</p><p><a href="'+intro+'#judgment">벌써, 가을의 자막 수정에서 얻은 판단</a></p>','research')
 baseline=d['research']['baseline']
 content+=section('<h2>'+baseline['date']+' 기준 관측</h2><p>'+prose(baseline['method'])+'</p><ul>'+''.join('<li><strong>'+esc(o['query'])+'</strong><p>'+prose(o['result'])+'</p></li>' for o in baseline['outcomes'])+'</ul><p>'+prose(baseline['interpretation'])+'</p>','baseline')
 hub_html=shell(d,d['hub_title'],d['hub_description'],hub,graph,content)
 graph=[{'@type':'WebPage','@id':intro,'url':intro,'name':d['intro_title'],'description':d['intro_description'],'author':{'@id':d['creator']['id']},'mainEntity':{'@id':a['entity_id']},'relatedLink':[a['url'],hub]},person(d),work_node(d,a),*cs,{'@type':'Article','@id':intro+'#judgment','headline':d['autumn']['judgment_title'],'author':{'@id':d['creator']['id']},'about':{'@id':a['entity_id']},'description':d['autumn']['judgment'],'articleBody':d['autumn']['judgment']+' '+d['autumn']['lesson'],'mainEntityOfPage':{'@id':intro}}]
 content=section('<div class="actions"><a class="button primary" href="'+a['url']+'">노래·웹툰·이미지 시네마 감상하기</a></div><figure><img src="assets/og.jpg" width="1200" height="630" alt="'+esc(a['thumbnail']['alt'])+'"></figure><h2>갑자기 서늘해진 아침</h2><p>'+prose(d['autumn']['origin'])+'</p><h2>다섯 사람의 서로 다른 가을</h2><p>'+prose(a['reason'])+'</p><p>'+prose(d['autumn']['media'])+'</p>')
 content+=section('<h2>'+esc(d['autumn']['judgment_title'])+'</h2><p>'+prose(d['autumn']['judgment'])+'</p><p>'+prose(d['autumn']['lesson'])+'</p>','judgment')
 content+=section('<h2>'+RELATED_WORKS_LABEL+'</h2>'+''.join('<h3 data-typography-break="approved">'+prose(w['title'])+'</h3><p>'+prose(w['reason'])+'</p><p><a href="'+w.get('intro_url',w['url'])+'">'+esc(w['title'])+' 살펴보기</a></p>' for w in d['works'] if w is not a)+'<p><a href="'+hub+'">'+CREATIVE_NOTES_LABEL+'</a>에서 작품을 잇는 창작 관점을 더 읽을 수 있다.</p>')
 intro_html=shell(d,d['intro_title'],d['intro_description'],intro,graph,content)
 return {PROFILE/'archive/image-cinema/index.html':hub_html,PROFILE/'archive/already-autumn/index.html':intro_html,PROFILE/'data/context-graph-export.json':json.dumps(d,ensure_ascii=False,indent=2)+'\n'}
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');a=parser.parse_args()
 for p,s in outputs().items():
  if a.check:assert p.read_text()==s,f'Context graph output drift: {p}'
  else:p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s)
 print('Context graph render: PASS')
