"""Builds the galaxy draft from the site's real graph. Position comes from relationships; nothing is invented."""
import base64, io, json, math, random, re, sys
from collections import Counter, defaultdict
from pathlib import Path
from PIL import Image
from fontTools import subset
from fontTools.ttLib import TTFont

HERE = Path(__file__).parent
R = Path(__file__).resolve().parents[3]
OUT = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
OUT.mkdir(parents=True, exist_ok=True)
P = R / 'pages/profile'
catalog = {('work:' + b['body_id']): b for b in json.loads((P / 'data/message-bodies.json').read_text(encoding='utf-8'))['bodies']}
TYPE = {'SONGBODY': 'song', 'SLIDEBODY': 'slide', 'SCREENBODY': 'screen', 'STORYBODY': 'story', 'KNOWLEDGEBODY': 'knowledge'}
HUB = 'creator:joonho'
GENERIC = {'audio', 'album', 'lecture', 'slide', 'video', 'song', 'music', 'gsap', 'motion', 'motion-js', 'interactive', 'interactive-web', 'webgl', '16:9', 'photoreal', 'gestalt', 'code', 'chartjs'}

sys.path.insert(0, str(R / 'tools'))
from constellation_data import build_graph
links = json.loads((P / 'data/constellation-links.json').read_text(encoding='utf-8'))
public = build_graph(links={'constellations': [], 'pairs': [], 'solo': []})
g = {'nodes': public['nodes'], 'edges': public['edges']}
known = {n['id'] for n in g['nodes']}
for c in links['constellations']:
    g['nodes'].append({'id': 'proposal:' + c['id'], 'kind': 'proposal', 'title': c['title'], 'summary': c['text']})
    for m in c['members']:
        assert 'work:' + m['id'] in known, m['id']
        g['edges'].append({'source': 'work:' + m['id'], 'target': 'proposal:' + c['id'], 'label': c['title'], 'reason': m['reason'], 'proposal': True})
for p_ in links['pairs']:
    assert 'work:' + p_['a'] in known and 'work:' + p_['b'] in known, p_
    g['edges'].append({'source': 'work:' + p_['a'], 'target': 'work:' + p_['b'], 'label': p_['label'], 'reason': p_['reason'], 'proposal': True})
nodes = g['nodes']
ids = [n['id'] for n in nodes]
index = {n['id']: i for i, n in enumerate(nodes)}
edges = g['edges']
real = [e for e in edges if HUB not in (e['source'], e['target'])]


def tags_of(n):
    b = catalog.get(n['id'], {})
    return {t.lower() for t in (n.get('tags') or b.get('tags') or [])} - GENERIC


tag_sets = [tags_of(n) for n in nodes]
df = Counter(t for s in tag_sets for t in s)
kind_of = []
for n in nodes:
    b = catalog.get(n['id'])
    kind_of.append(TYPE.get(b['body_type'], 'knowledge') if b else n['kind'])
degree = Counter()
for e in real:
    degree[e['source']] += 1
    degree[e['target']] += 1


def affinity(a, b):
    return sum(1 / math.log(1.5 + df[t]) for t in tag_sets[a] & tag_sets[b])


pairs = {}
for a in range(len(nodes)):
    for b in range(a + 1, len(nodes)):
        w = affinity(a, b)
        if w > 0:
            pairs[(a, b)] = w

# Force layout. Recorded links pull hard, shared tags pull gently, and the creator stays at the centre.
rng = random.Random(1909)
pos = [[rng.uniform(-14, 14), rng.uniform(-14, 14), rng.uniform(-14, 14)] for _ in nodes]
pos[index[HUB]] = [0.0, 0.0, 0.0]
vel = [[0.0, 0.0, 0.0] for _ in nodes]
springs = [(index[e['source']], index[e['target']]) for e in real]
recorded = {e['source'] for e in real if not e.get('proposal')} | {e['target'] for e in real if not e.get('proposal')}
N = len(nodes)
for step in range(700):
    cool = 1 - step / 700
    force = [[0.0, 0.0, 0.0] for _ in nodes]
    for a in range(N):
        pa = pos[a]
        for b in range(a + 1, N):
            pb = pos[b]
            dx, dy, dz = pa[0] - pb[0], pa[1] - pb[1], pa[2] - pb[2]
            d2 = dx * dx + dy * dy + dz * dz + .05
            f = 5.5 / d2
            d = math.sqrt(d2)
            for i, v in enumerate((dx, dy, dz)):
                force[a][i] += f * v / d
                force[b][i] -= f * v / d

    def spring(a, b, rest, k):
        dx, dy, dz = pos[b][0] - pos[a][0], pos[b][1] - pos[a][1], pos[b][2] - pos[a][2]
        d = math.sqrt(dx * dx + dy * dy + dz * dz) + 1e-6
        f = k * (d - rest)
        for i, v in enumerate((dx, dy, dz)):
            force[a][i] += f * v / d
            force[b][i] -= f * v / d

    for a, b in springs:
        spring(a, b, 2.6, .10)
    for (a, b), w in pairs.items():
        spring(a, b, 3.4, .012 * min(w, 2.2))
    for i in range(N):
        for j in range(3):
            # Flat disk: the vertical axis is pulled in harder than the others.
            force[i][j] -= pos[i][j] * (.05 if j == 1 else .012)
            vel[i][j] = (vel[i][j] + force[i][j] * .08 * cool) * .82
            pos[i][j] += vel[i][j]
    pos[index[HUB]] = [0.0, 0.0, 0.0]

# A gentle twist turns the disk into arms without changing who is near whom.
out = []
scale = 15 / max(math.hypot(p[0], p[2]) for p in pos)
for p in pos:
    x, y, z = p[0] * scale, p[1] * scale * .42, p[2] * scale
    r = math.hypot(x, z)
    a = math.atan2(z, x) + r * .085
    out.append([round(math.cos(a) * r, 3), round(y, 3), round(math.sin(a) * r, 3)])


def thumb(path):
    if not path:
        return ''
    f = R / path.lstrip('/')
    if not f.is_file():
        return ''
    im = Image.open(f).convert('RGB').resize((320, 180), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=58, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()


records = []
for i, n in enumerate(nodes):
    kin = sorted(((pairs.get((min(i, j), max(i, j)), 0), j) for j in range(N) if j != i), reverse=True)
    key_member = any(m.get('key') and 'work:' + m['id'] == n['id'] for c in links['constellations'] for m in c['members'])
    records.append({
        'id': n['id'], 'k': kind_of[i], 't': n['title'], 's': re.sub(r'\s+', ' ', n.get('summary') or ''), 'u': n.get('url') or '', 'y': n.get('year') or '',
        'img': thumb(n.get('image')) if n['kind'] == 'work' else '', 'alt': n.get('alt') or '', 'p': out[i], 'd': degree[n['id']], 'key': key_member, 'kin': [nodes[j]['id'] for w, j in kin[:6] if w > 0],
        'tags': sorted(tag_sets[i])[:6],
    })
links_out = [{'a': e['source'], 'b': e['target'], 'l': e.get('label', ''), 'r': e.get('reason', ''), 'hub': HUB in (e['source'], e['target']), 'prop': bool(e.get('proposal'))} for e in edges]
data = {'nodes': records, 'edges': links_out}
blob = json.dumps(data, ensure_ascii=False, separators=(',', ':'))

template = (HERE / 'template.html').read_text(encoding='utf-8')

# Pretendard, cut down to the letters this page uses.
letters = set(blob) | set(template) | set(map(chr, range(32, 127)))
letters = {c for c in letters if ord(c) > 31}
letters = {c for c in letters if not (0xD800 <= ord(c) <= 0xDFFF)}
font = TTFont(R / 'pages/on-stage/media/PretendardVariable.woff2')
opts = subset.Options(flavor='woff2', layout_features=['kern', 'liga', 'ccmp', 'locl', 'mark', 'mkmk'], name_IDs=[1, 2], notdef_outline=True)
sub = subset.Subsetter(opts)
sub.populate(unicodes=[ord(c) for c in letters])
sub.subset(font)
buf = io.BytesIO()
font.flavor = 'woff2'
font.save(buf)
face = base64.b64encode(buf.getvalue()).decode()

html = template.replace('/*GRAPH*/null', blob).replace('FONTDATA', face)
(OUT / 'index.html').write_text(html, encoding='utf-8')
far = sorted(records, key=lambda r: -r['d'])[:6]
print('nodes', len(records), 'edges', len(links_out), 'font KB', len(face) // 1024, 'page KB', len(html) // 1024)
print('kinds', Counter(r['k'] for r in records))
print('alone even with proposals', [r['t'][:18] for r in records if r['d'] == 0])
print('proposed links', sum(1 for e in links_out if e['prop']), 'constellations', len(links['constellations']))
