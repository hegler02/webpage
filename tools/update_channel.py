#!/usr/bin/env python3
"""Keep the two home rails of The Mirinaeman Project current: videos and released music.

Videos come from the artist channel; albums from the topic channel YouTube makes for every
distributed release. Both open on YouTube, free to play. The YouTube feed endpoint has been
unreliable since late 2025, so this reads the channels' list pages. When YouTube answers with
nothing usable for a rail, that rail is kept as it is.

  python3 tools/update_channel.py          fetch and update data/channel.json and covers
  python3 tools/update_channel.py --check  covers on disk match the data (release gate)
"""
import io
import json
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROFILE = ROOT / 'pages/profile'
DATA = PROFILE / 'data/channel.json'
COVERS = PROFILE / 'assets/channel'
KEEP = 12
RAILS = {
    'videos': {'page': 'https://www.youtube.com/channel/UCOtuxTyT2s4UNc-zcOyA6aA/videos', 'home': 'https://www.youtube.com/@themirinaemanproject/videos',
               'type': 'LOCKUP_CONTENT_TYPE_VIDEO', 'size': (480, 270), 'url': 'https://www.youtube.com/watch?v={}'},
    'albums': {'page': 'https://www.youtube.com/channel/UCQdVq0had1QV32_E6b5gXig/releases', 'home': 'https://www.youtube.com/channel/UCQdVq0had1QV32_E6b5gXig/releases',
               'type': 'LOCKUP_CONTENT_TYPE_ALBUM', 'size': (480, 480), 'url': 'https://www.youtube.com/playlist?list={}'},
}
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36', 'Accept-Language': 'ko,en;q=0.8'}


def fetch(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=30) as response:
        return response.read()


def items(html, content_type):
    match = re.search(r'var ytInitialData = (\{.*?\});</script>', html, re.S)
    if not match:
        return []
    found = []

    def walk(node):
        if isinstance(node, dict):
            lockup = node.get('lockupViewModel')
            if lockup and lockup.get('contentType') == content_type:
                title = lockup.get('metadata', {}).get('lockupMetadataViewModel', {}).get('title', {}).get('content')
                image = lockup.get('contentImage', {})
                image = image.get('collectionThumbnailViewModel', {}).get('primaryThumbnail', image)
                sources = image.get('thumbnailViewModel', {}).get('image', {}).get('sources', [])
                if lockup.get('contentId') and title:
                    found.append({'id': lockup['contentId'], 'title': title, 'source': max(sources, key=lambda s: s.get('width', 0))['url'] if sources else None})
            for value in node.values():
                walk(value)
        elif isinstance(node, list):
            for value in node:
                walk(value)

    walk(json.loads(match.group(1)))
    unique = {}
    for item in found:
        unique.setdefault(item['id'], item)
    return list(unique.values())[:KEEP]


def cover(item, size):
    from PIL import Image
    data = None
    for url in [f"https://i.ytimg.com/vi/{item['id']}/maxresdefault.jpg", f"https://i.ytimg.com/vi/{item['id']}/hqdefault.jpg"] if size[0] != size[1] else [item['source']]:
        try:
            data = fetch(url)
            break
        except Exception:
            continue
    if data is None:
        raise RuntimeError('no image')
    image = Image.open(io.BytesIO(data)).convert('RGB')
    # Fit the rail's shape from the middle; old video thumbnails carry letterbox bars.
    width, height = image.size
    ratio = size[0] / size[1]
    if width / height > ratio:
        cut = round(height * ratio)
        image = image.crop(((width - cut) // 2, 0, (width + cut) // 2, height))
    else:
        cut = round(width / ratio)
        image = image.crop((0, (height - cut) // 2, width, (height + cut) // 2))
    image.resize(size, Image.LANCZOS).save(COVERS / f"{item['id']}.webp", 'WEBP', quality=80, method=6)


def load():
    return json.loads(DATA.read_text(encoding='utf-8')) if DATA.is_file() else {name: {'home': rail['home'], 'items': []} for name, rail in RAILS.items()}


def save(data):
    with DATA.open('w', encoding='utf-8', newline='\n') as out:
        out.write(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


def check():
    data = load()
    problems = [f"{name}: missing cover {i['id']}" for name in RAILS for i in data.get(name, {}).get('items', []) if not (PROFILE / i['image'].lstrip('/')).is_file()]
    if problems:
        print('Channel rails: FAIL', *problems, sep='\n - ')
        return 1
    print('Channel rails: PASS (' + ', '.join(f"{len(data.get(n, {}).get('items', []))} {n}" for n in RAILS) + ')')
    return 0


def refresh(name, rail, current):
    try:
        found = items(fetch(rail['page']).decode('utf-8', 'replace'), rail['type'])
    except Exception as error:  # A YouTube outage must never empty a rail.
        print(f'{name} unchanged: could not read YouTube ({error})')
        return current
    if not found:
        print(f'{name} unchanged: YouTube returned nothing')
        return current
    out = []
    for item in found:
        if not (COVERS / f"{item['id']}.webp").is_file():
            try:
                cover(item, rail['size'])
            except Exception as error:
                print(f"{name}: skipped {item['title']} ({error})")
                continue
        out.append({'id': item['id'], 'title': item['title'], 'url': rail['url'].format(item['id']), 'image': f"/assets/channel/{item['id']}.webp"})
    print(f'{name}: {len(out)}')
    return {'home': rail['home'], 'items': out}


def main():
    if '--check' in sys.argv:
        return check()
    COVERS.mkdir(parents=True, exist_ok=True)
    current = load()
    data = {name: refresh(name, rail, current.get(name, {'home': rail['home'], 'items': []})) for name, rail in RAILS.items()}
    if data == current:
        print('Channel rails unchanged')
        return 0
    save(data)
    keep = {i['id'] for rail in data.values() for i in rail['items']}
    for path in COVERS.glob('*.webp'):
        if path.stem not in keep:
            path.unlink()
    print('Channel rails updated')
    return 0


if __name__ == '__main__':
    sys.exit(main())
