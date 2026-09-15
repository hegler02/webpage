# 미리내의 별자리

The constellation is a view of existing records, not a second artwork catalog.

- Public works: `pages/profile/data/message-bodies.json` (`DEPLOYED` / `GOLDEN` only).
- Explicit artwork concepts and the subtitle judgment: `pages/profile/data/context-graph.json`.
- Personal essay body: `pages/profile/data/constellation-editorial.json`, transcribed from the user's public Mirinaeverse article. Keep the source URL and factual relationship reason with any future addition.
- Papers: existing `research-item` records in `pages/profile/books/index.html`. Title grouping is a navigation aid, not evidence of research influence or citation.
- Every generated work is linked to the creator, so adding an approved catalog item automatically gives it an entry and an honest first relationship. Richer conceptual links require an actual reason and source.

Run `python3 tools/render_archive.py` after registry updates. This generates both the archive and constellation HTML/JSON. Then run `python3 tools/render_public_routes.py` and `python3 tools/release_gate.py`. The gate verifies that generated outputs are current and public data boundaries hold.

For local preview: `npm ci` and `npm run dev`; open `/constellation/` using the supported browser. The Vite server is a development adapter for the existing static MPA; production still uses the repository's existing Python release gate and Vercel routes.

The UI supports search, all-record and paper lists, contextual maps, node links encoded in the URL, original source links, desktop right reading and mobile in-flow bottom reading. Canvas only draws functional connectors. All relationship reasons and destinations also exist as accessible HTML controls and a generated reading index. JSON-LD describes the same records and their mentions.

CQI rule for this iteration: preserve source records, improve the next rendering, record the observed failure and decision. Visual findings must come from an actual browser observation. See `design-qa.md` for the current verification state.
