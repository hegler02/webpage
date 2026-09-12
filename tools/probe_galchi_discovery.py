"""Validate the creator-site galchi introduction and shared discovery routes."""
import json,hashlib,xml.etree.ElementTree as ET
from pathlib import Path
from html.parser import HTMLParser
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]/'pages/profile'
PAGE=ROOT/'archive/noreut-galchi-album'
URL='https://mirinaeman.com/archive/noreut-galchi-album/'
class Page(HTMLParser):
 def __init__(self):super().__init__();self.meta={};self.canonical=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='meta':self.meta[a.get('name',a.get('property'))]=a.get('content')
  if tag=='link' and a.get('rel')=='canonical':self.canonical.append(a.get('href'))
config=json.loads((ROOT.parents[1]/'vercel.json').read_text())
assert {'source':'/archive/noreut-galchi-album/','destination':'/pages/profile/archive/noreut-galchi-album/'} in config['rewrites']
p=Page();p.feed((PAGE/'index.html').read_text());assert p.canonical==[URL]
assert p.meta['og:url']==URL and p.meta['twitter:card']=='summary_large_image'
assert p.meta['og:image']==p.meta['twitter:image']==URL+'assets/og.png'
with Image.open(PAGE/'assets/og.png') as im:im.load();assert im.size==(1731,909)
assert (PAGE/'assets/og.png').stat().st_size<5_000_000
assert URL in [n.text for n in ET.parse(ROOT/'sitemap.xml').getroot().findall('{*}url/{*}loc')]
assert 'Sitemap: https://mirinaeman.com/sitemap.xml' in (ROOT/'robots.txt').read_text()
print('Galchi introduction discovery and image integrity: PASS')
