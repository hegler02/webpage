#!/usr/bin/env python3
"""Keeps every public record connected to the galaxy. Procedure for people and AIs: docs/CONNECTING_RECORDS.md

  python3 tools/constellation_links.py todo                 records still waiting, with what to read
  python3 tools/constellation_links.py list                 constellations and how many records each holds
  python3 tools/constellation_links.py add ID --to NAME --reason "..."
  python3 tools/constellation_links.py new NAME --title "..." --text "..."
  python3 tools/constellation_links.py pair A B --label "..." --reason "..."
  python3 tools/constellation_links.py solo ID --why "..."
  python3 tools/constellation_links.py approve NAME ...     only after the creator said so
  python3 tools/constellation_links.py --check              release gate
"""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'pages/profile/data/constellation-links.json'
CATALOG = ROOT / 'pages/profile/data/message-bodies.json'
STATUSES = ('proposed', 'approved')
PUBLIC = ('DEPLOYED', 'GOLDEN')
MAX_REASON = 90
sys.path.insert(0, str(Path(__file__).parent))


def load():
    return json.loads(DATA.read_text(encoding='utf-8'))


def save(links):
    links['constellations'].sort(key=lambda c: c['id'])
    with DATA.open('w', encoding='utf-8', newline='\n') as out:
        out.write(json.dumps(links, ensure_ascii=False, indent=2) + '\n')


def full(record):
    return record if ':' in record else 'work:' + record


def placed(links):
    """Every record someone has already decided about, approved or not."""
    done = {full(s['id']) for s in links['solo']}
    for c in links['constellations']:
        done |= {full(m['id']) for m in c['members']}
    for p in links['pairs']:
        done |= {full(p['a']), full(p['b'])}
    return done


def problems(links, catalog=None):
    catalog = catalog or json.loads(CATALOG.read_text(encoding='utf-8'))
    graph, connected = recorded_context_for(catalog)
    known = {n['id'] for n in graph['nodes']}
    found = []
    names = [c['id'] for c in links['constellations']]
    if len(names) != len(set(names)):
        found.append('별자리 id가 중복됩니다.')

    def reason_ok(where, text):
        if not str(text).strip():
            found.append(f'{where}: 이유가 비어 있습니다.')
        elif len(text) > MAX_REASON:
            found.append(f'{where}: 이유는 {MAX_REASON}자 안으로 쓰세요.')

    for c in links['constellations']:
        if c.get('status') not in STATUSES:
            found.append(f"별자리 {c['id']}: status는 proposed 또는 approved입니다.")
        if not c.get('title', '').strip() or not c.get('text', '').strip():
            found.append(f"별자리 {c['id']}: 이름과 설명이 필요합니다.")
        members = [m['id'] for m in c['members']]
        if len(members) != len(set(members)):
            found.append(f"별자리 {c['id']}: 같은 기록이 두 번 들어 있습니다.")
        if len(members) < 2:
            found.append(f"별자리 {c['id']}: 기록이 2개 이상이어야 별자리입니다.")
        for m in c['members']:
            if full(m['id']) not in known:
                found.append(f"별자리 {c['id']}: 없는 기록 {m['id']}")
            reason_ok(f"{c['id']}/{m['id']}", m.get('reason', ''))
    seen = set()
    for p in links['pairs']:
        key = frozenset((p['a'], p['b']))
        if key in seen:
            found.append(f"연결 {p['a']} - {p['b']}: 중복입니다.")
        seen.add(key)
        if p.get('status') not in STATUSES:
            found.append(f"연결 {p['a']} - {p['b']}: status는 proposed 또는 approved입니다.")
        for side in (p['a'], p['b']):
            if full(side) not in known:
                found.append(f'연결: 없는 기록 {side}')
        if not p.get('label', '').strip():
            found.append(f"연결 {p['a']} - {p['b']}: 이름이 필요합니다.")
        reason_ok(f"{p['a']}-{p['b']}", p.get('reason', ''))
    for s in links['solo']:
        if full(s['id']) not in known:
            found.append(f"solo: 없는 기록 {s['id']}")
        if not s.get('why', '').strip():
            found.append(f"solo {s['id']}: 혼자 두는 이유가 필요합니다.")
    waiting = waiting_records(links, catalog, connected)
    if waiting:
        found.append('아직 연결을 정하지 않은 기록이 있습니다: ' + ', '.join(waiting))
    return found


def recorded_context_for(catalog):
    from constellation_data import build_graph
    hub = 'creator:joonho'
    graph = build_graph(catalog, links={'constellations': [], 'pairs': [], 'solo': []})
    connected = set()
    for e in graph['edges']:
        if hub not in (e['source'], e['target']):
            connected |= {e['source'], e['target']}
    return graph, connected


def waiting_records(links, catalog, connected):
    done = placed(links) | connected
    return [b['body_id'] for b in catalog['bodies'] if b['status'] in PUBLIC and 'work:' + b['body_id'] not in done]


def find(links, name):
    for c in links['constellations']:
        if c['id'] == name:
            return c
    sys.exit(f'없는 별자리입니다: {name}. list로 이름을 확인하세요.')


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--check', action='store_true')
    sub = parser.add_subparsers(dest='command')
    sub.add_parser('todo')
    sub.add_parser('list')
    add = sub.add_parser('add')
    add.add_argument('id')
    add.add_argument('--to', required=True)
    add.add_argument('--reason', required=True)
    new = sub.add_parser('new')
    new.add_argument('id')
    new.add_argument('--title', required=True)
    new.add_argument('--text', required=True)
    pair = sub.add_parser('pair')
    pair.add_argument('a')
    pair.add_argument('b')
    pair.add_argument('--label', required=True)
    pair.add_argument('--reason', required=True)
    solo = sub.add_parser('solo')
    solo.add_argument('id')
    solo.add_argument('--why', required=True)
    approve = sub.add_parser('approve')
    approve.add_argument('names', nargs='+')
    args = parser.parse_args()
    links = load()

    if args.check:
        found = problems(links)
        if found:
            print('Constellation links: FAIL')
            for line in found:
                print(' -', line)
            print('고치는 법: docs/CONNECTING_RECORDS.md')
            return 1
        print('Constellation links: PASS')
        return 0
    if args.command == 'todo':
        catalog = json.loads(CATALOG.read_text(encoding='utf-8'))
        _, connected = recorded_context_for(catalog)
        by_id = {b['body_id']: b for b in catalog['bodies']}
        waiting = waiting_records(links, catalog, connected)
        print(f'연결을 정할 기록 {len(waiting)}개')
        for body in waiting:
            b = by_id[body]
            print(f"\n{body}\n  제목: {b['title']}\n  소개: {b['message_sentence']}\n  태그: {', '.join(b.get('tags', []))}\n  주소: {b['canonical_url']}")
        return 0
    if args.command == 'list':
        for c in links['constellations']:
            print(f"{c['id']:<14} {c['status']:<9} {len(c['members']):>2}개  {c['title']} — {c['text']}")
        print(f"연결 {len(links['pairs'])}개 / 혼자 두는 기록 {len(links['solo'])}개")
        return 0
    if args.command == 'add':
        c = find(links, args.to)
        c['members'].append({'id': args.id, 'reason': args.reason})
    elif args.command == 'new':
        links['constellations'].append({'id': args.id, 'title': args.title, 'text': args.text, 'status': 'proposed', 'members': []})
    elif args.command == 'pair':
        links['pairs'].append({'a': args.a, 'b': args.b, 'label': args.label, 'reason': args.reason, 'status': 'proposed'})
    elif args.command == 'solo':
        links['solo'].append({'id': args.id, 'why': args.why})
    elif args.command == 'approve':
        for name in args.names:
            matched = False
            for c in links['constellations']:
                if c['id'] == name:
                    c['status'] = 'approved'
                    matched = True
            if not matched:
                sys.exit(f'없는 별자리입니다: {name}')
    else:
        parser.print_help()
        return 0
    save(links)
    print('저장했습니다. 끝나면 render_archive.py와 release_gate.py를 실행하세요.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
