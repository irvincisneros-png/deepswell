// Quick look: one dive view at a site. ECO=gbr X=0 Z=-20 H=3 PITCH=-0.9 YAW=3.1 OUT=name node tests/playtest/look.mjs
import { launch } from './harness.mjs';
const e = process.env;
const t = await launch({ query: `eco=${e.ECO ?? 'gbr'}&quality=${e.QUALITY ?? 'ultra'}`, width: 1280, height: 720 });
await t.page.addStyleTag({ content: '#hud,#toasts,.toast,#click-to-play{visibility:hidden!important}' });
await t.click('#btn-dive'); await t.wait(1200);
await t.page.evaluate(([x, z, h, p, y]) => { const g = window.__game, d = g.diver; d.pos.set(x, g.world.groundAt(x, z) + h, z); d.pitch = p; d.yaw = y; d.update = (dt, w) => { d.camera.position.copy(d.pos); d.camera.quaternion.setFromEuler(new d.camera.rotation.constructor(d.pitch, d.yaw, 0, 'YXZ')); }; },
  [+(e.X ?? 0), +(e.Z ?? -20), +(e.H ?? 3), +(e.PITCH ?? -0.9), +(e.YAW ?? 3.1)]);
if (e.EVAL) await t.page.evaluate(e.EVAL);
await t.wait(1200);
await t.page.screenshot({ path: `playtest-shots/look-${e.OUT ?? 'x'}.png` });
console.log('errors', t.errors.length, t.errors.slice(0, 2).map(s => s.slice(0, 300)));
await t.close();
