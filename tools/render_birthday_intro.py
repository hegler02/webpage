"""Derive the birthday introduction from creator copy and the exported catalog."""
import argparse, html, json
from pathlib import Path
from render_hwasan_intro import reading_copy

ROOT=Path(__file__).resolve().parents[1]
PROFILE=ROOT/'pages/profile'
def outputs():
    d=json.loads((PROFILE/'data/birthday-your-day-intro.json').read_text())
    catalog=json.loads((PROFILE/'data/message-bodies.json').read_text())
    b=next(x for x in catalog['bodies'] if x['body_id']==d['body_id'])
    e=html.escape
    url='https://mirinaeman.com/work/'+b['body_id']+'/'
    og=url+'assets/birthday-og.png'
    title=b['title']+' | '+d['creator']
    graph={'@context':'https://schema.org','@graph':[
      {'@type':'WebPage','@id':url,'url':url,'name':title,'description':d['description'],'inLanguage':'ko','about':{'@id':b['canonical_url']+'#song'},'author':{'@id':'https://mirinaeman.com/#person'}},
      {'@type':'Person','@id':'https://mirinaeman.com/#person','name':d['creator']},
      {'@type':'MusicRecording','@id':b['canonical_url']+'#song','name':d['song_title'],'url':b['canonical_url'],'byArtist':{'@id':'https://mirinaeman.com/#person'}}]}
    paragraphs=''.join('<p>'+reading_copy(x)+'</p>' for x in d['story'])
    lyrics=''.join('<h3>'+e(x['title'])+'</h3>'+''.join('<p>'+reading_copy(line)+'</p>' for line in x['lines']) for x in d['lyrics'])
    page=f'''<!doctype html><html lang="ko" data-lang="ko" data-theme="light"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)}</title><meta name="description" content="{e(d['description'])}">
<meta name="site-home" content="https://mirinaeman.com/"><meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="{url}"><link rel="icon" href="../../favicon.svg" type="image/svg+xml">
<meta property="og:type" content="website"><meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(d['description'])}"><meta property="og:url" content="{url}"><meta property="og:image" content="{og}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="{e(d['og']['alt'])}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{e(title)}"><meta name="twitter:description" content="{e(d['description'])}"><meta name="twitter:image" content="{og}"><meta name="twitter:image:alt" content="{e(d['og']['alt'])}">
<script type="application/ld+json">{json.dumps(graph,ensure_ascii=False)}</script>
<link rel="stylesheet" href="../../styles.css"><script defer src="../../navigation.js"></script><script defer src="../../app.js"></script></head>
<body><a class="skip" href="#main">본문으로 이동</a><site-navigation data-page="work"></site-navigation><main id="main">
<section class="page-hero"><div class="wrap"><span class="eyebrow">A SONG FOR YOU</span><h1>{e(b['title'])}</h1><div style="max-width:var(--measure)">{paragraphs}</div><div class="actions"><a class="button primary" href="{e(b['canonical_url'])}">노래 · 영상 · 웹툰 감상하기</a></div></div></section>
<section class="section"><div class="wrap"><figure><img src="assets/birthday-og.png" width="1200" height="630" alt="{e(d['og']['alt'])}" loading="lazy"></figure></div></section>
<section class="section"><div class="wrap"><div style="max-width:var(--measure)"><h2>생일 축하해</h2><p>노래 원작 · {e(d['creator'])}</p>{lyrics}</div></div></section></main><footer class="footer"><div class="wrap"><p>© 미리내맨 · mirinaeman.com</p></div></footer></body></html>'''
    start='<!-- BIRTHDAY_INTRO_START -->';end='<!-- BIRTHDAY_INTRO_END -->'
    card=f'{start}<article class="card feature"><img class="card-media" src="../{e(b["thumbnail"]["path"])}" width="960" height="540" alt="{e(b["thumbnail"]["alt"])}" loading="lazy"><div class="card-body"><span class="tag">MUSIC · IMAGE CINEMA · WEBTOON</span><h2>{e(b["title"])}</h2><p>{e(b["message_sentence"])}</p><div class="actions"><a class="button" href="{url}">작품 소개</a></div></div></article>{end}'
    work=PROFILE/'work/index.html';text=work.read_text()
    if start in text: text=text[:text.index(start)]+card+text[text.index(end)+len(end):]
    else:
        anchor='<!-- HWASAN_INTRO_START -->';assert text.count(anchor)==1
        text=text.replace(anchor,card+anchor,1)
    return {PROFILE/'work/birthday-your-day/index.html':page,work:text}

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
    for path,text in outputs().items():
        if args.check: assert path.read_text()==text, 'Birthday introduction output drift'
        else: path.parent.mkdir(parents=True,exist_ok=True);path.write_text(text)
    print('Birthday introduction: PASS')
