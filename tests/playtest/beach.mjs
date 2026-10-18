// Beach / land mode at the rocky site: walk the shore, look at the dunes and rock platform, wade in until you
// swim, swim back ashore, then pick up the board and paddle out. QUALITY=ultra node tests/playtest/beach.mjs
import { launch } from './harness.mjs';

const q = process.env.QUALITY ? `&quality=${process.env.QUALITY}` : '';
const t = await launch({ query: `eco=rocky${q}`, outDir: `playtest-shots/beach${process.env.QUALITY ? '-' + process.env.QUALITY : ''}`, width: 1280, height: 720 });
const log = [];
const st = () => t.page.evaluate(() => { const g = window.__game, w = g.walker, d = g.diver; return { mode: g.mode, w: w.pos.toArray().map(v => +v.toFixed(1)), d: d.pos.toArray().map(v => +v.toFixed(1)), fps: g.fps }; });
const view = (x, z, yaw, pitch = -0.05) => t.page.evaluate(([x, z, yaw, pitch]) => { const g = window.__game, w = g.walker; w.pos.set(x, g.world.groundAt(x, z), z); w.vel.set(0, 0, 0); w.yaw = yaw; w.pitch = pitch; }, [x, z, yaw, pitch]);
await t.page.addStyleTag({ content: '#toasts,.toast,#click-to-play{visibility:hidden!important}' });
await t.click('#btn-beach'); await t.wait(1500);
log.push(['start', await st()]);
await t.shot('spawn-sea');                                        // facing the sea
await view(6, 106, Math.PI); await t.wait(800); await t.shot('dunes');          // facing the dunes
await view(30, 92, -Math.PI / 2); await t.wait(800); await t.shot('platform-from-beach'); // looking east to the platform
await view(70, 92, -2.2, -0.35); await t.wait(800); await t.shot('rock-pools');
await view(-20, 131, Math.PI, -0.08); await t.wait(800); await t.shot('hind-dune');
await view(0, 120, 0, -0.1); await t.wait(800); await t.shot('foredune-to-sea');
// Ghost crabs bolting: look at one up close.
await t.page.evaluate(() => { const g = window.__game, w = g.walker, c = g.world.land.agents.find(a => a.id === 'ghostcrab'); w.pos.set(c.pos.x, g.world.groundAt(c.pos.x, c.pos.z + 3), c.pos.z + 3); w.yaw = 0; w.pitch = -0.5; });
await t.wait(300); await t.shot('ghostcrab');
// Wade in from the beach until swimming starts.
await view(6, 92, 0); await t.wait(300);
for (let i = 0; i < 90 && (await st()).mode === 'land'; i++) await t.hold('KeyW', 250);
log.push(['after wading', await st()]);
await t.shot('swimming');
// Swim back to shore.
await t.page.evaluate(() => { window.__game.diver.yaw = Math.PI; });
for (let i = 0; i < 120 && (await st()).mode === 'dive'; i++) await t.hold('KeyW', 250);
log.push(['after swimming in', await st()]);
// Board on the beach -> surf.
await t.page.evaluate(() => { const g = window.__game, w = g.walker; w.pos.set(g.boardPos.x + 1, g.world.groundAt(g.boardPos.x + 1, g.boardPos.z), g.boardPos.z); });
await t.wait(300); await t.tap('KeyE'); await t.wait(1200);
log.push(['after E at board', await st()]);
console.log(JSON.stringify(log), 'errors:', t.errors.length, t.errors.slice(0, 3).map(e => e.slice(0, 300)));
await t.close();
