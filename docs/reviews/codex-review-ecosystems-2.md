**Improved, but not finished.** I reran tests: **19/19 pass**. Reviewed `3da271f`; excluded the later uncommitted shaft/fin edits. Console cleanliness does not establish ecological correctness.

Paths below are relative to `src/`.

| Round-1 fix | Verdict | Evidence |
|---|---|---|
| 1. E at non-surf sites | **Fixed** | `main.js:216` dispatches every site; boat/sub branches reachable at `:278`. |
| 2. Hidden habitat interaction | **Fixed** for picking/photos/collisions | Shared hidden flag: `world/reef.js:113`; consumers filter it at `world/world.js:58,83,94`. |
| 3. Ground-checked animals | **Partial** | Homes/spawns clamped at `life/life.js:155–158`; school targets remain unchecked at `:603`. Seeded probe: **0/70 buried homes/spawns, 10/70 buried targets**. |
| 4. Static/rig abundance | **Fixed** | `life/life.js:716–726` now handles lobsters, seahorses and rigs. |
| 5. Invisible ecological actors | **Partial** | Hunters/flock neighbours filtered at `life/life.js:475,581`; hidden static/rig agents bypass the guard at `:293–301`. Cleaning clients still unfiltered at `:620`. |
| 6. Dolphin breathing | **Fixed** | Breathing cycle composed into hunting at `life/life.js:485–492`; surface permission at `:409`. |
| 7. Behaviour awards | **Fixed** | Sardines now escape instead of hunt: `life/life.js:477`; baitball schooling recognised at `learn/photo.js:42`. |
| 8. Scenes reflect lab results | **Partial** | Substrate spread added, but urchin visibility overwritten: `ecosystems/rocky.js:204–207`. Kelp still thins globally rather than clearing the expanding patch (`:190`). Epiphytes tint blades at `ecosystems/seagrass.js:161`. |
| 9. Sub light switch | **Fixed** | T toggles lights at `main.js:217`; HUD advertises it at `:192`. |
| 10. Lighting across sites | **Fixed** | Menu calls vehicle setup at `main.js:127`; previous lamps removed at `:246`. |

**Science points**

- **Kelp — fixed conceptually:** stateful barren feedback and distinct thresholds now exist (`learn/labs.js:18–28`), with continuation (`ui/panels.js:237`). This captures the qualitative [hysteresis mechanism](https://www.nature.com/articles/s41467-023-44543-x); thresholds remain illustrative.
- **Seagrass — partial:** floods now add nutrients and shading (`learn/labs.js:40–43`); turtles respond. Dugong **condition** remains disconnected from rendered abundance, which instead follows immediate food cover (`ecosystems/seagrass.js:157–159`).
- **Pelagic — partial:** explicit independent-index caveat added (`ecosystems/pelagic.js:107`), but percentage axis/readouts remain (`ui/panels.js:212`; `ecosystems/pelagic.js:120`). Energy-transfer efficiency is still not demonstrated.
- **Deep — not fixed:** fractional-cover/logistic equations still encode neither skeletal extension nor age at maturity (`learn/labs.js:80–81`). Actual roughy maturity is [27–32 years](https://australian.museum/learn/animals/fishes/orange-roughy-hoplostethus-atlanticus-collett-1889/).
- **Assessment — not fixed:** single-run thresholds still award completion (`ecosystems/{rocky,seagrass,pelagic,deep}.js:188,152,127,163`); explanations remain input scripts (`ui/panels.js:200`).

**New regressions introduced**

- Rocky’s final abundance call restores **every urchin**, including outside the barren. Confirmed by targeted probe (`ecosystems/rocky.js:207`).
- Continuation restarts event clocks: protection incurs another year’s trawling; floods replay (`learn/labs.js:40,79`). Protected coral: **34.2% after ten continuous years versus 16.3% after 5+5**.
- Ear-pain toast suppression never resets: later dives lose that explanatory warning (`main.js:603`).

**Five highest-value remaining issues, ranked**

1. Fix rocky visibility composition and clear kelp spatially with barren expansion.
2. Preserve elapsed time and event history across continued runs.
3. Ground-check steering targets using body clearance, including slope crossings.
4. Require paired control/treatment evidence for comparison missions.
5. Fix visual readability: pelagic light pillars persist; deep title remains mostly black; photo subjects compete with central prompts and bottom HUD. The supplied screenshots still show these failures.
