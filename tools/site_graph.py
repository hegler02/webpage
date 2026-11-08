"""The whole site as one graph: every record with its address, place in the sky and neighbours."""
import json
import math
import re
from pathlib import Path

from constellation_data import PROFILE, ROOT, build_graph
from galaxy_layout import HUB, affinity, load as load_layout, place_new
from records import KINDS, slug

BODY_KIND = {'SONGBODY': 'song', 'SLIDEBODY': 'slide', 'SCREENBODY': 'screen', 'STORYBODY': 'story', 'KNOWLEDGEBODY': 'knowledge'}
# Kinds that are shown as a record of their own. Ideas and essays live inside the galaxy.
RECORD_KINDS = {'song', 'slide', 'screen', 'story', 'knowledge', *KINDS}
PUBLIC = ('DEPLOYED', 'GOLDEN')


def read_json(path):
    return json.loads(Path(path).read_text(encoding='utf-8'))


def page_of(node_id, editorial=()):
    """One address per record. An introduction already standing at that address is the record's page."""
    kind, _, name = node_id.partition(':')
    if kind == 'work':
        return f'/work/{name}/'
    if kind in KINDS:
        return f'/{KINDS[kind][0]}/{name}/'
    return ''


def site_graph(catalog=None, records=None, links=None, layout=None, posts=None):
    catalog = catalog or read_json(PROFILE / 'data/message-bodies.json')
    records = records if records is not None else read_json(PROFILE / 'data/records.json')
    links = links if links is not None else read_json(PROFILE / 'data/constellation-links.json')
    manifest = read_json(PROFILE / 'site.manifest.json')
    g = build_graph(catalog, links=links, records=records, posts=posts)
    nodes, edges = g['nodes'], g['edges']
    known = layout if layout is not None else load_layout()
    known = {k: v for k, v in known.items() if k in {n['id'] for n in nodes}}
    missing = [n['id'] for n in nodes if n['id'] not in known]
    positions = place_new(nodes, edges, known) if missing else known
    bodies = {'work:' + b['body_id']: b for b in catalog['bodies']}
    own = {r['id']: r for r in records['records']}
    keys = {('work:' + m['id'] if ':' not in m['id'] else m['id']) for c in links['constellations'] for m in c['members'] if m.get('key')}
    keys |= {('work:' + s['id'] if ':' not in s['id'] else s['id']) for s in links['solo'] if s.get('key')}
    index = {n['id']: i for i, n in enumerate(nodes)}
    pairs = affinity(nodes)
    degree = {n['id']: 0 for n in nodes}
    real = []
    for e in edges:
        if HUB not in (e['source'], e['target']):
            degree[e['source']] += 1
            degree[e['target']] += 1
            real.append(e)
    out = []
    for i, n in enumerate(nodes):
        body = bodies.get(n['id'])
        kind = BODY_KIND[body['body_type']] if body else n['kind']
        # A record's neighbours are records; a post may sit beside either.
        near = sorted(((round(pairs.get((min(i, j), max(i, j)), 0), 6), nodes[j]['id']) for j in range(len(nodes)) if j != i and (n['kind'] == 'post' or nodes[j]['kind'] != 'post')), key=lambda x: (-x[0], x[1]))
        item = dict(id=n['id'], k=kind, t=n['title'], s=re.sub(r'\s+', ' ', n.get('summary') or ''), u=n.get('url') or '', page=page_of(n['id']) if kind in RECORD_KINDS else '', y=n.get('year') or '',
                    p=positions[n['id']], d=degree[n['id']], key=n['id'] in keys, kin=[o for w, o in near[:6] if w > 0], tags=[t.lower() for t in (n.get('tags') or [])][:6])
        if n.get('introUrl'):
            item['intro'] = n['introUrl']
        if n.get('image') and (kind in RECORD_KINDS or kind == 'post'):
            item.update(img=n['image'].removeprefix('/pages/profile'), alt=n.get('alt', ''))
        if kind not in RECORD_KINDS and n.get('sections'):
            item['sec'] = [s for s in n['sections'] if s['text'] != n.get('summary')]
        if body:
            item['added'] = body['latest_deployed_at']
        elif n['id'] in own:
            item['added'] = own[n['id']]['added']
        out.append(item)
    link_out = [dict(a=e['source'], b=e['target'], l=e.get('label', ''), r=e.get('reason', ''), hub=HUB in (e['source'], e['target'])) for e in edges]
    return dict(nodes=out, edges=link_out, positions=positions, manifest=manifest, catalog=catalog, records=records, links=links, bodies=bodies, own=own, raw=g)


def thumb_ok():
    return True
