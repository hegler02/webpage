#!/usr/bin/env python3
"""Keeps every public record connected to the galaxy. Procedure for people and AIs: docs/CONNECTING_RECORDS.md

  python3 tools/constellation_links.py todo                 records still waiting, with what to read
  python3 tools/constellation_links.py list                 constellations and how many records each holds
  python3 tools/constellation_links.py review               what is waiting for the creator's approval
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
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'pages/profile/data/constellation-links.json'
CATALOG = ROOT / 'pages/profile/data/message-bodies.json'
RECORDS = ROOT / 'pages/profile/data/records.json'
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


def problems(links, catalog=None, records=None):
    catalog = catalog or json.loads(CATALOG.read_text(encoding='utf-8'))
    records = records if records is not None else load_records()
    graph, connected = recorded_context_for(catalog, records)
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
    waiting = waiting_records(links, catalog, connected, records)
    if waiting:
        found.append('아직 연결을 정하지 않은 기록이 있습니다: ' + ', '.join(waiting))
    return found


def load_records():
    return json.loads(RECORDS.read_text(encoding='utf-8'))


def recorded_context_for(catalog, records):
    from constellation_data import build_graph
    hub = 'creator:joonho'
    graph = build_graph(catalog, links={'constellations': [], 'pairs': [], 'solo': []}, records=records)
    connected = set()
    for e in graph['edges']:
        # A title topic, a post's link or a channel's song is automatic and is not a decision about this record.
        if hub not in (e['source'], e['target']) and not e['target'].startswith('topic:') and e['label'] not in ('글에서 소개', '채널의 곡'):
            connected |= {e['source'], e['target']}
    return graph, connected


def waiting_records(links, catalog, connected, records=None):
    done = placed(links) | connected
    records = records if records is not None else load_records()
    works = [b['body_id'] for b in catalog['bodies'] if b['status'] in PUBLIC and 'work:' + b['body_id'] not in done]
    return works + [r['id'] for r in records['records'] if r['id'] not in done]


def unplaced_posts(links):
    from constellation_data import read_posts
    done = placed(links)
    # A link the post makes is already a connection, and the two older essays already have theirs.
    graph, _ = recorded_context_for(json.loads(CATALOG.read_text(encoding='utf-8')), load_records())
    joined = {e['source'] for e in graph['edges'] if e['label'] == '글에서 소개'} | {e['target'] for e in graph['edges'] if e['target'].startswith('essay:')}
    urls = {unquote(n['url']) for n in graph['nodes'] if n['id'] in joined}
    return [p for p in read_posts() if 'post:' + p['id'].removeprefix('post-') not in done | joined and unquote(p['url']) not in urls]


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
    sub.add_parser('review')
    add = sub.add_parser('add')
    add.add_argument('id')
    add.add_argument('--to', required=True)
    add.add_argument('--reason', required=True)
    add.add_argument('--key', action='store_true', help='창작자가 중요한 자료라고 한 기록')
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
        records = load_records()
        _, connected = recorded_context_for(catalog, records)
        by_id = {b['body_id']: b for b in catalog['bodies']}
        by_id.update({r['id']: r for r in records['records']})
        waiting = waiting_records(links, catalog, connected, records)
        print(f'연결을 정할 기록 {len(waiting)}개')
        for name in waiting:
            b = by_id[name]
            print(f"\n{name}\n  제목: {b['title']}\n  소개: {b.get('message_sentence', b.get('summary'))}\n  태그: {', '.join(b.get('tags', []))}\n  주소: {b.get('canonical_url', b.get('url', ''))}")
        posts = unplaced_posts(links)
        if posts:
            print(f'\nMIRINAEVERSE 글 중 아직 제안이 없는 글 {len(posts)}개 (배포를 막지 않습니다)')
            for p in posts:
                print(f"  post:{p['id'].removeprefix('post-')}  {p['title']}\n    {p['summary']}")
        return 0
    if args.command == 'review':
        for c in links['constellations']:
            waiting = [m for m in c['members'] if m.get('status') == 'proposed'] if c['status'] == 'approved' else c['members']
            if waiting:
                print(f"\n별자리 {c['id']} ({c['title']}): {c['text']}" + ('' if c['status'] == 'approved' else ' [새 별자리]'))
                for m in waiting:
                    print(f"  + {m['id']}: {m['reason']}")
        for p in links['pairs']:
            if p.get('status') == 'proposed':
                print(f"\n연결 {p['a']} - {p['b']} [{p['label']}]: {p['reason']}")
        return 0
    if args.command == 'list':
        for c in links['constellations']:
            print(f"{c['id']:<14} {c['status']:<9} {len(c['members']):>2}개  {c['title']} — {c['text']}")
        print(f"연결 {len(links['pairs'])}개 / 혼자 두는 기록 {len(links['solo'])}개")
        return 0
    if args.command == 'add':
        c = find(links, args.to)
        member = {'id': args.id, 'reason': args.reason, 'status': 'proposed'}
        if args.key:
            member['key'] = True
        c['members'].append(member)
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
                    for m in c['members']:
                        m.pop('status', None)
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
