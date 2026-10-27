// Which shader programs are still compiled on the first frames after a site switch (they cause stalls)?
import { launch } from './harness.mjs';
const t = await launch({ outDir: 'playtest-shots/switcheco' });
await t.page.evaluate(() => {
  const g = window.__game, r = g.renderer;
  window.__progs = () => r.info.programs.map(p => p.name + '|' + p.cacheKey.length + '|' + p.cacheKey.slice(0, 120));
  const orig = g.warmUp.bind(g);
  g.warmUp = async () => { await orig(); window.__after = new Set(window.__progs()); };
});
await t.page.click('.eco-card[data-id="rocky"]', { noWaitAfter: true });
await t.page.waitForFunction(() => window.__game.eco.id === 'rocky' && !document.querySelector('#loading').classList.contains('show'), null, { timeout: 280000 });
await t.wait(3000);
const late = await t.page.evaluate(() => window.__progs().filter(p => !window.__after.has(p)));
console.log(late.length, JSON.stringify(late, null, 1));
await t.close();
