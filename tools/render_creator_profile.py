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
    contact = (START+'<section class="section" aria-labelledby="creator-contact-title"><div class="wrap">'
      '<div class="section-head"><div><span class="eyebrow">CREATOR · CONTACT</span>'
      f'<h2 id="creator-contact-title">{esc(data["name"])} · {esc(data["aliases"][0])}</h2></div>'
      '<p>'+bilingual(data['practice'])+'</p></div><div class="grid two">'
      '<article class="proof"><h3>공식 채널과 연락처</h3>'+links(data['channels'])+
      links([{'label':data['email'],'url':'mailto:'+data['email']}])+'</article>'
      '<article class="proof"><h3>작품과 사회적 활동</h3>'+links(data['works'])+
      '<p>사회적 활동</p>'+links([{'label':'미리내운동 활동 소개','url':data['movement']['intro_url']},data['movement']])+
      '</article></div></div></section>'+END)
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
