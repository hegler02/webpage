"""Check authored scene identity, worksheet wiring, glyph coverage and discovery."""
from pathlib import Path
import json,re,subprocess,sys
from html import unescape
from fontTools.ttLib import TTFont
ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).parent;PAGE=ROOT/'pages/sound_design_lab'
sys.path.insert(0,str(ROOT/'tools/discovery'))
from validate_discovery import validate_discovery
subprocess.run([sys.executable,str(HERE/'render.py'),'--check'],check=True)
d=json.loads((HERE/'content.json').read_text());html=(PAGE/'index.html').read_text()
assert re.findall(r'<section class="scene [^"]+" id="([^"]+)"',html)==[f'slide-{i:02}' for i in range(1,31)]
assert len(re.findall(r'<h1\b',html))==1
fields=[f[0] for g in d['groups'] for f in g['fields']]
assert len(fields)==len(set(fields))
assert sorted(fields)==sorted(re.findall(r'data-field="([^"]+)"',html))
assert len(re.findall(r'data-summary=',html))==len(d['groups'])==9
assert len(re.findall(r'class="type-word"',html))==30
assert len(re.findall(r'<template class="speaker-note">.+?</template>',html))==30
ids=set(re.findall(r'\bid="([^"]+)"',html))
assert all(x in ids for x in re.findall(r'href="#(slide-[^"]+)"',html))
text=unescape(re.sub(r'<[^>]+>','',re.sub(r'<(script|style)\b.*?</\1>','',html,flags=re.S)))
font=TTFont(PAGE/'assets/lecture-sans.woff2');glyphs=font.getBestCmap()
missing=sorted({c for c in text if '\uac00'<=c<='\ud7a3' and ord(c) not in glyphs})
assert not missing,missing
for script in ('presentation.js','motion.js','workbook.js'):
 subprocess.run(['node','--check',str(PAGE/script)],check=True)
errors=validate_discovery(PAGE,media_manifest=PAGE/'media.assets.json')
assert not errors,'\n'.join(errors)
print(f'PASS: 30 scenes, 9 groups, {len(fields)} fields, complete Korean glyphs, scripts and discovery')
