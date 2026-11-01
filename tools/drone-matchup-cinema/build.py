from pathlib import Path
import json,html,re,sys,subprocess
ROOT=Path(__file__).resolve().parent
SRC=ROOT/'src';OUT=ROOT.parents[1]/'pages/drone-matchup-cinema'
SKILL=None
def esc(s):return html.escape(str(s),quote=True)
def prose(s):return esc(s).replace('. ','.<br>').replace(', ',',<br>')
def icon(paths):return '<svg data-icon="control" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false" stroke="currentColor" fill="none">'+paths+'</svg>'
PLAY=icon('<path d="M7 4.5 20 12 7 19.5Z"/>')
def build():
    data=json.loads((SRC/'content/site.json').read_text(encoding='utf-8'))
    OUT.mkdir(exist_ok=True)
    canonical=data['canonical'];og=canonical+data['og']['path']
    schema={'@context':'https://schema.org','@graph':[
        {'@type':'WebPage','@id':canonical+'#page','url':canonical,'name':data['seo_title'],'description':data['description'],'inLanguage':'ko','mainEntity':{'@id':canonical+'#work'},'author':{'@id':canonical+'#creator'}},
        {'@type':'CreativeWork','@id':canonical+'#work','name':data['title'],'url':canonical,'description':data['description'],'creator':{'@id':canonical+'#creator'},'dateCreated':data['date'],'creativeWorkStatus':'완성 영상과 연출노트','isBasedOn':{'@type':'CreativeWork','name':'드론 매치업 강의에서 Kling으로 생성한 원본 영상'}},
        {'@type':'Person','@id':canonical+'#creator','name':data['creator'],'url':'https://mirinaeman.com/'}]}
    head=f'<title>{esc(data["seo_title"])}</title>\n<meta name="description" content="{esc(data["description"])}">\n<link rel="canonical" href="{canonical}">\n'
    fields={'og:type':'website','og:title':data['seo_title'],'og:description':data['description'],'og:url':canonical,'og:image':og,'og:image:type':data['og']['mime'],'og:image:width':1200,'og:image:height':630,'og:image:alt':data['og']['alt'],'twitter:card':'summary_large_image','twitter:title':data['seo_title'],'twitter:description':data['description'],'twitter:image':og,'twitter:image:alt':data['og']['alt']}
    head+='\n'.join(f'<meta {"property" if k.startswith("og:") else "name"}="{k}" content="{esc(v)}">' for k,v in fields.items())
    head+='\n<script type="application/ld+json">'+json.dumps(schema,ensure_ascii=False).replace('<','\\u003c')+'</script>'
    stage='';steps=''
    for i,c in enumerate(data['chapters']):
        stage+=f'<img src="{c["image"]}" width="1280" height="720" alt="" loading="lazy" class="{ "active" if i==0 else ""}">'
        steps+=f'<article class="step" id="{c["id"]}"><p class="number">{c["number"]}</p><img class="step-image" src="{c["image"]}" width="1280" height="720" alt="{esc(c["alt"])}" loading="lazy"><h3>{esc(c["title"])}</h3><blockquote>{prose(c["phrase"])}</blockquote><p>{prose(c["body"])}</p><p class="observation"><strong>생성된 장면에서</strong>{prose(c["note"])}</p><button class="scene-jump" type="button" data-time="{c["time"]}" aria-label="{esc(c["title"])} 영상 구간 보기">{PLAY}이 장면 다시 보기</button></article>'
    values={'head':head,'title':esc(data['title']),'creator':esc(data['creator']),'archive_url':data['archive_url'],'poster':data['film']['poster'],'play_icon':PLAY,'share_icon':icon('<path d="M12 16V3m-5 5 5-5 5 5M5 13v7h14v-7"/>'),'down_icon':icon('<path d="M12 4v16m-6-6 6 6 6-6"/>'),'stage_images':stage,'steps':steps,'prompt':''.join(f'<p class="prompt-line">{prose(s)}</p>' for s in data['prompt']),'runtime_data':json.dumps({k:data[k] for k in ['title','canonical','film']},ensure_ascii=False).replace('<','\\u003c')}
    def fill(text):
        for k,v in values.items():text=text.replace('{{'+k+'}}',str(v))
        return text
    for name in ['hero','screening','story','judgment']:
        values[name]=fill((SRC/f'templates/partials/{name}.html').read_text(encoding='utf-8')).replace('<br class="semantic-break">',' ')
    values['css']='\n'.join((SRC/f'styles/{name}.css').read_text(encoding='utf-8') for name in ['tokens','page','access'])
    values['js']='\n'.join((SRC/f'scripts/{name}.js').read_text(encoding='utf-8') for name in ['scroll','media','share','theme'])
    text=fill((SRC/'templates/layout.html').read_text(encoding='utf-8'))
    assert not re.search(r'\{\{\w+\}\}',text)
    assert '\ufffd' not in text
    (OUT/'index.html').write_text(text,encoding='utf-8')
    (OUT/'site.manifest.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    (OUT/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: '+canonical+'sitemap.xml\n',encoding='utf-8')
    (OUT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>'+canonical+'</loc></url></urlset>',encoding='utf-8')
    (OUT/'favicon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#0b141c"/><path d="M7 24V8h6v16m6 0V8h6v16" stroke="#daa15f" stroke-width="3"/></svg>',encoding='utf-8')
    (OUT/'DEPLOY.txt').write_text('Static subpath: '+canonical+'\nDeploy only this public directory. Host root robots and sitemap remain host-owned. Local file preview is supported. No media request before play intent.\n',encoding='utf-8')
    print('Rendered public body. Run the repository release gate before publication.')
if __name__=='__main__':build()
