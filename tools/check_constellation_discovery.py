"""Public reading/schema/OG fidelity of the galaxy is independent of the optional 3D renderer."""
import shutil,sys,tempfile
from pathlib import Path
from constellation_data import PROFILE,ROOT
from render_site import outputs
sys.path.insert(0,str(ROOT/'tools/discovery'))
from validate_discovery import validate_discovery
from validate_no_download_links import validate_site
destination=PROFILE/'galaxy'
for path,source in outputs().items():
    if path.parent==destination:assert path.read_text(encoding='utf-8')==source,f'Drift: {path}'
with tempfile.TemporaryDirectory() as tmp:
    stage=Path(tmp)
    shutil.copy2(destination/'index.html',stage/'index.html')
    shutil.copytree(destination/'assets',stage/'assets')
    shutil.copy2(destination/'media.assets.json',stage/'media.assets.json')
    for name in ('robots.txt','sitemap.xml'):shutil.copy2(PROFILE/name,stage/name)
    errors=validate_discovery(stage,media_manifest=stage/'media.assets.json')+validate_site(stage)
    assert not errors,'\n'.join(errors)
print('Galaxy discovery: PASS (canonical, index, schema, first-party OG, no downloads)')
