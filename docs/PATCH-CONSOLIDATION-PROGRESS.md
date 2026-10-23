# Execution ledger — 2026-10-23-TD2-Konsolidierter-Patchplan.md
Base: 38e17b5447d4e31edf931ba4febc7c46a96ff42f; isolated fresh checkout on feature/td2-consolidation-resume-20261024.
Ruling: use fresh dedicated clone instead of nested worktree; equivalent isolation, no shared checkout changed.
Ruling: branch date follows actual execution date, 24 October. PR #56 now includes preview preservation/tests before Pages publishing; preserve those changes.
Pre-flight: Task 2 serialize/deserialize feeds Task 3 storage; Task 3 runtime files feed Task 4 dist copies; compatible contracts.
Task 0: baseline tests started; see test results below.
Task 0: complete — baseline Ansturm 25/25 and all tests/*.test.cjs passed.
Task 1: complete — no-portals test RED→GREEN, menu regressions and 25/25 Ansturm tests pass. Four files remain archived but are no longer loaded.
Task 2: snapshot tests failed on missing module before implementation; roundtrip and validation implemented. Future RNG is injected; cosmetics intentionally discarded as planned.
Task 2: complete — 19 snapshot tests and 44/44 total Ansturm tests pass.
Task 3: complete — 4 storage + 6 real-handler flow tests RED→GREEN; 54/54 Ansturm tests pass. New saves restore paused, invalid data gets a message, buys/background/menu return checkpoint, defeat clears run only.
Task 4: parity test initially RED on stale app.js; copies synchronized.
Final review: independent reviewer found malformed-save spawn budget and preview retention issues.
Final: fixed malformed spawn budget — regression RED→GREEN; schema v1 refuses wave >1000, oversized raw payloads and impossible spawn clocks. Ruling: >1000 cannot be resumed with v1; a legitimate longer run needs a future schema. Existing gameplay values remain unchanged.
Final: fixed preview preservation in branch Pages workflow — regression RED→GREEN. Ruling: actual main workflow stays unchanged until separately authorized merge; preview can still be removed by an old root publisher before then. This is a temporary preview, not a durable production URL.
Final: minor (deferred): preview copy retains obsolete files; no deletions in this patch, archived gates no longer loaded. Future asset deletion must clean only the dedicated target.
Task 4: full local JavaScript suite, 55 Ansturm tests, TEST_MOBILE=1 and Python assets checks pass. Independent reviewer completed before final fixes; fixes verified by targeted failing tests and full green suite.
Task 5: local Cloud Browser connection refused (separate environment); remote visual smoke pending. Real Android/15-minute performance test remains open.
