// Character and jet ski close-ups in the game.
import { launch } from './harness.mjs';
const t = await launch({ query: 'eco=rocky&quality=ultra', outDir: 'playtest-shots/chars', width: 1280, height: 720 });
await t.page.addStyleTag({ content: '#hud,#toasts,.toast,#click-to-play,#prompt{visibility:hidden!important}' });
await t.click('#btn-surf'); await t.wait(1500);
await t.tap('KeyV'); await t.wait(800); await t.shot('surfer-lineup');
for (let i = 0; i < 600; i++) { const s = await t.state(); if (s.surf?.state === 'ride' || s.mode !== 'surf') break; await t.wait(150); }
await t.wait(1200); await t.shot('surfer-ride'); await t.wait(1200); await t.shot('surfer-ride2');
await t.tap('KeyV'); await t.close();
const u = await launch({ query: 'eco=rocky&quality=ultra', outDir: 'playtest-shots/chars', width: 1280, height: 720 });
await u.page.addStyleTag({ content: '#hud,#toasts,.toast,#click-to-play,#prompt{visibility:hidden!important}' });
await u.click('#btn-surf'); await u.wait(1200);
for (let i = 0; i < 600; i++) { const s = await u.state(); if (s.surf?.state === 'paddle') { await u.hold('KeyW', 600); break; } await u.wait(150); }
await u.page.keyboard.down('w'); await u.wait(500); await u.shot('fp-paddle'); await u.page.keyboard.up('w');
await u.close();
const v = await launch({ query: 'eco=rocky&quality=ultra', outDir: 'playtest-shots/chars', width: 1280, height: 720 });
await v.page.addStyleTag({ content: '#hud,#toasts,.toast,#click-to-play,#prompt{visibility:hidden!important}' });
await v.click('#btn-beach'); await v.wait(1200);
await v.page.evaluate(() => { const g = window.__game, w = g.walker, j = g.jetski; w.pos.set(j.pos.x + 2.2, g.world.groundAt(j.pos.x + 2.2, j.pos.z + 1.6), j.pos.z + 1.6); w.yaw = Math.atan2(-(j.pos.x - w.pos.x), -(j.pos.z - w.pos.z)); w.pitch = -0.2; });
await v.wait(600); await v.shot('jetski-parked');
await v.tap('KeyE'); await v.wait(500); await v.hold('KeyW', 2500); await v.wait(1500); await v.shot('jetski-ride'); await v.hold('KeyA', 900); await v.shot('jetski-turn');
console.log('errors', t.errors.length + u.errors.length + v.errors.length, [...u.errors, ...v.errors].slice(0, 3).map(s => s.slice(0, 200)));
await v.close();
