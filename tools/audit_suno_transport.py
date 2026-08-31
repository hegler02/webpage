#!/usr/bin/env python3
"""Block new or untracked Suno CDN playback transport while legacy debt is retired."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES = ROOT / "pages"
LEDGER = ROOT / "tools" / "legacy-suno-debt.json"
SUNO_RE = re.compile(r"https://cdn\d*\.suno\.ai/[^\"'\s<>)]+", re.I)
SCANNED_SUFFIXES = {".html", ".js", ".json"}


def collect() -> dict[str, dict[str, object]]:
    result: dict[str, dict[str, object]] = {}
    for path in sorted(PAGES.rglob("*")):
        if not path.is_file() or path.suffix not in SCANNED_SUFFIXES:
            continue
        urls = SUNO_RE.findall(path.read_text(encoding="utf-8", errors="ignore"))
        if urls:
            result[path.relative_to(ROOT).as_posix()] = {
                "reference_count": len(urls),
                "urls": sorted(set(urls)),
            }
    return result


def main() -> int:
    try:
        ledger = json.loads(LEDGER.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"BLOCK: cannot read Suno debt ledger: {exc}")
        return 1
    if ledger.get("schema_version") != 1 or not isinstance(ledger.get("files"), dict):
        print("BLOCK: invalid Suno debt ledger schema")
        return 1
    expected = ledger["files"]
    actual = collect()
    errors: list[str] = []
    for path in sorted(set(actual) | set(expected)):
        if path not in expected:
            errors.append(f"new unregistered Suno transport: {path}")
        elif path not in actual:
            errors.append(f"stale Suno debt record must be removed with migration: {path}")
        elif actual[path] != expected[path]:
            errors.append(f"Suno debt drift: {path} expected={expected[path]} actual={actual[path]}")
    if errors:
        for error in errors:
            print(f"BLOCK: {error}")
        return 1
    unique_urls = {url for item in actual.values() for url in item["urls"]}
    total_refs = sum(int(item["reference_count"]) for item in actual.values())
    print(f"Legacy Suno debt: PASS ({len(actual)} files, {len(unique_urls)} URLs, {total_refs} references; Songbirds=0)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
