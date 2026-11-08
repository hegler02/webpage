#!/usr/bin/env python3
"""Keep the home rails current: videos, released music and new Mirinaeverse posts.

Videos come from the artist channel; albums from the topic channel YouTube makes for every
distributed release. Both open on YouTube, free to play. The YouTube feed endpoint has been
unreliable since late 2025, so this reads the channels' list pages. Posts come from the
WordPress API, which also gives the featured image, date, tags and the links a post makes.
The rail shows the newest posts; all of them become stars in the galaxy. When a source answers
with nothing usable for a rail, that rail is kept as it is.

  python3 tools/update_channel.py          fetch and update data/channel.json and covers
  python3 tools/update_channel.py --all     read the channels to the very end, not only their newest page
  python3 tools/update_channel.py --check  covers on disk match the data (release gate)
"""
import html
import io
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROFILE = ROOT / 'pages/profile'
DATA = PROFILE / 'data/channel.json'
COVERS = PROFILE / 'assets/channel'
KEEP = 12  # The rail shows this many; every item stays in the data for the galaxy.
# Long-running series are one star each. A cover is kept for the rail, for a star, and for each series' newest video.
SERIES = [('ghibli', re.compile('ghibli', re.I)), ('palette', re.compile('palette of classics', re.I)), ('lofi', re.compile('lofi|lo-fi|starbucks', re.I))]
INNERTUBE = {'context': {'client': {'clientName': 'WEB', 'clientVersion': '2.20250101.00.00', 'hl': 'ko', 'gl': 'KR'}}}
RAILS = {
    'videos': {'page': 'https://www.youtube.com/channel/UCOtuxTyT2s4UNc-zcOyA6aA/videos', 'home': 'https://www.youtube.com/@themirinaemanproject',
               'type': 'LOCKUP_CONTENT_TYPE_VIDEO', 'size': (480, 270), 'url': 'https://www.youtube.com/watch?v={}'},
    'albums': {'page': 'https://www.youtube.com/channel/UCQdVq0had1QV32_E6b5gXig/releases', 'home': 'https://www.youtube.com/@themirinaemanproject',
               'type': 'LOCKUP_CONTENT_TYPE_ALBUM', 'size': (480, 480), 'url': 'https://www.youtube.com/playlist?list={}'},
    'posts': {'api': f'https://mirinaeverse.com/wp-json/wp/v2/posts?per_page=100&_embed=wp:featuredmedia,wp:term', 'home': 'https://mirinaeverse.com/', 'size': (480, 270)},
}
# A post without a featured image still belongs on the rail.
NO_IMAGE = '/assets/images/og-home.jpg'
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36', 'Accept-Language': 'ko,en;q=0.8'}


def fetch(url):
    # WordPress keeps Korean file names in its image addresses.
    url = urllib.parse.quote(url, safe=":/?&=%#+,;@~!$'()*[]")
    with urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=30) as response:
        return response.read()


def series_of(title):
    return next((name for name, pattern in SERIES if pattern.search(title)), None)


def items(html, content_type, everything=False):
    match = re.search(r'var ytInitialData = (\{.*?\});</script>', html, re.S)
    if not match:
        return []
    found = []
    pending = []

    def walk(node):
        if isinstance(node, dict):
            if isinstance(node.get('continuationCommand'), dict) and node['continuationCommand'].get('token'):
                pending.append(node['continuationCommand']['token'])
            lockup = node.get('lockupViewModel')
            if lockup and lockup.get('contentType') == content_type:
                title = lockup.get('metadata', {}).get('lockupMetadataViewModel', {}).get('title', {}).get('content')
                image = lockup.get('contentImage', {})
                image = image.get('collectionThumbnailViewModel', {}).get('primaryThumbnail', image)
                sources = image.get('thumbnailViewModel', {}).get('image', {}).get('sources', [])
                if lockup.get('contentId') and title:
                    # Album art has no fixed address; videos use the standard thumbnail addresses.
                    found.append({'id': lockup['contentId'], 'title': title, 'images': [max(sources, key=lambda s: s.get('width', 0))['url']] if sources and content_type.endswith('ALBUM') else None})
            for value in node.values():
                walk(value)
        elif isinstance(node, list):
            for value in node:
                walk(value)

    walk(json.loads(match.group(1)))
    # The next pages come from YouTube's own browse request, as the page itself asks for them.
    seen = set()
    while everything and pending and len(seen) < 200:
        token = pending.pop()
        if token in seen:
            continue
        seen.add(token)
        request = urllib.request.Request('https://www.youtube.com/youtubei/v1/browse?prettyPrint=false', data=json.dumps({**INNERTUBE, 'continuation': token}).encode(), headers={**HEADERS, 'Content-Type': 'application/json'})
        with urllib.request.urlopen(request, timeout=30) as response:
            walk(json.load(response))
    unique = {}
    for item in found:
        unique.setdefault(item['id'], item)
    return list(unique.values())


def cover(item, size):
    from PIL import Image
    data = None
    urls = item.get('images') or [f"https://i.ytimg.com/vi/{item['id']}/maxresdefault.jpg", f"https://i.ytimg.com/vi/{item['id']}/hqdefault.jpg"]
    for url in urls:
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
    problems = [f"{name}: missing cover {i['id']}" for name in RAILS for i in data.get(name, {}).get('items', []) if i.get('image') and not (PROFILE / i['image'].lstrip('/')).is_file()]
    if problems:
        print('Channel rails: FAIL', *problems, sep='\n - ')
        return 1
    print('Channel rails: PASS (' + ', '.join(f"{len(data.get(n, {}).get('items', []))} {n}" for n in RAILS) + ')')
    return 0


def excerpt(rendered):
    text = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', rendered))).replace('[…]', '').strip()
    if len(text) <= 150:
        return text
    # Long excerpts run on into the post's first heading; keep whole sentences.
    cut = text.rfind('. ', 0, 150)
    return text[:cut + 1] if cut > 0 else text[:150].rstrip() + '…'


def posts(rail):
    found = []
    page = 1
    while True:
        try:
            batch = json.loads(fetch(f"{rail['api']}&page={page}").decode('utf-8'))
        except urllib.error.HTTPError as error:
            if page > 1 and error.code == 400:  # WordPress answers 400 just past the last page.
                break
            raise
        for post in batch:
            embedded = post.get('_embedded', {})
            media = (embedded.get('wp:featuredmedia') or [{}])[0]
            # The original on the site itself: the resized copies sit on a CDN that refuses some readers.
            best = media.get('source_url')
            terms = [term for group in embedded.get('wp:term', []) for term in group]
            links = re.findall(r'href="https?://(?:www\.)?mirinaeman\.com(/[^"#?]+)', post['content']['rendered'])
            videos = re.findall(r'(?:youtu\.be/|youtube(?:-nocookie)?\.com/(?:watch\?v=|embed/|shorts/))([\w-]{11})', post['content']['rendered'])
            found.append({'id': f"post-{post['id']}", 'title': html.unescape(re.sub(r'<[^>]+>', '', post['title']['rendered'])).strip(), 'url': post['link'], 'date': post['date'][:10], 'images': [best] if best else None,
                          'summary': excerpt(post['excerpt']['rendered']), 'tags': [html.unescape(term['name']) for term in terms if term['taxonomy'] == 'post_tag'], 'links': sorted(set(links)), 'videos': sorted(set(videos))})
        if len(batch) < 100:
            break
        page += 1
    return found


def refresh_posts(name, rail, current):
    try:
        found = posts(rail)
    except Exception as error:  # A blog outage must never empty the rail.
        print(f'{name} unchanged: could not read Mirinaeverse ({error})')
        return current
    if not found:
        print(f'{name} unchanged: Mirinaeverse returned nothing')
        return current
    out = []
    for item in found:
        image = f"/assets/channel/{item['id']}.webp"
        if not (COVERS / f"{item['id']}.webp").is_file():
            try:
                if not item['images']:
                    raise RuntimeError('no featured image')
                cover(item, rail['size'])
            except Exception as error:
                print(f"{name}: default image for {item['title']} ({error})")
                image = NO_IMAGE
        out.append({'id': item['id'], 'title': item['title'], 'url': item['url'], 'date': item['date'], 'image': image, 'summary': item['summary'], 'tags': item['tags'], 'links': item['links'], 'videos': item['videos']})
    print(f'{name}: {len(out)}')
    return {'home': rail['home'], 'items': out}


def refresh(name, rail, current):
    if 'api' in rail:
        return refresh_posts(name, rail, current)
    try:
        found = items(fetch(rail['page']).decode('utf-8', 'replace'), rail['type'], '--all' in sys.argv)
    except Exception as error:  # A YouTube outage must never empty a rail.
        print(f'{name} unchanged: could not read YouTube ({error})')
        return current
    if not found:
        print(f'{name} unchanged: YouTube returned nothing')
        return current
    # Newest first; what has scrolled off the channel's first page stays in the data.
    new = {item['id'] for item in found}
    merged = found + [i for i in current.get('items', []) if i['id'] not in new]
    out = []
    covered = set()
    for index, item in enumerate(merged):
        entry = {'id': item['id'], 'title': item['title'], 'url': rail['url'].format(item['id'])}
        series = series_of(item['title'])
        if series:
            entry['series'] = series
        if index < KEEP or not series or series not in covered:
            covered.add(series)
            if not (COVERS / f"{item['id']}.webp").is_file():
                try:
                    cover(item, rail['size'])
                except Exception as error:
                    print(f"{name}: no cover for {item['title']} ({error})")
                    if index < KEEP:
                        continue
                    out.append(entry)
                    continue
            entry['image'] = f"/assets/channel/{item['id']}.webp"
        out.append(entry)
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
    keep = {i['id'] for rail in data.values() for i in rail['items'] if i.get('image')}
    for path in COVERS.glob('*.webp'):
        if path.stem not in keep:
            path.unlink()
    print('Channel rails updated')
    return 0


if __name__ == '__main__':
    sys.exit(main())
