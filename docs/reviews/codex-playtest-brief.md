You are an expert game designer, marine-biology teacher and adversarial QA tester. Play-test DeepSwell, a browser 3D game in this repo
(surf a reef wave in third person, then wipe out/kick out and freedive first-person on the Great Barrier Reef; photograph species,
read field-guide cards, do missions, run a reef-health lab). Audience: Year 9–10 NSW Marine & Aquaculture Technology students on school laptops.
The owner wants polished, realistic-looking 3D (molecular-animation / AAA-documentary quality), not primitive geometry.

HOW TO PLAY IT: a dev server is already running at http://localhost:8451/ . A Playwright harness drives real Chrome with real keyboard input:
  tests/playtest/harness.mjs  (read it: launch(), shot(name), hold(code,ms), tap(code), state(), look(yaw,pitch), clickView(button), click(selector))
  tests/playtest/example.mjs  (example: surfs one wave)
Run scenarios with:  URL=http://localhost:8451/ OUT=... node your-script.mjs   (write your scripts under tests/playtest/codex/ and screenshots go to playtest-shots/codex/ — set outDir).
Also try ?quality=low and ?quality=high. Controls are in README/How-to-play (W paddle/pump, A/D steer, Space pop-up, S crouch; dive: WASD, Space/C up/down, Shift, Q equalise, F camera, click info, J journal, M missions, L lab, E board, P pause).
window.__game exposes internals for probing (e.g. __game.advance(seconds) steps the sim deterministically).

PLAY AT LEAST: (1) several surf attempts as a novice would (including mistimed pop-ups, being too slow, crouching in the barrel),
(2) a full dive: duck-dive, descend past 10 m, ignore equalising, run low on O2 / black out, surface, swim to the board and press E,
(3) photograph 5+ fish species and a cleaning interaction, open cards, journal, missions + quiz, (4) the reef health lab, (5) menu/teacher.html.
Look at every screenshot you take.

If you cannot launch the browser (sandbox), say so explicitly, then do the best static review you can from the code and the existing screenshots in playtest-shots/.

REPORT (markdown, be blunt and specific, cite file:line):
1. Bugs/crashes/softlocks (with repro).
2. Fun & game-feel problems (surf physics, controls, camera, pacing, difficulty for a 14-year-old).
3. Visual quality gaps vs the realism bar — ranked, with concrete technical fixes.
4. Science accuracy errors or misleading simplifications (content in src/content/gbr.js, src/learn/reefModel.js, diver physiology).
5. Teaching/UX problems (clarity, onboarding, accessibility, low-end performance).
6. Top 10 prioritised fixes.
Do NOT edit game source files; only add files under tests/playtest/codex/ and playtest-shots/codex/.
