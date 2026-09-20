# Sound Lab assembly validation

## Checked before publication
- 30 scenes visually reviewed in a 1363×936 browser. Delayed-frame screenshots were refreshed before visual judgment.
- All 30 scenes measured with motion reduced: stage bounds and body bounds for direct layout children, modules, fields and save notes. No overflow after correction.
- Empty textareas: scrollHeight <= clientHeight + 1 on all 32 fields. The original 5-field grid overflow and empty-field scrollbars were reproduced and fixed.
- Hero type enlarged to 360px; statement type 290px. Cover, declaration and worksheet finals reviewed after changes.
- GSAP circuit: observed 2.3× keyword transform, input/output assembly and wire draw, then final transform none, wire offset zero, data-animating false and zero leaving scenes.
- Rapid next/next/back selected the requested destination; switching reduced motion during a transition removed the outgoing scene and displayed the complete destination. Final assembly replay finished with all nine cell transforms removed, data-animating false and no leaving scene.
- All five routing choices select exactly one output pane; selected pane content fits its container.
- All 32 fields entered through actual UI; all 9 groups become complete. Copy action wrote all 32 values to the clipboard.
- Reload restores all 32 values and 9/9 count. Test values were cleared through UI and the count returned to 0/9.
- ArrowRight and Enter inside a textarea keep the same slide. ArrowRight on the navigation button advances one scene. Space on the button advances once.
- 390×844 and 768×1024 iframe viewports: 16:9 stage fits exactly within available width, no horizontal document overflow. Phone outline opens and closes.
- JavaScript disabled through iframe sandbox at widths 1000 and 390: all 30 scenes rendered, no measured title/body/input horizontal overflow. Narrow static-reading cover visually checked.
- check.py: 30 ordered IDs, 9 groups, 32 unique fields, notes and keyword hooks, valid internal links, complete Korean glyph coverage, JS syntax, discovery metadata and media manifest.
- Repository release_gate.py includes this project's check.py; run before publication and archive closeout.

## Limits
This is a desktop/landscape presentation. A portrait phone scales the complete slide and is not a full-size worksheet editor.
No claim of testing every OS, screen reader or GPU. Fullscreen depends on browser permission. Clipboard success was tested; permission-denied selection fallback was code-reviewed, not forced in the browser.
No live model calls or factual audio analysis are added. Search/AI discovery structure validation is not proof of indexing, ranking or citation.

Production URL, exact commit and archive closeout are recorded after successful deployment in the CQI record.

## Verified public release
Runtime commit: 13f08e2a6a504ba47098b0c183d0d6f4c1323fab. Vercel READY: dpl_B8ae5cUJda1C48ancEZtoWNbndu8 at 2026-09-20T23:04:39.732Z.
Existing public URL confirms 30 scenes and 32 fields. Eight runtime/media resources are HTTP 200 and byte-identical (release-verification.json).
The archive export preserves all 56 existing bodies and updates only sound-design-lab metadata. No Work-menu change.
Skill repository push failed with HTTP 500; exact CQI record and change are preserved in body-archive-pending.json for recovery. Public catalog publication is independent.
