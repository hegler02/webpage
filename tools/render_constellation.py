"""Generate a complete reading index and equivalent schema from the public graph."""
import html
import json
from urllib.parse import quote
from constellation_data import build_graph, PROFILE, ROOT, ORIGIN
from context_graph import prose


def esc(s): return html.escape(str(s),quote=True)


def outputs():
    g=build_graph();manifest=json.loads((PROFILE/'site.manifest.json').read_text());base=ORIGIN+'/constellation/'
    nav=''.join(f'<a href="{ORIGIN+r["public_path"]}"'+(' aria-current="page"' if r['key']=='constellation' else '')+f'>{esc(r["ko"])}</a>' for r in manifest['routes'])
    entries=[];linked={n['id']:[] for n in g['nodes']};byid={n['id']:n for n in g['nodes']}
    node_url=lambda id:base+'?node='+quote(id,safe='')
    for e in g['edges']:
        linked[e['source']].append((e['target'],e))
        linked[e['target']].append((e['source'],e))
    items=[]
    types={'creator':'Person','concept':'DefinedTerm','topic':'DefinedTerm','paper':'ScholarlyArticle','essay':'Article'}
    for i,n in enumerate(g['nodes']):
        related=''.join(f'<li><a href="{esc(node_url(other))}">{prose(byid[other]["title"])}</a> — {prose(e["label"])}<p>{prose(e["reason"])}</p><a href="{esc(e["evidence"])}" target="_blank" rel="noopener noreferrer">연결 근거 ↗</a></li>' for other,e in linked[n['id']])
        sections=''.join(f'<h4>{prose(s["title"])}</h4><p>{prose(s["text"])}</p>' for s in n.get('sections',[]) if s['text']!=n['summary'])
        intro=f'<a href="{esc(n["introUrl"])}">작품 소개 읽기</a> · ' if n.get('introUrl') else ''
        entries.append(f'<article id="record-{esc(n["id"])}"><h3 data-typography-break="approved"><a href="{esc(node_url(n["id"]))}">{prose(n["title"])}</a></h3><p>{prose(n["summary"])}</p>{sections}{intro}<a href="{esc(n["url"])}" target="_blank" rel="noopener noreferrer">출처에서 읽기 ↗</a><ul>{related}</ul></article>')
        item={'@type':types.get(n['kind'],'CreativeWork'),'@id':node_url(n['id']),'name':n['title'],'url':n['url'],'description':n['summary']}
        # A creator relationship is distinct from a contextual mention.
        if n['kind'] in ('work','paper'):item['creator']={'@type':'Person','@id':node_url('creator:joonho'),'name':byid['creator:joonho']['title']}
        if n['kind'] not in ('creator','concept','topic'):
            item['mentions']=[{'@id':node_url(other),'name':byid[other]['title']} for other,e in linked[n['id']] if byid[other]['kind']!='creator']
        items.append({'@type':'ListItem','position':i+1,'item':item})
    schema={'@context':'https://schema.org','@type':'CollectionPage','@id':base,'url':base,'name':'미리내의 별자리','description':'김준호의 작품과 개인적인 기록, 창작의 판단과 논문을 맥락으로 이어 읽는 공간.','mainEntity':{'@type':'ItemList','numberOfItems':len(g['nodes']),'itemListElement':items}}
    page=(ROOT/'tools/constellation/page.html').read_text().replace('{{NAV}}',nav).replace('{{INDEX}}',''.join(entries)).replace('{{JSONLD}}',json.dumps(schema,ensure_ascii=False).replace('</','<\\/'))
    return {PROFILE/'constellation/index.html':page,PROFILE/'constellation/graph.json':json.dumps(g,ensure_ascii=False,indent=2)+'\n'}

if __name__=='__main__':
    import sys
    for path,content in outputs().items():
        if '--check' in sys.argv:assert path.read_text()==content,f'Constellation drift: {path}'
        else:path.parent.mkdir(parents=True,exist_ok=True);path.write_text(content)
    print('Constellation: PASS')
