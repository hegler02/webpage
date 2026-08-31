#!/usr/bin/env python3
"""Render MESSAGE BODIES public outputs from one sanitized catalog."""

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
ARCHIVE = PROFILE / "archive" / "index.html"
HOME = PROFILE / "index.html"
NAVIGATION = PROFILE / "navigation.js"
SITEMAP = PROFILE / "sitemap.xml"
HOME_START = "<!-- MESSAGE_BODIES_LATEST_START -->"
HOME_END = "<!-- MESSAGE_BODIES_LATEST_END -->"
ROUTES_RE = re.compile(r"/\* GENERATED_ROUTES_START \*/.*?/\* GENERATED_ROUTES_END \*/", re.S)
BODY_TYPES = ("SONGBODY", "SLIDEBODY", "SCREENBODY", "STORYBODY", "KNOWLEDGEBODY")
HOME_ARCHIVE_LIMIT = 6
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


def body_card(body: dict, compact: bool = False, asset_prefix: str = "./") -> str:
    tags = "".join(f'<span>{esc(tag)}</span>' for tag in body.get("tags", [])[:3])
    date = datetime.fromisoformat(body["latest_deployed_at"].replace("Z", "+00:00")).date().isoformat()
    css_class = "body-card body-card-compact" if compact else "body-card"
    thumbnail = body["thumbnail"]
    thumbnail_src = asset_prefix + thumbnail["path"]
    body_kind = body["body_type"].removesuffix("BODY")
    return (
        f'<article class="{css_class}" data-body-id="{esc(body["body_id"])}" data-body-type="{esc(body["body_type"])}">'
        f'<figure class="body-card-media" style="--thumbnail-position:{esc(thumbnail["focal_point"])}">'
        f'<img data-body-thumbnail="{esc(body["body_id"])}" src="{esc(thumbnail_src)}" alt="{esc(thumbnail["alt"])}" width="960" height="540" loading="lazy" decoding="async">'
        f'<figcaption>{esc(body_kind)}</figcaption></figure>'
        '<div class="body-card-copy">'
        f'<div class="body-card-meta"><span class="tag">{esc(body["body_type"])}</span><time datetime="{date}">{date[:4]}</time></div>'
        f'<h3>{esc(body["title"])}</h3><p>{esc(body["message_sentence"])}</p>'
        f'<div class="body-tags" aria-label="태그">{tags}</div>'
        f'<a class="body-card-link" href="{esc(body["canonical_url"])}"><span data-ko>작품 열기</span><span data-en lang="en">Open body</span><span aria-hidden="true">↗</span></a>'
        '</div></article>'
    )


def render_archive(bodies: list[dict], manifest: dict) -> str:
    counts = {body_type: sum(body["body_type"] == body_type for body in bodies) for body_type in BODY_TYPES}
    filters = [f'<button type="button" data-body-filter="ALL" aria-pressed="true">ALL <span>{len(bodies)}</span></button>']
    filters.extend(
        f'<button type="button" data-body-filter="{body_type}" aria-pressed="false">{body_type.removesuffix("BODY")} <span>{counts[body_type]}</span></button>'
        for body_type in BODY_TYPES
    )
    item_list = [
        {"@type": "ListItem", "position": index + 1, "name": body["title"], "url": body["canonical_url"]}
        for index, body in enumerate(bodies)
    ]
    schema = json.dumps(
        {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "MESSAGE BODIES",
            "url": "https://mirinaeman.com/archive/",
            "mainEntity": {"@type": "ItemList", "numberOfItems": len(bodies), "itemListElement": item_list},
        },
        ensure_ascii=False,
        separators=(",", ":"),
    )
    cards = "".join(body_card(body, asset_prefix="../") for body in bodies)
    return f'''<!doctype html>
<html lang="ko" data-lang="ko" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>MESSAGE BODIES | 김준호</title>
  <meta name="description" content="노래, 슬라이드, 화면, 이야기와 지식으로 몸을 얻은 김준호의 미디어 아카이브.">
  <meta name="site-home" content="{esc(manifest['public_home'])}">
  <link rel="canonical" href="https://mirinaeman.com/archive/">
  <link rel="icon" href="../favicon.svg" type="image/svg+xml">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:title" content="MESSAGE BODIES | 김준호">
  <meta property="og:description" content="이야기는 매체를 만날 때 몸을 얻는다. 축적되는 미디어 철학의 공개 아카이브.">
  <meta property="og:url" content="https://mirinaeman.com/archive/">
  <meta property="og:image" content="https://mirinaeman.com/assets/images/profile-hero.webp">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">{schema}</script>
  <style>html{{background:#ece9e2}}html[data-theme='dark']{{background:#0d0f13}}</style>
  <script>(function(){{try{{var t=localStorage.getItem('profile-theme');if(t)document.documentElement.dataset.theme=t;var l=localStorage.getItem('profile-language');if(l){{document.documentElement.dataset.lang=l;document.documentElement.lang=l}}}}catch(e){{}}}})()</script>
  <link rel="stylesheet" href="../styles.css">
  <script defer src="../navigation.js"></script>
  <script defer src="../app.js"></script>
  <script defer src="../archive.js"></script>
</head>
<body>
  <a class="skip" href="#main">본문으로 이동</a>
  <site-navigation data-page="archive"></site-navigation>
  <main id="main">
    <section class="archive-hero">
      <div class="wrap archive-hero-grid">
        <div><span class="eyebrow">MESSAGE BODIES · CQI ARCHIVE</span><h1><span data-ko>이야기는 매체를 만날 때 몸을 얻는다.</span><span data-en lang="en">A story gains a body when it meets its medium.</span></h1></div>
        <div class="archive-intro"><strong><span data-visible-count>{len(bodies)}</span><small> BODIES</small></strong><p><span data-ko>노래도, 슬라이드도, 화면도 같은 모양을 강요받지 않습니다. 각 메시지는 자신에게 맞는 몸으로 남습니다.</span><span data-en lang="en">Songs, slides, screens, and stories keep the body their message requires.</span></p></div>
      </div>
    </section>
    <section class="section archive-section">
      <div class="wrap">
        <div class="body-filters" aria-label="몸 유형 필터">{''.join(filters)}</div>
        <div class="body-grid">{cards}</div>
      </div>
    </section>
  </main>
  <footer class="footer"><div class="wrap"><p>© Joonho Kim · mirinaeman.com</p><p><span data-ko>인간의 판단이 최종 수용 권한을 갖습니다.</span><span data-en lang="en">Human judgment retains final authority over acceptance.</span></p></div></footer>
</body>
</html>
'''


def render_latest(bodies: list[dict]) -> str:
    cards = "".join(body_card(body, compact=True, asset_prefix="./") for body in bodies[:HOME_ARCHIVE_LIMIT])
    return f'''{HOME_START}<section class="section latest-bodies"><div class="wrap"><div class="section-head"><div><span class="eyebrow">MESSAGE BODIES</span><h2><span data-ko>내 미디어 철학이 몸을 입는 순간</span><span data-en lang="en">The moment my media philosophy takes a body</span></h2></div><p><span data-ko>노래, 슬라이드, 화면과 이야기가 배포로 끝나지 않고 다음 창작을 바꾸는 기억으로 축적됩니다.</span><span data-en lang="en">Songs, slides, screens, and stories accumulate as memory that changes the next creation.</span></p></div><div class="body-grid body-grid-latest">{cards}</div><div class="actions"><a class="button primary" href="./archive/index.html" data-route-key="archive"><span data-ko>전체 아카이브</span><span data-en lang="en">View full archive</span></a></div></div></section>{HOME_END}'''


def replace_block(source: str, start: str, end: str, replacement: str) -> str:
    if start not in source or end not in source:
        raise ValueError(f"generated markers missing: {start} / {end}")
    return source[: source.index(start)] + replacement + source[source.index(end) + len(end) :]


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


def render_sitemap(manifest: dict, bodies: list[dict]) -> str:
    urls = [manifest["public_home"].rstrip("/") + route["public_path"] for route in manifest["routes"]]
    urls.extend(body["canonical_url"] for body in bodies if urlparse(body["canonical_url"]).netloc == "mirinaeman.com")
    unique = list(dict.fromkeys(urls))
    body = "".join(f"<url><loc>{esc(url)}</loc></url>" for url in unique)
    return f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{body}</urlset>\n'


def outputs() -> dict[Path, str]:
    catalog = load_json(CATALOG)
    manifest = load_json(MANIFEST)
    bodies = normalized_bodies(catalog)
    home = replace_block(HOME.read_text(encoding="utf-8"), HOME_START, HOME_END, render_latest(bodies))
    navigation = ROUTES_RE.sub(rendered_routes(manifest), NAVIGATION.read_text(encoding="utf-8"), count=1)
    return {
        ARCHIVE: render_archive(bodies, manifest),
        HOME: home,
        NAVIGATION: navigation,
        SITEMAP: render_sitemap(manifest, bodies),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="fail when generated files differ")
    args = parser.parse_args()
    failures = []
    for path, content in outputs().items():
        if args.check:
            if not path.is_file() or path.read_text(encoding="utf-8") != content:
                failures.append(str(path.relative_to(ROOT)))
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8")
    if failures:
        print("BLOCK: generated output drift: " + ", ".join(failures))
        return 1
    print("MESSAGE BODIES render: PASS" if args.check else "MESSAGE BODIES rendered")
    return 0


if __name__ == "__main__":
    sys.exit(main())
