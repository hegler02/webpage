"""Publishing contract for editorial covers, independent of artwork archive images."""
import copy
import json
import re
from public_routes import PROFILE, manifest

IMAGE_PATH = re.compile(r'^/assets/images/work-notes/[a-z0-9-]+\.(webp|jpg|jpeg)$')


def dimensions(path):
    # Pillow is already a pinned build dependency for this repository's media pipeline.
    from PIL import Image
    with Image.open(path) as image:
        image.verify()
    with Image.open(path) as image:
        return image.size


def validate(entries, pages, root=PROFILE):
    if set(entries) != set(pages):
        raise ValueError('Work-note thumbnail coverage must match editorial_pages exactly')
    seen = set()
    for page, entry in entries.items():
        if not entry.get('alt', '').strip() or entry.get('kind') != 'ai-generated-editorial-cover':
            raise ValueError(f'Missing descriptive alt or generation disclosure: {page}')
        for key, size, budget in [('image', (1200, 675), 200 * 1024), ('small', (600, 338), 80 * 1024)]:
            url = entry.get(key, '')
            if not IMAGE_PATH.fullmatch(url) or url in seen:
                raise ValueError(f'Invalid or reused work-note cover: {page} {key}')
            seen.add(url)
            file = root / url.lstrip('/')
            if not file.is_file() or file.stat().st_size > budget:
                raise ValueError(f'Missing or oversized work-note cover: {url}')
            if dimensions(file) != size:
                raise ValueError(f'Incorrect dimensions: {url}')
    return entries


def load():
    data = json.loads((PROFILE / 'data/work-note-thumbnails.json').read_text(encoding='utf-8'))
    return validate(data['entries'], manifest()['editorial_pages'])


def self_test():
    entries = load()
    cases = []
    missing = copy.deepcopy(entries)
    del missing[next(iter(missing))]
    cases.append(missing)
    no_alt = copy.deepcopy(entries)
    no_alt[next(iter(no_alt))]['alt'] = ' '
    cases.append(no_alt)
    no_file = copy.deepcopy(entries)
    no_file[next(iter(no_file))]['image'] = '/assets/images/work-notes/missing-canary.webp'
    cases.append(no_file)
    wrong_size = copy.deepcopy(entries)
    key = next(iter(wrong_size))
    wrong_size[key]['image'], wrong_size[key]['small'] = wrong_size[key]['small'], wrong_size[key]['image']
    cases.append(wrong_size)
    for case in cases:
        try:
            validate(case, manifest()['editorial_pages'])
        except ValueError:
            continue
        raise AssertionError('Negative thumbnail canary unexpectedly passed')
    print(f'Work-note thumbnails: {len(entries)} covers verified; {len(cases)} negative canaries blocked')


if __name__ == '__main__':
    self_test()
