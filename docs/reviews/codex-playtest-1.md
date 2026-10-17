[Read the full six-part report](</Users/irvincisneros/Documents/Local Projects/Science Simulator Website/deepswell/tests/playtest/codex/REPORT.md>), including repro steps, file:line citations, ranked visual fixes and the top 10 priorities.

**Verdict:** promising teaching prototype; substantially below the requested realism bar.

Key findings:

- Tab navigation is blocked globally.
- Reading cards can exhaust breath without triggering blackout until closed.
- Repeated lab runs create competing animation loops.
- Cleaning evidence can be attributed to an unrelated fish.
- All-wrong quizzes still mark missions complete.
- The lab misplots bleaching and applies it to non-photosymbiotic sea fans.

**Testing limitation:** Chrome aborted in the sandbox for both quality tiers. I inspected all four existing screenshots and ran source-level behavioural probes; live play and FPS remain unverified. Existing tests passed **11/11**.

I added files only under `tests/playtest/codex/`; I did not edit game source.
