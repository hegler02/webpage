# 미리내의 별자리

The constellation is a view of accumulated public records, not a second artwork catalog.

## Update the graph

- `pages/profile/data/message-bodies.json`: sanitized McLuhan catalog export; DEPLOYED/GOLDEN works automatically become nodes and receive a factual creator edge. Never copy a second works list into JavaScript.
- `pages/profile/data/context-graph.json`: explicitly recorded concept relationships, with reasons. Shared vocabulary alone is not evidence of influence.
- `pages/profile/data/constellation-editorial.json`: existing full autumn essay; optional `nodes` and `edges` arrays accept future approved public essays and judgments. Each edge requires source, target, label, reason and HTTPS evidence. No unsupported links, dangling IDs or duplicates.
- `pages/profile/data/unfold-context.json`: already published source essay, voice selection judgment and related works are reused, not rewritten in a new data authority.
- `pages/profile/books/index.html`: bibliography. Title-based grouping is a navigation aid, never evidence of citation or influence.
- `site.manifest.json`: existing editorial routes own introduction URLs. No automatic additions to the curated Work menu.

After authorized catalog/context updates:

```sh
python3 tools/render_archive.py
python3 tools/render_public_routes.py
python3 tools/release_gate.py
```

This regenerates graph JSON, complete readable HTML and JSON-LD together. New works enter every-record browsing and search immediately after the resulting release is deployed. Meaningful new edges require an authored, supported reason; no model infers them silently. The seven opening records are an editorial entrance, not the full database. Pagination preserves all nodes; on compact screens the first group keeps a visible relationship.

## Runtime boundaries

- `graph-model.mjs`: filtering, reciprocal adjacency, paging, URL serialization.
- `graph-view.mjs`: escaped semantic controls and reader, source evidence, image identity.
- `constellation.js`: events, navigation state, async loading and visibility lifecycle host.
- `space-adapter.mjs`: Three.js world/camera, projected labels, bounded rotation, resource cleanup and on-demand rendering.
- `spatial-renderer.mjs`: WebGL first; native SVG draws the same projected graph when a GPU cannot initialize. A total engine import failure leaves the flat interactive map and complete static index.
- `constellation.css`: approved dark-blue visual direction, semantic tokens, responsive 700/900px rules. Original approved prototype is frozen in `baselines/` with its decompressed hash in `approved-prototype.json`.

Three.js 0.158.0 is pinned and self-hosted (MIT, license beside runtime). No CDN requests or auto-orbit. The adapter loads when its visible map enters the viewport. GPU drawing is capped at 1.2 million pixels and DPR 1.5; idle/offscreen/hidden drawing stops. Pointer drag and arrow keys rotate; Home resets. Reduced motion settles immediately and disables spatial rotation. All records and external destinations also work through ordinary buttons/links. External sources open a new tab. Sharing copies/shares the first-party page, never a media asset.

The user explicitly chose the spatial prototype after rejecting the earlier static layout. That specific approval is the design authority for this revision, not an invented DESIGN.md corpus approval. GSAP/WGSL are not added: Three.js already owns the requested spatial relationship, so another animation engine would duplicate ownership.

## Validation and limits

Release gate invokes source/registration tests, actual model URL/paging tests, real Three.js projection and lifecycle tests with a GPU-unavailable DOM fixture, and discovery/OG validation. The fixture is not hardware WebGL evidence. Browser checks and exact results belong in `verification.json`.

Supported local preview: `npm ci`, then `sites-preview start "$PWD"`, and the managed browser URL `http://terminal.local:4173/constellation/`. Keep temporary responsive QA harnesses out of the committed release. Production retains the existing Vercel static routes and release gate.

Revisions keep the public URL and old node IDs stable. Deployment is not human acceptance, indexing, or AI citation. User feedback on the public result determines the next CQI revision.
