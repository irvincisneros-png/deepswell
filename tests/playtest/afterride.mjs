// After a ride ends: is the rider still drawn on the board while you dive? ECO=gbr
import { launch } from './harness.mjs';
const t = await launch({ query: `eco=${process.env.ECO ?? 'gbr'}`, outDir: 'playtest-shots/afterride', width: 1280, height: 720 });
await t.click('#btn-surf'); await t.wait(1000);
for (let i = 0; i < 600; i++) {
  const s = await t.state(); if (s.surf?.state === 'ride' || s.mode !== 'surf') break;
  if (/POP UP/.test(s.prompt)) { await t.tap('Space'); continue; }
  if (/Paddle/.test(s.prompt)) await t.hold('KeyW', 150); else await t.wait(150);
}
for (let i = 0; i < 200; i++) { const s = await t.state(); if (s.mode !== 'surf') break; await t.hold('KeyW', 150); }
await t.wait(1500);
await t.page.evaluate(() => { const p = document.querySelector('.panel .close, #modal button'); p?.click(); });
await t.wait(500);
const info = await t.page.evaluate(() => {
  const g = window.__game, d = g.diver, b = g.boardPos;
  d.pos.set(b.x + 2.5, -0.1, b.z + 1); d.yaw = Math.atan2(-(b.x - d.pos.x), -(b.z - d.pos.z)); d.pitch = -0.05;
  return { mode: g.mode, riderVisible: g.surfer.rider.visible, rootVisible: g.surfer.root.visible, session: !!g.surfSession };
});
await t.wait(600); await t.shot('board-view');
console.log(JSON.stringify(info), 'errors', t.errors.length);
await t.close();
