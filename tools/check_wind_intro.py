"""Gate editorial delivery, identity and reciprocal discovery independently of playback."""
import json
import shutil
import sys
import tempfile
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
from render_wind_intro import render, DESTINATION, BODY_ID
from public_routes import ROOT, PROFILE, editorial_url, manifest

sys.path.insert(0, str(ROOT / 'tools/discovery'))
from validate_discovery import validate_discovery
from validate_no_download_links import validate_site


class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.media = []
    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            self.links.append(dict(attrs))
        if tag in ('video', 'audio', 'iframe'):
            self.media.append(tag)


source = (DESTINATION / 'index.html').read_text()
assert source == render(), 'Wind introduction differs from its content authority'
page = Document()
page.feed(source)
assert not page.media, 'The editorial page must not impersonate a video watch page'
for link in page.links:
    if urlsplit(link['href']).netloc not in ('', 'mirinaeman.com'):
        assert link.get('target') == '_blank' and {'noopener', 'noreferrer'} <= set(link.get('rel', '').split()), 'External link contract broken'
url = editorial_url(BODY_ID)
assert urlsplit(url).path in manifest()['editorial_pages'], 'Introduction route missing'
for relative in ('archive/image-cinema/index.html', 'archive/already-autumn/index.html', 'archive/unfold-your-turn/index.html'):
    parsed = Document()
    parsed.feed((PROFILE / relative).read_text())
    assert url in [link['href'] for link in parsed.links], f'Missing introduction backlink: {relative}'
with tempfile.TemporaryDirectory() as tmp:
    stage = Path(tmp)
    shutil.copy2(DESTINATION / 'index.html', stage / 'index.html')
    shutil.copytree(DESTINATION / 'assets', stage / 'assets')
    for filename in ('robots.txt', 'sitemap.xml'):
        shutil.copy2(PROFILE / filename, stage / filename)
    shutil.copy2(DESTINATION / 'media.assets.json', stage / 'media.assets.json')
    errors = validate_discovery(stage, media_manifest=stage / 'media.assets.json') + validate_site(stage)
    assert not errors, '\n'.join(errors)
print('Wind introduction, reciprocal links and discovery: PASS')
