import { test } from 'node:test';
import assert from 'node:assert/strict';
import { simulate, dhw, bleachFraction } from '../src/learn/reefModel.js';

const base = { temp: 0, nutrients: 0.2, cots: 0.15, fishing: 0.2 };
const at = (r, y) => r[y * 12];

test('degree heating weeks thresholds', () => {
  assert.equal(dhw(0.5), 0);
  assert.ok(bleachFraction(dhw(1)) > 0.5);   // ~6 DHW: significant bleaching
  assert.ok(bleachFraction(dhw(2)) > 0.99);  // 12 DHW: severe
});

test('healthy reef grows slowly', () => {
  const r = simulate(base, 5);
  assert.ok(at(r, 5).coral > at(r, 0).coral);
});

test('one heatwave knocks coral down, then it recovers', () => {
  const r = simulate({ ...base, temp: 1.5 }, 10);
  assert.ok(at(r, 1).coral < at(r, 0).coral * 0.75);
  assert.ok(at(r, 10).coral > at(r, 1).coral);
  assert.ok(Math.max(...r.map(s => s.bleach)) > 0.9);
});

test('repeated heatwaves collapse the reef to algae', () => {
  const r = simulate({ ...base, temp: 1.5, every: true }, 10);
  assert.ok(at(r, 10).coral < 0.05);
  assert.ok(at(r, 10).algae > 0.4);
});

test('nutrient runoff drives a crown-of-thorns outbreak', () => {
  const r = simulate({ ...base, nutrients: 0.9, cots: 0.3 }, 3);
  assert.ok(Math.max(...r.map(s => s.cots)) > 0.6);
});

test('heavy fishing slows recovery after bleaching', () => {
  const a = simulate({ ...base, temp: 1.5 }, 10), b = simulate({ ...base, temp: 1.5, fishing: 0.9 }, 10);
  assert.ok(at(b, 10).coral < at(a, 10).coral);
  assert.ok(at(b, 10).algae > at(a, 10).algae);
});
