// Visual gallery: the same set of views at every site, for before/after graphics comparisons.
// Usage: QUALITY=ultra TAG=before node tests/playtest/gallery.mjs   (ECOS=gbr,rocky to limit sites)
// Screenshots go to playtest-shots/gallery-<TAG>-<QUALITY>/<eco>-NN-<view>.png; fps per view in gallery.json.
import { launch } from './harness.mjs';
import { writeFileSync } from 'node:fs';

const quality = process.env.QUALITY ?? 'ultra', tag = process.env.TAG ?? 'now';
const ecos = (process.env.ECOS ?? 'gbr,rocky,seagrass,pelagic,deep').split(',');
const outDir = `playtest-shots/gallery-${tag}-${quality}`;
const report = {};

for (const eco of ecos) {
  const t = await launch({ query: `eco=${eco}&quality=${quality}`, outDir, width: 1280, height: 720 });
  const r = report[eco] = { views: {}, errors: [] };
  const shot = async name => {
    await t.wait(1200);
    r.views[name] = await t.page.evaluate(() => ({ fps: window.__game.fps, pr: +window.__game.renderer.getPixelRatio().toFixed(2) }));
    await t.page.screenshot({ path: `${outDir}/${eco}-${name}.png` });
  };
  // Hide HUD text so the comparison is about the 3D image.
  await t.page.addStyleTag({ content: '#hud,#toasts,#prompt,#mission-hud,#click-to-play,.toast{visibility:hidden!important}' });
  await t.wait(2500); await shot('01-menu');
  await t.click('#btn-dive'); await t.wait(1500);
  await t.page.evaluate(() => document.querySelectorAll('.panel .close, .panel button').forEach(b => /continue|close|ok|got it/i.test(b.textContent) && b.click()));
  const place = (pos, yaw, pitch) => t.page.evaluate(([p, y, pi]) => { const d = window.__game.diver; d.pos.set(...p); d.vel.set(0, 0, 0); d.yaw = y; d.pitch = pi; d.breath = 1; }, [pos, yaw, pitch]);
  // Freeze animal movement so close-ups frame the animal (swimming deformation still animates).
  await t.page.evaluate(() => { const l = window.__game.world.life, u = l.update.bind(l); l.update = (dt, d) => { for (const a of l.agents) { a.p0 ??= a.pos.clone(); } u(dt, d); for (const a of l.agents) a.pos.copy(a.p0); }; });
  const spawn = await t.page.evaluate(() => { const d = window.__game.diver; return { p: d.pos.toArray(), yaw: d.yaw }; });
  await shot('02-spawn');
  // Mid-water, looking down across the site.
  const floor = await t.page.evaluate(([x, z]) => window.__game.world.groundAt?.(x, z) ?? window.__game.world.terrain?.heightAt?.(x, z) ?? -10, [spawn.p[0], spawn.p[2]]);
  await place([spawn.p[0], Math.min(-3, floor + 4), spawn.p[2]], spawn.yaw, -0.35); await shot('03-seabed');
  // Look up at the surface from below (Snell's window, light shafts).
  await place([spawn.p[0], -6, spawn.p[2]], spawn.yaw, 1.1); await shot('04-up');
  // Close-ups of the first few species.
  const ids = await t.page.evaluate(() => [...new Set(window.__game.world.life.agents.filter(a => a.kind && !a.static).map(a => a.id))].slice(0, 4));
  for (const id of ids) {
    await t.page.evaluate(id => {
      const g = window.__game, d = g.diver;
      const a = g.world.life.agents.filter(a => a.id === id && a.visible !== false).sort((p, q) => p.pos.distanceTo(d.pos) - q.pos.distanceTo(d.pos))[0];
      if (!a) return;
      const L = Math.max(0.5, (a.kind?.length ?? 0.5) * 1.5);
      const side = new a.dir.constructor(-a.dir.z, 0.12, a.dir.x).normalize().multiplyScalar(L); // side-on view
      d.pos.copy(a.pos).add(side); d.vel.set(0, 0, 0);
      const v = a.pos.clone().sub(d.pos); d.yaw = Math.atan2(-v.x, -v.z); d.pitch = Math.atan2(v.y, Math.hypot(v.x, v.z));
    }, id);
    await shot(`05-fish-${id}`);
  }
  // Static life (coral, kelp, seagrass, sponges): nearest one, slightly above.
  const sid = await t.page.evaluate(() => {
    const g = window.__game, d = g.diver;
    const s = g.world.life.agents.filter(a => a.static).sort((p, q) => p.pos.distanceTo(d.pos) - q.pos.distanceTo(d.pos))[0];
    if (!s) return null;
    d.pos.copy(s.pos).add({ x: 2.2, y: 1.4, z: 2.2 }); d.vel.set(0, 0, 0);
    const v = s.pos.clone().sub(d.pos); d.yaw = Math.atan2(-v.x, -v.z); d.pitch = Math.atan2(v.y, Math.hypot(v.x, v.z));
    return s.id;
  });
  if (sid) await shot(`06-static-${sid}`);
  r.errors = t.errors.slice(0, 5);
  await t.close();
}
writeFileSync(`${outDir}/gallery.json`, JSON.stringify(report, null, 1));
console.log(JSON.stringify(Object.fromEntries(Object.entries(report).map(([k, v]) => [k, { fps: Object.values(v.views).map(x => x.fps).join(','), errors: v.errors.length }]))));
