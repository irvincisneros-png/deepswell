// Surf assist check: press nothing at all and see whether the assist catches and rides a wave. ECO=gbr
import { launch } from './harness.mjs';
const t = await launch({ query: `eco=${process.env.ECO ?? 'gbr'}`, width: 1280, height: 720 });
await t.click('#btn-surf'); await t.wait(500);
let rode = false, best = null;
for (let i = 0; i < 400; i++) {
  const s = await t.state();
  if (s.surf?.state === 'ride') rode = true;
  if (s.mode !== 'surf') break;
  await t.wait(150);
}
best = await t.page.evaluate(() => window.__game.lastRide);
console.log(JSON.stringify({ rode, kind: best?.kind, score: best?.score, time: best && +best.time.toFixed(1), reason: best?.reason }), 'errors', t.errors.length);
await t.close();
