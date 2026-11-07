#!/usr/bin/env python3
"""Render every public page from the catalog, the records file and the approved links.

This is the one command after adding or changing a record: python3 tools/render_archive.py
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
PROFILE = ROOT / "pages" / "profile"
CATALOG = PROFILE / "data" / "message-bodies.json"
MANIFEST = PROFILE / "site.manifest.json"
NAVIGATION = PROFILE / "navigation.js"
ROUTES_RE = re.compile(r"/\* GENERATED_ROUTES_START \*/.*?/\* GENERATED_ROUTES_END \*/", re.S)
BODY_TYPES = ("SONGBODY", "SLIDEBODY", "SCREENBODY", "STORYBODY", "KNOWLEDGEBODY")
THUMBNAIL_PATH_RE = re.compile(r"^assets/thumbnails/([a-z0-9-]+)\.webp$")
FOCAL_POINT_RE = re.compile(r"^(?:100|[0-9]{1,2})% (?:100|[0-9]{1,2})%$")


def load_json(path: Path) -> dict:
    with path.open(encoding="utf-8") as handle:
        value = json.load(handle)
    if not isinstance(value, dict):
        raise ValueError(f"{path}: root must be an object")
    return value


def esc(value: object) -> str:
    return html.escape(str(value), quote=True)


def normalized_bodies(catalog: dict) -> list[dict]:
    if catalog.get("schema_version") != 2:
        raise ValueError("catalog.schema_version must be 2")
    bodies = catalog.get("bodies")
    if not isinstance(bodies, list):
        raise ValueError("catalog.bodies must be a list")
    seen_ids: set[str] = set()
    seen_urls: set[str] = set()
    normalized: list[dict] = []
    for index, body in enumerate(bodies):
        if not isinstance(body, dict):
            raise ValueError(f"catalog.bodies[{index}] must be an object")
        required = ("body_id", "title", "body_type", "message_sentence", "canonical_url", "status", "latest_deployed_at", "thumbnail")
        missing = [field for field in required if not body.get(field)]
        if missing:
            raise ValueError(f"catalog.bodies[{index}] missing: {', '.join(missing)}")
        if body["body_id"] in seen_ids:
            raise ValueError(f"duplicate body_id: {body['body_id']}")
        if body["canonical_url"] in seen_urls:
            raise ValueError(f"duplicate canonical_url: {body['canonical_url']}")
        if body["body_type"] not in BODY_TYPES:
            raise ValueError(f"unsupported body_type: {body['body_type']}")
        parsed = urlparse(body["canonical_url"])
        if parsed.scheme != "https" or not parsed.netloc:
            raise ValueError(f"invalid canonical_url: {body['canonical_url']}")
        if parsed.hostname == "example.com" or (parsed.hostname or "").endswith(".example"):
            raise ValueError(f"placeholder canonical_url: {body['canonical_url']}")
        if body["status"] not in {"DEPLOYED", "GOLDEN"}:
            continue
        thumbnail = body["thumbnail"]
        if not isinstance(thumbnail, dict):
            raise ValueError(f"invalid thumbnail object: {body['body_id']}")
        path_match = THUMBNAIL_PATH_RE.fullmatch(str(thumbnail.get("path", "")))
        if not path_match or path_match.group(1) != body["body_id"]:
            raise ValueError(f"thumbnail path must match body_id: {body['body_id']}")
        if not str(thumbnail.get("alt", "")).strip():
            raise ValueError(f"thumbnail alt is required: {body['body_id']}")
        if thumbnail.get("width") != 960 or thumbnail.get("height") != 540:
            raise ValueError(f"thumbnail dimensions must be 960x540: {body['body_id']}")
        if not FOCAL_POINT_RE.fullmatch(str(thumbnail.get("focal_point", ""))):
            raise ValueError(f"invalid thumbnail focal_point: {body['body_id']}")
        seen_ids.add(body["body_id"])
        seen_urls.add(body["canonical_url"])
        normalized.append(body)
    return sorted(normalized, key=lambda item: (item["latest_deployed_at"], item["body_id"]), reverse=True)


def rendered_routes(manifest: dict) -> str:
    routes = []
    for route in manifest["routes"]:
        routes.append(
            {
                "key": route["key"],
                "path": route["public_path"].lstrip("/"),
                "ko": route["ko"],
                "en": route["en"],
            }
        )
    return "/* GENERATED_ROUTES_START */" + json.dumps(routes, ensure_ascii=False, separators=(",", ":")) + "/* GENERATED_ROUTES_END */"


def outputs(layout_check: bool = False) -> dict[Path, str]:
    catalog = load_json(CATALOG)
    manifest = load_json(MANIFEST)
    normalized_bodies(catalog)
    import galaxy_layout
    from constellation_data import build_graph
    from render_site import outputs as site_outputs
    graph = build_graph()
    known = galaxy_layout.load()
    missing = [n["id"] for n in graph["nodes"] if n["id"] not in known]
    if missing and layout_check:
        raise SystemExit("BLOCK: stars without a place in the sky: " + ", ".join(missing) + ". Run python3 tools/render_archive.py")
    layout = galaxy_layout.place_new(graph["nodes"], graph["edges"], {k: v for k, v in known.items() if k in {n["id"] for n in graph["nodes"]}})
    navigation = ROUTES_RE.sub(rendered_routes(manifest), NAVIGATION.read_text(encoding="utf-8"), count=1)
    result = {**site_outputs(layout=layout), NAVIGATION: navigation}
    result[galaxy_layout.DATA] = json.dumps(dict(sorted(layout.items())), ensure_ascii=False, indent=0) + "\n"
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="fail when generated files differ")
    args = parser.parse_args()
    failures = []
    for path, content in outputs(layout_check=args.check).items():
        if args.check:
            if not path.is_file() or path.read_text(encoding="utf-8") != content:
                failures.append(str(path.relative_to(ROOT)))
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            with path.open("w", encoding="utf-8", newline="\n") as out:
                out.write(content)
    if args.check:
        # A record page whose record is gone must not linger.
        expected = {p for p in outputs().keys()}
        for folder in ("work", "research"):
            for page in (PROFILE / folder).glob("*/index.html"):
                public = "/" + page.parent.relative_to(PROFILE).as_posix() + "/"
                if page not in expected and public not in load_json(MANIFEST)["editorial_pages"]:
                    failures.append(str(page.relative_to(ROOT)) + " (no record)")
    if failures:
        print("BLOCK: generated output drift: " + ", ".join(failures))
        return 1
    print("Site render: PASS" if args.check else "Site rendered")
    return 0


if __name__ == "__main__":
    sys.exit(main())
