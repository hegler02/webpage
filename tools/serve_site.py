#!/usr/bin/env python3
"""Serve the repository the way the host does: same redirects, rewrites and clean addresses.

  python3 tools/serve_site.py 4330    then open http://localhost:4330/
"""
import http.server
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
CONFIG = json.loads((ROOT / 'vercel.json').read_text(encoding='utf-8'))


def pattern(source):
    out, names = '', []
    for part in re.split(r'(:[a-zA-Z]+\*?)', source):
        if part.startswith(':'):
            names.append(part[1:].rstrip('*'))
            out += '(?P<%s>.*)' % names[-1] if part.endswith('*') else '(?P<%s>[^/]+)' % names[-1]
        else:
            out += re.escape(part)
    return re.compile('^' + out + '$')


RULES = [(pattern(r['source']), r['destination']) for r in CONFIG.get('rewrites', [])]
MOVES = [(pattern(r['source']), r['destination']) for r in CONFIG.get('redirects', [])]


def fill(destination, match):
    return re.sub(r':([a-zA-Z]+)\*?', lambda m: match.group(m.group(1)) or '', destination)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        url = urlsplit(self.path)
        path = url.path
        if not path.endswith('/') and '.' not in path.rsplit('/', 1)[-1]:
            return self.redirect(path + '/' + (('?' + url.query) if url.query else ''))
        for rule, destination in MOVES:
            m = rule.match(path)
            if m:
                target = fill(destination, m)
                if url.query and '?' not in target:
                    target += '?' + url.query
                return self.redirect(target)
        if not (ROOT / path.lstrip('/')).exists() or path == '/':
            for rule, destination in RULES:
                m = rule.match(path)
                if m:
                    path = fill(destination, m)
                    break
        self.path = path + (('?' + url.query) if url.query else '')
        return super().do_GET()

    def redirect(self, target):
        self.send_response(308)
        self.send_header('Location', target)
        self.end_headers()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, *args):
        pass


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4330
    http.server.ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
