#!/usr/bin/env python3
"""Block release when the profile archive violates public contracts."""

from __future__ import annotations

import json
import re
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
PROFILE = ROOT / "pages" / "profile"
DISPLAY_LEADING_FLOOR = 1.05
SECTION_LEADING_FLOOR = 1.10
DISPLAY_TRACKING_FLOOR = -0.05
SECTION_TRACKING_FLOOR = -0.04
THUMBNAIL_WIDTH = 960
THUMBNAIL_HEIGHT = 540
THUMBNAIL_PATH_RE = re.compile(r"^assets/thumbnails/([a-z0-9-]+)\.webp$")
FOCAL_POINT_RE = re.compile(r"^(?:100|[0-9]{1,2})% (?:100|[0-9]{1,2})%$")
FORBIDDEN_PUBLIC_FIELDS = {
    "incidents",
    "deployments",
    "artifact_sha256",
    "source_revision",
    "approvals",
    "golden_baseline",
    "project_id",
    "provider",
    "sha256",
    "source_kind",
}
AXES = ("relation", "attitude", "memory", "transformation")
JUDGMENT_FIELDS = (
    "affected_human",
    "accountable_human",
    "authority_scope",
    "decision_path",
    "reason_evidence",
    "override_effect",
    "appeal_path",
    "rejection_memory",
    "transformation_feedback",
    "revalidation_owner",
    "revalidation_evidence",
    "enforcement",
)


class Document(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.canonicals: list[str] = []
        self.og_urls: list[str] = []
        self.og_images: list[str] = []
        self.audio_count = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag == "link" and values.get("rel") == "canonical" and values.get("href"):
            self.canonicals.append(values["href"])
        if tag == "meta" and values.get("property") == "og:url" and values.get("content"):
            self.og_urls.append(values["content"])
        if tag == "meta" and values.get("property") == "og:image" and values.get("content"):
            self.og_images.append(values["content"])
        if tag == "audio":
            self.audio_count += 1


def nested_keys(value: object) -> set[str]:
    keys: set[str] = set()
    if isinstance(value, dict):
        for key, child in value.items():
            keys.add(key)
            keys.update(nested_keys(child))
    elif isinstance(value, list):
        for child in value:
            keys.update(nested_keys(child))
    return keys


def webp_dimensions(path: Path) -> tuple[int, int] | None:
    """Read VP8/VP8L/VP8X dimensions without an image-library dependency."""
    data = path.read_bytes()
    if len(data) < 30 or data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        return None
    offset = 12
    while offset + 8 <= len(data):
        kind = data[offset : offset + 4]
        size = int.from_bytes(data[offset + 4 : offset + 8], "little")
        payload = data[offset + 8 : offset + 8 + size]
        if kind == b"VP8X" and len(payload) >= 10:
            return (1 + int.from_bytes(payload[4:7], "little"), 1 + int.from_bytes(payload[7:10], "little"))
        if kind == b"VP8 " and len(payload) >= 10 and payload[3:6] == b"\x9d\x01\x2a":
            return (
                int.from_bytes(payload[6:8], "little") & 0x3FFF,
                int.from_bytes(payload[8:10], "little") & 0x3FFF,
            )
        if kind == b"VP8L" and len(payload) >= 5 and payload[0] == 0x2F:
            bits = int.from_bytes(payload[1:5], "little")
            return ((bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1)
        offset += 8 + size + (size % 2)
    return None


def main() -> int:
    errors: list[str] = []
    project_checks = (
        ([sys.executable, str(ROOT / "tools" / "render_songbirds.py"), "--check"], "Songbirds manifest gate"),
        (["node", str(ROOT / "tools" / "test_songbirds_player.mjs")], "Songbirds player gate"),
        ([sys.executable, str(ROOT / "tools" / "audit_suno_transport.py")], "Suno transport debt gate"),
    )
    for command, label in project_checks:
        check = subprocess.run(command, cwd=ROOT, text=True, capture_output=True, check=False)
        if check.returncode:
            errors.append(f"{label}: " + (check.stdout.strip() or check.stderr.strip()))

    render = subprocess.run(
        [sys.executable, str(ROOT / "tools" / "render_archive.py"), "--check"],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    if render.returncode:
        errors.append(render.stdout.strip() or render.stderr.strip())

    vercel = json.loads((ROOT / "vercel.json").read_text(encoding="utf-8"))
    manifest = json.loads((PROFILE / "site.manifest.json").read_text(encoding="utf-8"))
    catalog = json.loads((PROFILE / "data" / "message-bodies.json").read_text(encoding="utf-8"))
    l0_contract = json.loads((PROFILE / "l0.contract.json").read_text(encoding="utf-8"))
    trace = json.loads((PROFILE / "trace.manifest.json").read_text(encoding="utf-8"))
    routes = manifest.get("routes", [])
    route_sources = {item.get("source") for item in vercel.get("rewrites", [])}
    for route in routes:
        public_path = route["public_path"]
        required_sources = [public_path] if public_path == "/" else [public_path, public_path + ":path*"]
        for source in required_sources:
            if source not in route_sources:
                errors.append(f"missing route rewrite: {source}")
        if not (PROFILE / route["physical_path"]).is_file():
            errors.append(f"missing route output: {route['physical_path']}")

    leaked = nested_keys(catalog).intersection(FORBIDDEN_PUBLIC_FIELDS)
    if leaked:
        errors.append("private catalog fields leaked: " + ", ".join(sorted(leaked)))
    body_ids = [body.get("body_id") for body in catalog.get("bodies", [])]
    urls = [body.get("canonical_url") for body in catalog.get("bodies", [])]
    if len(body_ids) != len(set(body_ids)):
        errors.append("duplicate body_id in public catalog")
    if len(urls) != len(set(urls)):
        errors.append("duplicate canonical_url in public catalog")
    if catalog.get("schema_version") != 2:
        errors.append("public catalog schema_version must be 2")

    thumbnail_paths: list[str] = []
    for body in catalog.get("bodies", []):
        if body.get("status") not in {"DEPLOYED", "GOLDEN"}:
            continue
        body_id = body.get("body_id", "unknown")
        thumbnail = body.get("thumbnail")
        if not isinstance(thumbnail, dict):
            errors.append(f"thumbnail contract missing: {body_id}")
            continue
        thumbnail_path = str(thumbnail.get("path", ""))
        path_match = THUMBNAIL_PATH_RE.fullmatch(thumbnail_path)
        if not path_match or path_match.group(1) != body_id:
            errors.append(f"thumbnail path/body_id mismatch: {body_id}")
            continue
        thumbnail_paths.append(thumbnail_path)
        if not str(thumbnail.get("alt", "")).strip():
            errors.append(f"thumbnail alt missing: {body_id}")
        if thumbnail.get("width") != THUMBNAIL_WIDTH or thumbnail.get("height") != THUMBNAIL_HEIGHT:
            errors.append(f"thumbnail catalog dimensions mismatch: {body_id}")
        if not FOCAL_POINT_RE.fullmatch(str(thumbnail.get("focal_point", ""))):
            errors.append(f"thumbnail focal_point invalid: {body_id}")
        asset = (PROFILE / thumbnail_path).resolve()
        try:
            asset.relative_to(PROFILE.resolve())
        except ValueError:
            errors.append(f"thumbnail escapes profile root: {body_id}")
            continue
        if not asset.is_file() or asset.stat().st_size == 0:
            errors.append(f"thumbnail asset missing: {body_id}")
        elif webp_dimensions(asset) != (THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT):
            errors.append(f"thumbnail asset dimensions mismatch: {body_id}")
    if len(thumbnail_paths) != len(set(thumbnail_paths)):
        errors.append("duplicate thumbnail path in public catalog")

    for item in l0_contract.get("items", []):
        item_id = item.get("id", "unknown")
        for axis in AXES:
            proof = item.get(axis)
            if not isinstance(proof, dict) or not proof.get("statement") or not proof.get("enforcement"):
                errors.append(f"L0 proof missing: {item_id}.{axis}")
        judgment = item.get("human_judgment")
        if not isinstance(judgment, dict):
            errors.append(f"human judgment missing: {item_id}")
        else:
            for field in JUDGMENT_FIELDS:
                if not judgment.get(field):
                    errors.append(f"human judgment field missing: {item_id}.{field}")

    for fact_id, fact in trace.get("facts", {}).items():
        value = str(fact.get("value", ""))
        for target in fact.get("targets", []):
            path = ROOT / target["path"]
            if not path.is_file():
                errors.append(f"trace target missing: {target['path']}")
            elif path.read_text(encoding="utf-8").count(value) != target.get("count", 1):
                errors.append(f"trace mismatch: {fact_id} -> {target['path']}")

    archive_source = (PROFILE / "archive" / "index.html").read_text(encoding="utf-8")
    archive = Document()
    archive.feed(archive_source)
    deployable_bodies = sorted(
        (body for body in catalog.get("bodies", []) if body.get("status") in {"DEPLOYED", "GOLDEN"}),
        key=lambda body: (body["latest_deployed_at"], body["body_id"]),
        reverse=True,
    )
    expected_ids = [body["body_id"] for body in deployable_bodies]
    rendered_ids = re.findall(r'data-body-id="([a-z0-9-]+)"', archive_source)
    if sorted(rendered_ids) != sorted(expected_ids):
        errors.append("archive cards do not equal deployable public catalog records")
    archive_thumbnail_ids = re.findall(r'data-body-thumbnail="([a-z0-9-]+)"', archive_source)
    if sorted(archive_thumbnail_ids) != sorted(expected_ids):
        errors.append("archive thumbnails do not equal deployable public catalog records")
    if re.search(r'data-body-thumbnail="[^"]+"[^>]+src="https?://', archive_source):
        errors.append("archive thumbnails must use project-owned local assets")
    home_source = (PROFILE / "index.html").read_text(encoding="utf-8")
    home_thumbnail_ids = re.findall(r'data-body-thumbnail="([a-z0-9-]+)"', home_source)
    if home_thumbnail_ids != expected_ids[:6]:
        errors.append("home thumbnails do not equal the six latest public bodies")
    if archive.audio_count:
        errors.append("archive must not render audio controls")
    if "cdn1.suno.ai" in archive_source or "cdn2.suno.ai" in archive_source:
        errors.append("archive contains forbidden Suno playback transport")
    if archive.canonicals != ["https://mirinaeman.com/archive/"] or archive.og_urls != archive.canonicals:
        errors.append("archive canonical and og:url must match")
    if not archive.og_images or any(urlparse(url).scheme != "https" for url in archive.og_images):
        errors.append("archive requires an absolute HTTPS og:image")

    css = (PROFILE / "styles.css").read_text(encoding="utf-8")
    token_patterns = {
        "leading-display": (r"--leading-display:([0-9.]+)", DISPLAY_LEADING_FLOOR),
        "leading-title": (r"--leading-title:([0-9.]+)", SECTION_LEADING_FLOOR),
        "tracking-display": (r"--tracking-display:([-0-9.]+)em", DISPLAY_TRACKING_FLOOR),
        "tracking-title": (r"--tracking-title:([-0-9.]+)em", SECTION_TRACKING_FLOOR),
    }
    for name, (pattern, floor) in token_patterns.items():
        match = re.search(pattern, css)
        if not match or float(match.group(1)) < floor:
            errors.append(f"typography token below floor or missing: {name}")
    for html_path in PROFILE.rglob("*.html"):
        source = html_path.read_text(encoding="utf-8")
        document = Document()
        document.feed(source)
        if re.search(r"https://cdn\d+\.suno\.ai", source, re.I):
            errors.append(f"forbidden Suno playback transport: {html_path.relative_to(ROOT)}")
        if document.audio_count > 1:
            errors.append(f"multiple audio control surfaces: {html_path.relative_to(ROOT)}")
        if re.search(r"<h[1-3][^>]*>.*?<br\s*/?>", source, re.I | re.S):
            errors.append(f"unapproved heading hard break: {html_path.relative_to(ROOT)}")

    sitemap = (PROFILE / "sitemap.xml").read_text(encoding="utf-8")
    for route in routes:
        public_url = manifest["public_home"].rstrip("/") + route["public_path"]
        if f"<loc>{public_url}</loc>" not in sitemap:
            errors.append(f"sitemap missing route: {public_url}")
    robots = (PROFILE / "robots.txt").read_text(encoding="utf-8")
    if "Sitemap: https://mirinaeman.com/sitemap.xml" not in robots:
        errors.append("robots sitemap authority mismatch")

    if errors:
        for error in errors:
            print(f"BLOCK: {error}")
        return 1
    print("Release gate: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
