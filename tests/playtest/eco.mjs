// Smoke-visit an ecosystem: load it, dive, take a few views + one surf (if any). ECO=rocky node tests/playtest/eco.mjs
import { launch } from './harness.mjs';
const eco = process.env.ECO ?? 'gbr';
const t = await launch({ query: `eco=${eco}` + (process.env.Q ? '&' + process.env.Q : ''), outDir: `playtest-shots/eco-${eco}` });
await t.shot('menu');
const views = JSON.parse(process.env.VIEWS ?? '[]');
await t.click('#btn-dive'); await t.wait(1500); await t.shot('dive-start');
for (const [i, v] of views.entries()) {
  await t.page.evaluate(v => { const d = window.__game.diver; d.pos.set(v[0], v[1], v[2]); d.vel.set(0, 0, 0); d.yaw = v[3]; d.pitch = v[4]; }, v);
  await t.wait(900); await t.shot('view-' + i);
}
const info = await t.page.evaluate(() => { const g = window.__game; const c = {}; for (const a of g.world.life.agents) c[a.id] = (c[a.id] ?? 0) + 1; return { counts: c, picks: g.world.reef.picks.length, fps: g.fps }; });
console.log(JSON.stringify(info));
console.log('errors:', t.errors.slice(0, 8));
await t.close();
