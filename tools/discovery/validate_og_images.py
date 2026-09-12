#!/usr/bin/env python3
"""Validate local Open Graph images and their pre-production HTTP delivery."""

from __future__ import annotations

import argparse
import binascii
import hashlib
import io
import json
import posixpath
import struct
import sys
import zlib
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urljoin, urlparse
from urllib.request import Request, urlopen


MAX_IMAGE_BYTES = 20 * 1024 * 1024
DEFAULT_MIN_WIDTH = 1200
DEFAULT_MIN_HEIGHT = 630
DEFAULT_RATIO = 1200 / 630
DEFAULT_RATIO_TOLERANCE = 0.01
MIME_BY_FORMAT = {"png": "image/png", "jpeg": "image/jpeg", "webp": "image/webp"}
SUFFIXES_BY_FORMAT = {"png": {".png"}, "jpeg": {".jpg", ".jpeg"}, "webp": {".webp"}}


class ImageValidationError(ValueError):
    pass


@dataclass(frozen=True)
class OGRecord:
    html_path: Path
    local_path: Path
    public_relative_path: str
    image_url: str
    image_type: str
    width: int
    height: int
    alt: str


class MetadataParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.meta: dict[str, str] = {}
        self.canonical = ""

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key.lower(): (value or "").strip() for key, value in attrs}
        if tag.lower() == "meta":
            key = (values.get("property") or values.get("name") or "").lower()
            if key and key not in self.meta:
                self.meta[key] = values.get("content", "")
        elif tag.lower() == "link" and "canonical" in values.get("rel", "").lower().split():
            self.canonical = values.get("href", "")


def file_hash(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def png_dimensions(data: bytes) -> tuple[int, int]:
    if not data.startswith(b"\x89PNG\r\n\x1a\n"):
        raise ImageValidationError("PNG signature mismatch")
    offset = 8
    dimensions: tuple[int, int] | None = None
    compressed = bytearray()
    saw_end = False
    while offset < len(data):
        if offset + 12 > len(data):
            raise ImageValidationError("PNG chunk header is truncated")
        size = struct.unpack(">I", data[offset : offset + 4])[0]
        chunk_type = data[offset + 4 : offset + 8]
        chunk_end = offset + 12 + size
        if chunk_end > len(data):
            raise ImageValidationError("PNG chunk payload is truncated")
        payload = data[offset + 8 : offset + 8 + size]
        expected_crc = struct.unpack(">I", data[offset + 8 + size : chunk_end])[0]
        actual_crc = binascii.crc32(chunk_type + payload) & 0xFFFFFFFF
        if actual_crc != expected_crc:
            raise ImageValidationError(f"PNG {chunk_type.decode('ascii', 'replace')} CRC mismatch")
        if chunk_type == b"IHDR":
            if size != 13 or dimensions is not None:
                raise ImageValidationError("PNG IHDR is invalid")
            width, height = struct.unpack(">II", payload[:8])
            if not width or not height:
                raise ImageValidationError("PNG dimensions must be positive")
            dimensions = (width, height)
        elif chunk_type == b"IDAT":
            compressed.extend(payload)
        elif chunk_type == b"IEND":
            if size:
                raise ImageValidationError("PNG IEND must be empty")
            saw_end = True
            offset = chunk_end
            break
        offset = chunk_end
    if dimensions is None or not compressed or not saw_end or offset != len(data):
        raise ImageValidationError("PNG structure is incomplete or has trailing bytes")
    try:
        decoded = zlib.decompress(bytes(compressed))
    except zlib.error as exc:
        raise ImageValidationError(f"PNG pixel stream cannot be decoded: {exc}") from exc
    if not decoded:
        raise ImageValidationError("PNG pixel stream is empty")
    return dimensions


def jpeg_dimensions(data: bytes) -> tuple[int, int]:
    if not data.startswith(b"\xff\xd8") or not data.endswith(b"\xff\xd9"):
        raise ImageValidationError("JPEG start/end markers are incomplete")
    offset = 2
    dimensions: tuple[int, int] | None = None
    sof_markers = set(range(0xC0, 0xD4)) - {0xC4, 0xC8, 0xCC}
    while offset < len(data) - 1:
        if data[offset] != 0xFF:
            offset += 1
            continue
        while offset < len(data) and data[offset] == 0xFF:
            offset += 1
        if offset >= len(data):
            break
        marker = data[offset]
        offset += 1
        if marker in {0x00, 0x01} or 0xD0 <= marker <= 0xD9:
            if marker == 0xD9:
                break
            continue
        if offset + 2 > len(data):
            raise ImageValidationError("JPEG segment length is truncated")
        size = struct.unpack(">H", data[offset : offset + 2])[0]
        if size < 2 or offset + size > len(data):
            raise ImageValidationError("JPEG segment payload is truncated")
        if marker in sof_markers:
            if size < 7:
                raise ImageValidationError("JPEG frame header is invalid")
            height, width = struct.unpack(">HH", data[offset + 3 : offset + 7])
            if not width or not height:
                raise ImageValidationError("JPEG dimensions must be positive")
            dimensions = (width, height)
        if marker == 0xDA:
            break
        offset += size
    if dimensions is None:
        raise ImageValidationError("JPEG frame dimensions are missing")
    return dimensions


def webp_dimensions(data: bytes) -> tuple[int, int]:
    if len(data) < 20 or data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        raise ImageValidationError("WebP signature mismatch")
    declared_size = int.from_bytes(data[4:8], "little") + 8
    if declared_size != len(data):
        raise ImageValidationError("WebP RIFF size does not match file length")
    offset = 12
    dimensions: tuple[int, int] | None = None
    while offset < len(data):
        if offset + 8 > len(data):
            raise ImageValidationError("WebP chunk header is truncated")
        kind = data[offset : offset + 4]
        size = int.from_bytes(data[offset + 4 : offset + 8], "little")
        payload_start = offset + 8
        payload_end = payload_start + size
        padded_end = payload_end + (size % 2)
        if padded_end > len(data):
            raise ImageValidationError("WebP chunk payload is truncated")
        payload = data[payload_start:payload_end]
        if kind == b"VP8X" and len(payload) >= 10:
            dimensions = (
                1 + int.from_bytes(payload[4:7], "little"),
                1 + int.from_bytes(payload[7:10], "little"),
            )
        elif kind == b"VP8 " and len(payload) >= 10 and payload[3:6] == b"\x9d\x01\x2a":
            dimensions = (
                int.from_bytes(payload[6:8], "little") & 0x3FFF,
                int.from_bytes(payload[8:10], "little") & 0x3FFF,
            )
        elif kind == b"VP8L" and len(payload) >= 5 and payload[0] == 0x2F:
            bits = int.from_bytes(payload[1:5], "little")
            dimensions = ((bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1)
        offset = padded_end
    if offset != len(data) or dimensions is None or not all(dimensions):
        raise ImageValidationError("WebP structure or dimensions are invalid")
    return dimensions


def inspect_image_bytes(data: bytes, suffix: str = "") -> tuple[str, int, int]:
    if not data:
        raise ImageValidationError("image file is empty")
    if len(data) > MAX_IMAGE_BYTES:
        raise ImageValidationError(f"image exceeds {MAX_IMAGE_BYTES} bytes")
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        image_format = "png"
        width, height = png_dimensions(data)
    elif data.startswith(b"\xff\xd8"):
        image_format = "jpeg"
        width, height = jpeg_dimensions(data)
    elif data.startswith(b"RIFF") and data[8:12] == b"WEBP":
        image_format = "webp"
        width, height = webp_dimensions(data)
    else:
        raise ImageValidationError("OG images must be decodable PNG, JPEG, or WebP files")
    if suffix and suffix.lower() not in SUFFIXES_BY_FORMAT[image_format]:
        raise ImageValidationError(f"{image_format} bytes do not match the {suffix} extension")
    try:
        from PIL import Image
        with Image.open(io.BytesIO(data)) as decoded:
            decoded.verify()
        with Image.open(io.BytesIO(data)) as decoded:
            decoded.load()
            if decoded.size != (width, height):
                raise ImageValidationError("decoded dimensions differ from structural headers")
    except ImportError as exc:
        raise ImageValidationError("Pillow is required for full image decoding") from exc
    except Exception as exc:
        raise ImageValidationError(f"complete image decode failed: {exc}") from exc
    return image_format, width, height


def validate_dimensions(
    width: int,
    height: int,
    *,
    min_width: int = DEFAULT_MIN_WIDTH,
    min_height: int = DEFAULT_MIN_HEIGHT,
    ratio: float = DEFAULT_RATIO,
    tolerance: float = DEFAULT_RATIO_TOLERANCE,
) -> list[str]:
    errors: list[str] = []
    if width < min_width or height < min_height:
        errors.append(f"OG dimensions are {width}x{height}; minimum is {min_width}x{min_height}")
    actual_ratio = width / height if height else 0
    if not ratio or abs(actual_ratio - ratio) / ratio > tolerance:
        errors.append(
            f"OG ratio is {actual_ratio:.4f}; expected {ratio:.4f} within {tolerance * 100:.1f}%"
        )
    return errors


def parse_metadata(html: str) -> MetadataParser:
    parser = MetadataParser()
    parser.feed(html)
    return parser


def resolve_og_path(root: Path, canonical: str, image_url: str) -> tuple[Path | None, str, list[str]]:
    errors: list[str] = []
    canonical_url = urlparse(canonical)
    parsed_image = urlparse(image_url)
    if parsed_image.scheme != "https" or not parsed_image.netloc:
        return None, "", ["og:image must be an absolute HTTPS URL"]
    if parsed_image.netloc != canonical_url.netloc:
        return None, "", ["og:image must use the canonical first-party host"]
    image_path = posixpath.normpath(unquote(parsed_image.path))
    if not image_path.startswith("/") or image_path == "/" or "/../" in f"{image_path}/":
        return None, "", ["og:image path is invalid"]
    canonical_path = unquote(canonical_url.path or "/")
    canonical_base = canonical_path if canonical_path.endswith("/") else (
        posixpath.dirname(canonical_path) + "/" if Path(canonical_path).suffix else canonical_path + "/")
    if not image_path.startswith(canonical_base):
        return None, "", ["og:image lies outside the declared public site root"]
    relative_candidates = [image_path[len(canonical_base):]]
    seen: set[str] = set()
    for relative in relative_candidates:
        if not relative or relative in seen:
            continue
        seen.add(relative)
        candidate = (root / relative).resolve()
        try:
            candidate.relative_to(root)
        except ValueError:
            continue
        if candidate.is_file():
            return candidate, candidate.relative_to(root).as_posix(), errors
    return None, "", [f"og:image does not resolve to a project-owned file: {image_url}"]


def find_media_manifest(root: Path, explicit: Path | None) -> Path | None:
    if explicit:
        return explicit.resolve()
    for candidate in (root / "media.assets.json", root.parent / "media.assets.json"):
        if candidate.is_file():
            return candidate.resolve()
    return None


def load_og_assets(manifest_path: Path | None) -> tuple[list[dict[str, Any]], list[str]]:
    if manifest_path is None:
        return [], ["OG image must be recorded in media.assets.json with role=open-graph"]
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        return [], [f"cannot read OG media manifest: {exc}"]
    assets = manifest.get("assets", []) if isinstance(manifest, dict) else []
    og_assets = [asset for asset in assets if isinstance(asset, dict) and asset.get("role") == "open-graph"]
    if not og_assets:
        return [], ["media.assets.json needs at least one image asset with role=open-graph"]
    return og_assets, []


def validate_manifest_identity(record: OGRecord, manifest_path: Path, assets: list[dict[str, Any]]) -> list[str]:
    matches: list[dict[str, Any]] = []
    for asset in assets:
        delivery = asset.get("delivery", {}) if isinstance(asset.get("delivery"), dict) else {}
        raw_path = delivery.get("path")
        if not isinstance(raw_path, str):
            continue
        candidate = (manifest_path.parent / raw_path).resolve()
        if candidate == record.local_path:
            matches.append(asset)
    if len(matches) != 1:
        return [f"{record.html_path.name}: og:image must match exactly one role=open-graph manifest asset"]
    delivery = matches[0]["delivery"]
    errors: list[str] = []
    if matches[0].get("kind") != "image":
        errors.append(f"{record.html_path.name}: OG manifest asset kind must be image")
    if delivery.get("mime") != record.image_type:
        errors.append(f"{record.html_path.name}: OG manifest MIME differs from metadata")
    if delivery.get("width") != record.width or delivery.get("height") != record.height:
        errors.append(f"{record.html_path.name}: OG manifest dimensions differ from metadata")
    digest = delivery.get("sha256")
    if not isinstance(digest, str) or len(digest) != 64 or any(ch not in "0123456789abcdef" for ch in digest):
        errors.append(f"{record.html_path.name}: OG manifest SHA-256 is invalid")
    elif file_hash(record.local_path) != digest:
        errors.append(f"{record.html_path.name}: OG file hash differs from media.assets.json")
    return errors


def validate_og_site(
    root: Path,
    *,
    media_manifest: Path | None = None,
    min_width: int = DEFAULT_MIN_WIDTH,
    min_height: int = DEFAULT_MIN_HEIGHT,
    ratio: float = DEFAULT_RATIO,
    tolerance: float = DEFAULT_RATIO_TOLERANCE,
) -> tuple[list[str], list[OGRecord]]:
    root = root.resolve()
    errors: list[str] = []
    records: list[OGRecord] = []
    manifest_path = find_media_manifest(root, media_manifest)
    og_assets, manifest_errors = load_og_assets(manifest_path)
    errors.extend(manifest_errors)
    html_paths = sorted(root.rglob("*.html"))
    if not html_paths:
        return errors + ["site contains no HTML files"], records
    site_canonical = parse_metadata((root / "index.html").read_text(encoding="utf-8")).canonical if (root / "index.html").is_file() else ""
    for html_path in html_paths:
        parser = parse_metadata(html_path.read_text(encoding="utf-8"))
        image_url = parser.meta.get("og:image", "")
        if not image_url:
            errors.append(f"{html_path.relative_to(root)}: missing og:image")
            continue
        label = html_path.relative_to(root).as_posix()
        if not parser.canonical:
            errors.append(f"{label}: canonical URL is required to resolve og:image")
            continue
        required = {
            "og:image:type": parser.meta.get("og:image:type", ""),
            "og:image:width": parser.meta.get("og:image:width", ""),
            "og:image:height": parser.meta.get("og:image:height", ""),
            "og:image:alt": parser.meta.get("og:image:alt", ""),
        }
        for key, value in required.items():
            if not value:
                errors.append(f"{label}: missing {key}")
        if any(not required[key].isdigit() for key in ("og:image:width", "og:image:height")):
            errors.append(f"{label}: OG width and height metadata must be positive integers")
            continue
        width, height = int(required["og:image:width"]), int(required["og:image:height"])
        if not width or not height:
            errors.append(f"{label}: OG width and height metadata must be positive integers")
            continue
        local_path, relative_path, path_errors = resolve_og_path(root, site_canonical or parser.canonical, image_url)
        errors.extend(f"{label}: {item}" for item in path_errors)
        if local_path is None:
            continue
        try:
            data = local_path.read_bytes()
            image_format, actual_width, actual_height = inspect_image_bytes(data, local_path.suffix)
        except (OSError, ImageValidationError) as exc:
            errors.append(f"{label}: OG image integrity/load failure: {exc}")
            continue
        actual_type = MIME_BY_FORMAT[image_format]
        if required["og:image:type"] != actual_type:
            errors.append(f"{label}: og:image:type is {required['og:image:type']}; actual type is {actual_type}")
        if (width, height) != (actual_width, actual_height):
            errors.append(
                f"{label}: OG metadata is {width}x{height}; decoded file is {actual_width}x{actual_height}"
            )
        errors.extend(
            f"{label}: {item}"
            for item in validate_dimensions(
                actual_width,
                actual_height,
                min_width=min_width,
                min_height=min_height,
                ratio=ratio,
                tolerance=tolerance,
            )
        )
        record = OGRecord(
            html_path=html_path,
            local_path=local_path,
            public_relative_path=relative_path,
            image_url=image_url,
            image_type=actual_type,
            width=actual_width,
            height=actual_height,
            alt=required["og:image:alt"],
        )
        records.append(record)
        if manifest_path:
            errors.extend(validate_manifest_identity(record, manifest_path, og_assets))
    return errors, records


def read_url(url: str, *, expected_prefix: str) -> tuple[bytes, str]:
    request = Request(url, headers={"User-Agent": "McLuhan-OG-Gate/1.0"})
    with urlopen(request, timeout=20) as response:
        content_type = response.headers.get_content_type()
        if not content_type.startswith(expected_prefix):
            raise ValueError(f"{url} returned {content_type}, expected {expected_prefix}*")
        data = response.read(MAX_IMAGE_BYTES + 1)
        if len(data) > MAX_IMAGE_BYTES:
            raise ValueError(f"{url} exceeds the {MAX_IMAGE_BYTES}-byte probe limit")
        return data, content_type


def page_probe_url(probe_root: str, html_path: Path, site_root: Path) -> str:
    relative = html_path.relative_to(site_root).as_posix()
    if relative == "index.html":
        relative = ""
    elif relative.endswith("/index.html"):
        relative = relative[: -len("index.html")]
    return urljoin(probe_root.rstrip("/") + "/", relative)


def probe_og_site(root: Path, probe_url: str, records: list[OGRecord]) -> list[str]:
    parsed_probe = urlparse(probe_url)
    localhost = parsed_probe.hostname in {"127.0.0.1", "localhost", "::1"}
    if parsed_probe.scheme != "https" and not (localhost and parsed_probe.scheme == "http"):
        return ["preview probe URL must use HTTPS (HTTP is allowed only for localhost tests)"]
    errors: list[str] = []
    for record in records:
        page_url = page_probe_url(probe_url, record.html_path, root)
        try:
            html_bytes, _ = read_url(page_url, expected_prefix="text/html")
            remote = parse_metadata(html_bytes.decode("utf-8"))
        except Exception as exc:
            errors.append(f"preview page load failed: {page_url}: {exc}")
            continue
        expected_meta = {
            "og:image": record.image_url,
            "og:image:type": record.image_type,
            "og:image:width": str(record.width),
            "og:image:height": str(record.height),
            "og:image:alt": record.alt,
        }
        for key, expected in expected_meta.items():
            if remote.meta.get(key) != expected:
                errors.append(f"preview metadata differs for {key}: {page_url}")
        asset_url = urljoin(probe_url.rstrip("/") + "/", record.public_relative_path)
        try:
            image_bytes, content_type = read_url(asset_url, expected_prefix="image/")
            image_format, width, height = inspect_image_bytes(image_bytes, record.local_path.suffix)
        except Exception as exc:
            errors.append(f"preview OG image load failed: {asset_url}: {exc}")
            continue
        if content_type != record.image_type or MIME_BY_FORMAT[image_format] != record.image_type:
            errors.append(f"preview OG MIME differs from local authority: {asset_url}")
        if (width, height) != (record.width, record.height):
            errors.append(f"preview OG dimensions differ from local authority: {asset_url}")
        if hashlib.sha256(image_bytes).hexdigest() != file_hash(record.local_path):
            errors.append(f"preview OG bytes differ from local authority: {asset_url}")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("site", type=Path)
    parser.add_argument("--media-manifest", type=Path)
    parser.add_argument("--probe-url")
    parser.add_argument("--min-width", type=int, default=DEFAULT_MIN_WIDTH)
    parser.add_argument("--min-height", type=int, default=DEFAULT_MIN_HEIGHT)
    parser.add_argument("--ratio", type=float, default=DEFAULT_RATIO)
    parser.add_argument("--ratio-tolerance", type=float, default=DEFAULT_RATIO_TOLERANCE)
    args = parser.parse_args()
    root = args.site.resolve()
    try:
        errors, records = validate_og_site(
            root,
            media_manifest=args.media_manifest,
            min_width=args.min_width,
            min_height=args.min_height,
            ratio=args.ratio,
            tolerance=args.ratio_tolerance,
        )
        if args.probe_url and not errors:
            errors.extend(probe_og_site(root, args.probe_url, records))
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        errors, records = [str(exc)], []
    if errors:
        for error in errors:
            print(f"BLOCK: {error}")
        return 1
    suffix = f", {len(records)} preview load(s)" if args.probe_url else ""
    print(f"Open Graph images: PASS ({len(records)} local{suffix})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
