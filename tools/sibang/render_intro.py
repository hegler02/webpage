"""Render the factual archive introduction on the Linux deployment server."""
import argparse
import html
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
facts=json.loads((Path(__file__).with_name('source.json')).read_text(encoding='utf-8'))
intro=facts['introduction_canonical'];watch=facts['canonical'];title=facts['title'];description=facts['description'];alt=facts['og_alt'];image=intro+'assets/og.jpg'
esc=lambda value:html.escape(value,quote=True)
meta={'description':description,'robots':'index,follow,max-image-preview:large','og:type':'website','og:locale':'ko_KR','og:title':title,'og:description':description,'og:url':intro,'og:image':image,'og:image:type':'image/jpeg','og:image:width':'1200','og:image:height':'630','og:image:alt':alt,'twitter:card':'summary_large_image','twitter:title':title,'twitter:description':description,'twitter:image':image,'twitter:image:alt':alt}
head=''.join(f'<meta {"property" if key.startswith("og:") else "name"}="{key}" content="{esc(value)}">' for key,value in meta.items())
schema={'@context':'https://schema.org','@graph':[
 {'@type':'WebPage','@id':intro,'url':intro,'name':title,'description':description,'inLanguage':'ko','mainEntity':{'@id':watch+'#work'},'author':{'@id':'https://mirinaeman.com/#person'}},
 {'@type':'CreativeWork','@id':watch+'#work','name':facts['name'],'description':description,'url':watch,'genre':facts['genre'],'creator':{'@id':'https://mirinaeman.com/#person'}},
 {'@type':'MusicRecording','@id':watch+'#recording','name':facts['name'],'byArtist':{'@id':watch+'#trio'},'genre':facts['genre'],'inLanguage':'ko','duration':facts['duration']},
 {'@type':'MusicGroup','@id':watch+'#trio','name':facts['artist'],'description':'이 작품에 등장하는 세 인물의 가상 밴드.'},
 {'@type':'Person','@id':'https://mirinaeman.com/#person','name':facts['creator']['name'],'url':facts['creator']['url']},
]}
schema_text=json.dumps(schema,ensure_ascii=False).replace('<','\\u003c')
page=f'''<!doctype html><html lang="ko" data-lang="ko" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(title)}</title><meta name="site-home" content="https://mirinaeman.com/"><link rel="canonical" href="{intro}"><link rel="icon" href="../../favicon.svg" type="image/svg+xml">{head}<script type="application/ld+json">{schema_text}</script><link rel="stylesheet" href="../../styles.css"><link rel="stylesheet" href="../image-cinema/context.css"><script defer src="../../navigation.js"></script><script defer src="../../app.js"></script></head><body><a class="skip" href="#main">본문으로 이동</a><site-navigation data-page="archive"></site-navigation><main id="main"><section class="page-hero"><div class="wrap"><span class="eyebrow">TROT · WEBTOON · MUSIC VIDEO</span><h1>시방시방</h1><p><span class="statement-line">시방 트리오 · 2분 55초</span></p><p><span class="statement-line">{esc(description.split('. ')[0]+'.')}</span><span class="statement-line">{esc(description.split('. ',1)[1])}</span></p><p><span class="statement-line">창작 · 연출 — <a href="https://mirinaeman.com/profile/">미리내맨 김준호</a></span></p><div class="actions"><a class="button primary" href="{watch}" target="_blank" rel="noopener noreferrer">뮤직비디오 감상하기</a></div></div></section><section class="section"><div class="wrap context-prose"><figure><img src="assets/og.jpg" width="1200" height="630" alt="{esc(alt)}" loading="lazy"></figure></div></section><section class="section"><div class="wrap context-prose"><h2>돈은 내가 내고</h2><p><span class="statement-line">돈은 내가 내고,</span><span class="statement-line">눈치도 내가 봐.</span></p><p><span class="statement-line">AI님 앞에서 한없이 공손해지는 세 사람의 이야기입니다.</span><span class="statement-line">어두운 도시의 과장된 웹툰과 트로트의 흥이 만납니다.</span></p><h2>시방 트리오</h2><p><span class="statement-line">시방 트리오는 이 작품에 등장하는 세 인물의 가상 밴드입니다.</span><span class="statement-line">AI로 만든 노래와 32컷의 웹툰 원화를 뮤직비디오로 엮었습니다.</span></p><h2>감상 방법</h2><p><span class="statement-line">첫 시안 중앙의 재생 버튼을 누르면 영상이 시작됩니다.</span><span class="statement-line">같은 자리에서 재생과 일시정지를 전환할 수 있습니다.</span><span class="statement-line">가사 자막은 작은 배지로 켜고 끕니다.</span></p><p><span class="statement-line">함께 읽기 — <a href="https://mirinaeman.com/archive/dont-you-want-my-money/">내 돈도 안 받냐</a></span><span class="statement-line">AI 서비스에 돈을 내는 사람의 황당한 처지를 노래로 풀어낸 또 하나의 풍자입니다.</span></p><div class="actions"><a class="button" href="https://mirinaeman.com/archive/">아카이브로</a></div></div></section></main><footer class="footer"><div class="wrap"><p><span class="statement-line">© 미리내맨 · mirinaeman.com</span></p></div></footer></body></html>'''
target=ROOT/'pages/profile/archive/sibang-sibang/index.html'
parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
if args.check:
    if not target.is_file() or target.read_text(encoding='utf-8')!=page:raise SystemExit('BLOCK: Sibang introduction drift')
else:
    target.parent.mkdir(parents=True,exist_ok=True);target.write_text(page,encoding='utf-8')
print('Sibang introduction: PASS' if args.check else 'Sibang introduction rendered')
