// Example scenario: surf one wave, then dive and photograph something.
import { launch } from './harness.mjs';

const t = await launch({ query: process.env.Q ?? '' });
await t.shot('menu');
await t.click('#btn-surf');
await t.wait(1500);
await t.shot('lineup');
// Wait for the set, paddle when prompted, pop up in the window.
for (let i = 0; i < 400; i++) {
  const s = await t.state();
  if (s.surf?.state === 'ride' || s.mode !== 'surf') break;
  if (/POP UP/.test(s.prompt)) { await t.tap('Space'); continue; }
  if (/Paddle/.test(s.prompt)) await t.hold('KeyW', 200); else await t.wait(200);
}
await t.shot('riding');
for (let i = 0; i < 40; i++) {
  const s = await t.state();
  if (s.surf?.state !== 'ride') break;
  await t.hold(s.surf.ride.ft > 0.7 ? 'KeyA' : s.surf.ride.ft < 0.3 ? 'KeyD' : 'KeyW', 200);
  if (i % 10 === 5) await t.shot('ride-' + i);
}
await t.wait(3000);
await t.shot('ride-end');
console.log(JSON.stringify(await t.state(), null, 1));
console.log('errors:', t.errors);
await t.close();
