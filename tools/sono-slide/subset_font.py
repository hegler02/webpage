"""Build the lecture's OFL font subset from an explicitly supplied Pretendard source."""
import argparse,hashlib,json
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
R=Path(__file__).resolve().parents[2];P=R/'pages/sono_slide'
a=argparse.ArgumentParser();a.add_argument('--source',type=Path,required=True);args=a.parse_args()
text=(P/'index.html').read_text()+(P/'presentation.js').read_text()+''.join(chr(n) for n in range(32,127))+'0123456789←→↗↓×·“”‘’—'
f=TTFont(args.source);options=subset.Options();options.flavor='woff2';options.layout_features=['*'];tool=subset.Subsetter(options=options);tool.populate(text=text);tool.subset(f)
# The source reserves its family name: identify this derivative separately.
for name in f['name'].names:
 if name.nameID in {1,3,4,6,16}:name.string=('MirinaeMusicSans' if name.nameID==6 else 'Mirinae Music Sans').encode(name.getEncoding(),errors='replace')
f.flavor='woff2';out=P/'assets/lecture-sans.woff2';f.save(out)
record={'family':'Mirinae Music Sans','derived_from':'Pretendard','source_sha256':hashlib.sha256(args.source.read_bytes()).hexdigest(),'license':'SIL Open Font License 1.1','license_file':'font-license.txt','source_author':'Kil Hyung-jin','source_project':'https://github.com/orioncactus/pretendard','delivery_sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'delivery_bytes':out.stat().st_size,'scope':'Characters in the complete lecture HTML and controller plus ASCII; variable weights preserved.'}
(P/'assets/font-provenance.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'source_bytes':args.source.stat().st_size,'delivery_bytes':out.stat().st_size}))
