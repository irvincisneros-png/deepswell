// Close-up of chosen species at a site. ECO=gbr IDS=fusilier,lionfish node tests/playtest/species.mjs
import { launch } from './harness.mjs';
const eco = process.env.ECO ?? 'gbr', ids = (process.env.IDS ?? '').split(',').filter(Boolean);
const t = await launch({ query: `eco=${eco}&quality=${process.env.QUALITY ?? 'ultra'}`, outDir: `playtest-shots/species-${eco}`, width: 1280, height: 720 });
await t.page.addStyleTag({ content: '#hud,#toasts,.toast,#click-to-play{visibility:hidden!important}' });
await t.click('#btn-dive'); await t.wait(1200);
await t.page.evaluate(() => { const l = window.__game.world.life, u = l.update.bind(l); l.update = (dt, d) => { for (const a of l.agents) a.p0 ??= a.pos.clone(); u(dt, d); for (const a of l.agents) a.pos.copy(a.p0); }; });
for (const id of ids) {
  const ok = await t.page.evaluate(id => {
    const g = window.__game, d = g.diver;
    const a = g.world.life.agents.find(a => a.id === id && a.visible !== false); if (!a) return false;
    const L = Math.max(0.45, (a.kind?.length ?? a.radius ?? 0.3) * 2.2);
    const side = new a.dir.constructor(-a.dir.z, 0.35, a.dir.x).normalize().multiplyScalar(L);
    d.pos.copy(a.pos).add(side); d.vel.set(0, 0, 0);
    const v = a.pos.clone().sub(d.pos); d.yaw = Math.atan2(-v.x, -v.z); d.pitch = Math.atan2(v.y, Math.hypot(v.x, v.z));
    return true;
  }, id);
  await t.wait(700); if (ok) await t.shot(id); else console.log('missing', id);
}
console.log('errors', t.errors.length, t.errors.slice(0, 2).map(s => s.slice(0, 200)));
await t.close();
