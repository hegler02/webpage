#!/usr/bin/env python3
"""Keep approved creator identity, visible links and discovery metadata in sync."""
import argparse
import html
import json
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
PROFILE = ROOT / 'pages/profile'
PAGE = PROFILE / 'about/index.html'
DATA = PROFILE / 'data/creator-profile.json'
START = '<!-- CREATOR_CONTACT_START -->'
END = '<!-- CREATOR_CONTACT_END -->'
FILM_START = '<!-- CREATOR_FILM_START -->'
FILM_END = '<!-- CREATOR_FILM_END -->'


def esc(value):
    return html.escape(value, quote=True)


def bilingual(value):
    return ''.join(f'<span data-{lang}' + (' lang="en"' if lang == 'en' else '') + f'>{esc(value[lang])}</span>' for lang in ('ko', 'en'))


def external_attrs(url, site_url):
    destination = urlsplit(url)
    if destination.netloc and destination.hostname != urlsplit(site_url).hostname:
        return ' target="_blank" rel="noopener noreferrer"'
    return ''


def links(items, site_url):
    return '<ul>' + ''.join(f'<li><a href="{esc(item["url"])}"{external_attrs(item["url"], site_url)}>{esc(item["label"])}</a></li>' for item in items) + '</ul>'


def channel_links(items, site_url):
    # Paths from Simple Icons (CC0); recognizable logos, not text glyph substitutes.
    paths = json.loads((PROFILE / 'data/social-icons.json').read_text())
    keys = {'YouTube': 'youtube', 'Instagram': 'instagram', 'TikTok': 'tiktok', '네이버 블로그': 'naver'}
    result = []
    for item in items:
        key = keys[item['label']]
        svg = f'<svg width="24" height="24" viewBox="0 0 24 24" data-icon="{key}" aria-hidden="true" focusable="false"><path d="{paths[key]}"/></svg>'
        result.append(f'<li><a class="creator-icon-link" href="{esc(item["url"])}"{external_attrs(item["url"], site_url)} aria-label="{esc(item["label"])}" title="{esc(item["label"])}">{svg}</a></li>')
    return '<ul class="creator-socials">' + ''.join(result) + '</ul>'


def person_schema(data):
    person = {'@context': 'https://schema.org', '@type': 'Person', '@id': data['url'] + '#person', 'name': data['name'], 'alternateName': data['aliases'], 'url': data['url'],
              'mainEntityOfPage': data['url'], 'description': data['description'], 'jobTitle': data['jobTitle'], 'email': data['email'], 'sameAs': [item['url'] for item in data['channels']]}
    assert data['movement']['url'] not in person['sameAs']
    return person


def contact_block(data):
    copy_icon = '<svg width="24" height="24" viewBox="0 0 24 24" data-icon="copy" aria-hidden="true" focusable="false"><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>'
    return (START + '<section class="sec creator-contact" id="creator-contact" aria-labelledby="creator-contact-title">'
            f'<h2 id="creator-contact-title">{esc(data["name"])} · {esc(data["aliases"][0])}</h2><div class="two">'
            '<div class="creator-panel"><h3>' + bilingual({'ko': '공식 채널', 'en': 'Official channels'}) + '</h3>' + channel_links(data['channels'], data['url']) +
            '<div class="creator-email"><span id="creator-email-address">' + esc(data['email']) + '</span>'
            '<button type="button" class="creator-copy" data-copy-email aria-label="이메일 주소 복사" title="이메일 주소 복사" aria-describedby="creator-copy-status">' + copy_icon + '</button></div>'
            '<p class="creator-copy-status" id="creator-copy-status" role="status" aria-live="polite"></p></div>'
            '<div><div class="creator-panel"><h3>' + bilingual({'ko': '창작 작품', 'en': 'Creative works'}) + '</h3>' + links(data['works'], data['url']) + '</div>'
            '<div class="creator-panel"><h3>' + bilingual({'ko': '사회적 활동', 'en': 'Social initiatives'}) + '</h3>' + links([{'label': '미리내운동 활동 소개', 'url': data['movement']['intro_url']}, data['movement']], data['url']) +
            '</div></div></div></section>' + END)


def film_block(data):
    film = data.get('featured_film')
    if not film:
        return ''
    return (FILM_START + '<section class="sec creator-film" id="on-stage" aria-labelledby="creator-film-title">'
            '<a class="creator-film-card" href="' + esc(film['url']) + '" target="_blank" rel="noopener">'
            '<img src="' + esc(film['image']) + '" width="960" height="540" loading="lazy" alt="' + esc(film['alt']) + '">'
            '<div class="creator-film-copy"><span class="eyebrow">A PERSONAL FILM · 00:48</span>'
            '<h2 id="creator-film-title">' + bilingual(film['title']) + '</h2>'
            '<p>' + bilingual(film['description']) + '</p>'
            '<span class="creator-film-action">' + bilingual({'ko': '48초 감상 ↗', 'en': 'Watch the 48-second film ↗'}) + '</span>'
            '</div></a></section>' + FILM_END)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    parser.parse_args()
    data = json.loads(DATA.read_text(encoding='utf-8'))
    source = PAGE.read_text(encoding='utf-8')
    for block in (contact_block(data), film_block(data)):
        if block not in source:
            raise SystemExit('Creator profile differs from its content authority; run render_archive.py')
    assert json.dumps(person_schema(data), ensure_ascii=False).replace('<', '\\u003c') in source, 'Creator identity schema drift'
    print('Creator profile content and metadata: PASS')


if __name__ == '__main__':
    main()
