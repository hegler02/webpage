"""Typeset an honest presentation title card and its archive thumbnail."""
from pathlib import Path
from io import BytesIO
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont
import json,hashlib
R=Path(__file__).resolve().parents[1];P=R/'pages/profile';OUT=P/'archive/harugyeol-ai-health/assets'
font=TTFont(P/'constellation/assets/NanumGothic-Bold.woff2');font.flavor=None;buf=BytesIO();font.save(buf);font_bytes=buf.getvalue()
def card(width,height,path):
 im=Image.new('RGB',(width,height),'#081319');d=ImageDraw.Draw(im);k=width/1200
 def text(x,y,label,size,color):d.text((int(x*k),int(y*k)),label,font=ImageFont.truetype(BytesIO(font_bytes),int(size*k)),fill=color)
 d.line((int(72*k),int(65*k),int(1128*k),int(65*k)),fill='#32504b',width=2)
 text(72,90,'HARUGYEOL / INTERACTIVE PRESENTATION',19,'#9bf1d4')
 text(72,175,'AI를 활용해',68,'#f0f6f4');text(72,270,'헬스케어 앱 만들기',68,'#9bf1d4')
 text(76,390,'아이디어에서 첫 사용자까지 · 15개의 장면',26,'#a3b8bc')
 text(76,520,'김준호 · 미리내맨',23,'#f0f6f4');text(980,517,'하루결',28,'#9bf1d4')
 path.parent.mkdir(parents=True,exist_ok=True);im.save(path,quality=90)
card(1200,630,OUT/'og.jpg');card(960,540,P/'assets/thumbnails/harugyeol-ai-health.webp')
h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
manifest={'schema_version':1,'assets':[{'id':'harugyeol-intro-og','kind':'image','role':'open-graph','source':{'kind':'project-generated','filename':'og.jpg','path':'assets/og.jpg','sha256':h(OUT/'og.jpg')},'delivery':{'path':'assets/og.jpg','mime':'image/jpeg','width':1200,'height':630,'sha256':h(OUT/'og.jpg')}}]}
(OUT.parent/'media.assets.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('Presentation title card and thumbnail rendered')
