"""First-party introduction; catalog owns identity, authored context owns prose."""
import argparse,json
from urllib.parse import urljoin
from context_graph import PROFILE,esc,prose
from public_routes import editorial_url,public_url
BODY_ID='wind-of-longing'
DESTINATION=PROFILE/'archive'/BODY_ID

def render():
 c=json.loads((PROFILE/'data/wind-context.json').read_text());catalog={b['body_id']:b for b in json.loads((PROFILE/'data/message-bodies.json').read_text())['bodies']};b=catalog[BODY_ID]
 creator=json.loads((PROFILE/'data/creator-profile.json').read_text());person=creator['url']+'#person';watch=b['canonical_url'];url=editorial_url(BODY_ID);song=watch+'#song';hub=editorial_url('image-cinema')
 a=json.loads((DESTINATION/'media.assets.json').read_text())['assets'][0]['delivery'];og=urljoin(url,a['path'])
 related=[{**v,**catalog[v['body_id']],'intro':editorial_url(v['body_id'])} for v in c['related']]
 graph=[{'@type':'WebPage','@id':url,'url':url,'name':c['title'],'description':c['description'],'inLanguage':'ko','author':{'@id':person},'mainEntity':{'@id':song},'relatedLink':[watch,hub,*[v['intro'] for v in related]]},{'@type':'Person','@id':person,'name':creator['name'],'alternateName':creator['aliases'][0],'url':creator['url']},{'@type':'MusicRecording','@id':song,'name':b['title'],'url':watch,'byArtist':{'@id':person},'inLanguage':'ko'},{'@type':'CreativeWork','@id':watch+'#work','name':b['title']+' — 이미지 시네마와 웹툰','description':b['message_sentence'],'creator':{'@id':person},'isBasedOn':{'@id':song},'url':watch},{'@type':'Article','@id':url+'#commentary','headline':c['title'],'author':{'@id':person},'mainEntityOfPage':{'@id':url},'about':{'@id':song},'articleBody':c['lead']+'\n'+'\n'.join(s['heading']+'\n'+'\n'.join(s['paragraphs']) for s in c['sections'])}]
 meta=[('name','description',c['description'])]
 meta += [('property','og:'+k,v) for k,v in {'type':'website','title':c['title'],'description':c['description'],'url':url,'image':og,'image:type':a['mime'],'image:width':a['width'],'image:height':a['height'],'image:alt':b['thumbnail']['alt']}.items()]
 meta += [('name','twitter:'+k,v) for k,v in {'card':'summary_large_image','title':c['title'],'description':c['description'],'image':og,'image:alt':b['thumbnail']['alt']}.items()]
 head=''.join(f'<meta {attr}="{key}" content="{esc(v)}">' for attr,key,v in meta)
 sections=''.join('<h2>'+esc(s['heading'])+'</h2>'+''.join('<p>'+prose(p)+'</p>' for p in s['paragraphs']) for s in c['sections'])
 links=''.join('<h3 data-typography-break="approved">'+prose(v['title'])+'</h3><p>'+prose(v['reason'])+'</p><p><a href="'+v['intro']+'">작품 소개 읽기</a></p>' for v in related)
 schema=json.dumps({'@context':'https://schema.org','@graph':graph},ensure_ascii=False).replace('<','\\u003c')
 return f'''<!doctype html><html lang="ko" data-lang="ko" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(c['title'])}</title>{head}<link rel="canonical" href="{url}"><meta name="robots" content="index,follow,max-image-preview:large"><meta name="site-home" content="{public_url('home')}"><link rel="icon" href="../../favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="../../styles.css"><link rel="stylesheet" href="../image-cinema/context.css"><script type="application/ld+json">{schema}</script><script defer src="../../navigation.js"></script><script defer src="../../app.js"></script><script defer src="../jeju-we/share.js"></script></head><body><a class="skip" href="#main">본문으로 이동</a><site-navigation data-page="archive"></site-navigation><main id="main"><section class="page-hero"><div class="wrap"><span class="eyebrow">{esc(c['eyebrow'])}</span><h1>{esc(c['heading'])}</h1><div class="context-prose"><p>{prose(c['lead'])}</p><p>노래·창작 기획 · <a href="{creator['url']}">{esc(creator['name'])}({esc(creator['aliases'][0])})</a></p></div><div class="actions"><a class="button primary" href="{watch}" target="_blank" rel="noopener noreferrer">노래·웹툰·시네마 감상하기 ↗</a><button class="button" id="share-page" type="button">페이지 공유</button></div><p id="share-status" role="status"></p></div></section><section class="section"><div class="wrap context-prose"><figure><img src="{a['path']}" width="{a['width']}" height="{a['height']}" alt="{esc(b['thumbnail']['alt'])}"></figure>{sections}<p><a class="button primary" href="{watch}" target="_blank" rel="noopener noreferrer">그리움의 바람 감상하기 ↗</a></p></div></section><section class="section"><div class="wrap context-prose"><h2>이어지는 작품</h2>{links}<p><a href="{hub}">창작노트</a>에서 이미지 시네마와 관객의 해석 여백을 더 읽을 수 있습니다.</p></div></section></main><footer class="footer"><div class="wrap"><p>© {esc(creator['name'])} · 미리내맨</p><a href="{public_url('archive')}">전체 아카이브</a></div></footer></body></html>'''
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--check',action='store_true');a=p.parse_args();output=render();path=DESTINATION/'index.html'
 if a.check:assert path.read_text()==output,'Wind introduction drift'
 else:path.write_text(output)
 print('Wind introduction: PASS')
