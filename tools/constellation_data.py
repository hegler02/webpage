"""Public constellation derived from the existing catalog, context and bibliography."""
import hashlib
import json
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROFILE = ROOT / 'pages/profile'
ORIGIN = 'https://mirinaeman.com'
ASSETS = '/pages/profile/'

class Papers(HTMLParser):
    def __init__(self):
        super().__init__(); self.records=[]; self.current=None; self.field=None
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='li' and 'research-item' in a.get('class','').split():
            self.current={'title':'','summary':'','year':'','url':ORIGIN+'/books/#degree-theses-title'}
        if self.current is not None:
            if tag=='a' and a.get('href'): self.current['url']=a['href']
            if tag in ('h3','p','time'): self.field={'h3':'title','p':'summary','time':'year'}[tag]
    def handle_data(self, data):
        if self.current is not None and self.field: self.current[self.field]+=data
    def handle_endtag(self, tag):
        if tag in ('h3','p','time'): self.field=None
        if tag=='li' and self.current is not None:
            self.records.append(self.current); self.current=None

def build_graph(catalog=None):
    catalog = catalog or json.loads((PROFILE/'data/message-bodies.json').read_text())
    context=json.loads((PROFILE/'data/context-graph.json').read_text())
    editorial=json.loads((PROFILE/'data/constellation-editorial.json').read_text())
    nodes=[]; edges=[]
    def node(id,kind,title,summary,url,**extra):
        n=dict(id=id,kind=kind,title=title,summary=summary,url=url,**extra); nodes.append(n); return n
    def edge(a,b,label,reason,source):
        edges.append(dict(source=a,target=b,label=label,reason=reason,evidence=source))
    creator=node('creator:joonho','creator','김준호 · 미리내맨','작품, 개인적인 마음, 연구와 제작의 판단을 이어 갑니다.',ORIGIN+'/profile/')
    for b in sorted(catalog['bodies'],key=lambda x:x.get('latest_deployed_at',''),reverse=True):
        if b['status'] not in ('DEPLOYED','GOLDEN'): continue
        n=node('work:'+b['body_id'],'work',b['title'],b['message_sentence'],b['canonical_url'],image=ASSETS+b['thumbnail']['path'],alt=b['thumbnail']['alt'],year=b['first_deployed_at'][:4],tags=b.get('tags',[]),sourceLabel='작품 아카이브',sections=[{'title':'작품의 기록','text':b['message_sentence']}])
        edge(n['id'],creator['id'],'창작자','김준호의 공개 작품 아카이브에 등록된 기록입니다.',ORIGIN+'/archive/')
    for c in context['concepts']:
        node('concept:'+c['id'],'concept',c['name'],c['text'],ORIGIN+context['hub_path'],image=ASSETS+'constellation/assets/afternoon-shadows.webp',alt='햇빛이 드리운 나뭇가지 그림자 — 개념을 위한 이미지',sourceLabel='창작 노트',sections=[{'title':'창작의 관점','text':c['text']}])
    for w in context['works']:
        for c in w['concepts']:
            edge('work:'+w['body_id'],'concept:'+c,'함께 읽는 개념',w['reason'],ORIGIN+context['hub_path'])
    a=context['autumn']
    node('judgment:autumn-subtitles','judgment','자막에서 배운 것','그림을 가리던 자막을 아래로',ORIGIN+context['intro_path'],sourceLabel='제작 판단 · 벌써, 가을',sections=[{'title':'무엇이 문제였나','text':'모바일과 PC에서 자막이 높고 크게 놓여 장면을 가렸습니다.'},{'title':'어떻게 바꾸었나','text':a['judgment']},{'title':'다음 작업에 남길 것','text':a['lesson']}])
    edge('work:already-autumn','judgment:autumn-subtitles','제작에서 배운 것',a['judgment'],ORIGIN+context['intro_path'])
    edge('judgment:autumn-subtitles','concept:interpretive-space','다음 작업의 기준',a['lesson'],ORIGIN+context['intro_path'])
    essay=editorial['essay']
    node(essay['id'],'essay',essay['title'],essay['summary'],essay['url'],sourceLabel='미리내벌스 · 개인적인 기록',year='2026',sections=essay['sections'])
    edge('work:already-autumn',essay['id'],'작품을 낳은 마음','작가가 이 노래를 만든 마음과 다섯 세대의 가을을 선택한 이유를 직접 기록했습니다.',essay['url'])
    edge(essay['id'],'concept:felt-time','같은 이야기, 서로 다른 시간','글에서 노래, 웹툰, 이미지 시네마가 시간을 쓰는 방식과 각자의 가을을 설명합니다.',essay['url'])
    # A title-based grouping is a browsing aid, never a claim of citation or influence.
    topics=[('metaverse','메타버스와 교육',['메타버스']),('bees','스마트 양봉',['꿀벌','여왕벌','honeybee','beehive','beekeeping']),('moving-image','영상과 창작',['영상','동영상','panorama','디지털 디자인'])]
    papers=Papers(); papers.feed((PROFILE/'books/index.html').read_text())
    for slug,title,terms in topics:
        node('topic:'+slug,'topic',title,'논문 제목에 나타난 주제를 함께 읽는 입구입니다. 연구 간 인용이나 영향 관계를 뜻하지 않습니다.',ORIGIN+'/books/',sourceLabel='논문 제목 기반 분류')
    for p in papers.records:
        pid='paper:'+hashlib.sha256(p['url'].encode()).hexdigest()[:16]
        n=node(pid,'paper',p['title'].strip(),p['summary'].strip(),p['url'],year=p['year'].strip(),sourceLabel='논문 · 서지 기록',sections=[{'title':'서지 기록','text':p['summary'].strip()},{'title':'원문 안내','text':'아래 링크에서 공식 서지 또는 원문 제공처로 이동합니다. 이 화면에는 논문 전문을 복제하지 않았습니다.'}])
        edge(pid,creator['id'],'저자','김준호의 공개 저서·연구 페이지에 수록된 논문입니다.',ORIGIN+'/books/')
        for slug,title,terms in topics:
            if any(t in p['title'].lower() for t in terms): edge(pid,'topic:'+slug,'제목 기반 주제','논문 제목의 용어를 기준으로 묶었습니다. 인용·영향 관계를 주장하지 않습니다.',ORIGIN+'/books/')
    ids={n['id'] for n in nodes}
    assert len(ids)==len(nodes), 'duplicate node ID'
    assert all(e['source'] in ids and e['target'] in ids for e in edges), 'dangling relationship'
    return {'schemaVersion':1,'nodes':nodes,'edges':edges,'featured':['work:already-autumn','work:snail-time-jeju',essay['id'],'concept:felt-time','judgment:autumn-subtitles','concept:image-cinema'],'defaultNode':'judgment:autumn-subtitles'}
