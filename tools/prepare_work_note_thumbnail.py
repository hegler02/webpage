"""Optimize an approved, newly generated cover; never invent or generate its content."""
import argparse
import io
import re
from pathlib import Path
from PIL import Image, ImageOps
from public_routes import PROFILE


def prepare(source, slug):
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', slug):
        raise ValueError('Use a descriptive lowercase ASCII slug')
    destination = PROFILE / 'assets/images/work-notes'
    destination.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as original:
        original = ImageOps.exif_transpose(original).convert('RGB')
        if original.width < 1200 or original.height < 675:
            raise ValueError('Source must be at least 1200 x 675; do not upscale')
        for width, height, suffix, limit in [(1200, 675, '', 200 * 1024), (600, 338, '-600', 80 * 1024)]:
            image = ImageOps.fit(original, (width, height), method=Image.Resampling.LANCZOS)
            for quality in range(84, 59, -4):
                encoded = io.BytesIO()
                image.save(encoded, format='WEBP', quality=quality, method=6)
                if encoded.tell() <= limit:
                    break
            else:
                raise ValueError(f'Cannot meet byte budget without excessive loss: {slug}')
            target = destination / f'{slug}{suffix}.webp'
            target.write_bytes(encoded.getvalue())
            print(f'{target.name}: {width}x{height}, {encoded.tell()} bytes, quality {quality}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('slug')
    args = parser.parse_args()
    prepare(args.source, args.slug)
