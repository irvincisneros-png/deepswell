// Phone play-test: touch-only surf + dive at a site (ECO=gbr) using real touch events.
import { launch } from './harness.mjs';
const eco = process.env.ECO ?? 'gbr';
const t = await launch({ query: `eco=${eco}`, outDir: `playtest-shots/mobile-${eco}`, mobile: true });
const { page } = t;
const cdp = await page.context().newCDPSession(page);
const center = async sel => { const b = await page.locator(sel).first().boundingBox(); return b && { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
// Hold touch points (multi-touch) via CDP.
const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((p, i) => ({ x: p.x, y: p.y, id: p.id ?? i })) });
async function holdBtn(sel, ms) { const c = await center(sel); await touch('touchStart', [c]); await t.wait(ms); await touch('touchEnd', []); }
const report = {};
report.touchClass = await page.evaluate(() => document.body.classList.contains('touch'));
report.quality = await page.evaluate(() => window.__game.settings.quality);
await t.shot('menu');
await page.tap(eco === 'deep' || eco === 'pelagic' || eco === 'seagrass' ? '#btn-dive' : '#btn-surf'); await t.wait(1200);
await t.shot('start');
// SURF: hold PADDLE when told, tap POP UP, then steer with arrows
if ((await t.state()).mode === 'surf') {
  let rode = false;
  for (let i = 0; i < 400; i++) {
    const s = await t.state();
    if (s.surf?.state === 'ride') { rode = true; break; }
    if (/POP UP/.test(s.prompt)) { await holdBtn('#touch .t-pop', 60); continue; }
    if (/PADDLE|Paddle/.test(s.prompt)) await holdBtn('#touch .t-paddle', 150); else await t.wait(150);
  }
  report.prompt = (await t.state()).prompt;
  await t.shot('surf');
  for (let i = 0; i < 60 && rode; i++) {
    const s = await t.state();
    if (s.surf?.state !== 'ride') break;
    const ft = s.surf.ride.ft;
    await holdBtn(ft > 0.75 ? '#touch .t-steer button:first-child' : ft < 0.3 ? '#touch .t-steer button:last-child' : '#touch .t-paddle', 180);
    if (i === 8) await t.shot('ride');
  }
  report.rode = rode;
  await t.wait(3500);
  if (await page.locator('#modal:not(.hidden)').count()) { await t.shot('result'); await page.tap('#modal-close'); }
}
// DIVE: joystick forward + look-drag down simultaneously (two fingers), then swim down
await t.wait(500);
const stick = await center('#t-stick');
const look = { x: 520, y: 150 };
await touch('touchStart', [{ ...stick, id: 1 }, { ...look, id: 2 }]);
for (let i = 1; i <= 15; i++) { await touch('touchMove', [{ x: stick.x, y: stick.y - 60, id: 1 }, { x: look.x, y: look.y + i * 8, id: 2 }]); await t.wait(60); }
await t.wait(1500);
await touch('touchEnd', []);
await holdBtn('#touch .t-pad.t-dive .t-row:last-child button:first-child', 1500); // ▼
const d1 = await t.state();
report.dive = d1.dive;
await t.shot('dive');
// Equalise via EQ button, camera via 📷 and a tap to shoot, journal via 📗
await page.tap('#t-eq').catch(() => {});
await page.tap('#touch button[data-key="KeyF"]'); await t.wait(300);
await page.touchscreen.tap(420, 200); await t.wait(500);
report.cameraMode = await page.evaluate(() => window.__game.cameraMode);
await t.shot('camera');
await page.tap('#touch button[data-key="KeyF"]'); await t.wait(200);
await page.tap('#touch button[data-key="KeyJ"]'); await t.wait(500);
report.journalOpen = (await t.state()).panelOpen;
await t.shot('journal');
await page.tap('#modal-close'); await t.wait(300);
// Portrait: rotate warning
await page.setViewportSize({ width: 390, height: 844 }); await t.wait(400);
report.rotateShown = await page.evaluate(() => getComputedStyle(document.querySelector('#t-rotate')).display);
await t.shot('portrait');
report.errors = t.errors.slice(0, 5);
console.log(JSON.stringify(report, null, 1));
await t.close();
