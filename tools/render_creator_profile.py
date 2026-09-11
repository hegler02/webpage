#!/usr/bin/env python3
"""Keep approved creator identity, visible links and discovery metadata in sync."""
import argparse
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROFILE = ROOT / 'pages/profile'
PAGE = PROFILE / 'profile/index.html'
DATA = PROFILE / 'data/creator-profile.json'
START = '<!-- CREATOR_CONTACT_START -->'
END = '<!-- CREATOR_CONTACT_END -->'

def esc(value):
    return html.escape(value, quote=True)

def bilingual(value):
    return ''.join(f'<span data-{lang}' + (' lang="en"' if lang == 'en' else '') + f'>{esc(value[lang])}</span>' for lang in ('ko', 'en'))

def links(items):
    return '<ul>' + ''.join(f'<li><a href="{esc(item["url"])}">{esc(item["label"])}</a></li>' for item in items) + '</ul>'

def channel_links(items):
    # Paths from Simple Icons (CC0); recognizable logos, not text glyph substitutes.
    paths = json.loads((PROFILE / 'data/social-icons.json').read_text())
    keys = {'YouTube':'youtube', 'Instagram':'instagram', 'TikTok':'tiktok', '네이버 블로그':'naver'}
    result = []
    for item in items:
        key = keys[item['label']]
        svg = f'<svg width="24" height="24" viewBox="0 0 24 24" data-icon="{key}" aria-hidden="true" focusable="false"><path d="{paths[key]}"/></svg>'
        result.append(f'<li><a class="creator-icon-link" href="{esc(item["url"])}" aria-label="{esc(item["label"])}" title="{esc(item["label"])}">{svg}</a></li>')
    return '<ul class="creator-socials">'+''.join(result)+'</ul>'

def render(source, data):
    person = {'@context':'https://schema.org', '@type':'Person', '@id':data['url']+'#person',
              'name':data['name'], 'alternateName':data['aliases'], 'url':data['url'],
              'mainEntityOfPage':data['url'], 'description':data['description'],
              'jobTitle':data['jobTitle'], 'email':data['email'],
              'sameAs':[item['url'] for item in data['channels']]}
    assert data['movement']['url'] not in person['sameAs']
    source = re.sub(r'<title>.*?</title>', lambda _: '<title>'+esc(data['title'])+'</title>', source, count=1)
    metadata = [('name','description',data['description']), ('property','og:title',data['title']),
                ('property','og:description',data['description']), ('property','og:url',data['url']),
                ('property','og:image',data['image']['url']), ('property','og:image:alt',data['image']['alt']),
                ('name','twitter:card','summary_large_image'), ('name','twitter:title',data['title']),
                ('name','twitter:description',data['description']), ('name','twitter:image',data['image']['url']),
                ('name','twitter:image:alt',data['image']['alt'])]
    for attr, name, value in metadata:
        tag = f'<meta {attr}="{name}" content="{esc(value)}">'
        pattern = rf'<meta {attr}="{re.escape(name)}"[^>]*>'
        source = re.sub(pattern, lambda _: tag, source) if re.search(pattern, source) else source.replace('</head>',tag+'</head>',1)
    schema = '<script type="application/ld+json">'+json.dumps(person,ensure_ascii=False).replace('<','\\u003c')+'</script>'
    source = re.sub(r'<script type="application/ld\+json">.*?</script>',lambda _:schema,source,count=1,flags=re.S)
    hero = re.search(r'(<section class="page-hero[^>]*>.*?)(<p>.*?</p>)(.*?</section>)',source,re.S)
    if not hero:
        raise ValueError('Expected profile hero not found')
    source = source[:hero.start(2)] + '<p>'+bilingual(data['intro'])+'</p>' + source[hero.end(2):]
    for tag in ('<link rel="stylesheet" href="./creator-contact.css">', '<script defer src="./creator-contact.js"></script>'):
        if tag not in source:
            source = source.replace('</head>', tag+'</head>', 1)
    contact = (START+'<section class="section creator-contact" id="creator-contact" aria-labelledby="creator-contact-title"><div class="wrap">'
      '<div class="section-head"><div><span class="eyebrow">CREATOR · CONTACT</span>'
      f'<h2 id="creator-contact-title">{esc(data["name"])} · {esc(data["aliases"][0])}</h2></div>'
      '<p>'+bilingual(data['practice'])+'</p></div><div class="grid two">'
      '<article class="creator-panel"><h3>'+bilingual({'ko':'공식 채널','en':'Official channels'})+'</h3>'+channel_links(data['channels'])+
      '<div class="creator-email"><span id="creator-email-address">'+esc(data['email'])+'</span>'
      '<button type="button" class="creator-copy" data-copy-email aria-label="이메일 주소 복사" title="이메일 주소 복사" aria-describedby="creator-copy-status">'
      '<svg width="24" height="24" viewBox="0 0 24 24" data-icon="copy" aria-hidden="true" focusable="false"><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg></button></div>'
      '<p class="creator-copy-status" id="creator-copy-status" role="status" aria-live="polite"></p></article>'
      '<div class="creator-activities"><article class="creator-panel"><h3>'+bilingual({'ko':'창작 작품','en':'Creative works'})+'</h3>'+links(data['works'])+'</article>'
      '<article class="creator-panel"><h3>'+bilingual({'ko':'사회적 활동','en':'Social initiatives'})+'</h3>'+links([{'label':'미리내운동 활동 소개','url':data['movement']['intro_url']},data['movement']])+
      '</article></div></div></div></section>'+END)
    if START in source:
        source = re.sub(re.escape(START)+'.*?'+re.escape(END),lambda _:contact,source,flags=re.S)
    else:
        boundary = source.index('</section>',source.index('<main'))+len('</section>')
        source = source[:boundary]+contact+source[boundary:]
    return source

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check',action='store_true')
    args = parser.parse_args()
    data = json.loads(DATA.read_text())
    source = PAGE.read_text()
    result = render(source,data)
    if args.check:
        if source != result:
            raise SystemExit('Creator profile differs from its content authority; run render_creator_profile.py')
    else:
        PAGE.write_text(result)
    print('Creator profile content and metadata: PASS')

if __name__ == '__main__':
    main()
