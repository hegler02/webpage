"""Render an accessible reading index and the interactive constellation from one graph."""
import html
import json
from constellation_data import build_graph, PROFILE, ROOT, ORIGIN

def esc(s): return html.escape(str(s),quote=True)

def outputs():
    g=build_graph(); manifest=json.loads((PROFILE/'site.manifest.json').read_text()); base=ORIGIN+'/constellation/'
    nav=''.join(f'<a href="{ORIGIN+r["public_path"]}"'+(' aria-current="page"' if r['key']=='constellation' else '')+f'>{esc(r["ko"])}</a>' for r in manifest['routes'])
    entries=[]; linked={n['id']:[] for n in g['nodes']}
    for e in g['edges']: linked[e['source']].append(e)
    byid={n['id']:n for n in g['nodes']}
    for n in g['nodes']:
        related=''.join(f'<li><a href="https://mirinaeman.com/constellation/?node={esc(e["target"])}">{esc(byid[e["target"]]["title"])}</a> — {esc(e["label"])}. {esc(e["reason"])}</li>' for e in linked[n['id']])
        entries.append(f'<article id="record-{esc(n["id"])}"><h3><a href="https://mirinaeman.com/constellation/?node={esc(n["id"])}">{esc(n["title"])}</a></h3><p>{esc(n["summary"])}</p><a href="{esc(n["url"])}">출처에서 읽기</a><ul>{related}</ul></article>')
    schema={'@context':'https://schema.org','@type':'CollectionPage','@id':base,'url':base,'name':'미리내의 별자리','description':'김준호의 작품과 개인적인 기록, 창작의 판단과 논문을 맥락으로 이어 읽는 공간.','mainEntity':{'@type':'ItemList','numberOfItems':len(g['nodes']),'itemListElement':[{'@type':'ListItem','position':i+1,'item':{'@type':'ScholarlyArticle' if n['kind']=='paper' else 'CreativeWork','@id':base+'?node='+n['id'],'name':n['title'],'url':n['url'],'description':n['summary'],'mentions':[{'@id':base+'?node='+e['target'],'name':byid[e['target']]['title']} for e in linked[n['id']]]}} for i,n in enumerate(g['nodes'])]}}
    page=(ROOT/'tools/constellation/page.html').read_text().replace('{{NAV}}',nav).replace('{{INDEX}}',''.join(entries)).replace('{{JSONLD}}',json.dumps(schema,ensure_ascii=False).replace('</','<\\/'))
    return {PROFILE/'constellation/index.html':page,PROFILE/'constellation/graph.json':json.dumps(g,ensure_ascii=False,indent=2)+'\n'}

if __name__=='__main__':
    import sys
    for path,content in outputs().items():
        if '--check' in sys.argv: assert path.read_text()==content, f'Constellation drift: {path}'
        else: path.parent.mkdir(parents=True,exist_ok=True);path.write_text(content)
    print('Constellation: PASS')
