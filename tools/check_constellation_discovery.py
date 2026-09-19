"""Public reading/schema/OG fidelity is independent of the optional 3D renderer."""
import json,shutil,sys,tempfile
from pathlib import Path
from render_constellation import outputs
from constellation_data import PROFILE,ROOT,build_graph
sys.path.insert(0,str(ROOT/'tools/discovery'))
from validate_discovery import validate_discovery
from validate_no_download_links import validate_site
for path,source in outputs().items():assert path.read_text()==source,f'Drift: {path}'
destination=PROFILE/'constellation'
with tempfile.TemporaryDirectory() as tmp:
    stage=Path(tmp)
    shutil.copy2(destination/'index.html',stage/'index.html')
    shutil.copytree(destination/'assets',stage/'assets')
    shutil.copy2(destination/'media.assets.json',stage/'media.assets.json')
    for name in ('robots.txt','sitemap.xml'):shutil.copy2(PROFILE/name,stage/name)
    errors=validate_discovery(stage,media_manifest=stage/'media.assets.json')+validate_site(stage)
    assert not errors,'\n'.join(errors)
print('Constellation discovery: PASS (canonical, index, schema, first-party OG, no downloads)')
