// Full play session: novice + good surfing, dive with mistakes, photos, cards, missions, lab. Writes shots + a JSON log.
import { launch } from './harness.mjs';
import { writeFileSync } from 'node:fs';

const outDir = process.env.OUT ?? 'playtest-shots/full';
const t = await launch({ query: process.env.Q ?? '', outDir });
const log = [];
const note = async (label) => { const s = await t.state(); log.push({ label, ...s }); return s; };
await t.shot('menu');

// ---- Surf 1: novice — pops up too early
await t.click('#btn-surf'); await t.wait(1200); await t.shot('lineup');
for (let i = 0; i < 300; i++) { const s = await t.state(); if (/Paddle!/.test(s.prompt)) { await t.tap('Space'); await t.wait(300); await note('novice-early-popup'); break; } await t.wait(150); }
await t.shot('novice-early');
// ---- keep trying: proper technique
let rode = false;
for (let i = 0; i < 600; i++) {
  const s = await t.state();
  if (s.surf?.state === 'ride') { rode = true; break; }
  if (s.mode !== 'surf') break;
  if (/POP UP/.test(s.prompt)) { await t.tap('Space'); continue; }
  if (/Paddle/.test(s.prompt)) await t.hold('KeyW', 150); else await t.wait(150);
}
await note('after-catch-attempts');
await t.shot('pop-up');
let shots = 0;
for (let i = 0; i < 120 && rode; i++) {
  const s = await t.state();
  if (s.surf?.state !== 'ride') break;
  const r = s.surf.ride;
  if (r.ft > 0.75) await t.hold('KeyA', 180); else if (r.ft < 0.3) await t.hold('KeyD', 180); else await t.hold(i % 3 ? 'KeyW' : 'KeyS', 180);
  if (i % 8 === 0 && shots < 6) { shots++; await t.shot('ride'); }
}
await note('ride-ended'); await t.wait(2500); await t.shot('ride-result');
await t.page.evaluate(() => window.__game.panels.close());
await t.wait(500); await t.shot('underwater-after-ride');

// ---- Dive: duck-dive, descend without equalising, then equalise, go deep, run low on O2
await t.look(0, -1.2);
await t.hold('KeyW', 3000); await note('after-duckdive'); await t.shot('duck-dive');
await t.hold('KeyC', 2500); await note('descend-no-eq'); await t.shot('ears');
for (let i = 0; i < 6; i++) { await t.tap('KeyQ'); await t.hold('KeyC', 800); }
await note('equalised-descent'); await t.shot('deeper');
// swim seaward to the slope and go past 10 m
await t.page.evaluate(() => { const d = window.__game.diver; d.yaw = 0; d.pitch = -0.5; });
for (let i = 0; i < 12; i++) { await t.tap('KeyQ'); await t.hold('KeyW', 900); }
await note('deep-swim'); await t.shot('deep');
// photograph things: aim at nearest visible fish of several species
await t.tap('KeyF'); await t.wait(300);
for (const id of ['trevally', 'reefshark', 'turtle', 'parrotfish', 'coraltrout', 'chromis', 'bluetang', 'butterflyfish', 'manta', 'cleanerwrasse']) {
  await t.page.evaluate((id) => {
    const g = window.__game, d = g.diver;
    const a = g.world.life.agents.filter(a => a.id === id && a.visible !== false).sort((p, q) => p.pos.distanceTo(d.pos) - q.pos.distanceTo(d.pos))[0];
    if (!a) return;
    // teleport near it (simulates swimming there) and aim
    const off = a.dir.clone().multiplyScalar(-1).setY(0.2).normalize().multiplyScalar(Math.max(1.2, a.kind?.length * 2.5 || 1.5));
    d.pos.copy(a.pos).add(off); d.vel.set(0, 0, 0);
    const v = a.pos.clone().sub(d.pos);
    d.yaw = Math.atan2(-v.x, -v.z); d.pitch = Math.atan2(v.y, Math.hypot(v.x, v.z));
  }, id);
  await t.wait(250);
  await t.clickView(0); await t.wait(400);
  await note('photo-' + id); await t.shot('photo-' + id);
}
await t.tap('KeyF');
// info card via click
await t.clickView(0); await t.wait(400); await t.shot('click-info');
await t.page.evaluate(() => window.__game.panels.close());
// Journal, missions, lab
await t.tap('KeyJ'); await t.wait(500); await t.shot('journal'); await t.page.evaluate(() => window.__game.panels.close());
await t.tap('KeyM'); await t.wait(500); await t.shot('missions'); await t.page.evaluate(() => window.__game.panels.close());
await t.tap('KeyL'); await t.wait(500);
await t.page.evaluate(() => { const s = document.querySelector('#s-temp'); s.value = 2; s.dispatchEvent(new Event('input')); document.querySelector('#s-years').value = 3; document.querySelector('#s-years').dispatchEvent(new Event('input')); document.querySelector('#lab-run').click(); });
await t.wait(5000); await t.shot('lab-run'); await note('lab');
await t.page.evaluate(() => window.__game.panels.close()); await t.wait(400); await t.shot('bleached-reef');
// Low O2: stay down
await t.page.evaluate(() => { const d = window.__game.diver; d.breath = 0.2; });
await t.hold('KeyC', 2000); await t.wait(6000); await note('low-o2'); await t.shot('low-o2');
await t.wait(5000); await note('after-blackout'); await t.shot('after-blackout');
// Board
await t.tap('KeyE'); await t.wait(500); await note('board'); await t.shot('board');
writeFileSync(`${outDir}/log.json`, JSON.stringify({ log, errors: t.errors }, null, 1));
console.log('done; errors:', t.errors.length, t.errors.slice(0, 5));
await t.close();
