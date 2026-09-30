# Mirinaeman Coding lecture

30-slide Korean web presentation. Content source: content.json. Static output: ../../pages/coding-lab/. Runtime: GSAP scene transitions and Motion UI responses; no shared transform owner. Font: Noto Sans KR 400 (OFL). Images are first-party app screenshots without personal records.

Build: `python3 tools/coding-lecture/build.py` then `tools/coding-lecture/node_modules/.bin/esbuild tools/coding-lecture/runtime.js --bundle --minify --format=iife --outfile=pages/coding-lab/presentation.js`.

Validation performed: 30 slide bounds, no JavaScript errors, 1920x1212 and 390x844 viewport, rapid previous/next, reduced motion, reading mode reveals 30 slides, Korean font coverage. Discovery, OG local image, media manifest and existing homepage release gates pass. These are technical checks, not instructor/student acceptance.

## Publication hold
Automatic approval review rejected app main update because it requires explicit main-branch authorization. Both production changes are prepared on feature branches. Do not bypass that rejection or mark archive registration complete.

After explicit user approval to update `hegler02/bq2-read-with-me main` and `hegler02/webpage main`:
1. Confirm current branches and merge only approved changes. Verify app and lecture deployments and canonical URLs.
2. Load body-archive-pending.json. Set each record's DEPLOYED state, deployment times and actual source identity from verified deployment responses.
3. Use the McLuhan body_archive.py upsert and validate_body_archive.py. Persist only affected skill evidence/index through the personal skill save procedure.
4. Export public catalog to pages/profile/data/message-bodies.json, run tools/render_archive.py and tools/release_gate.py, publish catalog via existing branch path.
5. Verify both cards, thumbnails and canonical URLs on mirinaeman.com/archive/, and validate_catalog_sync.py. No Work-menu listing is authorized.

App real personal-PDF and paid AI operation remain distinct from synthetic UI/API tests. Public plugin marketplace submission is not complete; do not tell students it is already publicly listed.
