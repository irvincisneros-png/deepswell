**Round 2 verdict: meaningful fixes, but the world still looks visibly procedural, and surfing sometimes hides the player entirely. Prioritise visibility, photography and clear feedback before adding sites.**

Evidence: inspected the report, commit, current code, 14 screenshots and log; `npm test` passes **15/15**. The supplied session reports no console errors. It does **not** demonstrate successful unassisted deep diving, blackout recovery or board return: “deep-swim” stops at 2.8 m, photographs use teleportation, “after-blackout” retains 6% reserve, and E is rejected underwater. I’m discounting the headless pointer-lock overlay as requested.

**1. Round-1 fixes: what actually changed**

| Status | Findings |
|---|---|
| **Fixed in code** | Overlapping lab runs: generation token plus captured run inputs (`panels.js:231–245`). Negative-Z ocean cutout: independent enable uniform (`water.js:83`). Camera FOV/crosshair teardown and stale blackout callbacks: central reset paths (`main.js:138–180`, `292`). Unsupported photo subjects filtered (`main.js:304`). Ear warnings reset on spawn/surfacing (`diver.js:29`, `92`). |
| **Fixed in code** | Reading pauses breath by default; optional countdown now dispatches warnings/blackout. Blackout suspends swimming (`main.js:461–484`). Pumping supports holding W; voluntary E kick-out, lip warning/grace period and reachable flats exit added (`surfSession.js:147–188`). |
| **Fixed in code** | Non-symbiotic sea fans/sponges excluded from bleaching; feeding groups derived from cards; cleaner-wrasse citation corrected. Quiz threshold/retries/review, higher surf objective threshold, journal Back, mission/lab CSV rows, labelled lab sliders and retained lab state added. Teacher-link wording now accurately promises highlighting rather than automatic entry. |
| **Partial** | Keyboard default handling and initial/return focus improved, **no modal focus trap** (`panels.js:19`). Drag-look added, but photography/info still require pointer lock. Cleaning no longer credits unrelated foreground fish, but still lacks evidence that both interaction participants are visible. Graph scaling/time labels fixed, but starfish index still shares a **percentage axis**. |
| **Still outstanding** | Realistic surfer/animals, convincing water/reef materials, grounded lighting, light-shaft artefacts, exploration landmarks, diet/abundance observations and school-device performance evidence. CSV still omits individual quiz answers. Low quality still reduces ecological populations. COTS certainty remains in lab explanation. |

First-wave protection is implemented, and this run achieves a 13.2-second ride. That supports improvement, not a measured novice success rate.

**2. Ranked play critique**

1. **“Where’s my surfer?”** Screenshot 3 shows almost nothing except the wave, despite active scoring. This breaks the central action loop: the player cannot judge position, turns or danger. Bigger problem than character detail.
2. **“That coral is broken.”** Turtle/chromis shots expose black wedges and sliced-looking plates. Branching coral resembles bundles of tubes; sand resembles embossed carpet. These artefacts overwhelm the attractive colour palette.
3. **“I photographed the fish—why did I get coral?”** The log confirms chromis → table coral and blue tang → staghorn. A small centred fish loses to a large colony. Collection feels arbitrary.
4. **“Why does Q keep failing when the screen tells me to press Q?”** Persistent central equalisation text contradicts the refusal toast. Duplicate refusals occupy both notification slots. This reads as a broken control.
5. **“What am I looking for?”** Large stretches of repeated seabed lack memorable destinations. The turtle and manta provide the strongest moments; build exploration around encounters like those.
6. **“Did the experiment change anything?”** The lab panel is readable, but the resulting reef barely communicates the dramatic cover loss. At Year 3, low bleaching can legitimately accompany substantial mortality; the screenshot filename “bleached reef” confuses that distinction.
7. **“Too much homework on screen.”** Scientific-name notifications, equalisation prompts and two rows of controls compete with animals. The journal’s collection grid is appealing; its tiny, distant subjects make poor trophies.

**3. New regressions and newly exposed defects**

- **Introduced: incomplete drag fallback.** `input.js:24–35` permits drag-look, but `main.js:469` discards clicks unless locked; hover also requires lock. Pointer-lock denial still prevents core interactions.
- **Introduced: lab inputs/results can disagree.** Moving sliders changes explanation immediately while the retained chart/world still represents the previous run (`panels.js:195–202`, `228–245`). Capturing run inputs fixes export consistency, not displayed consistency.
- **Introduced science wording error:** `content/gbr.js:845` now describes DHW as heat *above the bleaching threshold*. It accumulates qualifying anomalies above **MMM**, with ≥1°C determining inclusion. The numerical six-week function remains consistent with that distinction. [NOAA definition](https://www.coralreefwatch.noaa.gov/product/5km/tutorial/crw10a_dhw_product.php).
- **Unresolved science overclaim:** `reefModel.js:69` still calls runoff a trigger for outbreaks; the revised quiz is more cautious. The nutrient contribution remains unresolved. [Reef Authority](https://outlookreport.gbrmpa.gov.au/threats-responses-and-risks/6-factors-influencing-regions-values/65-land-based-runoff/652-vulnerability-ecosystem-land-based-runoff).

**4. Highest-value remaining changes**

1. `src/surf/surfSession.js:240`: constrain camera-to-rider sightlines against the actual wave mesh; reposition above/toward the open face when occluded.
2. `src/world/coral.js:158`: plate top triangles wind downward, underside upward. Reverse winding; validate normals before material tuning.
3. `src/learn/photo.js:21`: prioritise a tight centre aim cone, ray-test obstruction, then rank size; outline the selected subject.
4. `index.html:86`, `src/main.js:518`: make equalisation instructions state-dependent; deduplicate refusals and show ascent progress.
5. `src/ui/panels.js:195`: separate draft controls from applied results, label pending changes, and offer matched before/after reef views.
