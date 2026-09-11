"""Public HTML identities shared by renderers; physical asset paths stay separate."""
import json
from pathlib import Path
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parents[1]
PROFILE = ROOT / 'pages/profile'


def manifest():
    return json.loads((PROFILE / 'site.manifest.json').read_text())


def public_url(key):
    data = manifest()
    route = next(route for route in data['routes'] if route['key'] == key)
    return urljoin(data['public_home'], route['public_path'])


def editorial_url(body_id):
    data = manifest()
    path = next(path for path in data['editorial_pages'] if path.rstrip('/').endswith('/' + body_id))
    return urljoin(data['public_home'], path)


def html_aliases():
    data = manifest()
    pages = [(data['physical_root'] + r['physical_path'], r['public_path']) for r in data['routes']]
    pages += [(data['physical_root'].rstrip('/') + path + 'index.html', path) for path in data['editorial_pages']]
    aliases = {}
    for physical_file, public_path in pages:
        for alias in (physical_file, physical_file.removesuffix('.html'), physical_file.removesuffix('index.html')):
            aliases[alias] = public_path
    return aliases
