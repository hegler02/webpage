"""Generate public tool pages from one reviewed registry; --check detects drift."""
import json, re, sys
from pathlib import Path
from html import escape as e
ROOT=Path(__file__).resolve().parents[2]
DATA=json.loads((Path(__file__).parent/'registry.json').read_text())
LABELS={'preparing':'공개 준비 중','review':'심사 중','public':'공개','retired':'제공 중단'}

def page(title, path, body, description):
    url=DATA['origin']+path
    return f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(title)} · 미리내맨</title><meta name="description" content="{e(description)}"><link rel="canonical" href="{url}"><meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(description)}"><meta property="og:url" content="{url}"><meta property="og:type" content="website"><meta name="twitter:card" content="summary"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/tools/hub.css"><script src="/tools/hub.js" defer></script></head><body><a class="skip" href="#main">본문으로 이동</a><header class="site-header"><nav class="wrap hub-nav" aria-label="주요 메뉴"><a class="brand" href="/">미리내맨</a><a href="/tools/">스킬·플러그인</a><button class="button" data-theme aria-label="밝은 화면으로 전환">밝은 화면</button></nav></header><main id="main" class="wrap hub-main">{body}</main><footer class="footer"><div class="wrap"><p>© {e(DATA['publisher'])}</p><p>사람은 판단하고, AI는 제안과 구현을 맡습니다.</p><a href="/tools/">전체 스킬·플러그인</a></div></footer></body></html>'''

def outputs():
    out={}; cards=[]; slugs=set(); paths=set()
    for x in DATA['items']:
        slug=x['slug']; path=x['path']; status=x['status']
        assert re.fullmatch('[a-z0-9-]+',slug) and slug not in slugs,'Duplicate/invalid slug'
        assert re.fullmatch('/(?:[a-z0-9-]+/)+',path) and path not in paths,'Duplicate/invalid path'
        slugs.add(slug);paths.add(path)
        assert status in LABELS and x['policy_status'] in ('draft','approved')
        if status=='public':
            assert x['install_url'] and x['install_url'].startswith('https://') and x['policy_status']=='approved','Public item needs verified install link and approved policy'
        else: assert not x['install_url'],'Do not expose installation before public verification'
        status_text=LABELS[status]
        cards.append(f'<article class="card tool-card" data-tool data-kind="{e(x["kind"])}"><div class="card-body hub-stack"><span class="tag">{e(x["category"])} · {e(x["kind"])} · {status_text}</span><h2><a href="{path}">{e(x["name"])}</a></h2><p>{e(x["summary"])}</p><p class="muted">v{e(x["version"])}</p><a class="button" href="{path}">사용 방법 살펴보기</a></div></article>')
        links=''.join(f'<a class="button" href="{path}{p}/">{t}</a>' for p,t in [('support','사용 안내·문의'),('privacy','개인정보 안내'),('terms','이용약관')])
        install=f'<a class="button primary" href="{e(x["install_url"] or "")}">설치하기</a>' if status=='public' else f'<p class="hub-notice">{status_text}입니다. 공개 설치가 확인되면 설치 링크를 제공합니다.</p>'
        heading=f'<a href="/tools/">← 전체 목록</a><span class="eyebrow">{e(x["kind"])} · {status_text} · v{e(x["version"])}</span><h1>{e(x["name"])}</h1><p class="lede">{e(x["summary"])}</p>'
        steps='<ol>'+''.join(f'<li>{e(s)}</li>' for s in x['steps'])+'</ol>'
        requirements='<ul>'+''.join(f'<li>{e(s)}</li>' for s in x['requirements'])+'</ul>'
        changes=''.join(f'<article><h3>v{e(c["version"])}</h3><p>{e(c["text"])}</p></article>' for c in x['changes'])
        body=f'{heading}{install}<section class="hub-stack"><h2>내 판단이 앱이 되는 과정</h2>{steps}</section><section class="hub-stack"><h2>시작 전에 준비할 것</h2>{requirements}<p>스킬은 무료입니다. AI 환경·호스팅·인증·API 등 외부 서비스 비용은 각 제공자의 요금과 본인의 사용량에 따릅니다.</p></section><section class="hub-stack"><h2>개선 이력</h2>{changes}</section><div class="actions">{links}</div>'
        out[path+'index.html']=page(x['name'],path,body,x['summary'])
        mail=e(DATA['support'])
        sections=x["pages"]
        assert set(sections)=={'support','privacy','terms'}, 'Missing policy/support pages'
        for suffix,(title,content) in sections.items():
            content=content.replace('{{support}}', mail)
            sub=path+suffix+'/'
            out[sub+'index.html']=page(title,sub,f'<a href="{path}">← 스킬 소개</a><h1>{title}</h1><p class="muted">{e(x["name"])}</p><section class="hub-stack">{content}</section>',title+' · '+x['name'])
    body='<span class="eyebrow">MIRINAEMAN · TOOLS</span><h1>내 메시지에<br class="hub-break">몸을 만드는 방법</h1><p class="lede">질문하며 판단하고, AI와 함께 구현합니다. 미리내맨의 스킬과 플러그인을 한곳에서 만나보세요.</p><form class="hub-filters" role="search"><label>이름·분야 검색<input type="search" id="search" placeholder="예: 코딩, 개발"></label><label>종류<select id="kind"><option value="">전체</option><option>스킬</option><option>플러그인</option></select></label></form><p id="count" role="status" aria-live="polite"></p><div class="hub-grid">'+''.join(cards)+'</div><p id="empty" hidden>조건에 맞는 항목이 없습니다. 검색어나 종류를 바꿔보세요.</p>'
    out['/tools/index.html']=page('스킬·플러그인','/tools/',body,'미리내맨의 스킬과 플러그인 소개, 사용 방법과 개선 이력.')
    return {ROOT/k.lstrip('/'):v for k,v in out.items()}

if __name__=='__main__':
    for path,content in outputs().items():
        if '--check' in sys.argv: assert path.exists() and path.read_text()==content, f'Catalog drift: {path}'
        else:path.parent.mkdir(parents=True,exist_ok=True);path.write_text(content)
    print('Tool catalog: PASS')
