# Mirinaeman Coding lecture

30-slide Korean web presentation. Content source: content.json. Static output: ../../pages/coding-lab/. Runtime: GSAP scene transitions and Motion UI responses; no shared transform owner. Font: Noto Sans KR 400 (OFL). Images are first-party app screenshots without personal records.

Build: `python3 tools/coding-lecture/build.py` then `tools/coding-lecture/node_modules/.bin/esbuild tools/coding-lecture/runtime.js --bundle --minify --format=iife --outfile=pages/coding-lab/presentation.js`.

Validation performed: 30 slide bounds, no JavaScript errors, 1920x1212 and 390x844 viewport, rapid previous/next, reduced motion, reading mode reveals 30 slides, Korean font coverage. Discovery, OG local image, media manifest and existing homepage release gates pass. These are technical checks, not instructor/student acceptance.

## Publication status — 2026-09-30

The user explicitly approved both main updates, full public deployment and two archive registrations. Production app and lecture are live at https://bq2-read-with-me.vercel.app/ and https://mirinaeman.com/pages/coding-lab/ (unauthenticated HTTP 200 verified). The app personal-report route correctly redirects unauthenticated visitors to login. Preview-only Supabase environment variables remain absent; production configuration works. The lecture authenticated preview OG HTTP probe passed.

McLuhan records were upserted as DEPLOYED, not GOLDEN. The user asked to refine the lecture later; publication permission is not final content acceptance. The sanitized catalog and archive/constellation/home outputs have been generated and release-gated for publication. Live archive body IDs, canonical URLs, both thumbnail bytes, and exact catalog equality have been verified. Archive screenshot: evidence/archive-live.jpg. Catalog production source: 11973b05f93d92ec10317e478b862b237b477514.

App real personal-PDF and paid AI operation remain distinct from synthetic UI/API tests. Public plugin marketplace submission is not complete; do not tell students it is already publicly listed.
