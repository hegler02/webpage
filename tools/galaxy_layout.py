#!/usr/bin/env python3
"""Where each star sits. Links pull hard, shared tags pull weakly, the disk is flat with a slight twist.

Positions live in data/galaxy-layout.json so the sky stays put: a new record finds its own place among
stars that do not move. `--full` lays out the whole sky again.
"""
import hashlib
import json
import math
import random
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'pages/profile/data/galaxy-layout.json'
HUB = 'creator:joonho'
GENERIC = {'audio', 'album', 'lecture', 'slide', 'video', 'song', 'music', 'gsap', 'motion', 'motion-js', 'interactive', 'interactive-web', 'webgl', '16:9', 'photoreal', 'gestalt', 'code', 'chartjs'}
RADIUS = 15
# Stars that arrive by themselves and live on another site.
OUTSIDE = {'post', 'video', 'album', 'series'}


def tag_sets(nodes):
    return [{t.lower() for t in (n.get('tags') or [])} - GENERIC for n in nodes]


def affinity(nodes):
    """Shared rare tags count more than shared common ones. Posts don't count, so a new post leaves the records' neighbours alone."""
    sets = tag_sets(nodes)
    df = Counter(t for n, s in zip(nodes, sets) if n['kind'] not in OUTSIDE for t in s)
    pairs = {}
    for a in range(len(nodes)):
        for b in range(a + 1, len(nodes)):
            w = sum(1 / math.log(1.5 + df[t]) for t in sets[a] & sets[b])
            if w > 0:
                pairs[(a, b)] = w
    return pairs


def _spring(pos, force, a, b, rest, k):
    d = [pos[b][i] - pos[a][i] for i in range(3)]
    length = math.sqrt(sum(v * v for v in d)) + 1e-6
    f = k * (length - rest)
    for i in range(3):
        force[a][i] += f * d[i] / length
        force[b][i] -= f * d[i] / length


def _relax(pos, free, springs, pairs, steps):
    n = len(pos)
    vel = [[0.0, 0.0, 0.0] for _ in pos]
    pinned = set(range(n)) - free
    for step in range(steps):
        cool = 1 - step / steps
        force = [[0.0, 0.0, 0.0] for _ in pos]
        for a in range(n):
            pa = pos[a]
            for b in range(a + 1, n):
                if a in pinned and b in pinned:
                    continue
                pb = pos[b]
                dx, dy, dz = pa[0] - pb[0], pa[1] - pb[1], pa[2] - pb[2]
                d2 = dx * dx + dy * dy + dz * dz + .05
                f = 5.5 / d2
                d = math.sqrt(d2)
                for i, v in enumerate((dx, dy, dz)):
                    force[a][i] += f * v / d
                    force[b][i] -= f * v / d
        for a, b in springs:
            _spring(pos, force, a, b, 2.6, .10)
        for (a, b), w in pairs.items():
            _spring(pos, force, a, b, 3.4, .012 * min(w, 2.2))
        for i in free:
            for j in range(3):
                force[i][j] -= pos[i][j] * (.05 if j == 1 else .012)
                vel[i][j] = (vel[i][j] + force[i][j] * .08 * cool) * .82
                pos[i][j] += vel[i][j]


def full_layout(nodes, edges):
    index = {n['id']: i for i, n in enumerate(nodes)}
    rng = random.Random(1909)
    pos = [[rng.uniform(-14, 14) for _ in range(3)] for _ in nodes]
    pos[index[HUB]] = [0.0, 0.0, 0.0]
    springs = [(index[e['source']], index[e['target']]) for e in edges if HUB not in (e['source'], e['target'])]
    _relax(pos, set(range(len(nodes))) - {index[HUB]}, springs, affinity(nodes), 700)
    scale = RADIUS / max(math.hypot(p[0], p[2]) for p in pos)
    out = {}
    for n, p in zip(nodes, pos):
        x, y, z = p[0] * scale, p[1] * scale * .42, p[2] * scale
        r = math.hypot(x, z)
        a = math.atan2(z, x) + r * .085
        out[n['id']] = [round(math.cos(a) * r, 3), round(y, 3), round(math.sin(a) * r, 3)]
    return out


def place_new(nodes, edges, known):
    """New stars start beside whatever they link to or resemble, then settle; the rest stay still."""
    index = {n['id']: i for i, n in enumerate(nodes)}
    pairs = affinity(nodes)
    fresh = [n['id'] for n in nodes if n['id'] not in known]
    springs = [(index[e['source']], index[e['target']]) for e in edges if HUB not in (e['source'], e['target'])]
    pos = [list(known[n['id']]) if n['id'] in known else None for n in nodes]
    for record in fresh:
        i = index[record]
        rng = random.Random(hashlib.sha256(record.encode()).hexdigest())
        friends = [b if a == i else a for a, b in springs if i in (a, b)]
        friends += [b if a == i else a for (a, b) in pairs if i in (a, b)]
        friends = [f for f in friends if pos[f] is not None][:8]
        if friends:
            pos[i] = [sum(pos[f][j] for f in friends) / len(friends) + rng.uniform(-1, 1) for j in range(3)]
        else:
            angle, r = rng.uniform(0, 6.283), rng.uniform(RADIUS * .6, RADIUS)
            pos[i] = [math.cos(angle) * r, rng.uniform(-1, 1), math.sin(angle) * r]
    free = {index[r] for r in fresh}
    near = [(a, b) for a, b in springs if a in free or b in free]
    close = {k: w for k, w in pairs.items() if k[0] in free or k[1] in free}
    _relax(pos, free, near, close, 240)
    out = dict(known)
    for record in fresh:
        p = pos[index[record]]
        # A star with few ties must not drift out of the sky.
        r = math.hypot(p[0], p[2])
        if r > RADIUS:
            rim = RADIUS * random.Random(record).uniform(.8, 1) / r
            p[0], p[2] = p[0] * rim, p[2] * rim
        p[1] = max(-3, min(3, p[1]))
        out[record] = [round(v, 3) for v in p]
    return out


def load():
    return json.loads(DATA.read_text(encoding='utf-8')) if DATA.is_file() else {}


def save(layout):
    with DATA.open('w', encoding='utf-8', newline='\n') as out:
        out.write(json.dumps(dict(sorted(layout.items())), ensure_ascii=False, indent=0) + '\n')


if __name__ == '__main__':
    import sys
    sys.path.insert(0, str(Path(__file__).parent))
    from constellation_data import build_graph
    g = build_graph()
    if '--full' in sys.argv:
        save(full_layout(g['nodes'], g['edges']))
    else:
        save(place_new(g['nodes'], g['edges'], {k: v for k, v in load().items() if k in {n['id'] for n in g['nodes']}}))
    print('Galaxy layout saved')
