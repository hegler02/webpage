"""Deterministic title-card derivatives; never reuse a generated mock as runtime UI."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
from fontTools.ttLib import TTFont
import json,hashlib
from content import SITE
T=Path(__file__).parent;R=T.parents[1];P=R/'pages/ImageAgent'
def titlecard(path,size):
 image=Image.new('RGB',(1200,630),'#f3f4f6');d=ImageDraw.Draw(image)
 font_path=str(T/'font-build.ttf')
 f=TTFont(P/'assets/chain-sans.woff2');f.flavor=None;f.save(font_path)
 def text(x,y,v,n,color='#2f2b4a'):
  f=ImageFont.truetype(font_path,n);d.text((x,y),v,font=f,fill=color)
 d.rounded_rectangle((40,36,1160,594),radius=12,fill='white')
 text(90,75,'MIRINAEMAN  /  IMAGE HARNESS',18,'#6553dd')
 text(85,133,'단문 인과체인',70);text(90,233,'내 생각을 이미지로 옮기는 법',30,'#4b5563')
 for box in [(683,335,860,458),(906,335,1083,458)]:d.rounded_rectangle(box,radius=20,outline='#af8245',width=5)
 d.arc((855,345,914,371),180,360,fill='#af8245',width=4)
 d.rounded_rectangle((893,320,1098,473),radius=3,outline='#6553dd',width=2)
 d.polygon([(1039,415),(1027,403),(1025,395),(1030,389),(1038,390),(1043,395),(1049,389),(1057,390),(1061,398),(1058,405)],fill='#6553dd')
 text(90,349,'앞 문장 → 다음 문장의 기준',27)
 text(90,405,'문장을 고치면,',27,'#6553dd');text(90,448,'연결된 장면이 달라진다.',27,'#6553dd')
 text(90,542,'김준호 교수 · 19장 웹 프레젠테이션',18,'#4b5563')
 if size!=image.size:image=image.resize(size,Image.Resampling.LANCZOS)
 image.save(path,quality=90)
 return hashlib.sha256(Path(path).read_bytes()).hexdigest()
h=titlecard(P/'assets/og.jpg',(1200,630))
manifest={'schema_version':1,'assets':[{'id':'image-agent-og','role':'open-graph','kind':'image','source':{'kind':'authored','filename':'og.jpg','path':'assets/og.jpg','sha256':h},'delivery':{'path':'assets/og.jpg','mime':'image/jpeg','width':1200,'height':630,'sha256':h}}]}
(P/'media.assets.json').write_text(json.dumps(manifest,indent=2))
titlecard(T/'thumbnail.webp',(960,540))
(T/'font-build.ttf').unlink(missing_ok=True)
print('Share image and thumbnail built')
