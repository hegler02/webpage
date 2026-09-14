"""Check actual graph endpoints, visible explanations, identity and page metadata."""
import json,re,sys,shutil,tempfile
from pathlib import Path
from html.parser import HTMLParser
from context_graph import load,PROFILE,ROOT
from render_context_graph import outputs
from release_gate import unapproved_heading_breaks
sys.path.insert(0,str(ROOT/'tools/discovery'))
from validate_discovery import validate_discovery
from validate_no_download_links import validate_site
class Markup(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.ids=[];self.text=[];self.script=False
 def handle_starttag(self,t,a):
  a=dict(a)
  if t=='script':self.script=True
  if t=='br':self.text.append(' ')
  if t=='a':self.links.append(a.get('href'))
  if 'id' in a:self.ids.append(a['id'])
 def handle_endtag(self,t):
  if t=='script':self.script=False
 def handle_data(self,s):
  if not self.script:self.text.append(s)
d=load()
assert not unapproved_heading_breaks('<h2>Title</h2><p>Sentence.<br>Next</p>')
assert unapproved_heading_breaks('<h2>Title<br>Next</h2>')
assert not unapproved_heading_breaks('<h2 data-typography-break="approved">Title,<br>Next</h2>')
for p,s in outputs().items():assert p.read_text()==s,f'Graph generated drift: {p}'
for name in ['already-autumn','image-cinema']:
 p=PROFILE/'archive'/name;source=(p/'index.html').read_text();m=Markup();m.feed(source)
 assert len(m.ids)==len(set(m.ids))
 assert d['creator']['url'] in m.links
 graph=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',source,re.S).group(1))['@graph']
 assert next(n for n in graph if n['@type']=='Person')['@id']==d['creator']['id']
 with tempfile.TemporaryDirectory() as tmp:
  stage=Path(tmp);shutil.copy2(p/'index.html',stage/'index.html');shutil.copytree(p/'assets',stage/'assets');shutil.copy2(p/'media.assets.json',stage/'media.assets.json');shutil.copy2(PROFILE/'robots.txt',stage/'robots.txt');shutil.copy2(PROFILE/'sitemap.xml',stage/'sitemap.xml')
  errors=validate_discovery(stage,media_manifest=stage/'media.assets.json')+validate_site(stage);assert not errors,'\n'.join(errors)
hub=(PROFILE/'archive/image-cinema/index.html').read_text();m=Markup();m.feed(hub)
for c in d['concepts']:assert c['id'] in m.ids and c['text'] in ''.join(m.text)
for w in d['works']:assert w.get('intro_url',w['url']) in m.links and w['reason'] in ''.join(m.text)
for name in ['jeju-we','noreut-galchi-album']:
 s=(PROFILE/'archive'/name/'index.html').read_text();assert d['hub_url'] in s and d['intro_url'] in s
for file in ['index.html','archive/index.html']:assert d['hub_url'] in (PROFILE/file).read_text()
print('Context graph: PASS (visible relations, reciprocal links, creator identity, crawl metadata and heading regression)')
