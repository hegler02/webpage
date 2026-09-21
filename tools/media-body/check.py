"""Verify preserved teaching content, media references, and static discovery."""
from pathlib import Path
from bs4 import BeautifulSoup
from fontTools.ttLib import TTFont
import json,re,hashlib
R=Path(__file__).resolve().parents[2];P=R/'pages/media';src=json.loads((R/'tools/media-body/source.json').read_text());doc=BeautifulSoup((P/'index.html').read_text(),'html.parser')
def norm(s):return re.sub(r'\s+','',s)
scenes=doc.select('[data-scene]');assert len(scenes)==36
for i,(s,original) in enumerate(zip(scenes,src['slides']),1):
 actual=norm(s.get_text());
 for txt in [original['title'],original['lead']]+[x for pair in original['points'] for x in pair]:assert norm(txt) in actual,(i,txt)
for el in doc.select('[src],link[href]'):
 path=el.get('src') or el.get('href');path=path.split('?')[0]
 if path and not re.match(r'https?:|#|data:',path):assert (P/path).is_file(),path
assert len(doc.select('.reference-figure'))==11
assert len(doc.select('h1'))==1
assert doc.html.get('lang')=='ko'
assert doc.select_one('[rel=canonical]')['href']=='https://mirinaeman.com/pages/media/'
assert doc.select_one('meta[property="og:image"]')['content'].endswith('/pages/media/assets/og.jpg')
schema=json.loads(doc.select_one('script[type="application/ld+json"]').string);assert len(schema['@graph'])==3
original_assets=json.loads((R/'tools/media-body/reference-assets.json').read_text())
for p in (P/'assets/appendix').glob('*.webp'):assert hashlib.sha256(p.read_bytes()).hexdigest()==original_assets[p.name],p
text=doc.get_text()
for path in (P/'assets').glob('lecture-*.woff2'):
 cmap=TTFont(path).getBestCmap();missing={c for c in text if '\uac00'<=c<='\ud7a3' and ord(c) not in cmap};assert not missing,(path,missing)
assert not re.search(r'<script[^>]*src="https?://',str(doc))
print('PASS: 36 original titles/leads/points; 11 unchanged references; local assets; Korean font coverage; static SEO/schema.')
