// Surf comparison shots: lineup while a set approaches, paddling for it, and riding. ECO=gbr node tests/playtest/surfshots.mjs
import { launch } from './harness.mjs';
const eco = process.env.ECO ?? 'gbr';
const t = await launch({ query: `eco=${eco}&quality=${process.env.QUALITY ?? 'ultra'}`, outDir: `playtest-shots/surfshots-${eco}`, width: 1280, height: 720 });
await t.click('#btn-surf'); await t.wait(1200);
let n = 0, shotSet = false, shotPaddle = false;
for (let i = 0; i < 700; i++) {
  const s = await t.state();
  if (s.surf?.state === 'ride') break;
  if (s.mode !== 'surf') break;
  if (!shotSet && s.surf?.wave && s.surf.wave.z < s.surf.pos[2] - 25) { await t.shot('set-coming'); shotSet = true; }
  if (/POP UP/.test(s.prompt)) { await t.tap('Space'); continue; }
  if (/Paddle/.test(s.prompt)) { await t.hold('KeyW', 150); if (!shotPaddle) { await t.shot('paddling'); shotPaddle = true; } } else await t.wait(150);
}
for (let i = 0; i < 60; i++) {
  const s = await t.state();
  if (s.surf?.state !== 'ride') break;
  const r = s.surf.ride;
  await t.hold(r.ft > 0.75 ? 'KeyA' : r.ft < 0.3 ? 'KeyD' : 'KeyW', 180);
  if (i === 6 || i === 18) await t.shot('ride');
}
console.log('errors', t.errors.length);
await t.close();
