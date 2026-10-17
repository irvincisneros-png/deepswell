import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kelpModel, seagrassModel, planktonModel, seamountModel } from '../src/learn/labs.js';
const last = r => r[r.length - 1];
const max = (r, k) => Math.max(...r.map(s => s[k]));

test('kelp: protected predators keep the forest; overfishing + warming makes a barren; restoration prevents it', () => {
  assert.ok(last(kelpModel({ fishing: 0.2, warming: 0, restore: false }, 8)).kelp > 0.6);
  const bad = kelpModel({ fishing: 0.95, warming: 1.5, restore: false }, 8);
  assert.ok(max(bad, 'barren') > 0.5 && last(bad).kelp < 0.2);
  assert.ok(last(kelpModel({ fishing: 0.95, warming: 1.5, restore: true }, 8)).barren < 0.2);
});
test('seagrass: clear water grows the meadow; sediment + nutrients + flood kill it and dugongs decline', () => {
  assert.ok(last(seagrassModel({ sediment: 0.2, nutrients: 0.2, flood: false }, 5)).seagrass > 0.6);
  const murky = seagrassModel({ sediment: 0.8, nutrients: 0.7, flood: true }, 5);
  assert.ok(last(murky).seagrass < 0.3 && last(murky).dugong < 0.7);
});
test('plankton: upwelling makes a bloom, stratification blocks it, sardine fishing hurts predators', () => {
  assert.ok(max(planktonModel({ upwelling: 1, warming: 0, fishing: 0.2 }, 3), 'phyto') > 0.7);
  assert.ok(max(planktonModel({ upwelling: 1, warming: 2, fishing: 0.2 }, 3), 'phyto') < 0.7);
  const fished = planktonModel({ upwelling: 0.3, warming: 0, fishing: 0.9 }, 5), base = planktonModel({ upwelling: 0.3, warming: 0, fishing: 0.2 }, 5);
  assert.ok(last(fished).sardine < last(base).sardine && last(fished).pred < last(base).pred);
});
test('seamount: trawling destroys coral; protection stops the loss but recovery is negligible in 10 years', () => {
  const trawled = seamountModel({ trawl: 0.8, protect: false }, 10);
  assert.ok(last(trawled).coral < 0.21);
  const prot = seamountModel({ trawl: 0.8, protect: true }, 10);
  const y1 = prot[12].coral;
  assert.ok(last(prot).coral >= y1 && last(prot).coral - y1 < 0.02);
});
