**The smoke test proves loading, not ecological correctness or ordinary playability.** Its photo loop teleports the diver beside animals. All 19 current tests pass, including the uncommitted lab tests; several defects below remain untested. References target **710e5d7**, separating later working-tree edits. The two missing rocky screenshots weren’t assessable.

**Top 10 fixes, ranked by impact**

1. **Wire up E for sites without surf.** `src/main.js:215` only calls `tryBoard()` when `eco.surf` exists. The sub’s return-to-ship branch is therefore unreachable; seagrass/pelagic “boat” controls also do nothing. **Repro:** launch deep, press E. **Fix:** dispatch E for every dive site.

2. **Remove hidden habitat from picking, photography and collisions.** `src/world/reef.js:106–110` hides instances but preserves `picks` and the collision grid; `src/world/world.js:83–94` continues using them. **Repro:** destroy coral/seagrass through a lab, then photograph or swim through a removed colony. Invisible habitat remains interactive. **Fix:** give placements shared visibility state and filter every consumer.

3. **Ground-check deep fish homes and school targets.** `src/life/life.js:138` accepts fixed Y without checking terrain; deep roughy use −612 m (`src/ecosystems/deep.js:93`). A deterministic placement probe produced **70/70 roughy underground**. Seabed avoidance subsequently fights their buried home targets. **Fix:** validate spawn, home and steering targets against local terrain and body clearance.

4. **Make abundance changes affect the named organisms.** `src/life/life.js:702` skips static agents and agents without `kind`. Rocky’s predator reduction therefore leaves **rock lobsters unchanged**; seagrass’s nursery reduction leaves **seahorses unchanged** (`rocky.js:185`, `seagrass.js:155`). **Repro:** run maximum fishing/pollution and count them. **Fix:** support static instances and rigs explicitly.

5. **Exclude invisible animals from ecological interactions.** Visibility only shrinks rendering (`life.js:265`); hidden agents still update, flock and hunt (`:285`, `:469`, `:564`). **Repro:** reduce pelagic predators using the lab; invisible hunters still repel sardines. **Fix:** deactivate removed agents consistently across steering and neighbour queries.

6. **Let common dolphins breathe.** `src/ecosystems/pelagic.js:57` assigns them `hunter`; that path never enters the breathing state machine, and the surface constraint keeps them underwater. **Repro:** observe indefinitely. **Fix:** compose hunting with an air-breathing cycle rather than making behaviours mutually exclusive.

7. **Correct false photographic behaviour awards.** `src/life/life.js:471` marks **prey sardines** as hunting; `src/learn/photo.js:46` awards that behaviour. Conversely, baitball sardines never receive “schooling” (`photo.js:42`). **Fix:** distinguish predator attack, prey escape and schooling.

8. **Make lab scenes represent their reported state.** Rocky `apply()` removes kelp globally, but never expands the pink barren substrate or redistributes urchins beyond the pre-existing patch (`rocky.js:44`, `:142`, `:180`). Seagrass never renders its calculated epiphytes. **Fix:** apply spatial habitat changes and visible leaf fouling, not merely instance thinning.

9. **Implement the advertised light switch.** `src/content/deep.js:568` tells players to switch sub lights off; `src/main.js:243–255` provides no toggle. **Fix:** add a control and visible state, then test the living-light mission with lamps off.

10. **Clear vehicle lighting when changing sites.** At this commit, lights are removed only by `setupVehicle()` during dive entry. **Repro:** dive deep → quit → select GBR: sub lights persist in the GBR title scene until another dive starts. **Fix:** reset vehicle state on site/menu transitions. The working-tree `enterMenu()` addition already addresses this lighting leak.

**Science and assessment**

- **Kelp — `labs.js:16–26`:** the explanation promises persistent barrens, but barren cover is recalculated algebraically and each run restarts healthy. There is no experiment continuing a damaged reef through restoration, nor explicit collapse/recovery thresholds. Real hysteresis matters here. Add resumable state and distinct transition thresholds, or soften the claim. [IMAS research](https://www.imas.utas.edu.au/__data/assets/pdf_file/0005/1141709/Marzloff_Towards-Ecosystem-Based-Management-2012.pdf)

- **Seagrass — `labs.js:38–45`:** “flood” adds four months of shading only: no nutrient pulse, burial or salinity effect. Dugong **condition** becomes animal disappearance in `apply()`, while turtles remain unchanged despite the mission’s food-chain explanation (`content/seagrass.js:642`). Label the mechanism narrowly and separate condition, movement and abundance.

- **Pelagic — `labs.js:60–64`:** independently normalised abundance indices cannot demonstrate energy-transfer efficiency or relative trophic biomass. Yet the mission explanation invokes approximately 10% transfer (`content/pelagic.js:629`). Keep that conceptual explanation separate from graph evidence; label the axes “relative index,” not percentages implying comparable quantities.

- **Deep — `labs.js:77–78`:** fractional-cover growth does not encode millimetres of skeletal extension; unstructured logistic fish growth does not encode late maturity. Those are illustrative assumptions, not mechanisms demonstrated by the simulation. Orange roughy maturity really is around 27–32 years. [AFMA](https://www.afma.gov.au/species/orange-roughy)

All four mission checks accept a **single threshold-crossing run**. Deep explicitly asks for a comparison, but checks no control run. Explanations are input-conditioned scripts, not interpretations of observed results.

**Screenshot problems, ranked**

1. **Deep seamount:** the white hotspot destroys terrain detail; darkness elsewhere supplies little navigation.
2. **Pelagic:** obvious rectangular light-shaft strips look like luminous pillars.
3. **HUD:** duplicate ear-pain warnings, onboarding and photo controls compete with the subject.
4. **Rocky after lab:** sparse aquarium-like tubes over rippled ground communicate habitat deletion more clearly than an urchin barren.
5. **Seagrass:** angular ribbon blades and exposed, uniformly textured sand weaken the meadow impression.

The orange debug box is diagnostic evidence, not a production-art defect.
