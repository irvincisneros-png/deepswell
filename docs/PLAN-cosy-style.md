# Cosy art style rollout

Goal: a soft, cosy "diorama" look (reference: *I Just Wanted to Fish*), with species shapes and markings still
accurate, that runs well on school laptops. The realistic look stays available in Settings.

## Decisions
- Style: rounded, chunky shapes; matte pastel palette; soft light with gentle shading; thin ink outlines on
  animals, coral and props (not water); bright, clear shallows; crisp two-tone clouds.
- Fish: one cosy fish builder in code (`src/life/fishModel.js`) restyles every species at once
  (rounder bodies, thick soft fins, big glossy eyes). Species markings keep using the existing paint functions.
- Corals, rocks, plants: hand-shaped model sets built by Blender Python scripts (`tools/blender/`), one `.glb`
  per site in `assets/models/`, mapped to the site's generators via `eco.cosyModels`.
- Blender runs headless from the command line (no MCP needed): `blender --background --factory-startup --python <script> -- <out.glb> [preview.png]`.
- Every model set gets a Blender review render and in-game gallery screenshots before it is used.
- Performance budget: low tier must stay at or below the original game's frame time (see `tests/playtest/bench.mjs`).

## Status
- [x] Stylised lighting (soft), colour grade, toon clouds, banded water with crisp foam
- [x] Cosy fish builder for all species (rounder bodies, thick soft fins, big eyes with a highlight)
- [x] Thin ink outlines on silhouettes, faded by fog; water excluded (no depth write in the cosy look)
- [x] Blender sets for GBR, rocky reef, seagrass, deep sea (`tools/blender/build_sets.py`, shared `cosylib.py`), with `_lo` versions
- [x] Small creatures: anemone, crown-of-thorns, prickly redfish (GBR); long-spined urchin, abalone, cunjevoi (rocky reef)
- [x] More creatures: weedy seadragon, octopus, rock lobster (rocky); seahorse, blue swimmer / mud / soldier crabs, sea hare, blubber jelly (seagrass); bluebottle, salps, moon jelly (pelagic); vampire squid, atolla, siphonophore, comb jelly, giant isopod, brittle star (deep); beach ghost crab and Waratah anemone (`tools/blender/creatures.py`)
- [x] Cosy turtle eyes; round spots on the whitespotted eagle ray; ray textures at 512 px
- [x] Outline fixes: live fog/underwater values in the post pass; water surface blocks outlines while underwater
- [x] Cosy is the default; Settings > Graphics style switches to Realistic (`?style=realistic` also works)
- [x] Performance: low tier GBR 5.8 ms (was 7.2 ms in the original), ultra GBR 13.6 ms (was 21.6 ms)

## How to rebuild models
    "D:/Applications/blender.exe" --background --factory-startup --python tools/blender/build_sets.py -- all
Writes `assets/models/<site>_cosy.glb` and review renders `playtest-shots/blender-<site>.png`.
Edit colours/shapes in `build_sets.py` (per site) or `cosylib.py` (shared shape builders) and rerun.

## Next ideas
- Simple animation clips (crab scuttle/burrow, bird hops and take-off, octopus arm curl) via Blender rigs + three.js AnimationMixer.
- Cosy remodels of the larger rigs (turtle body, giant clam) and marine mammals.
- Painted (baked) textures for richer surfaces; per-site colour grading.
- Pelagic site has no habitat models (open water) — fish and jellies carry it.
