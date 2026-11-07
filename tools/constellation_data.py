"""Public constellation derived from the existing catalog, context and bibliography."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROFILE = ROOT / 'pages/profile'
ORIGIN = 'https://mirinaeman.com'
ASSETS = '/pages/profile/'
sys.path.insert(0, str(Path(__file__).parent))
from records import KINDS

# Research records whose titles use these words join the topic on their own: a browsing aid, not a claim.
TOPICS=[('metaverse','메타버스와 교육',['메타버스','metaver']),('bees','스마트 양봉',['꿀벌','여왕벌','벌통','벌집','양봉','honeybee','beehive','beekeeping']),('moving-image','영상과 창작',['영상','동영상','panorama','디지털 디자인','뮤직비디오','360'])]

def build_graph(catalog=None, editorial=None, links=None, records=None):
    catalog = catalog or json.loads((PROFILE/'data/message-bodies.json').read_text())
    context=json.loads((PROFILE/'data/context-graph.json').read_text())
    editorial=editorial if editorial is not None else json.loads((PROFILE/'data/constellation-editorial.json').read_text())
    manifest=json.loads((PROFILE/'site.manifest.json').read_text())
    records=records if records is not None else json.loads((PROFILE/'data/records.json').read_text(encoding='utf-8'))
    nodes=[]; edges=[]
    def node(id,kind,title,summary,url,**extra):
        n=dict(id=id,kind=kind,title=title,summary=summary,url=url,**extra); nodes.append(n); return n
    def edge(a,b,label,reason,source):
        edges.append(dict(source=a,target=b,label=label,reason=reason,evidence=source))
    creator=node('creator:joonho','creator','김준호 · 미리내맨','작품, 개인적인 마음, 연구와 제작의 판단을 이어 갑니다.',ORIGIN+'/about/')
    for b in sorted(catalog['bodies'],key=lambda x:x.get('latest_deployed_at',''),reverse=True):
        if b['status'] not in ('DEPLOYED','GOLDEN'): continue
        n=node('work:'+b['body_id'],'work',b['title'],b['message_sentence'],b['canonical_url'],image=ASSETS+b['thumbnail']['path'],alt=b['thumbnail']['alt'],year=b['first_deployed_at'][:4],tags=b.get('tags',[]),sourceLabel='작품 아카이브',sections=[{'title':'작품의 기록','text':b['message_sentence']}])
        intro=next((p for p in manifest['editorial_pages'] if p.rstrip('/').split('/')[-1]==b['body_id']),None)
        if intro:n['introUrl']=ORIGIN+intro
        edge(n['id'],creator['id'],'창작자','김준호의 공개 작품 아카이브에 등록된 기록입니다.',ORIGIN+'/work/')
    for c in context['concepts']:
        node('concept:'+c['id'],'concept',c['name'],c['text'],ORIGIN+context['hub_path'],image=ASSETS+'galaxy/assets/afternoon-shadows.webp',alt='햇빛이 드리운 나뭇가지 그림자 — 개념을 위한 이미지',sourceLabel='창작 노트',sections=[{'title':'창작의 관점','text':c['text']}])
    for w in context['works']:
        for c in w['concepts']:
            edge('work:'+w['body_id'],'concept:'+c,'함께 읽는 개념',w['reason'],ORIGIN+context['hub_path'])
    a=context['autumn']
    node('judgment:autumn-subtitles','judgment','자막에서 배운 것','그림을 가리던 자막을 아래로',ORIGIN+context['intro_path'],sourceLabel='제작 판단 · 벌써, 가을',sections=[{'title':'무엇이 문제였나','text':'모바일과 PC에서 자막이 높고 크게 놓여 장면을 가렸습니다.'},{'title':'어떻게 바꾸었나','text':a['judgment']},{'title':'다음 작업에 남길 것','text':a['lesson']}])
    edge('work:already-autumn','judgment:autumn-subtitles','제작에서 배운 것',a['judgment'],ORIGIN+context['intro_path'])
    edge('judgment:autumn-subtitles','concept:interpretive-space','다음 작업의 기준',a['lesson'],ORIGIN+context['intro_path'])
    wind=json.loads((PROFILE/'data/wind-context.json').read_text())
    wind_intro=ORIGIN+'/archive/wind-of-longing/'
    for related in wind['related']:
        edge('work:'+wind['body_id'],'work:'+related['body_id'],'이어 읽는 작품',related['reason'],wind_intro)
    essay=editorial['essay']
    node(essay['id'],'essay',essay['title'],essay['summary'],essay['url'],sourceLabel='미리내벌스 · 개인적인 기록',year='2026',sections=essay['sections'])
    edge('work:already-autumn',essay['id'],'작품을 낳은 마음','작가가 이 노래를 만든 마음과 다섯 세대의 가을을 선택한 이유를 직접 기록했습니다.',essay['url'])
    edge(essay['id'],'concept:felt-time','같은 이야기, 서로 다른 시간','글에서 노래, 웹툰, 이미지 시네마가 시간을 쓰는 방식과 각자의 가을을 설명합니다.',essay['url'])
    # Approved introduction owns these facts; no second copy of its prose or identity.
    unfold=json.loads((PROFILE/'data/unfold-context.json').read_text())
    intro=next(n['introUrl'] for n in nodes if n['id']=='work:'+unfold['body_id'])
    source_id='essay:unfold-origin';judgment_id='judgment:unfold-vocal-texture'
    first=unfold['sections'][0];voice=unfold['sections'][1];finding=unfold['sections'][-1]
    node(source_id,'essay',first['heading'],first['paragraphs'][0],unfold['source']['url'],sourceLabel='미리내벌스 · 작품의 출발점',sections=[{'title':first['heading'],'text':first['paragraphs'][1]}])
    node(judgment_id,'judgment',voice['heading'],voice['paragraphs'][0],intro,sourceLabel='제작 판단 · 펼칠 차례',sections=[{'title':'보컬을 바꾸며 들은 것','text':voice['paragraphs'][1]},{'title':finding['heading'],'text':'\n\n'.join(finding['paragraphs'])}])
    edge('work:'+unfold['body_id'],source_id,'작품이 시작된 글',first['paragraphs'][1],intro)
    edge('work:'+unfold['body_id'],judgment_id,'목소리를 고른 이유',finding['paragraphs'][1],intro)
    for related in unfold['related']:
        edge('work:'+unfold['body_id'],'work:'+related['body_id'],'이어 읽는 작품',related['reason'],intro)
    harugyeol=json.loads((PROFILE/'data/harugyeol-context.json').read_text())
    health_node=next((n for n in nodes if n['id']=='work:harugyeol-ai-health'),None)
    if health_node:
        for related in harugyeol['related']:
            edge(health_node['id'],'work:'+related['body_id'],'이어 읽는 작품',related['reason'],health_node['introUrl'])
    # Extension seam for future approved editorial records. Required fields are
    # allowlisted, so internal CQI metadata cannot become public accidentally.
    for item in editorial.get('nodes',[]):
        node(item['id'],item['kind'],item['title'],item['summary'],item['url'],**{k:item[k] for k in ('sections','sourceLabel','image','alt','year') if k in item})
    for item in editorial.get('edges',[]):
        edge(item['source'],item['target'],item['label'],item['reason'],item['evidence'])
    # Records outside the catalog. Their identity must exist before approved links can reach them.
    for r in records['records']:
        menu=KINDS[r['kind']][0]
        n=node(r['id'],r['kind'],r['title'],r['summary'],r.get('url') or ORIGIN+'/'+menu+'/',year=r.get('year',''),tags=r.get('tags',[]),sourceLabel=KINDS[r['kind']][1])
        if r.get('image'):n.update(image=ASSETS+r['image']['path'],alt=r['image']['alt'])
        edge(r['id'],creator['id'],'창작자' if menu=='work' else '저자','김준호의 공개 기록입니다.',ORIGIN+'/'+menu+'/')
    # Constellations and links the creator approved. Proposals stay out of the public graph.
    links=links if links is not None else json.loads((PROFILE/'data/constellation-links.json').read_text())
    work_url={n['id']:n['url'] for n in nodes}
    public_work=lambda record:record if ':' in record else 'work:'+record
    for c in links['constellations']:
        if c.get('status')!='approved': continue
        members=[m for m in c['members'] if public_work(m['id']) in work_url and m.get('status','approved')=='approved']
        if not members: continue
        node('constellation:'+c['id'],'constellation',c['title'],c['text'],ORIGIN+'/galaxy/?node=constellation:'+c['id'],sourceLabel='별자리')
        for m in members:
            edge(public_work(m['id']),'constellation:'+c['id'],c['title'],m['reason'],work_url[public_work(m['id'])])
    for pair in links['pairs']:
        if pair.get('status')!='approved': continue
        a,b=public_work(pair['a']),public_work(pair['b'])
        if a in work_url and b in work_url:
            edge(a,b,pair['label'],pair['reason'],work_url[a])
    # A title-based grouping is a browsing aid, never a claim of citation or influence.
    for slug,title,terms in TOPICS:
        node('topic:'+slug,'topic',title,'제목에 나타난 주제를 함께 읽는 입구입니다. 연구 간 인용이나 영향 관계를 뜻하지 않습니다.',ORIGIN+'/research/',sourceLabel='제목 기반 분류')
    for r in records['records']:
        if KINDS[r['kind']][0]!='research': continue
        for slug,title,terms in TOPICS:
            if any(t in r['title'].lower() for t in terms): edge(r['id'],'topic:'+slug,'제목 기반 주제','제목의 용어를 기준으로 묶었습니다. 인용·영향 관계를 주장하지 않습니다.',ORIGIN+'/research/')
    ids={n['id'] for n in nodes}
    assert len(ids)==len(nodes), 'duplicate node ID'
    assert all(e['source'] in ids and e['target'] in ids for e in edges), 'dangling relationship'
    assert all(e['reason'].strip() and e['evidence'].startswith('https://') for e in edges), 'missing relation evidence'
    assert len({(e['source'],e['target'],e['label']) for e in edges})==len(edges), 'duplicate relationship'
    return {'schemaVersion':2,'nodes':nodes,'edges':edges,'featured':['work:snail-time-jeju','work:already-autumn','work:jeju-we','work:unfold-your-turn','concept:felt-time','concept:image-cinema','concept:interpretive-space'],'defaultNode':'work:snail-time-jeju'}
