"""One editorial relationship source; catalog owns work identities."""
from pathlib import Path
import json,html,re,hashlib
ROOT=Path(__file__).resolve().parents[1];PROFILE=ROOT/'pages/profile'
def load():
 d=json.loads((PROFILE/'data/context-graph.json').read_text());catalog=json.loads((PROFILE/'data/message-bodies.json').read_text());lookup={b['body_id']:b for b in catalog['bodies']};creator=json.loads((PROFILE/'data/creator-profile.json').read_text())
 d['creator']={'id':creator['url']+'#person','name':creator['name'],'alias':creator['aliases'][0],'url':creator['url']}
 d['hub_url']='https://mirinaeman.com'+d['hub_path'];d['intro_url']='https://mirinaeman.com'+d['intro_path']
 for item in d['works']:
  b=lookup[item['body_id']];item.update(title=b['title'],url=b['canonical_url'],summary=b['message_sentence'],thumbnail=b['thumbnail'])
  if 'intro_path' in item:item['intro_url']='https://mirinaeman.com'+item['intro_path']
  # Only reuse entity IDs observed in an existing first-party document.
  if item['body_id']=='already-autumn':item['entity_id']=b['canonical_url'].rstrip('/')+'/#work'
  elif 'intro_path' in item:
   source=(PROFILE/item['intro_path'].strip('/')/'index.html').read_text()
   for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>',source,re.S):
    for node in json.loads(block).get('@graph',[]):
     if node.get('@type')=='CreativeWork':item['entity_id']=node['@id'];break
 d['source_sha256']=hashlib.sha256((PROFILE/'data/context-graph.json').read_bytes()).hexdigest()
 return d
def esc(s):return html.escape(str(s),quote=True)
def prose(s):return re.sub(r'([,.])\s+(?=\S)',r'\1<br>',esc(s))
def concepts(d):
 # Each concept is a visible authored definition, not a claim of academic consensus.
 return [{'@type':'CreativeWork','@id':d['hub_url']+'#'+c['id'],'name':c['name'],'description':c['text'],'author':{'@id':d['creator']['id']},'url':d['hub_url']+'#'+c['id']} for c in d['concepts']]
def person(d):return {'@type':'Person','@id':d['creator']['id'],'name':d['creator']['name'],'alternateName':d['creator']['alias'],'url':d['creator']['url']}
def work_node(d,w):
 n={'@type':'CreativeWork','name':w['title'],'url':w['url'],'description':w['summary'],'creator':{'@id':d['creator']['id']},'about':[{'@id':d['hub_url']+'#'+i} for i in w['concepts']]}
 if 'entity_id' in w:n['@id']=w['entity_id']
 return n
def backlink(body_id):
 d=load();w=next(x for x in d['works'] if x['body_id']==body_id)
 return '<aside class="section"><div class="wrap" style="max-width:var(--measure)"><h2>이어지는 창작 맥락</h2><p>'+prose(w['reason'])+'</p><p><a href="'+d['hub_url']+'">이미지 시네마의 감정과 해석 여백</a> · <a href="'+d['intro_url']+'">벌써, 가을의 창작 기록</a></p></div></aside>'
