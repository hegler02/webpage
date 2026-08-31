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
FORBIDDEN_PUBLIC_FIELDS = {
    "incidents",
    "deployments",
    "artifact_sha256",
    "source_revision",
    "approvals",
    "golden_baseline",
    "project_id",
    "provider",
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


def main() -> int:
    errors: list[str] = []
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
        source = route["public_path"] if route["public_path"] == "/" else route["public_path"] + ":path*"
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
    expected_ids = [
        body["body_id"]
        for body in catalog.get("bodies", [])
        if body.get("status") in {"DEPLOYED", "GOLDEN"}
    ]
    rendered_ids = re.findall(r'data-body-id="([a-z0-9-]+)"', archive_source)
    if sorted(rendered_ids) != sorted(expected_ids):
        errors.append("archive cards do not equal deployable public catalog records")
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
