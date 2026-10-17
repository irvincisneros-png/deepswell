// For every ecosystem: dive, run the lab with the mission's condition settings, photograph 6 species, check missions.
import { launch } from './harness.mjs';
import { writeFileSync } from 'node:fs';
const LAB = {
  gbr: { temp: 2, years: 3 }, rocky: { fishing: 0.95, warming: 1.5, years: 8 }, seagrass: { sediment: 0.8, nutrients: 0.7, years: 5 },
  pelagic: { upwelling: 1, warming: 0, years: 3 }, deep: { trawl: 0.8, years: 10 },
};
const report = {};
for (const eco of ['gbr', 'rocky', 'seagrass', 'pelagic', 'deep']) {
  const t = await launch({ query: `eco=${eco}`, outDir: `playtest-shots/all-${eco}` });
  await t.click('#btn-dive'); await t.wait(1000);
  const ids = await t.page.evaluate(() => { const g = window.__game; return [...new Set(g.world.life.agents.filter(a => a.kind && !a.static).map(a => a.id))]; });
  await t.tap('KeyF');
  let n = 0;
  for (const id of ids.slice(0, 8)) {
    await t.page.evaluate(id => {
      const g = window.__game, d = g.diver;
      const a = g.world.life.agents.filter(a => a.id === id && a.visible !== false).sort((p, q) => p.pos.distanceTo(d.pos) - q.pos.distanceTo(d.pos))[0];
      if (!a) return;
      const L = Math.max(1.4, (a.kind?.length ?? 0.5) * 2.4);
      const off = a.dir.clone().multiplyScalar(-1).setY(0.15).normalize().multiplyScalar(L);
      d.pos.copy(a.pos).add(off); d.vel.set(0, 0, 0);
      const v = a.pos.clone().sub(d.pos); d.yaw = Math.atan2(-v.x, -v.z); d.pitch = Math.atan2(v.y, Math.hypot(v.x, v.z));
    }, id);
    await t.wait(200); await t.clickView(0); await t.wait(300);
    if (n++ < 3) await t.shot('photo-' + id);
  }
  await t.tap('KeyF');
  // missions + lab
  const ms = await t.page.evaluate(() => window.__game.eco.missions.map(m => m.id));
  await t.page.evaluate(m => { const g = window.__game; g.trackMission(g.eco.missions.find(x => x.goal.type === 'lab')); }, ms);
  await t.tap('KeyL'); await t.wait(400);
  await t.page.evaluate(cfg => { for (const [k, v] of Object.entries(cfg)) { const el = document.querySelector('#s-' + k); if (el) { el.value = v; el.dispatchEvent(new Event('input')); } } document.querySelector('#lab-run').click(); }, LAB[eco]);
  await t.wait(1500 + LAB[eco].years * 1000);
  await t.shot('lab');
  await t.page.evaluate(() => document.querySelector('#lab-look').click());
  await t.wait(800); await t.shot('after-lab');
  report[eco] = await t.page.evaluate(() => { const g = window.__game; return { journal: Object.keys(g.progress.journal).filter(k => k.startsWith(g.eco.id)).length, missions: g.progress.missions, fps: g.fps }; });
  report[eco].errors = t.errors.slice(0, 5);
  await t.close();
}
writeFileSync('playtest-shots/allecos.json', JSON.stringify(report, null, 1));
console.log(JSON.stringify(Object.fromEntries(Object.entries(report).map(([k, v]) => [k, { journal: v.journal, labMet: Object.entries(v.missions).filter(([m, s]) => s.goalMet).map(([m]) => m), errors: v.errors.length }]))));
