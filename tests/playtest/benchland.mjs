// Uncapped ms/frame on the beach (land mode) at a few viewpoints. QUALITY=low node tests/playtest/benchland.mjs
import { launch } from './harness.mjs';
const t = await launch({ query: `eco=rocky&quality=${process.env.QUALITY ?? 'ultra'}`, width: 1280, height: 720 });
await t.click('#btn-beach'); await t.wait(1500);
console.log(JSON.stringify(await t.page.evaluate(() => {
  const g = window.__game; g.renderer.setAnimationLoop(null);
  const gl = g.renderer.getContext(), px = new Uint8Array(4), sync = () => gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
  const run = n => { sync(); const t0 = performance.now(); for (let i = 0; i < n; i++) { g.loop(1 / 60); sync(); } return +((performance.now() - t0) / n).toFixed(1); };
  const w = g.walker, upd = w.update; w.update = function (dt, world, b) { this.vel.set(0, 0, 0); return upd.call(this, dt, world, b); };
  // Warm up at each view first, so shader compiles and buffer uploads aren't counted.
  const at = (x, z, yaw) => { w.pos.set(x, g.world.groundAt(x, z), z); w.yaw = yaw; w.pitch = -0.05; run(15); };
  run(20);
  const out = {};
  at(6, 106, 0); out.seaView = run(40);
  at(6, 106, Math.PI); out.dunesView = run(40);
  at(0, 150, Math.PI); out.inScrub = run(40);
  at(70, 92, -2.2); out.platform = run(40);
  return out;
})), 'errors', t.errors.length);
await t.close();
