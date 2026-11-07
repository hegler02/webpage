#!/usr/bin/env python3
"""Records that are not catalog works: papers, books, projects, patents, films, products.

Each record gets one address and one star from this single file. Procedure: docs/CONNECTING_RECORDS.md

  python3 tools/records.py list
  python3 tools/records.py add paper my-slug --title "..." --summary "..." --year 2027 --url "https://..." --tags a,b
"""
import argparse
import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROFILE = ROOT / 'pages/profile'
DATA = PROFILE / 'data/records.json'
ID = re.compile(r'^(paper|book|project|patent|film|collection|product):[a-z0-9][a-z0-9-]*$')
# kind: (menu that owns it, Korean, English, label of the outward link)
KINDS = {
    'paper': ('research', '논문', 'Paper', ('서지 보기', 'View record')),
    'book': ('research', '책', 'Book', ('책 보기', 'View book')),
    'project': ('research', '연구 과제', 'Project', None),
    'patent': ('research', '특허', 'Patent', None),
    'film': ('work', '뮤직비디오 연출', 'Music video', ('영상 보기', 'Watch')),
    'collection': ('work', '프로젝트', 'Project', ('보러 가기', 'Open')),
    'product': ('work', '제품', 'Product', ('서비스 열기', 'Open service')),
}


def load():
    return json.loads(DATA.read_text(encoding='utf-8'))


def save(data):
    with DATA.open('w', encoding='utf-8', newline='\n') as out:
        out.write(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


def slug(record_id):
    return record_id.split(':', 1)[1]


def problems(data, body_ids=()):
    found = []
    seen = set(body_ids)
    for r in data['records']:
        where = r.get('id', '?')
        if not ID.fullmatch(str(r.get('id', ''))):
            found.append(f'{where}: id는 종류:영문이름 형식입니다.')
            continue
        if r['id'].split(':')[0] != r.get('kind'):
            found.append(f'{where}: id와 kind가 다릅니다.')
        if slug(r['id']) in seen:
            found.append(f'{where}: 같은 주소를 쓰는 기록이 있습니다.')
        seen.add(slug(r['id']))
        for field in ('title', 'summary', 'added'):
            if not str(r.get(field, '')).strip():
                found.append(f'{where}: {field}가 필요합니다.')
        if r.get('url') and not re.match(r'^https?://', r['url']):
            found.append(f'{where}: url은 http로 시작해야 합니다.')
        if r.get('kind') == 'paper' and r.get('group') not in ('thesis', 'article'):
            found.append(f'{where}: 논문 group은 thesis 또는 article입니다.')
        image = r.get('image')
        if image:
            if not str(image.get('alt', '')).strip():
                found.append(f'{where}: 이미지 설명(alt)이 필요합니다.')
            if not (PROFILE / image.get('path', '')).is_file():
                found.append(f"{where}: 이미지가 없습니다 {image.get('path')}")
        if not r.get('tags'):
            found.append(f'{where}: 태그가 필요합니다. 태그는 비슷한 기록을 곁에 놓습니다.')
    return found


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest='command', required=True)
    sub.add_parser('list')
    add = sub.add_parser('add')
    add.add_argument('kind', choices=KINDS)
    add.add_argument('slug')
    add.add_argument('--title', required=True)
    add.add_argument('--summary', required=True)
    add.add_argument('--tags', required=True, help='쉼표로 구분')
    add.add_argument('--year', default='')
    add.add_argument('--url', default='')
    add.add_argument('--group', choices=('thesis', 'article'), help='논문일 때')
    add.add_argument('--label', default='')
    add.add_argument('--image', help='pages/profile 아래 이미지 경로')
    add.add_argument('--alt', default='')
    args = parser.parse_args()
    data = load()
    if args.command == 'list':
        for r in data['records']:
            print(f"{r['id']:<44} {r.get('year', ''):<6} {r['title']}")
        return 0
    record = {'id': f'{args.kind}:{args.slug}', 'kind': args.kind, 'title': args.title, 'summary': args.summary, 'year': args.year, 'url': args.url, 'added': date.today().isoformat(), 'tags': [t.strip() for t in args.tags.split(',') if t.strip()]}
    if args.kind == 'paper':
        record['group'] = args.group or 'article'
    if args.label:
        record['label'] = args.label
    if args.image:
        record['image'] = {'path': args.image, 'alt': args.alt}
    data['records'].append(record)
    found = problems(data)
    if found:
        sys.exit('\n'.join(found))
    save(data)
    print(f"추가했습니다: {record['id']}. 이제 python3 tools/render_archive.py 와 python3 tools/constellation_links.py todo 를 차례로 실행하세요.")
    return 0


if __name__ == '__main__':
    sys.exit(main())
