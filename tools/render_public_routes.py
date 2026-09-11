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
    existing = [r for r in config.get('redirects', []) if r['source'] not in aliases]
    config['redirects'] = existing + [{'source': source, 'destination': target, 'permanent': True} for source, target in aliases.items()]
    result[config_path] = json.dumps(config, ensure_ascii=False, indent=2) + '\n'
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    check = parser.parse_args().check
    for path, content in outputs().items():
        if check:
            assert path.read_text() == content, f'Public route drift: {path}'
        else:
            path.write_text(content)
    print('Public HTML routes: PASS' if check else 'Public HTML routes rendered')
