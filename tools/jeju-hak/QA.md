# Refactor verification — 2026-09-20

Approved scope: original 15 scenes, 3 parts and URL; common layout rules,
chapter transitions, local media, accessible navigation and discovery metadata.

## Observed in the browser

- All 15 desktop scenes visually reviewed at 1363×936. Scene 6 prompt overflow
  and scene 11 panel/note overlap corrected and inspected again.
- 390×844 portrait viewport: all 15 scenes traversed, document width and
  scroll width both 390; checked content stays within horizontal bounds.
- 768×1024 scene 11: two panels have equal top, bottom and 176px rendered height.
- 1440×900 scene 6: no horizontal document overflow.
- JavaScript-disabled reading edition exposes all 15 scenes and original links.
- Keyboard Enter advances one scene; rapid next/next/previous leaves one active
  scene, no departing scene and 14 inert scenes.
- Outline selection, Escape/focus return, reload from #slide-08 and copying
  the canonical current-scene URL verified.
- Manual reduced-motion option settles immediately with aria-busy=false.
- No page JavaScript exceptions observed.

## Release checks

Generated HTML drift, ordered scene identity, JavaScript syntax, media hashes,
public discovery metadata and repository release gate pass. Open Graph image
was inspected and served through a local HTTP probe with exact file hash.

## Limits

Fullscreen API entry was denied by the browser environment; the visible failure
message was verified, successful fullscreen entry was not. Touch hardware
gestures and OS-level reduced-motion emulation were not tested. Search indexing
and AI citations are not measured. A generic static-site validator expects a
user theme switch and unrelated token/breakpoint conventions; that validator
was not passed or used as this lecture's release gate. Its mixed light/dark/red
scenes follow the user's approved presentation design.

This verification records implementation evidence, not final user acceptance.
