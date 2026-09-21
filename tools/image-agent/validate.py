"""Project-specific content, causal dependency and navigation checks."""
from pathlib import Path
from bs4 import BeautifulSoup
from fontTools.ttLib import TTFont
import json,re,sys
T=Path(__file__).parent;R=T.parents[1];P=R/'pages/ImageAgent'
s=BeautifulSoup((P/'index.html').read_text(),'html.parser');original=json.loads((T/'original.json').read_text());config=json.loads(s.select_one('#stage-config').string)
norm=lambda x:re.sub(r'\s+','',x)
assert len(s.select('.scene'))==len(original)==19
for i,old in enumerate(original):assert norm(s.select('.original-section')[i].get_text()).endswith(norm(old['text'])),i
ids=[x['id'] for x in s.select('[id]')];assert len(ids)==len(set(ids))
for scene,data in zip(s.select('.scene'),config['scenes']):
 assert len(scene.select('.chain-node'))==data['beats']==len(data['steps'])
 assert len(scene.select('.result-line'))==data['beats']
 for item in data['steps']:assert all(item[k].strip() for k in ['sentence','relation','result'])
assert config['scenes'][3]['steps'][-1]['relation']=='조건에 결과를 연결한다'
assert config['scenes'][17]['steps'][2]['relation']=='원인 → 결과'
assert config['scenes'][17]['steps'][3]['relation']=='앞 결과 → 다음 조건'
font=TTFont(P/'assets/chain-sans.woff2');chars=set().union(*(t.cmap.keys() for t in font['cmap'].tables))
for tag in s(['script','style']):tag.decompose()
missing={x for x in s.get_text() if ord(x)>127 and ord(x) not in chars and not x.isspace()};assert not missing,missing
print('PASS: 19 originals, 68 states, unique IDs, causal step linkage, font glyph coverage')
