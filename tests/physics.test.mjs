import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SetWave, sampleFace, sampleProfile, PROFILE_N, waveHeightAt } from '../src/ocean/waveProfile.js';
import { buoyancyAt, pressureAt } from '../src/dive/diver.js';

test('pressure doubles at 10 m', () => {
  assert.equal(pressureAt(0), 1);
  assert.equal(pressureAt(10), 2);
  assert.equal(pressureAt(30), 4);
});

test('buoyancy: floats near the surface, ~neutral at 10 m, sinks deeper', () => {
  assert.ok(buoyancyAt(2) > 0);
  assert.ok(Math.abs(buoyancyAt(10)) < 0.02);
  assert.ok(buoyancyAt(18) < 0);
});

test('wave profile samples are finite and the barrel overhangs', () => {
  const s = new Float32Array(PROFILE_N), y = new Float32Array(PROFILE_N), f = new Float32Array(PROFILE_N);
  sampleProfile(2.4, 1, 1, 0, s, y, f);
  for (let i = 0; i < PROFILE_N; i++) assert.ok(Number.isFinite(s[i]) && Number.isFinite(y[i]));
  // Lip tip sits further shoreward than the wall below it -> an overhang (the tube).
  const tipS = Math.max(...Array.from(s).slice(10, 40));
  const wallS = Math.min(...Array.from(s).slice(30, 50));
  assert.ok(tipS > wallS + 1, `tip ${tipS} wall ${wallS}`);
});

test('wave peels toward -x after breaking and the face is ridable', () => {
  const w = new SetWave({ H: 2.4, speed: 5.5, peel: 6.4, peakX: 22, z0: -75, breakZ: -12, endZ: 60 });
  w.t = w.tBreak + 2;
  const p0 = w.peelX();
  w.update(1);
  assert.ok(w.peelX() < p0);
  const f = sampleFace(w, w.peelX() - 8, 0.5);
  assert.ok(f.y > 0.3 && f.y < 2.4, `face height ${f.y}`);
  assert.ok(f.slope > 0.2, `face slope ${f.slope}`);
  assert.ok(waveHeightAt(w, w.peelX() - 30, w.z) > 0.5);
});
