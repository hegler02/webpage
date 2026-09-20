"""Gate generated lecture content, scene identity and public discovery metadata."""
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
PAGE = ROOT / 'pages/jeju_hak'
sys.path.insert(0, str(ROOT / 'tools/discovery'))
from validate_discovery import validate_discovery

subprocess.run([sys.executable, str(Path(__file__).with_name('render.py')), '--check'], check=True)
html = (PAGE / 'index.html').read_text()
ids = re.findall(r'<section\b[^>]*\bid="(slide-\d+)"', html)
assert ids == [f'slide-{n:02}' for n in range(1, 16)], 'Lecture must preserve 15 ordered scene IDs'
errors = validate_discovery(PAGE, media_manifest=PAGE / 'media.assets.json')
assert not errors, '\n'.join(errors)
for script in ('presentation.js', 'motion.js'):
    subprocess.run(['node', '--check', str(PAGE / script)], check=True)
print('Jeju lecture structure and discovery: PASS')
