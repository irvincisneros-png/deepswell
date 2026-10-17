// Play-test harness: real Chromium, real keyboard/mouse input, screenshots + game-state probes.
// Usage (from repo root, with the dev server running on :8450):
//   node tests/playtest/example.mjs
// Playwright is borrowed from a sibling repo's node_modules (no install needed here).
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const candidates = [
  process.env.PLAYWRIGHT_PATH,
  path.resolve(import.meta.dirname, '../../../LifeLens/node_modules/playwright'),
  path.resolve(import.meta.dirname, '../../../year7-cells-lab/node_modules/playwright'),
  'playwright',
].filter(Boolean);
let pw;
for (const c of candidates) { try { pw = require(c); break; } catch { /* next */ } }
if (!pw) throw new Error('Playwright not found. Set PLAYWRIGHT_PATH to a node_modules/playwright folder.');

export async function launch({ url = process.env.URL ?? 'http://localhost:8450/', query = '', outDir = 'playtest-shots', width = 1280, height = 800, headless = true } = {}) {
  mkdirSync(outDir, { recursive: true });
  const browser = await pw.chromium.launch({ headless, channel: process.env.PW_CHANNEL ?? 'chrome', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(url + (query ? `?${query}` : ''));
  await page.waitForFunction(() => window.__game && window.__game.mode === 'menu', null, { timeout: 120000 });
  let n = 0;
  const api = {
    page, browser, errors,
    /** Save a screenshot; returns the path. */
    async shot(name) { const p = path.join(outDir, `${String(++n).padStart(2, '0')}-${name}.png`); await page.screenshot({ path: p }); return p; },
    /** Hold a key (KeyboardEvent.code, e.g. 'KeyW', 'Space') for ms milliseconds. */
    async hold(code, ms) { await page.keyboard.down(keyName(code)); await page.waitForTimeout(ms); await page.keyboard.up(keyName(code)); },
    async tap(code) { await page.keyboard.press(keyName(code)); },
    async wait(ms) { await page.waitForTimeout(ms); },
    async click(selector) { await page.click(selector); },
    /** Snapshot of the game state (mode, surf/dive numbers, HUD prompt, toasts). */
    async state() {
      return page.evaluate(() => {
        const g = window.__game, s = g.surfSession, d = g.diver;
        return {
          mode: g.mode, fps: g.fps, panelOpen: g.panels.isOpen,
          prompt: document.querySelector('#prompt')?.textContent,
          toasts: [...document.querySelectorAll('.toast')].map(t => t.textContent),
          surf: s && { state: s.state, score: Math.round(s.score), paddleSpeed: +s.paddleSpeed.toFixed(2), wave: s.wave && { z: +s.wave.z.toFixed(1), broken: s.wave.broken }, pos: s.pos.toArray().map(v => +v.toFixed(1)), ride: s.ride && { ft: +s.ride.ft.toFixed(2), v: +s.ride.v.toFixed(1), theta: +s.ride.theta.toFixed(2) } },
          dive: g.mode === 'dive' && { depth: +(d.depthNow ?? 0).toFixed(1), breath: +d.breath.toFixed(2), maxDepth: +d.maxDepth.toFixed(1), pos: d.pos.toArray().map(v => +v.toFixed(1)), ear: +d.ear.toFixed(2) },
          journal: Object.keys(g.progress.journal),
        };
      });
    },
    /** Rotate the diver's view directly (pointer lock is unavailable in headless browsers). */
    async look(yawDelta, pitchDelta = 0) { await page.evaluate(([y, p]) => { const d = window.__game.diver; d.yaw += y; d.pitch = Math.max(-1.45, Math.min(1.45, d.pitch + p)); }, [yawDelta, pitchDelta]); },
    /** Simulate a click in the 3D view (as if the mouse were locked): photo in camera mode, otherwise info card. */
    async clickView(button = 0) { await page.evaluate(b => { const g = window.__game; g.input.locked = true; g.input.clicks.push({ button: b }); }, button); await page.waitForTimeout(150); },
    async close() { await browser.close(); },
  };
  return api;
}
function keyName(code) {
  const map = { KeyW: 'w', KeyA: 'a', KeyS: 's', KeyD: 'd', KeyQ: 'q', KeyE: 'e', KeyF: 'f', KeyJ: 'j', KeyM: 'm', KeyL: 'l', KeyP: 'p', KeyC: 'c', Space: ' ', ShiftLeft: 'Shift', Escape: 'Escape' };
  return map[code] ?? code;
}
