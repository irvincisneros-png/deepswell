// GPU frame-time benchmark (uncapped by vsync): renders N frames back to back at the dive spawn and reports ms/frame.
// Usage: QUALITY=ultra ECOS=gbr,rocky node tests/playtest/bench.mjs   (SHADOWS=0 to switch sun shadows off for comparison)
import { launch } from './harness.mjs';

const quality = process.env.QUALITY ?? 'ultra';
const ecos = (process.env.ECOS ?? 'gbr,rocky,seagrass,pelagic,deep').split(',');
const out = {};
for (const eco of ecos) {
  const t = await launch({ query: `eco=${eco}&quality=${quality}${process.env.STYLE ? `&style=${process.env.STYLE}` : ""}`, width: 1280, height: 720 });
  await t.click('#btn-dive'); await t.wait(1500);
  out[eco] = await t.page.evaluate(async ([shadows]) => {
    const g = window.__game;
    if (shadows === '0') g.env.shadowRange = 0, g.env.sun.castShadow = false;
    g.renderer.setAnimationLoop(null);
    const gl = g.renderer.getContext(), px = new Uint8Array(4);
    const sync = () => gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    const run = n => { sync(); const t0 = performance.now(); for (let i = 0; i < n; i++) { g.loop(1 / 60); sync(); } return (performance.now() - t0) / n; };
    run(20);
    const d = g.diver, p = d.pos.clone();
    const res = { spawn: run(60) };
    d.pos.set(p.x, Math.min(-3, g.world.groundAt(p.x, p.z) + 3), p.z); d.pitch = -0.2;
    res.reef = run(60);
    res.calls = g.renderer.info.render.calls; res.tris = g.renderer.info.render.triangles;
    for (const k of ['spawn', 'reef']) res[k] = +res[k].toFixed(1);
    return res;
  }, [process.env.SHADOWS ?? '1']);
  out[eco].errors = t.errors.length;
  await t.close();
}
console.log(JSON.stringify(out));
