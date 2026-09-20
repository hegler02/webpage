"""Typeset first-party share artwork using the lecture's own design tokens."""
from pathlib import Path
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
import hashlib,json,re
ROOT=Path(__file__).resolve().parents[2];PAGE=ROOT/'pages/sound_design_lab'
css=(PAGE/'styles.css').read_text()
color=lambda key: re.search(r'--'+key+r':(#[a-fA-F0-9]+)',css).group(1)
f=TTFont(PAGE/'assets/lecture-sans.woff2')
f=instantiateVariableFont(f,{'wght':820});f.flavor=None;b=BytesIO();f.save(b);font=b.getvalue()
def render(w,h,path):
 im=Image.new('RGB',(w,h),color('paper'));draw=ImageDraw.Draw(im);sx=w/1200;sy=h/630
 def line(x,y,x2,y2,c,width=1):draw.line((x*sx,y*sy,x2*sx,y2*sy),fill=c,width=max(1,round(width*sx)))
 def text(x,y,t,size,c):draw.text((x*sx,y*sy),t,font=ImageFont.truetype(BytesIO(font),round(size*sx)),fill=c,anchor='lt')
 text(60,50,'SOUND DESIGN LAB V2 / THE ASSEMBLY LECTURE',17,color('blue'))
 text(60,118,'감각을 구조로.',62,color('ink'))
 # This exact wordmark is derived from the page, not a data visualization.
 text(52,240,'HARNESS',204,color('blue'));draw.ellipse((1030*sx,349*sy,1070*sx,389*sy),fill=color('orange'))
 line(60,458,1140,458,color('ink'),2)
 for x,a,b in [(60,'INPUT','감각적 입력'),(435,'DECODE','역할별 해석'),(810,'OUTPUT','검증된 설계안')]:
  text(x,478,a,15,color('muted'));text(x,511,b,27,color('ink'))
 line(60,555,1140,555,color('line'))
 text(60,581,'김준호 교수 · 미리내맨',16,color('muted'));text(887,581,'30 SCENES / 9 CANVAS',15,color('blue'))
 im.save(path,quality=92)
render(1200,630,PAGE/'assets/og.jpg')
render(960,540,ROOT/'pages/profile/assets/thumbnails/sound-design-lab.webp')
og=PAGE/'assets/og.jpg';sha=hashlib.sha256(og.read_bytes()).hexdigest()
m={'schema_version':1,'assets':[{'id':'lecture-og','kind':'image','role':'open-graph','source':{'kind':'project-generated','filename':'og.jpg','path':'assets/og.jpg','sha256':sha},'delivery':{'path':'assets/og.jpg','mime':'image/jpeg','width':1200,'height':630,'sha256':sha}}]}
(PAGE/'media.assets.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
(PAGE/'assets/favicon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="'+color('blue')+'"/><path d="M16 48L48 16M18 16H48V46" fill="none" stroke="white" stroke-width="7"/></svg>')
print('Share image, archive thumbnail and favicon rendered')
