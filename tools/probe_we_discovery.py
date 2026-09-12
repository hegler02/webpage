"""Validate the new introduction using the shared McLuhan public-output gate."""
import json,hashlib,shutil,tempfile,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];PROFILE=ROOT/'pages/profile';PAGE=PROFILE/'archive/jeju-we'
sys.path.insert(0,str(ROOT/'tools/discovery'))
from validate_discovery import validate_discovery
from validate_no_download_links import validate_site
config=json.loads((ROOT/'vercel.json').read_text())
assert {'source':'/archive/jeju-we/','destination':'/pages/profile/archive/jeju-we/'} in config['rewrites']
with tempfile.TemporaryDirectory() as tmp:
 stage=Path(tmp);shutil.copy2(PAGE/'index.html',stage/'index.html');shutil.copytree(PAGE/'assets',stage/'assets');shutil.copy2(PROFILE/'robots.txt',stage/'robots.txt');shutil.copy2(PROFILE/'sitemap.xml',stage/'sitemap.xml')
 manifest=json.loads((PAGE/'media.assets.json').read_text());(stage/'media.assets.json').write_text(json.dumps(manifest))
 errors=validate_discovery(stage,media_manifest=stage/'media.assets.json') + validate_site(PAGE)
 if errors:raise SystemExit('\n'.join(errors))
 print('WE introduction SEO, OG, Twitter, JSON-LD and image: PASS')
