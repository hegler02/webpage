"""Normalize known HTML links and exact legacy redirects, never asset subtrees."""
import argparse
import json
import re
from urllib.parse import urljoin, urlsplit, urlunsplit
from public_routes import ROOT, PROFILE, manifest, html_aliases


def outputs():
    data = manifest()
    aliases = html_aliases()
    origin = data['public_home'].rstrip('/')
    result = {}
    for route in data['routes']:
        path = PROFILE / route['physical_path']
        base = origin + data['physical_root'] + route['physical_path']
        def replace(match):
            value = match.group(2)
            if value.startswith('#'):
                return match.group(0)
            url = urlsplit(urljoin(base, value))
            if url.netloc == urlsplit(origin).netloc and url.path in aliases:
                canonical = urlunsplit((url.scheme, url.netloc, aliases[url.path], url.query, url.fragment))
                return match.group(1) + canonical + match.group(3)
            return match.group(0)
        result[path] = re.sub(r'(<a\b[^>]*\bhref=")([^"]+)(")', replace, path.read_text())
    config_path = ROOT / 'vercel.json'
    config = json.loads(config_path.read_text())
    moved = dict(data.get('moved', {}))
    for source, target in data.get('moved', {}).items():
        physical = data['physical_root'].rstrip('/') + source
        moved.update({physical: target, physical + 'index.html': target, physical + 'index': target})
    existing = [r for r in config.get('redirects', []) if r['source'] not in aliases and r['source'] not in moved and not r['source'].startswith(data['physical_root'])]
    config['redirects'] = existing + [{'source': source, 'destination': target, 'permanent': True} for source, target in {**aliases, **moved}.items()]
    # A moved section keeps its sub-paths (hand-written introductions) but not its own front page.
    gone = set(data.get('moved', {}))
    config['rewrites'] = [r for r in config.get('rewrites', []) if r['source'] not in gone and r['source'] not in ('/constellation/:path*',)]
    present = {r['source'] for r in config['rewrites']}
    for route in data['routes']:
        if route['public_path'] == '/':
            continue
        for source, destination in ((route['public_path'], data['physical_root'].rstrip('/') + route['public_path']), (route['public_path'] + ':path*', data['physical_root'].rstrip('/') + route['public_path'] + ':path*')):
            if source not in present:
                config['rewrites'].append({'source': source, 'destination': destination})
    for source in ('/site/:path*',):
        if source not in present:
            config['rewrites'].append({'source': source, 'destination': data['physical_root'] + 'site/:path*'})
    for name in ('favicon.ico', 'apple-touch-icon.png', 'icon-512.png'):
        if '/' + name not in present:
            config['rewrites'].append({'source': '/' + name, 'destination': data['physical_root'] + name})
    # Rewrites into folders that no longer exist would only hide a 404.
    config['rewrites'] = [r for r in config['rewrites'] if r['source'] != '/archive.js' and (ROOT / r['destination'].lstrip('/').split(':')[0]).exists()]
    redirects = {r['source'] for r in config['redirects']}
    if '/constellation/:path*' not in redirects:
        config['redirects'].append({'source': '/constellation/:path*', 'destination': '/galaxy/:path*', 'permanent': True})

    # The host does not open a folder's index.html through a wildcard rewrite, so every page gets its own.
    record_pages = sorted('/' + p.parent.relative_to(PROFILE).as_posix() + '/' for folder in ('work', 'research') for p in (PROFILE / folder).glob('*/index.html'))
    pages = list(dict.fromkeys([*data.get('editorial_pages', []), *record_pages]))
    editorial = [{'source': path, 'destination': data['physical_root'].rstrip('/') + path} for path in pages]
    editorial_sources = {entry['source'] for entry in editorial}
    config['rewrites'] = editorial + [entry for entry in config['rewrites'] if entry['source'] not in editorial_sources]
    result[config_path] = json.dumps(config, ensure_ascii=False, indent=2) + '\n'
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    check = parser.parse_args().check
    for path, content in outputs().items():
        if check:
            actual = path.read_text()
            # The hosting CLI may reserialize its configuration before building.
            # Compare JSON values; keep byte-exact checks for generated HTML.
            if path.suffix == '.json':
                assert json.loads(actual) == json.loads(content), f'Public route drift: {path}'
            else:
                assert actual == content, f'Public route drift: {path}'
        else:
            path.write_text(content)
    print('Public HTML routes: PASS' if check else 'Public HTML routes rendered')
