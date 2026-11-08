#!/usr/bin/env python3
"""Read the albums The Mirinaeman Project releases on YouTube and keep the home rail current.

The YouTube feed endpoint has been unreliable since late 2025, so this reads the channel's release
list page. When YouTube answers with nothing usable, the current rail is kept as it is.

  python3 tools/update_releases.py          fetch and update data/releases.json and covers
  python3 tools/update_releases.py --check  covers on disk match the data (release gate)
"""
import io
import json
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROFILE = ROOT / 'pages/profile'
DATA = PROFILE / 'data/releases.json'
COVERS = PROFILE / 'assets/releases'
# The topic channel YouTube makes for the artist; every distributed album lands here.
CHANNEL = 'UCQdVq0had1QV32_E6b5gXig'
PAGE = f'https://www.youtube.com/channel/{CHANNEL}/releases'
COVER_SIZE = 480
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36', 'Accept-Language': 'ko,en;q=0.8'}


def fetch(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=30) as response:
        return response.read()


def albums(html):
    match = re.search(r'var ytInitialData = (\{.*?\});</script>', html, re.S)
    if not match:
        return []
    found = []

    def walk(node):
        if isinstance(node, dict):
            lockup = node.get('lockupViewModel')
            if lockup and lockup.get('contentType') == 'LOCKUP_CONTENT_TYPE_ALBUM':
                title = lockup.get('metadata', {}).get('lockupMetadataViewModel', {}).get('title', {}).get('content')
                sources = lockup.get('contentImage', {}).get('collectionThumbnailViewModel', {}).get('primaryThumbnail', {}).get('thumbnailViewModel', {}).get('image', {}).get('sources', [])
                if lockup.get('contentId') and title and sources:
                    best = min(sources, key=lambda s: abs(s.get('width', 0) - COVER_SIZE))
                    found.append({'id': lockup['contentId'], 'title': title, 'source': best['url']})
            for value in node.values():
                walk(value)
        elif isinstance(node, list):
            for value in node:
                walk(value)

    walk(json.loads(match.group(1)))
    unique = {}
    for album in found:
        unique.setdefault(album['id'], album)
    return list(unique.values())


def cover(album):
    from PIL import Image
    image = Image.open(io.BytesIO(fetch(album['source']))).convert('RGB')
    side = min(image.size)
    left, top = (image.width - side) // 2, (image.height - side) // 2
    image = image.crop((left, top, left + side, top + side)).resize((COVER_SIZE, COVER_SIZE), Image.LANCZOS)
    path = COVERS / f"{album['id']}.webp"
    image.save(path, 'WEBP', quality=82, method=6)
    return path


def load():
    return json.loads(DATA.read_text(encoding='utf-8')) if DATA.is_file() else {'channel': CHANNEL, 'releases': []}


def save(data):
    with DATA.open('w', encoding='utf-8', newline='\n') as out:
        out.write(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


def check():
    data = load()
    problems = [f"missing cover {r['id']}" for r in data['releases'] if not (PROFILE / r['image'].lstrip('/')).is_file()]
    if problems:
        print('Releases: FAIL', *problems, sep='\n - ')
        return 1
    print(f"Releases: PASS ({len(data['releases'])} albums)")
    return 0


def main():
    if '--check' in sys.argv:
        return check()
    current = load()
    try:
        found = albums(fetch(PAGE).decode('utf-8', 'replace'))
    except Exception as error:  # A YouTube outage must never empty the rail.
        print(f'Releases unchanged: could not read YouTube ({error})')
        return 0
    if not found:
        print('Releases unchanged: YouTube returned no albums')
        return 0
    COVERS.mkdir(parents=True, exist_ok=True)
    known = {r['id']: r for r in current['releases']}
    releases = []
    for album in found:
        path = COVERS / f"{album['id']}.webp"
        if not path.is_file():
            try:
                cover(album)
            except Exception as error:
                print(f"skipped {album['title']}: cover unavailable ({error})")
                continue
        releases.append({'id': album['id'], 'title': album['title'], 'url': f"https://music.youtube.com/playlist?list={album['id']}",
                         'image': f"/assets/releases/{album['id']}.webp"})
    if [r['id'] for r in releases] == [r['id'] for r in current['releases']] and [r['title'] for r in releases] == [r['title'] for r in current['releases']]:
        print(f'Releases unchanged ({len(releases)} albums)')
        return 0
    save({'channel': CHANNEL, 'source': PAGE, 'releases': releases})
    for stale in set(known) - {r['id'] for r in releases}:
        (COVERS / f'{stale}.webp').unlink(missing_ok=True)
    print(f'Releases updated ({len(releases)} albums)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
