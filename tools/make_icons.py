#!/usr/bin/env python3
"""Site icon: a gold star in the night sky with a thread of the galaxy. One geometry for SVG, ICO and PNG."""
import math
from pathlib import Path

from PIL import Image, ImageDraw

PROFILE = Path(__file__).resolve().parents[1] / 'pages/profile'
SKY, STAR, THREAD = '#070a12', '#ffd27a', '#8fb0ff'
# Galaxy thread: small dots on an arc behind the star, in a 64-unit box.
DOTS = [(12, 44, 1.6), (17, 39, 2.0), (23, 35, 1.6), (44, 26, 1.6), (50, 21, 2.0), (55, 16, 1.4)]


def star_points(cx, cy, outer, inner, n=4, turn=-math.pi / 2):
    pts = []
    for i in range(n * 2):
        r = outer if i % 2 == 0 else inner
        a = turn + i * math.pi / n
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def svg():
    star = ' '.join(f'{x:.2f},{y:.2f}' for x, y in star_points(32, 32, 22, 6.5))
    dots = ''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{THREAD}"/>' for x, y, r in DOTS)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">'
            f'<rect width="64" height="64" rx="14" fill="{SKY}"/>{dots}'
            f'<polygon points="{star}" fill="{STAR}"/><circle cx="32" cy="32" r="3.2" fill="#fff6dd"/></svg>\n')


def raster(size, dots=True):
    scale = 16
    big = size * scale
    k = big / 64
    im = Image.new('RGBA', (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, big - 1, big - 1), radius=14 * k, fill=SKY)
    if dots:
        for x, y, r in DOTS:
            d.ellipse(((x - r) * k, (y - r) * k, (x + r) * k, (y + r) * k), fill=THREAD)
    d.polygon([(x * k, y * k) for x, y in star_points(32, 32, 22, 6.5)], fill=STAR)
    d.ellipse(((32 - 3.2) * k, (32 - 3.2) * k, (32 + 3.2) * k, (32 + 3.2) * k), fill='#fff6dd')
    return im.resize((size, size), Image.LANCZOS)


def main():
    (PROFILE / 'favicon.svg').write_text(svg(), encoding='utf-8')
    # At 16 pixels the thread turns to noise, so the smallest icon is the star alone.
    sizes = [raster(16, dots=False), raster(32), raster(48)]
    sizes[2].save(PROFILE / 'favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)], append_images=sizes[:2])
    touch = raster(180).convert('RGB')
    touch.save(PROFILE / 'apple-touch-icon.png', optimize=True)
    raster(512).save(PROFILE / 'icon-512.png', optimize=True)
    print('icons written')


if __name__ == '__main__':
    main()
