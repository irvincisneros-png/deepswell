// Where does switching site spend its time? Logs each loading message with a timestamp and every stalled frame.
import { launch } from './harness.mjs';
const t = await launch({ query: process.env.QUALITY ? `quality=${process.env.QUALITY}` : '', outDir: 'playtest-shots/switcheco' });
await t.page.evaluate(() => {
  const T0 = performance.now(); window.__log = [];
  const L = (...a) => window.__log.push([Math.round(performance.now() - T0), ...a]);
  new MutationObserver(() => L('msg', document.querySelector('#load-msg').textContent)).observe(document.querySelector('#load-msg'), { childList: true, characterData: true, subtree: true });
  let last = performance.now(); const f = () => { const n = performance.now(); if (n - last > 150) L('stall', Math.round(n - last)); last = n; requestAnimationFrame(f); }; requestAnimationFrame(f);
  L('quality', window.__game.quality ?? window.__game.settings?.quality);
});
await t.page.click(`.eco-card[data-id="${process.env.ECO ?? 'rocky'}"]`, { noWaitAfter: true });
await t.page.waitForFunction(() => window.__game.eco.id === 'rocky' && !document.querySelector('#loading').classList.contains('show'), null, { timeout: 280000 });
await t.wait(4000);
console.log(JSON.stringify(await t.page.evaluate(() => window.__log)));
console.log('errors', t.errors.length);
await t.close();
