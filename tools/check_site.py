#!/usr/bin/env python3
"""The site contract: every record reaches every place it belongs, every link lands, every style comes from a token."""
import json
import re
import sys
import xml.etree.ElementTree as ElementTree
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit

sys.path.insert(0, str(Path(__file__).parent))
from constellation_data import PROFILE, ROOT
from galaxy_layout import load as load_layout
from render_site import HOME_LATEST, Site
from site_graph import RECORD_KINDS

ORIGIN = 'https://mirinaeman.com'
SITE_CSS = ('site/site.css', 'site/chrome.css')


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.ids = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get('id'):
            self.ids.append(a['id'])
        for key in ('href', 'src'):
            if tag in ('a', 'img', 'link', 'script') and a.get(key):
                self.links.append(a[key])


def vercel():
    return json.loads((ROOT / 'vercel.json').read_text(encoding='utf-8'))


def resolve(path, config):
    """Where the host would answer a public path from, or None."""
    for r in config['redirects']:
        source = r['source']
        if source == path or (source.endswith(':path*') and path.startswith(source[:-6])):
            return resolve(urlsplit(r['destination'].replace(':path*', path[len(source) - 6:] if source.endswith(':path*') else '')).path, config)
    if path != '/' and (ROOT / path.lstrip('/')).exists():
        target = ROOT / path.lstrip('/')
        return target / 'index.html' if target.is_dir() else target
    for r in config['rewrites']:
        source = r['source']
        if source == path:
            target = r['destination']
        elif source.endswith(':path*') and path.startswith(source[:-6]):
            target = r['destination'].replace(':path*', path[len(source) - 6:])
            # The host does not open a folder's index.html through a wildcard rewrite.
            if target.endswith('/') or (ROOT / target.lstrip('/')).is_dir():
                return None
        else:
            continue
        file = ROOT / target.lstrip('/')
        if file.is_dir() or target.endswith('/'):
            file = file / 'index.html'
        return file if file.is_file() else None
    return None


def token_problems():
    found = []
    tokens = (PROFILE / 'site/tokens.css').read_text(encoding='utf-8')
    defined = set(re.findall(r'(--[\w-]+):', tokens))
    for name in SITE_CSS:
        css = re.sub(r'/\*.*?\*/', '', (PROFILE / name).read_text(encoding='utf-8'), flags=re.S)
        css = re.sub(r'@import[^;]+;', '', css)
        rules = re.sub(r'@media[^{]+', '@media', css)
        for pattern, label in [(r'#[0-9a-fA-F]{3,8}\b', 'colour'), (r'(?<![\w.(-])\d*\.?\d+(?:px|rem|em|vw|vh|dvh|ms|s)\b(?!-)', 'size or time'),
                               (r'font-size:\s*(?!var\()', 'font size'), (r'line-height:\s*(?!var\(|inherit)', 'line height'), (r'letter-spacing:\s*(?!var\(|inherit)', 'tracking')]:
            for m in re.finditer(pattern, rules):
                if label == 'size or time' and m.group(0) in ('0s',):
                    continue
                found.append(f'{name}: raw {label} instead of a token near "{rules[max(0, m.start() - 24):m.end() + 8]}"')
        used = set(re.findall(r'var\((--[\w-]+)', css))
        for missing in sorted(used - defined - {'--c', '--i'}):
            found.append(f'{name}: {missing} is not defined in tokens.css')
    return found


def main():
    site = Site()
    config = vercel()
    errors = []
    outputs = site.outputs()
    sitemap = {n.text for n in ElementTree.parse(PROFILE / 'sitemap.xml').getroot().iter() if n.tag.endswith('loc')}
    work = (PROFILE / 'work/index.html').read_text(encoding='utf-8')
    research = (PROFILE / 'research/index.html').read_text(encoding='utf-8')
    home = (PROFILE / 'index.html').read_text(encoding='utf-8')
    galaxy = json.loads((PROFILE / 'galaxy/graph.json').read_text(encoding='utf-8'))
    stars = {n['id']: n for n in galaxy['nodes']}
    layout = load_layout()

    # 1. Every record reaches its page, its list, the sitemap and the sky.
    for n in site.records:
        name = f"{n['id']} ({n['t']})"
        if resolve(n['page'], config) is None:
            errors.append(f'{name}: no page at {n["page"]}')
        if ORIGIN + n['page'] not in sitemap:
            errors.append(f'{name}: missing from sitemap')
        listing = research if n['page'].startswith('/research/') else work
        if f'href="{n["page"]}"' not in listing:
            errors.append(f'{name}: not listed on {"/research/" if listing is research else "/work/"}')
        if n['id'] not in stars or n['id'] not in layout:
            errors.append(f'{name}: no star in the galaxy')
    expected_home = [n['page'] for n in site.latest()]
    shown = re.findall(r'<a class="card" href="([^"]+)"', home.split('latest-bodies', 1)[-1])[:HOME_LATEST]
    if shown != expected_home:
        errors.append('home: the newest records are not the ones shown')
    for star in (n for n in site.nodes if n['k'] == 'constellation'):
        if f'value="{star["id"]}"' not in work:
            errors.append(f'{star["id"]}: constellation missing from the work filter')

    # 2. Every internal link and image lands.
    for path in [p for p in outputs if p.suffix == '.html'] + [PROFILE / 'navigation.js']:
        if path.suffix != '.html':
            continue
        doc = Links()
        doc.feed(path.read_text(encoding='utf-8'))
        if len(doc.ids) != len(set(doc.ids)):
            errors.append(f'{path.relative_to(ROOT)}: duplicate id')
        public = '/' + path.parent.relative_to(PROFILE).as_posix().strip('.') + '/'
        for link in doc.links:
            url = urlsplit(urljoin(ORIGIN + public.replace('//', '/'), link))
            if url.netloc != 'mirinaeman.com' or url.path.startswith('/pages/') and not url.path.startswith('/pages/profile/'):
                continue
            if url.path.startswith('/tools/'):
                continue
            if resolve(url.path, config) is None:
                errors.append(f'{path.relative_to(ROOT)}: broken link {link}')
    context = json.loads((PROFILE / 'site/editorial-context.json').read_text(encoding='utf-8'))
    for page in context:
        if resolve(page, config) is None:
            errors.append(f'editorial context for a page that does not exist: {page}')

    # 3. One menu, and every address it replaced still answers.
    manifest = site.manifest
    if [r['key'] for r in manifest['routes']] != ['home', 'work', 'galaxy', 'research', 'mirinae', 'about']:
        errors.append('menu must be 홈, 작업, 은하수, 연구, 미리내, 소개')
    redirects = {r['source']: r['destination'] for r in config['redirects']}
    for old, new in manifest['moved'].items():
        if redirects.get(old) != new:
            errors.append(f'old address {old} does not lead to {new}')

    # 4. Research keeps its order: doctoral thesis, master's thesis, then articles.
    theses = re.search(r'data-research-list="theses">(.*?)</div><h3', research, re.S)
    if not theses or theses.group(1).find('박사학위논문') > theses.group(1).find('석사학위논문'):
        errors.append('research: degree theses come first, doctoral before master')

    # 5. Style comes from the one token source.
    errors += token_problems()
    for path in outputs:
        if path.suffix == '.html' and re.search(r'style="(?!--[\w-]+:)', path.read_text(encoding='utf-8')):
            errors.append(f'{path.relative_to(ROOT)}: inline style that is not a token')

    if errors:
        for line in errors:
            print('BLOCK:', line)
        return 1
    print(f'Site contract: PASS ({len(site.records)} records, {len(outputs)} files, every link resolved)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
