// Sound check: plays each site in real Chrome and reports which sounds fired and how loud the mix was.
import { launch } from './harness.mjs';
import { writeFileSync } from 'node:fs';

// Tap the master output so we can prove sound is actually coming out (RMS of the final mix).
const meter = () => {
  const E = window.__game.audio.engine;
  if (!E.ctx) return null;
  if (!window.__an) { window.__an = E.ctx.createAnalyser(); window.__an.fftSize = 2048; E.limiter.connect(window.__an); window.__peak = 0; window.__sum = 0; window.__n = 0;
    const buf = new Float32Array(2048);
    setInterval(() => { window.__an.getFloatTimeDomainData(buf); let s = 0; for (const v of buf) s += v * v; const rms = Math.sqrt(s / buf.length); window.__peak = Math.max(window.__peak, rms); window.__sum += rms; window.__n++; }, 50); }
  return { ctx: E.ctx.state, peak: +window.__peak.toFixed(3), mean: +(window.__sum / Math.max(1, window.__n)).toFixed(3), voices: E.voices };
};
const stats = t => t.page.evaluate(() => ({ ...window.__game.audio.stats }));
const nearest = (t, id) => t.page.evaluate(id => {
  const g = window.__game, d = g.diver;
  const a = g.world.life.agents.filter(a => a.id === id && a.visible !== false).sort((p, q) => p.pos.distanceTo(d.pos) - q.pos.distanceTo(d.pos))[0];
  if (!a) return false;
  d.pos.copy(a.pos).add({ x: 6, y: 1, z: 6 }); d.pos.y = Math.min(d.pos.y, -1); d.vel.set(0, 0, 0);
  return true;
}, id);

const report = {};
async function site(eco, fn) {
  const t = await launch({ query: `eco=${eco}`, outDir: `playtest-shots/audio-${eco}` });
  await fn(t);
  report[eco] = { stats: await stats(t), meter: await t.page.evaluate(meter), errors: t.errors.slice(0, 5) };
  await t.close();
}

await site('gbr', async t => {
  await t.click('#btn-surf'); await t.page.evaluate(meter); await t.wait(500);
  let rode = false;
  for (let i = 0; i < 500; i++) {
    const s = await t.state();
    if (s.surf?.state === 'ride') { rode = true; break; }
    if (/POP UP/.test(s.prompt)) { await t.tap('Space'); continue; }
    if (/Paddle/.test(s.prompt)) await t.hold('KeyW', 150); else await t.wait(150);
  }
  for (let i = 0; i < 80 && rode; i++) {
    const s = await t.state();
    if (s.surf?.state !== 'ride') break;
    await t.hold(s.surf.ride.ft > 0.75 ? 'KeyA' : s.surf.ride.ft < 0.3 ? 'KeyD' : 'KeyW', 180);
  }
  await t.wait(3500);
  if ((await t.state()).panelOpen) await t.page.evaluate(() => window.__game.panels.close());
  // Dive: swim down, equalise, near parrotfish, photo
  await t.hold('KeyW', 1500); await t.page.evaluate(() => { window.__game.diver.pitch = -1.2; });
  await t.hold('KeyW', 1500); await t.tap('KeyQ');
  await nearest(t, 'parrotfish'); await t.wait(4000);
  await nearest(t, 'humpheadwrasse'); await t.wait(5000);
  await t.tap('KeyF'); await t.clickView(0); await t.tap('KeyF');
  await t.shot('dive');
});
await site('rocky', async t => {
  await t.click('#btn-dive'); await t.page.evaluate(meter); await t.wait(800);
  await t.page.evaluate(() => { window.__game.diver.pitch = -1.2; }); await t.hold('KeyW', 2000);
  await nearest(t, 'urchin'); await t.page.evaluate(() => { const d = window.__game.diver; d.pos.x -= 4; d.pos.z -= 4; }); await t.wait(4000);
  await nearest(t, 'bluegroper'); await t.wait(6000);
  // Blackout + rescue
  await t.page.evaluate(() => { window.__game.diver.breath = 0.01; }); await t.wait(4500);
});
await site('seagrass', async t => {
  await t.click('#btn-dive'); await t.page.evaluate(meter); await t.wait(5000);
  await nearest(t, 'dugong'); await t.wait(8000);
  await t.tap('KeyE'); await t.wait(1000);
  await t.tap('KeyL'); await t.wait(400); await t.page.evaluate(() => document.querySelector('#lab-run').click()); await t.wait(1500);
});
await site('pelagic', async t => {
  await t.click('#btn-dive'); await t.page.evaluate(meter); await t.wait(4000);
  await nearest(t, 'commondolphin'); await t.wait(8000);
  await nearest(t, 'humpback'); await t.wait(12000);
  await t.page.evaluate(() => { const d = window.__game.diver; d.pos.y = -0.1; }); await t.wait(5000);
});
await site('deep', async t => {
  await t.click('#btn-dive'); await t.page.evaluate(meter); await t.wait(1000);
  await t.hold('KeyC', 2500); await t.hold('KeyW', 2000); await t.tap('KeyT'); await t.wait(9000);
});

writeFileSync('playtest-shots/audio.json', JSON.stringify(report, null, 1));
for (const [eco, r] of Object.entries(report)) console.log(eco, JSON.stringify(r.meter), 'errors', r.errors.length, '\n  ', Object.entries(r.stats).map(([k, v]) => `${k}:${v}`).join(' '));
