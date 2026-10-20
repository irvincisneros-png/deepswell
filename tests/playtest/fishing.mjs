// Fishing, jet ski and crown-of-thorns play-test.
import { launch } from './harness.mjs';
const t = await launch({ query: 'eco=rocky&quality=ultra', outDir: 'playtest-shots/fishing', width: 1280, height: 720 });
const log = [];
const fs = () => t.page.evaluate(() => { const f = window.__game.fishing; return { state: f.state, tension: +f.tension.toFixed(2), dist: +f.dist.toFixed(1), running: f.fight?.running }; });
await t.click('#btn-beach'); await t.wait(1200);
// Stand at the water's edge facing the sea.
await t.page.evaluate(() => { const g = window.__game, w = g.walker; w.pos.set(0, g.world.groundAt(0, 90), 90); w.yaw = 0; w.pitch = -0.05; });
await t.wait(300);
for (let round = 0; round < 2; round++) {
  await t.tap('KeyR'); await t.wait(300);
  if ((await fs()).state === 'off') await t.tap('KeyR');
  await t.page.keyboard.down(' '); await t.wait(900); await t.page.keyboard.up(' ');
  await t.wait(1200); if (round === 0) await t.shot('float-out');
  // Wait for the bite, then strike.
  for (let i = 0; i < 120; i++) { const s = await fs(); if (s.state === 'bite') { await t.tap('Space'); break; } await t.wait(120); }
  await t.wait(300); if (round === 0) await t.shot('fight');
  for (let i = 0; i < 400; i++) {
    const s = await fs(); if (s.state !== 'fight') break;
    if (!s.running && s.tension < 0.7) await t.hold('Space', 150); else await t.wait(150);
  }
  await t.wait(400); const end = await fs(); log.push(['round', round, end.state]);
  if (end.state === 'landed') {
    await t.shot('landed');
    const legal = await t.page.evaluate(() => document.querySelector('#modal')?.innerText.slice(0, 120));
    log.push(legal);
    await t.page.click('#fx-release'); await t.wait(400);
  }
  await t.tap('KeyR'); await t.wait(300);
}
log.push(['catches', await t.page.evaluate(() => (window.__game.progress.catches ?? []).map(c => `${c.id} ${c.length} kept:${c.kept} ok:${c.correct}`))]);
// Jet ski
await t.page.evaluate(() => { const g = window.__game, w = g.walker, j = g.jetski; w.pos.set(j.pos.x, g.world.groundAt(j.pos.x, j.pos.z + 2), j.pos.z + 2); });
await t.wait(200); await t.tap('KeyE'); await t.wait(600);
log.push(['mode', await t.page.evaluate(() => window.__game.mode)]);
await t.hold('KeyW', 2500); await t.shot('jetski-ride');
await t.hold('KeyA', 800); await t.hold('KeyW', 1500); await t.shot('jetski-turn');
await t.hold('KeyS', 2500); await t.tap('KeyR'); await t.wait(500); await t.shot('jetski-fish');
log.push(['jetski', await t.page.evaluate(() => ({ mode: window.__game.mode, fishing: window.__game.fishing.state, spot: window.__game.fishing.spot }))]);
console.log(JSON.stringify(log), 'errors', t.errors.length, t.errors.slice(0, 3).map(s => s.slice(0, 300)));
await t.close();

// Crown-of-thorns cull at the GBR
const u = await launch({ query: 'eco=gbr&quality=ultra', outDir: 'playtest-shots/fishing', width: 1280, height: 720 });
await u.click('#btn-dive'); await u.wait(1200);
for (let k = 0; k < 2; k++) {
  await u.page.evaluate(() => {
    const g = window.__game, d = g.diver, c = g.world.life.agents.find(a => a.id === 'cots' && a.visible !== false && !a.culled);
    d.pos.copy(c.pos).add(new c.pos.constructor(0.9, 0.6, 0.9)); d.vel.set(0, 0, 0);
    const v = c.pos.clone().sub(d.pos); d.yaw = Math.atan2(-v.x, -v.z); d.pitch = Math.atan2(v.y, Math.hypot(v.x, v.z));
  });
  await u.wait(300); if (k === 0) await u.shot('cots-before');
  await u.tap('KeyG'); await u.wait(1500);
}
console.log('culls', await u.page.evaluate(() => window.__game.progress.culls), 'errors', u.errors.length, u.errors.slice(0, 3).map(s => s.slice(0, 300)));
await u.close();
