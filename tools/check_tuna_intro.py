"""Verify Tuna introduction identity, context and share-image delivery."""
from pathlib import Path
import tempfile,shutil,sys,json
from render_tuna_intro import render
R=Path(__file__).resolve().parents[1];P=R/'pages/profile';D=P/'archive/tuna-man'
sys.path.insert(0,str(R/'tools/discovery'))
from validate_discovery import validate_discovery
from validate_no_download_links import validate_site
assert (D/'index.html').read_text()==render(),'Tuna introduction output drift'
with tempfile.TemporaryDirectory() as tmp:
 p=Path(tmp);shutil.copy2(D/'index.html',p/'index.html');shutil.copytree(D/'assets',p/'assets');shutil.copy2(D/'media.assets.json',p/'media.assets.json');shutil.copy2(P/'robots.txt',p/'robots.txt');shutil.copy2(P/'sitemap.xml',p/'sitemap.xml')
 errors=validate_discovery(p,media_manifest=p/'media.assets.json')+validate_site(p);assert not errors,'\n'.join(errors)
print('Tuna discovery and viewing gate: PASS')
