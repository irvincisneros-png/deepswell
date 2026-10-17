// Surf one wave at a site (ECO=rocky) and report the ride.
import { launch } from './harness.mjs';
const eco = process.env.ECO ?? 'gbr';
const t = await launch({ query: `eco=${eco}`, outDir: `playtest-shots/surf-${eco}` });
await t.click('#btn-surf'); await t.wait(1000);
let rode = false;
for (let i = 0; i < 600; i++) {
  const s = await t.state();
  if (s.surf?.state === 'ride') { rode = true; break; }
  if (s.mode !== 'surf') break;
  if (/POP UP/.test(s.prompt)) { await t.tap('Space'); continue; }
  if (/Paddle/.test(s.prompt)) await t.hold('KeyW', 150); else await t.wait(150);
}
let shots = 0, last;
for (let i = 0; i < 120 && rode; i++) {
  const s = await t.state(); last = s;
  if (s.surf?.state !== 'ride') break;
  const r = s.surf.ride;
  await t.hold(r.ft > 0.75 ? 'KeyA' : r.ft < 0.3 ? 'KeyD' : 'KeyW', 180);
  if (i % 10 === 3 && shots++ < 3) await t.shot('ride');
}
await t.wait(2500);
const end = await t.page.evaluate(() => window.__game.lastRide);
console.log(JSON.stringify({ rode, end }), t.errors.slice(0, 3));
await t.close();
