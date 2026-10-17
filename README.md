# DeepSwell

Surf a wave, wipe out (or kick out), then freedive into living marine ecosystems. A browser 3D game for NSW Year 9–10 **Marine & Aquaculture Technology**.

**Sites:** Great Barrier Reef (outer reef break) · NSW rocky reef & kelp (Illawarra beach break) · Seagrass & mangroves (Moreton Bay) · Open ocean (NSW shelf edge) · Deep sea (Tasmanian seamount, by submersible).

Each site has 17–26 species with field-guide cards, an underwater camera + journal, five missions with check questions, and an ecosystem lab (coral bleaching, urchin barrens, seagrass light, plankton food chain, seamount trawling).

## Run locally

No build step — plain ES modules with a vendored Three.js r169.

```bash
python3 devserver.py 8450
```

Open http://localhost:8450 (teacher links and QR codes: `/teacher.html`).

## Controls

- **Surf:** hold W to paddle, Space to pop up, A/D to drop/climb the face, W to pump, S to crouch in the barrel, E to kick out.
- **Dive:** mouse to look (or drag if mouse capture is blocked), WASD swim, Space/C up/down, Shift strong kicks, Q equalise, F camera, click for info, J journal, M missions, L lab, E board/boat, P pause.

## Tests

```bash
npm test                                   # physics, ecosystem models, content completeness
URL=http://localhost:8450/ node tests/playtest/full.mjs      # scripted real-Chrome play session (screenshots)
URL=http://localhost:8450/ node tests/playtest/allecos.mjs   # every site: photos, labs, missions
```

The play-test harness borrows Playwright from a sibling repo (set `PLAYWRIGHT_PATH` otherwise) and uses installed Google Chrome.

## Notes

- All models and textures are procedural (no third-party assets). Species facts are sourced on each card; lab models are simplified teaching models.
- Progress stays on the device (localStorage); students can export a CSV of journal, missions and lab runs.
- Reviews: `docs/reviews/` (Codex adversarial reviews and responses).
