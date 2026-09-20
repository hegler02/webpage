"""One-time media delivery preparation from supplied local source files."""
from pathlib import Path
from PIL import Image
import argparse,json,hashlib,shutil
R=Path(__file__).resolve().parents[2];P=R/'pages/sono_slide'
a=argparse.ArgumentParser();a.add_argument('--sources',type=Path,required=True);args=a.parse_args();assets=[]
for name,file in [('suno-start','HtaI4566PKc.png'),('suno-revise','zmZd3562.png'),('suno-publish','UQtC9912vms.png'),('sound-lab','wpLB8975ihc.png')]:
 source=args.sources/file;im=Image.open(source).convert('RGB');im.thumbnail((1800,1200));dest=P/f'assets/{name}.webp';im.save(dest,quality=90,method=6)
 assets.append({'id':name,'kind':'image','source':{'kind':'user-provided','filename':file,'sha256':hashlib.sha256(source.read_bytes()).hexdigest()},'provenance_url':'https://i.imghippo.com/files/'+file,'delivery':{'path':f'assets/{name}.webp','mime':'image/webp','width':im.width,'height':im.height,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()}})
for name,body in [('home','home-was-inside'),('photo','listen-before-photo'),('fan','too-many-screws-left'),('blues','sara-vs-natasha')]:
 dest=P/f'assets/album-{name}.webp';im=Image.open(dest);sha=hashlib.sha256(dest.read_bytes()).hexdigest()
 assets.append({'id':'album-'+name,'kind':'image','source':{'kind':'user-provided','filename':body+'.webp','sha256':sha},'provenance_url':'https://mirinaeman.com/pages/profile/assets/thumbnails/'+body+'.webp','delivery':{'path':f'assets/album-{name}.webp','mime':'image/webp','width':im.width,'height':im.height,'sha256':sha}})
(P/'media.assets.json').write_text(json.dumps({'schema_version':1,'assets':assets},ensure_ascii=False,indent=2)+'\n')
print('Prepared',len(assets),'local images')
