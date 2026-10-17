# DeepSwell — Design Spec

Date: 2026-10-17 · Status: draft for owner review

A polished browser 3D game for **Year 9–10 Marine & Aquaculture Technology** (NSW Stage 5 elective). Students surf a wave in third person; when they wipe out or finish the ride they free dive (first person) into a living marine ecosystem, where they observe, photograph and study real species and run ecosystem-health experiments. Great Barrier Reef first; NSW rocky reef/kelp, seagrass & mangroves, open ocean and deep sea follow.

## Decisions (from owner interview)

| Topic | Decision |
|---|---|
| Audience | Students in class; part of the science sim suite, linked from the hub |
| Hardware | Quality tiers: runs on school laptops, stunning on a good GPU. Keyboard + mouse primary |
| Surfing | Arcade-realistic: paddle, pop-up, carve, tube ride; fun within 30 s |
| Diving | First person free dive with breath meter, depth/pressure, equalising; teaches freediving physiology, never punishing |
| Interaction | Info cards, living behaviour, camera + species journal, ecosystem-health sim, plus extra learning mechanics (below) |
| Structure | Short missions + free roam, field journal, teacher page with QR |
| Assets | CC0/CC-BY glTF animals where good ones exist; procedural coral, kelp, terrain; Codex-generated textures |
| Stack | New repo `deepswell`, Three.js + Vite, GitHub Pages |
| Builder | Claude builds directly; Codex does max 2 adversarial review rounds per milestone |
| Milestone 1 | Surf → wipeout/finish → Great Barrier Reef dive, ~25 species, info cards, camera journal, breath meter |

Name "DeepSwell" is a working title; rename is a find-and-replace.

## Core loop

1. **Beach / lineup** (third person). Choose a break (M1: one GBR-adjacent outer-reef break — fictional, labelled as such since the GBR isn't a typical surf spot; NSW beach break added with the rocky-reef ecosystem).
2. **Surf.** Paddle into a set wave, pop up, ride: carve along the face, speed from staying in the pocket, optional tube ride when the lip throws. Score = ride length, carves, tube time.
3. **Transition.** Wipeout (fell, nosed in, caught by the lip) or kick-out at ride end → camera rolls underwater through the whitewater (bubbles, muffled audio, light shafts) and hands over to the first person diver at the surface.
4. **Dive.** Breathe up at the surface, duck-dive, explore. Breath meter, depth gauge, equalise prompt. Surface to breathe; swim back to the board to surf again.
5. **Learn.** Click/aim at life → info card; photograph → journal entry; missions give purpose; experiments change the reef.

## Learning mechanics

- **Field guide info card** (click or crosshair + E): common + scientific name, photo-mode thumbnail, size, diet, trophic level, role in ecosystem, interactions (symbioses), conservation status (IUCN), "Did you know", and NSW/AUS relevance. Pauses nothing; dive time still counts (teaches observation under breath limits), but a teacher toggle can freeze breath while cards are open.
- **Living behaviour** students can observe and log: schooling (boids), flee radius from diver, cleaner-wrasse stations, clownfish–anemone symbiosis, turtles grazing, reef shark patrols, parrotfish grazing coral (with sand puffs — bioerosion), coral polyp feeding at night (later), predator–prey chases.
- **Camera & journal**: photo quality scored (subject framing, distance, species fully visible). Journal entries unlock card details. Species dex per ecosystem with completion %.
- **Behaviour spotting**: some journal entries require photographing a behaviour (e.g. a cleaning interaction), not just the species.
- **Food-web builder**: journal species can be dragged into a food web; correct links light up and reveal energy-flow arrows.
- **Ecosystem health lab** (reef "time-lapse" panel): sliders for sea temperature, nutrient runoff, crown-of-thorns starfish, fishing pressure. Fast-forward months/years: coral bleaches (colour fades to white, then algae overgrowth), fish counts shift, cover % chart. Restore mode shows recovery. Values are simplified but directionally correct and stated as such.
- **Survey transect**: lay a tape on the seafloor, count species along it — real reef-monitoring method (Reef Check / AIMS style) — produces a data table for class.
- **Freediving physiology**: breath meter, pressure/depth readout, equalise prompt every few metres, mammalian dive reflex note, "never dive alone" safety messaging. Surfing side teaches rip currents and wave formation (swell, period, reef/sandbank breaking).
- **Missions** (3–6 per ecosystem, ~5–10 min each), e.g. "Photograph 5 herbivores", "Find the cleaning station", "Run a transect", "Explain why this coral is white", "Build a 6-link food web". Each ends with 2–3 check questions.
- **Teacher page**: QR/link per mission, settings (breath freeze, difficulty), class code-free (no accounts, no data collection), progress stored locally per device with export-to-CSV of journal/transect data.

## Ecosystem roadmap

| # | Ecosystem | Signature content | Notes |
|---|---|---|---|
| M1 | Great Barrier Reef (outer reef, 0–20 m) | Branching/table/brain/plate coral, clownfish & anemone, parrotfish, cleaner wrasse, green turtle, blacktip reef shark, giant clam, manta (rare), crown-of-thorns | Bleaching lab |
| M2 | NSW rocky reef & kelp (Illawarra) | Eastern blue groper, Port Jackson shark, weedy seadragon, crayweed/kelp, urchin barrens | Local — Woonona beach break; urchin–kelp balance lab |
| M3 | Seagrass & mangroves | Seagrass meadows, juvenile fish nursery, dugong, rays, mangrove roots | Estuary water quality lab |
| M4 | Open ocean / pelagic | Humpback whales, bait balls, sharks, mantas, plankton | Migration & plankton food web |
| M5 | Deep sea / twilight zone | Bioluminescence, vents | Via submersible (beyond freediving limits — explicitly taught) |

## Technical architecture

**Stack:** Vite + TypeScript + Three.js (pinned version), `postprocessing` (pmndrs) for bloom/DoF/god rays, no UI framework (lightweight DOM UI with CSS), Vitest for logic tests, Playwright for smoke/visual checks. Deployed to GitHub Pages via Actions.

**Module layout (`src/`):**
- `core/` — game loop, state machine (`Menu → Surf → Transition → Dive → Menu`), input (pointer lock, keys), settings & quality tiers, save (localStorage).
- `ocean/` — surface (FFT-style or summed Gerstner swell, shared by surf and dive views), breaking wave, foam, underwater fog/caustics/god rays, water-line split when camera crosses the surface.
- `surf/` — board & surfer controller, wave-riding physics (arcade), scoring, wipeout detection, third person camera.
- `dive/` — first person swimmer controller (buoyancy, fin kicks, drag), breath/pressure/equalise system, camera tool.
- `life/` — species registry (data-driven), boids schooling, behaviour state machines (wander, flee, school, clean, graze, patrol), vertex-shader swim animation for static models, instanced rendering, LOD.
- `world/` — ecosystem loader; GBR scene: procedural terrain (sand, reef slope, bommies), procedural coral generators (branching, table, brain, plate, soft coral), anemones, rubble, particulate.
- `learn/` — info cards, journal/dex, missions, food web builder, health lab, transect tool, check questions.
- `content/` — JSON per ecosystem: species (facts, behaviours, model ref, scale), missions, questions, syllabus tags. Content is data so later ecosystems are mostly content + scene work.
- `ui/` — HUD, menus, cards, journal, teacher page.

**Breaking wave approach** (hardest visual): base swell from Gerstner waves; the breaking set wave is a dedicated animated mesh — a parametric cross-section profile (rise → steepen → lip throw → curl → collapse) swept along a peel line that advances laterally, blended into the swell. Shader adds translucent lip (subsurface tint), foam from curvature/age, spray particles off the lip. Riding physics samples the same analytic profile, so visuals and physics agree. The tube is a real camera-interior space during tube rides.

**Underwater look:** exponential depth/distance fog with colour absorption (reds lost first), animated caustics projected onto the seabed and creatures, volumetric-style god rays, drifting particulate/marine snow, surface viewed from below (Snell's window), bloom, subtle chromatic softness, muffled audio with bubbles and reef crackle (snapping shrimp).

**Performance & tiers:** Low (school laptops: no god rays, fewer instances, lower res, simpler wave), Medium, High, Ultra. Auto-detect on first launch with a manual override. Targets: 60 fps High on a mid GPU; ≥30 fps Low on an Intel-iGPU school laptop. Instancing for coral and schools; frustum + distance culling; texture budgets; models in compressed glTF (Draco/Meshopt + KTX2).

**Assets & licensing:** each third-party model/texture recorded in `ASSETS.md` (source, author, licence, attribution). Only CC0 or CC-BY. Codex image generation for textures (coral surface detail, sand normal maps, caustics) per owner's standing OK.

## Milestone 1 scope (playable)

- Title screen, settings, quality tiers.
- One surf break: paddle, pop-up, ride, carve, tube, wipeout, kick-out, score.
- Transition into the water; first person dive with breath, depth, equalise; surface breathing; back to board.
- GBR scene ~120 × 120 m playable area, 0–20 m depth, with ~25 species (mix of fish, invertebrates, reptile, shark, coral types as journal entries).
- Info cards, camera + journal/dex, 3 missions with check questions, bleaching health lab (basic).
- Teacher page with mission links/QR.
- Ships to GitHub Pages after owner OK (new public repo is outward-facing — ask first).

Out of M1: food-web builder, transect tool, other ecosystems, night dives, audio polish beyond basics (all M2+).

## Quality & testing

- Visual bar per [[realistic-3d-polish]]: organic shapes, rich materials, fog/DoF, no primitive/toy look. Every scene reviewed with browser screenshots on Low and High before commit.
- Unit tests (Vitest): breath/pressure maths, scoring, boids rules, mission state, health-lab model, content schema validation (every species has all card fields + licence).
- Smoke test (Playwright): loads, each state reachable, no console errors, journal entry recorded.
- Science accuracy: every species fact sourced (AIMS, GBRMPA, Australian Museum, IUCN); sources stored in content JSON. Codex review pass includes a science-accuracy check.
- Accessibility: remappable keys, subtitles for audio cues, colour-safe UI, reduced-motion option (calmer camera), pause anytime.

## Open items to confirm later (not blocking M1)

- Exact Marine & Aquaculture Technology syllabus module codes for tagging (owner to point to the syllabus doc or the module the class is on).
- Whether the class uses Chromebooks or Windows laptops (sets Low-tier target device).
