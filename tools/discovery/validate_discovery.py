#!/usr/bin/env python3
"""Block incomplete public-page SEO, Open Graph and Twitter cards before release."""
from __future__ import annotations
from datetime import datetime
import argparse
import json
import re
import sys
import xml.etree.ElementTree as ET
from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

from validate_og_images import validate_og_site, probe_og_site

REQUIRED = ('description', 'viewport', 'og:type', 'og:title', 'og:description',
            'og:url', 'og:image', 'og:image:type', 'og:image:width', 'og:image:height',
            'og:image:alt', 'twitter:card', 'twitter:title', 'twitter:description',
            'twitter:image', 'twitter:image:alt')

class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.meta = defaultdict(list)
        self.canonicals, self.titles, self.schemas, self.h1s = [], [], [], []
        self.lang = ''; self.head = False; self.capture = None; self.text = []
        self.feed(html)
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'html': self.lang = (a.get('lang') or '').strip()
        if tag == 'head': self.head = True
        if self.head and tag == 'meta':
            key = (a.get('property') or a.get('name') or '').lower()
            self.meta[key].append((a.get('content') or '').strip())
        if self.head and tag == 'link' and 'canonical' in (a.get('rel') or '').lower().split():
            self.canonicals.append((a.get('href') or '').strip())
        if (tag == 'title' and self.head) or tag == 'h1' or (tag == 'script' and a.get('type') == 'application/ld+json'):
            self.capture = tag; self.text = []
    def handle_data(self, data):
        if self.capture: self.text.append(data)
    def handle_endtag(self, tag):
        if tag == self.capture:
            {'title':self.titles,'h1':self.h1s,'script':self.schemas}[tag].append(''.join(self.text).strip())
            self.capture = None
        if tag == 'head': self.head = False
    def value(self, key):
        return self.meta[key][0] if self.meta[key] else ''

def https(value):
    u = urlparse(value)
    return u.scheme == 'https' and bool(u.hostname) and not u.username and not u.password and not u.fragment

def identity(value):
    return value.rstrip('/')

def schema_nodes(value):
    if isinstance(value, list):
        for item in value: yield from schema_nodes(item)
    elif isinstance(value, dict):
        yield value
        for key, child in value.items():
            if key != '@context': yield from schema_nodes(child)

def video_errors(node):
    types = node.get('@type', [])
    types = types if isinstance(types, list) else [types]
    if not any(isinstance(t, str) and t.rsplit('/', 1)[-1] == 'VideoObject' for t in types):
        return []
    errors = []
    if not isinstance(node.get('name'), str) or not node['name'].strip():
        errors.append('VideoObject missing non-empty name')
    thumbs = node.get('thumbnailUrl', [])
    thumbs = thumbs if isinstance(thumbs, list) else [thumbs]
    if not thumbs or not all(isinstance(t, str) and https(t) for t in thumbs):
        errors.append('VideoObject thumbnailUrl requires absolute HTTPS image URL(s)')
    value = node.get('uploadDate')
    if not isinstance(value, str) or not value.strip():
        errors.append('VideoObject missing uploadDate (original publication)')
    else:
        try:
            if not re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?", value):
                raise ValueError('not an ISO date/time')
            datetime.fromisoformat(value.replace('Z', '+00:00'))
        except ValueError:
            errors.append('VideoObject uploadDate must be a valid ISO 8601 date/time')
    return errors

def public_base(canonical):
    u=urlparse(canonical);path=u.path or '/'
    if not path.endswith('/'):
        path=path.rsplit('/',1)[0]+'/' if Path(path).suffix else path+'/'
    return u._replace(path=path,params='',query='',fragment='').geturl()

def can_crawl(lines, agent, url):
    groups=[];agents=[];rules=[]
    for raw in [*lines,'']:
        line=raw.split('#',1)[0].strip()
        if not line:
            if agents:groups.append((agents,rules))
            agents=[];rules=[];continue
        if ':' not in line:continue
        key,value=line.split(':',1);key=key.strip().lower();value=value.strip()
        if key=='user-agent':
            if rules:groups.append((agents,rules));agents=[];rules=[]
            agents.append(value.lower())
        elif key in ('allow','disallow') and agents and value:rules.append((key,value))
    selected=[];best=-2
    for agents,rules in groups:
        scores=[-1 if a=='*' else len(a) for a in agents if a=='*' or a in agent.lower()]
        if not scores:continue
        score=max(scores)
        if score>best:best=score;selected=list(rules)
        elif score==best:selected.extend(rules)
    u=urlparse(url);path=u.path or '/'
    if u.query:path+='?'+u.query
    matches=[]
    for kind,pattern in selected:
        terminal=pattern.endswith('$');raw=pattern[:-1] if terminal else pattern
        expression='^'+re.escape(raw).replace(r'\*','.*')+('$' if terminal else '')
        if re.search(expression,path):matches.append((len(raw.replace('*','')),kind=='allow'))
    return max(matches)[1] if matches else True

SCHEMA_TYPES={'WebPage','WebSite','CreativeWork','MusicAlbum','MusicRecording','Article',
 'NewsArticle','BlogPosting','Person','Organization','CollectionPage','ProfilePage','AboutPage',
 'FAQPage','Product','Book','VideoObject','SoftwareApplication','Course','Event','Recipe','Dataset'}

def has_schema_context(value):
    if isinstance(value,str):return value.rstrip('/') in ('https://schema.org','http://schema.org')
    if isinstance(value,list):return any(has_schema_context(v) for v in value)
    if isinstance(value,dict):return has_schema_context(value.get('@vocab'))
    return False

def valid_type(value):
    values=value if isinstance(value,list) else [value]
    return bool(values) and all(isinstance(v,str) and v.rsplit('/',1)[-1] in SCHEMA_TYPES for v in values)

def validate_discovery(root: Path, *, media_manifest=None, probe_url=None):
    root = root.resolve(); errors = []
    pages = sorted(root.rglob('*.html'))
    if not pages: return ['site contains no HTML pages']
    titles = {}; descriptions = {}; canonicals = {}; public_urls = []; image_urls = []
    for path in pages:
        label = str(path.relative_to(root)); page = Page(path.read_text(encoding='utf-8'))
        def fail(message): errors.append(f'{label}: {message}')
        if not page.lang: fail('missing html lang')
        if len(page.titles) != 1 or not page.titles[0]: fail('exactly one non-empty title required')
        if len(page.h1s) != 1 or not page.h1s[0]: fail('exactly one non-empty h1 required')
        for key in REQUIRED:
            if len(page.meta[key]) != 1 or not page.value(key): fail(f'exactly one non-empty {key} required in head')
        if len(page.canonicals) != 1 or not https(page.canonicals[0]): fail('exactly one absolute HTTPS canonical required')
        canonical = page.canonicals[0] if page.canonicals else ''
        if canonical: public_urls.append(canonical)
        if page.value('og:url') != canonical: fail('og:url differs from canonical')
        if page.value('twitter:card') != 'summary_large_image': fail('twitter:card must be summary_large_image')
        for tw, og in [('twitter:title','og:title'),('twitter:description','og:description'),('twitter:image','og:image'),('twitter:image:alt','og:image:alt')]:
            if page.value(tw) != page.value(og): fail(f'{tw} differs from {og}; derive both from one authority')
        for key in ['og:url','og:image','twitter:image']:
            if not https(page.value(key)): fail(f'{key} must be an absolute HTTPS URL without credentials or fragment')
        image_urls.append(page.value('og:image'))
        for key in ['robots','googlebot','bingbot']:
            directives = set(' '.join(page.meta[key]).lower().replace(',', ' ').split())
            if directives & {'noindex','none','nofollow','noimageindex'}: fail(f'{key} blocks intended public indexing or discovery')
        for values, seen, name in [(page.titles,titles,'title'),([page.value('description')],descriptions,'description'),([canonical],canonicals,'canonical')]:
            for value in values:
                norm = identity(value) if name == 'canonical' else value
                if value and norm in seen: fail(f'duplicate {name} also used by {seen[norm]}')
                seen[norm] = label
        nodes = []; contexts = []
        if not page.schemas: fail('missing JSON-LD')
        for block in page.schemas:
            try:
                parsed = json.loads(block)
                nodes.extend(schema_nodes(parsed))
            except (ValueError, TypeError): fail('invalid JSON-LD')
        for node in nodes:
            for error in video_errors(node): fail(error)
        contexts = [n.get('@context') for n in nodes]
        if not any(has_schema_context(c) for c in contexts):
            fail('JSON-LD needs schema.org context')
        if not any(valid_type(n.get('@type')) and isinstance(n.get('url',n.get('@id')),str) and identity(n.get('url',n.get('@id')).split('#',1)[0]) == identity(canonical) for n in nodes):
            fail('JSON-LD needs a typed page/entity with url equal to canonical')
    sitemap = root/'sitemap.xml'; robots_path = root/'robots.txt'
    locations = []
    if not sitemap.is_file(): errors.append('missing sitemap.xml')
    else:
        try:
            xml = ET.parse(sitemap).getroot()
            if xml.tag != '{http://www.sitemaps.org/schemas/sitemap/0.9}urlset': errors.append('sitemap.xml must be a sitemap urlset')
            locations = [(n.text or '').strip() for n in xml.findall('{*}url/{*}loc')]
            if any(not https(u) for u in locations): errors.append('sitemap locations must be absolute HTTPS URLs')
            for u in public_urls:
                if identity(u) not in {identity(v) for v in locations}: errors.append(f'sitemap missing canonical: {u}')
        except ET.ParseError: errors.append('invalid sitemap XML')
    if not robots_path.is_file(): errors.append('missing robots.txt')
    else:
        lines = robots_path.read_text(encoding='utf-8').splitlines()
        declared = [line.split(':',1)[1].strip() for line in lines if line.lower().startswith('sitemap:')]
        home=Page((root/'index.html').read_text()).canonicals if (root/'index.html').is_file() else []
        expected_sitemap=public_base(home[0])+'sitemap.xml' if home else ''
        # A creator-site subpage uses the domain-root robots and sitemap.
        root_sitemap = urlparse(home[0])._replace(path='/sitemap.xml', params='', query='', fragment='').geturl() if home else ''
        if not ({expected_sitemap, root_sitemap} & set(declared)):
            errors.append('robots.txt needs an absolute first-party Sitemap directive')
        for agent in ['Googlebot','Bingbot','Twitterbot','facebookexternalhit']:
            for url in public_urls + image_urls:
                if url and not can_crawl(lines,agent,url): errors.append(f'robots.txt blocks {agent}: {url}')
    og_errors, records = validate_og_site(root, media_manifest=media_manifest)
    errors.extend(og_errors)
    for record in records:
        if record.local_path.stat().st_size >= 5_000_000: errors.append(f'{record.local_path.name}: shared Twitter image must be under 5 MB')
    if probe_url and not errors: errors.extend(probe_og_site(root, probe_url, records))
    return errors

def main():
    p=argparse.ArgumentParser(description=__doc__); p.add_argument('site',type=Path)
    p.add_argument('--media-manifest',type=Path); p.add_argument('--probe-url')
    a=p.parse_args()
    try: errors=validate_discovery(a.site,media_manifest=a.media_manifest,probe_url=a.probe_url)
    except (OSError, ValueError) as exc: errors=[str(exc)]
    for e in errors: print('BLOCK: '+e)
    if not errors: print('Discovery format: PASS (SEO, OG, Twitter, JSON-LD; indexing/citation not measured)')
    return int(bool(errors))
if __name__=='__main__': sys.exit(main())
