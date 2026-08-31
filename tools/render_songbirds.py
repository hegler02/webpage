#!/usr/bin/env python3
"""Render Songbirds track data from one manifest and detect drift."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "pages" / "songbirds"
MANIFEST_PATH = PAGE / "track.manifest.json"
MEDIA_PATH = PAGE / "media.assets.json"
INDEX_PATH = PAGE / "index.html"
APP_PATH = PAGE / "app.js"
HTML_SCHEMA_RE = re.compile(r"<!-- GENERATED_TRACK_SCHEMA_START -->.*?<!-- GENERATED_TRACK_SCHEMA_END -->", re.S)
HTML_CARDS_RE = re.compile(r"<!-- GENERATED_TRACK_CARDS_START -->.*?<!-- GENERATED_TRACK_CARDS_END -->", re.S)
JS_TRACKS_RE = re.compile(r"/\* GENERATED_TRACKS_START \*/.*?/\* GENERATED_TRACKS_END \*/", re.S)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def schema_block(manifest: dict) -> str:
    base = manifest["canonical_url"]
    tracks = []
    for position, track in enumerate(manifest["tracks"], 1):
        tracks.append({
            "@type": "MusicRecording",
            "position": position,
            "name": track["title"],
            "alternateName": track["alternate_name"],
            "inLanguage": track["language"],
            "duration": f"PT{track['duration_seconds']}S",
            "audio": {
                "@type": "AudioObject",
                "contentUrl": base + track["src"].removeprefix("./"),
                "encodingFormat": track["mime"],
            },
        })
    payload = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": base + "#website",
                "url": base,
                "name": "오랜만이야 · SONGBIRDS",
                "alternateName": "IT’S BEEN A WHILE",
                "inLanguage": ["ko-KR", "en"],
                "description": "제주의 실제 새소리에서 시작된 네 가지 목소리의 어쿠스틱 포크팝 앨범 웹사이트.",
            },
            {
                "@type": "MusicAlbum",
                "@id": base + "#album",
                "url": base,
                "name": manifest["album"]["name"],
                "alternateName": manifest["album"]["alternate_names"],
                "description": "제주 호텔 정원에서 스마트폰으로 녹음한 실제 새소리에서 시작된 어쿠스틱 포크팝 앨범. 오래 만나지 못한 자신에게 건네는 조용한 안부를 네 가지 목소리로 담았다.",
                "image": [base + "assets/images/album-cover.png", base + "assets/images/hero-window.png"],
                "genre": ["Acoustic Folk Pop", "Folk Pop"],
                "numTracks": len(tracks),
                "track": tracks,
            },
        ],
    }
    body = json.dumps(payload, ensure_ascii=False, indent=2)
    return f'<!-- GENERATED_TRACK_SCHEMA_START -->\n  <script type="application/ld+json">\n{body}\n  </script>\n  <!-- GENERATED_TRACK_SCHEMA_END -->'


def cards_block(manifest: dict) -> str:
    cards = []
    for position, track in enumerate(manifest["tracks"], 1):
        active = " is-active" if track["id"] == "duet" else ""
        cards.append(
            f'        <button class="track-card{active}" type="button" data-track="{track["id"]}">'
            f'<span class="track-index">{position:02d}</span>'
            f'<span class="track-meta"><i>{track["eyebrow"]}</i><strong>{track["title"]}</strong><small>{track["note"]}</small></span>'
            '<span class="track-action"><span class="play-icon"></span></span></button>'
        )
    return "<!-- GENERATED_TRACK_CARDS_START -->\n" + "\n".join(cards) + "\n        <!-- GENERATED_TRACK_CARDS_END -->"


def tracks_block(manifest: dict) -> str:
    tracks = {
        track["id"]: {key: track[key] for key in ("eyebrow", "title", "note", "src")}
        for track in manifest["tracks"]
    }
    return "/* GENERATED_TRACKS_START */\nconst TRACKS = " + json.dumps(tracks, ensure_ascii=False, indent=2) + ";\n/* GENERATED_TRACKS_END */"


def replace_one(source: str, pattern: re.Pattern, replacement: str, label: str) -> str:
    rendered, count = pattern.subn(replacement, source)
    if count != 1:
        raise ValueError(f"{label}: expected one generated block, found {count}")
    return rendered


def validate(manifest: dict, media: dict) -> None:
    if manifest.get("schema_version") != 1 or media.get("schema_version") != 1:
        raise ValueError("manifest schema_version must be 1")
    tracks = manifest.get("tracks")
    if not isinstance(tracks, list) or len(tracks) != 4:
        raise ValueError("Songbirds requires exactly four tracks")
    ids = [track.get("id") for track in tracks]
    if len(set(ids)) != len(ids) or "duet" not in ids:
        raise ValueError("track ids must be unique and include duet")
    deliveries = {asset["delivery"]["path"]: asset["delivery"] for asset in media.get("assets", [])}
    for track in tracks:
        src = track.get("src", "")
        if "suno.ai" in src or not src.startswith("./assets/audio/"):
            raise ValueError(f"{track.get('id')}: src must be a first-party audio path")
        relative = src.removeprefix("./")
        path = PAGE / relative
        delivery = deliveries.get(relative)
        if not path.is_file() or not delivery:
            raise ValueError(f"{track.get('id')}: delivery asset missing")
        if delivery.get("mime") != track.get("mime") or sha256(path) != delivery.get("sha256"):
            raise ValueError(f"{track.get('id')}: media manifest mismatch")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    try:
        manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
        media = json.loads(MEDIA_PATH.read_text(encoding="utf-8"))
        validate(manifest, media)
        expected_index = replace_one(INDEX_PATH.read_text(encoding="utf-8"), HTML_SCHEMA_RE, schema_block(manifest), "track schema")
        expected_index = replace_one(expected_index, HTML_CARDS_RE, cards_block(manifest), "track cards")
        expected_app = replace_one(APP_PATH.read_text(encoding="utf-8"), JS_TRACKS_RE, tracks_block(manifest), "runtime tracks")
        if args.check:
            drift = []
            if expected_index != INDEX_PATH.read_text(encoding="utf-8"):
                drift.append("pages/songbirds/index.html")
            if expected_app != APP_PATH.read_text(encoding="utf-8"):
                drift.append("pages/songbirds/app.js")
            if drift:
                print("BLOCK: Songbirds generated track data drift: " + ", ".join(drift))
                return 1
        else:
            INDEX_PATH.write_text(expected_index, encoding="utf-8")
            APP_PATH.write_text(expected_app, encoding="utf-8")
        print("Songbirds track manifest: PASS")
        return 0
    except (OSError, ValueError, KeyError, json.JSONDecodeError) as exc:
        print(f"BLOCK: {exc}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
