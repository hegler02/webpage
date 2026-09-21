"""Render semantic teaching figures; page state and motion live in separate modules."""
from html import escape
import re

def text(value):
    return escape(str(value), quote=True)

def lines(value):
    return re.sub(r'([,.])\s+(?=\S)',r'\1<br>',text(value)).replace('\n', '<br>')

def photo(crop='room', caption='', extra=''):
    return f'<figure class="frame crop-{crop} {extra}" data-frame><img src="assets/room.webp" alt="열린 문과 빈 의자, 바닥의 액자가 남은 가상의 방" loading="lazy" width="1672" height="941"><figcaption>{text(caption)}</figcaption></figure>'

def points(items, cls='facts'):
    return f'<dl class="{cls}">'+''.join(f'<div data-piece><dt>{text(k)}</dt><dd>{lines(v)}</dd></div>' for k,v in items)+'</dl>'

def chain(items, cls='chain'):
    return f'<ol class="{cls}">'+''.join(f'<li data-piece><span class="index">{i:02}</span><span>{text(x)}</span></li>' for i,x in enumerate(items,1))+'</ol>'

def morph(rows, ident):
    names=['image','webtoon','video']
    tabs=''.join(f'<button type="button" data-form="{name}" aria-pressed="{str(i==0).lower()}">{text(rows[i][0])}</button>' for i,name in enumerate(names))
    frames=''.join(photo(crop,label) for crop,label in [('door','문을 연다'),('room','빈 방을 본다'),('trace','잘못됐음을 깨닫는다')])
    return f'<div class="body-demo" data-demo data-mode="image"><div class="demo-controls js-only" role="group" aria-label="같은 이야기의 매체 선택">{tabs}<button class="demo-replay" type="button" data-demo-replay aria-label="선택한 매체 연출 다시 보기">재생 ↗</button></div><div class="demo-stage" aria-label="하나의 이야기: 문을 열고 빈 방과 남은 흔적을 발견한다">{frames}<span class="time-line" aria-hidden="true"></span></div><div class="dimension-key">'+''.join(f'<p><b>{text(row[0])}</b><span>{text(row[1])}</span><em>{text(row[2])}</em></p>' for row in rows)+'</div></div>'

def knife(fallen=False):
    # Teaching symbols describe the two observed endpoints, not the unseen action.
    blade='<path d="M155 70h220l-38 36H155z"/><path d="M70 70h85v36H70z"/><path d="M150 63v49"/>'
    hand='<path d="M62 97v45q2 23 30 23h45q20-5 20-28v-29m-82-38V50q5-16 15 0v42m0-42q10-20 18 0v42m0-36q10-20 18 0v36m0-30q12-18 19 2v28"/>'
    return f'<svg data-illustration="diagram" width="440" height="200" class="knife-symbol" viewBox="0 0 440 200" aria-hidden="true"><g transform="{("translate(40 65) rotate(-12 160 80)" if fallen else "translate(20 0)")}">{blade}{"" if fallen else hand}</g>{"<path d=\"M30 187h380\"/>" if fallen else ""}</svg>'

def render(slide, number, phases):
    p=slide['points'];m=slide['media'];mode=m['mode']
    if mode=='appendix':
        return f'<figure class="reference-figure"><button type="button" class="image-open" data-image="{text(m["src"])}" data-caption="{text(slide["title"].replace(chr(10)," "))}" aria-label="{text(slide["title"].replace(chr(10)," "))} 원본 크게 보기"><img src="{text(m["src"])}" alt="{text(m["alt"])}" loading="lazy"><span class="image-hint">원본 크게 보기 ↗</span></button></figure>'
    if number==1:
        return '<div class="hero-photo">'+photo('room')+'</div><p class="hero-caption">하나의 이야기.<br>서로 다른 감각.</p>'
    if number==2:
        return '<div class="question-frames"><div class="single-world">'+photo('room','한 장면의 밀도')+'</div><div class="repeat-world">'+''.join(photo(c,'시간만 늘리면?') for c in ['room','room','room'])+'</div></div>'
    if number==3:
        return '<ol class="journey">'+''.join(f'<li data-piece><span class="journey-number">{i:02}</span><strong>{x["name"]}</strong><span>{label}</span></li>' for i,(x,label) in enumerate(zip([{'name':x} for x in ['질문','개념','매체','판단']],['왜 실패하는가','메시지의 몸이란','이미지 · 웹툰 · 영상','AI와 인간의 역할']),1))+'</ol>'
    if number==5:
        return '<div class="big-comparison"><div data-piece><span class="giant">∞</span><p>생성 도구</p></div><span class="comparison-arrow" aria-hidden="true">→</span><div data-piece><span class="giant">0</span><p>남은 메시지?</p></div></div>'
    if number==6:
        return '<div class="contrast-words">'+''.join(f'<div data-piece><span class="micro">{text(k)}</span><strong>{text(v)}</strong></div>' for k,v in p)+'</div>'
    if number==7:
        return '<div class="central-thesis"><span class="micro">MESSAGE BODY</span><p><span data-piece>한 문장</span><i>→</i><span data-piece>한 판단</span><i>→</i><span data-piece>한 비트</span></p><span class="thesis-line" aria-hidden="true"></span></div>'
    if number==8:
        return '<div class="story-chain">'+''.join(photo(c,v,'story-beat') for c,(_,v) in zip(['door','room','trace'],p))+'</div>'
    if number==10:
        return f'<div class="split-sentence"><p class="lump" data-piece>{text(p[0][1])}</p><span class="split-label">판단을 분리하면, 고칠 곳이 보인다.</span>{chain(p[1][1].split(" → "),"beat-tokens")}</div>'
    if number==11:
        return '<div class="compression"><div class="compression-half"><span class="micro">SUMMARY / 요약</span><div class="semantic-words" data-compress="remove"><span>상황</span><span>판단</span><span>감정</span><span>관계</span></div><p>덜어내기</p></div><div class="compression-half"><span class="micro">IMPLICATION / 함축</span><div class="semantic-words" data-compress="gather"><span>상황</span><span>판단</span><span>감정</span><span>관계</span></div><p>한 단위 안에 살아 있게</p></div></div>'
    if number==12:
        return '<div class="anchor-columns">'+''.join(f'<article data-piece><span class="index">{i:02}</span><strong>{text(k)}</strong><p>{lines(v)}</p></article>' for i,(k,v) in enumerate(p,1))+'</div>'
    if number==13:
        return '<div class="render-principle"><div data-piece><span class="micro">START WITH</span><strong>판단</strong></div><svg data-illustration="diagram" width="300" height="150" viewBox="0 0 300 150" aria-hidden="true"><path class="draw-line" pathLength="1" d="M0 75H110V30H300M110 75V120H300"/></svg><div><p data-piece>담기면 <b>함축</b></p><p data-piece>안 담기면 <b>분할</b></p></div></div>'
    if number in (14,34):
        return morph(m['rows'],number)
    if number in (15,16):
        labels=['문 / 사건의 문턱','의자 / 남겨진 자리','액자 / 이상을 알리는 흔적'] if number==15 else [k+' / '+v for k,v in p]
        return '<div class="spatial-story">'+photo('room')+'<ol class="spatial-labels">'+''.join(f'<li data-piece><span>{i:02}</span>{text(label)}</li>' for i,label in enumerate(labels,1))+'</ol></div>'
    if number in (17,23,30):
        return chain([v for _,v in p],'translation-chain')
    if number==18:
        return '<div class="gutter-demo"><div class="gutter-stage">'+photo('door','프레임 01')+'<div class="gutter-space"><span>당신이<br>채운 시간</span></div>'+photo('room','프레임 02')+'</div><label class="gutter-control js-only">여백을 바꿔보세요 <input type="range" min="4" max="28" value="16" data-gutter aria-label="컷 사이 여백"><span>짧게 ↔ 길게</span></label></div>'
    if number==21:
        return '<div class="closure-stage"><figure data-frame>'+knife()+'<figcaption>칼을 든 손</figcaption></figure><div class="closure-gap"><span>그 사이에<br>무슨 일이<br>있었을까?</span></div><figure data-frame>'+knife(True)+'<figcaption>바닥에 떨어진 칼</figcaption></figure></div>'
    if number==24:
        return '<div class="time-composition">'+photo('room')+'<div class="time-mask" aria-hidden="true"></div><span class="time-label">공간에 시간이 더해진다.</span><div class="time-ruler" aria-hidden="true">'+''.join('<i></i>' for _ in range(21))+'</div></div>'
    if number==25:
        return '<div class="shot-cut"><div class="shot-reel">'+photo('door','SHOT A')+'<span class="cut-marker"><i></i>CUT</span>'+photo('room','SHOT B')+'</div><p>쇼트는 시선의 단위.<br>컷은 연결의 경계.</p></div>'
    if number==29:
        return '<div class="synthesis"><div><span class="micro">SYNTHESIS</span>'+photo('room','여러 판단을 한 쇼트에')+'</div><div><span class="micro">SPLIT</span><div class="synthesis-parts">'+''.join(photo(c,l) for c,l in [('door','시선'),('room','발견'),('trace','인식')])+'</div></div></div>'
    if number==35:
        return '<div class="judgment"><div class="possibilities" aria-label="AI의 여러 제안">'+''.join(f'<span data-piece>{x}</span>' for x in ['변주 A','변주 B','변주 C','변주 D'])+'</div><span class="judgment-arrow">→</span><div class="human-choice"><span class="micro">FINAL AUTHORITY</span><strong>인간의 판단</strong><p>남길 것과 바꿀 것,<br>금지할 것.</p></div></div>'
    if mode=='links':
        return '<nav class="practice-links" aria-label="실습 에이전트">'+''.join(f'<a href="{text(link["href"])}" target="_blank" rel="noopener noreferrer" data-piece><span class="index">{i:02}</span><strong>{text(link["title"])}</strong><span>{text(link["desc"])}</span><i aria-hidden="true">↗</i></a>' for i,link in enumerate(m['links'],1))+'</nav>'
    return points(p)
