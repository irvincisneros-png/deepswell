// NSW rocky reef & kelp forest (Illawarra, near Woonona/Bellambi). Beach toward +z.
// Deep sand + sponge gardens (z < -60) -> boulder reef with kelp forest and an urchin barren -> sandbar beach break -> beach.
import * as THREE from 'three';
import { makeNoise, smoothstep, lerp, clamp } from '../core/noise.js';
import { species as speciesInfo, missions } from '../content/rocky.js';
import { kelpModel } from '../learn/labs.js';
import { addGenerator } from '../world/reef.js';
import { registerBehaviour, registerLook } from '../life/life.js';
import { paint as P } from '../life/looks.js';
import * as FL from '../world/flora.js';
import { rock } from '../world/coral.js';

const noise = makeNoise(77);
const BARREN = { x: 28, z: -28, r: 16 };
const BOULDERS = [[-30, -40, 7, 3], [10, -50, 8, 3.5], [-55, -20, 6, 2.5], [45, -45, 7, 3], [-10, -15, 6, 2.2], [30, -5, 5, 1.8]];

function baseProfile(z) {
  if (z < -60) return lerp(-14, -18, smoothstep(-60, -95, z));
  if (z < 0) return lerp(-14, -5, smoothstep(-60, 0, z));        // boulder reef rising toward shore
  if (z < 28) return lerp(-5, -2.6, smoothstep(0, 20, z));        // sandbar where waves break
  return lerp(-2.6, -0.6, smoothstep(28, 75, z)) + smoothstep(80, 110, z) * 3;
}
export function reefiness(x, z) {
  let r = smoothstep(-66, -56, z) * (1 - smoothstep(-4, 6, z));
  r *= 0.7 + 0.3 * noise.n2(x * 0.04, z * 0.04);
  for (const [bx, bz, rad] of BOULDERS) r = Math.max(r, 1 - smoothstep(rad * 0.8, rad * 1.5, Math.hypot(x - bx, z - bz)));
  return clamp(r, 0, 1);
}
export function heightAt(x, z) {
  let h = baseProfile(z);
  const reef = reefiness(x, z);
  // Boulder field: blocky lumps + gutters running shore-normal
  h += reef * (Math.max(0, noise.fbm2(x * 0.09, z * 0.09, 4)) * 3.2 + noise.fbm2(x * 0.35, z * 0.35, 2) * 0.5);
  h -= reef * Math.pow(Math.max(0, Math.sin(x * 0.18 + noise.n2(x * 0.03, z * 0.03) * 2)), 6) * 1.6;
  h += noise.fbm2(x * 0.05, z * 0.05, 3) * 0.5;
  for (const [bx, bz, r, ht] of BOULDERS) { const d = Math.hypot(x - bx, z - bz) / r; if (d < 2) h += ht * Math.exp(-d * d * 2) * (0.8 + 0.4 * noise.n2(x * 0.5, z * 0.5)); }
  return Math.min(h, z > 70 ? 3 : -1.2);
}
export function colorAt(x, z, h, slope) {
  const reef = reefiness(x, z);
  const n = noise.n2(x * 0.3, z * 0.3);
  const sand = [0.7 + n * 0.04, 0.66 + n * 0.04, 0.55];
  const inBarren = Math.hypot(x - BARREN.x, z - BARREN.z) < BARREN.r;
  // Rock with pink coralline paint (barrens) or green-brown turf (under kelp)
  const rockC = inBarren ? (n > 0 ? [0.62, 0.45, 0.5] : [0.5, 0.42, 0.45]) : (n > 0.1 ? [0.36, 0.38, 0.24] : [0.42, 0.38, 0.3]);
  const t = clamp(reef * 1.3 - slope * 0.3, 0, 1);
  return [lerp(sand[0], rockC[0], t), lerp(sand[1], rockC[1], t), lerp(sand[2], rockC[2], t)];
}
const inBarren = (x, z) => Math.hypot(x - BARREN.x, z - BARREN.z) < BARREN.r;

// ---- Habitat-forming plants and sponges
addGenerator('kelp', { fn: FL.kelp, variants: 5, scale: [1.0, 1.7], radius: 0.7, sink: 0.02, rough: 0.6, sway: 0.22, cluster: 16, bleaches: false, as: 'kelp', detailScale: 12 });
addGenerator('crayweed', { fn: FL.crayweed, variants: 3, scale: [0.9, 1.4], radius: 0.6, sink: 0.02, rough: 0.6, sway: 0.12, cluster: 6, bleaches: false, as: 'crayweed', detailScale: 12 });
addGenerator('fingersponge', { fn: FL.fingerSponge, variants: 3, scale: [0.8, 1.6], radius: 0.35, sink: 0.02, rough: 0.9, bleaches: false, as: 'spongegarden', cluster: 4 });
addGenerator('vasesponge', { fn: s => FL.vaseSponge(s, { colors: [[0.9, 0.6, 0.2], [0.8, 0.4, 0.3], [0.7, 0.65, 0.5]] }), variants: 3, scale: [0.8, 1.5], radius: 0.35, sink: 0.02, rough: 0.9, bleaches: false, as: 'spongegarden' });
addGenerator('boulder', { fn: rock, variants: 3, scale: [1.6, 4.2], radius: 1.6, sink: 0.4, rough: 0.95, bleaches: false });

// ---- Looks (procedural fish skins)
const { C, mix, sm, withEye, bars, spots, counter, hash } = P;
const looks = {
  bluegroper: { length: 0.9, depth: 0.34, width: 0.2, peak: 0.55, snout: 0.45, tailFrac: 0.15, tail: 'round', pectoral: 0.12, belly: 0.3,
    dorsal: { from: 0.12, to: 0.8, height: 0.06 }, anal: { from: 0.12, to: 0.45, height: 0.06 },
    paint: { body: withEye((u, s) => mix(C(0x1f4fa8), C(0x3f7fd8), s * 0.5 + 0.5).map(v => v * (0.92 + 0.1 * Math.sin(u * 90 + s * 4))), 0.9, 0.3, 0.03, 0x111111, 0xd06030), fin: () => C(0x2a5cb0) }, swim: { freq: 3, amp: 0.4 } },
  redmorwong: { length: 0.5, depth: 0.36, width: 0.16, peak: 0.6, snout: 0.6, tailFrac: 0.18, tail: 'forked', pectoral: 0.16,
    dorsal: { from: 0.15, to: 0.8, height: 0.12, shape: 'tri' }, anal: { from: 0.15, to: 0.4, height: 0.08 },
    paint: { body: withEye(bars((u, s) => mix(C(0xd8d0c8), C(0xb06050), sm(-0.2, 0.8, s)), [[0.72, 0.035, 0x5a2a20], [0.55, 0.035, 0x5a2a20]]), 0.9, 0.25, 0.04), fin: () => C(0xa04030) }, swim: { freq: 3, amp: 0.5 } },
  mado: { length: 0.18, depth: 0.45, width: 0.12, peak: 0.55, snout: 0.7, tailFrac: 0.18, tail: 'forked', pectoral: 0.12,
    dorsal: { from: 0.2, to: 0.75, height: 0.14 }, anal: { from: 0.18, to: 0.45, height: 0.1 },
    paint: { body: withEye((u, s) => (Math.abs(((s * 4 + u * 0.6) % 1 + 1) % 1 - 0.5) < 0.15 ? C(0x1a1a1a) : C(0xe8e0a0)), 0.86, 0.25, 0.05), fin: () => C(0xe8d070) }, swim: { freq: 7, amp: 0.8 } },
  luderick: { length: 0.4, depth: 0.38, width: 0.15, peak: 0.55, snout: 0.6, tailFrac: 0.17, tail: 'forked', pectoral: 0.12,
    dorsal: { from: 0.15, to: 0.78, height: 0.08 }, anal: { from: 0.15, to: 0.42, height: 0.08 },
    paint: { body: withEye(bars((u, s) => mix(C(0x6a6658), C(0x3a3a32), sm(-0.4, 0.8, s)), [[0.3, 0.012, 0x222218], [0.45, 0.012, 0x222218], [0.6, 0.012, 0x222218]]), 0.9, 0.25, 0.04), fin: () => C(0x3a3a32) }, swim: { freq: 4, amp: 0.6 } },
  kingfish: { length: 1.1, depth: 0.25, width: 0.14, peak: 0.6, snout: 0.9, tailFrac: 0.22, tail: 'forked', tailSpan: 1.6, pectoral: 0.12,
    dorsal: { from: 0.2, to: 0.65, height: 0.06 }, anal: { from: 0.18, to: 0.42, height: 0.05 },
    paint: { body: withEye((u, s) => { if (Math.abs(s - 0.1) < 0.06) return C(0xd8c040); return mix(C(0xe8eef0), C(0x3a6a8a), sm(-0.1, 0.6, s)); }, 0.9, 0.25, 0.03), fin: (u, part) => (part === 'tail' ? C(0xe0c030) : C(0x5a7a8a)) }, swim: { freq: 3.5, amp: 0.6 }, metal: 0.5 },
  oldwife: { length: 0.25, depth: 0.6, width: 0.1, peak: 0.55, snout: 0.9, tailFrac: 0.15, tail: 'truncate', pectoral: 0.1,
    dorsal: { from: 0.25, to: 0.8, height: 0.25, shape: 'sail' }, anal: { from: 0.2, to: 0.5, height: 0.18 },
    paint: { body: withEye(bars(() => C(0xe8e4d8), [[0.82, 0.04, 0x1a1a1a], [0.62, 0.06, 0x1a1a1a], [0.42, 0.06, 0x1a1a1a], [0.22, 0.05, 0x1a1a1a]]), 0.88, 0.2, 0.04), fin: (u) => (u > 0.5 ? C(0x1a1a1a) : C(0xd0c8b8)) }, swim: { freq: 4, amp: 0.5 } },
  snapper: { length: 0.7, depth: 0.38, width: 0.15, peak: 0.6, snout: 0.6, tailFrac: 0.17, tail: 'forked', pectoral: 0.14,
    dorsal: { from: 0.18, to: 0.78, height: 0.08 }, anal: { from: 0.16, to: 0.4, height: 0.07 },
    paint: { body: withEye(spots((u, s) => mix(C(0xf0c8b0), C(0xc06050), sm(-0.3, 0.7, s)), 0x6ab0ff, 28, 0.12, (u, s) => s > -0.2), 0.9, 0.3, 0.035), fin: () => C(0xd07060) }, swim: { freq: 3, amp: 0.5 } },
  easternbluedevil: { length: 0.3, depth: 0.32, width: 0.15, peak: 0.55, snout: 0.6, tailFrac: 0.15, tail: 'round', pectoral: 0.14,
    dorsal: { from: 0.12, to: 0.8, height: 0.12 }, anal: { from: 0.12, to: 0.45, height: 0.12 },
    paint: { body: withEye(spots((u, s) => mix(C(0x0a1a5a), C(0x1a3aa0), s * 0.5 + 0.5), 0xbfe0ff, 30, 0.1), 0.88, 0.25, 0.04), fin: (u, part, f) => (f > 0.8 ? C(0x60c0ff) : C(0x1a3aa0)) }, swim: { freq: 2.5, amp: 0.4 } },
  greynurse: { length: 2.6, depth: 0.18, width: 0.17, peak: 0.55, snout: 1.0, tailFrac: 0.26, tail: 'heterocercal', tailSpan: 1.3, pectoral: 0.15, pecWing: 0.4,
    dorsal: { from: 0.42, to: 0.58, height: 0.09, shape: 'tri' }, anal: { from: 0.15, to: 0.25, height: 0.06 },
    paint: { body: withEye(spots(counter(0x7a7a6a, 0xe8e0d0, 1.2), 0x5a3a2a, 16, 0.12, (u, s) => s > 0 && u < 0.7), 0.92, 0.2, 0.012, 0x050505, 0x222222), fin: () => C(0x6a6a5a) }, swim: { freq: 1.6, amp: 0.6 } },
  portjackson: { length: 1.1, depth: 0.2, width: 0.2, peak: 0.75, snout: 0.35, tailFrac: 0.22, tail: 'heterocercal', tailSpan: 1.1, pectoral: 0.16, pecWing: 0.6,
    dorsal: { from: 0.55, to: 0.65, height: 0.08, shape: 'tri' }, anal: { from: 0.2, to: 0.28, height: 0.05 },
    paint: { body: withEye((u, s) => { const harness = Math.abs(u - 0.66 + Math.abs(s) * 0.15) < 0.03 || Math.abs(u - 0.42 + Math.abs(s) * 0.1) < 0.03; return harness && s > -0.3 ? C(0x2a2018) : mix(C(0xe0d4c0), C(0xa89880), sm(-0.4, 0.5, s)); }, 0.88, 0.45, 0.025), fin: () => C(0x9a8a70) }, swim: { freq: 1.8, amp: 0.5 } },
  wobbegong: { length: 1.6, depth: 0.1, width: 0.28, peak: 0.7, snout: 0.25, tailFrac: 0.2, tail: 'round', pectoral: 0.18, pecWing: 1, boxy: 3,
    dorsal: { from: 0.25, to: 0.35, height: 0.05 }, anal: null,
    paint: { body: withEye(spots((u, s) => mix(C(0xc8b080), C(0x6a5030), sm(-0.3, 0.3, s)), 0xf0e0b0, 24, 0.18, (u, s) => s > -0.2), 0.86, 0.5, 0.02), fin: () => C(0x7a6040) }, swim: { freq: 1.5, amp: 0.4 } },
  fiddlerray: { kind: 'stingray', length: 0.9, span: 0.55, thick: 0.18, tail: 0.9,
    paint: (u, v, top) => { if (!top) return C(0xf0ece4); const line = Math.abs(Math.sin((u * 6 + Math.abs(v - 0.5) * 8))) < 0.18; return line ? C(0x3a3020) : mix(C(0xa89870), C(0x7a6a48), v); }, swim: { freq: 2.5, amp: 0.4 } },
};
for (const [id, l] of Object.entries(looks)) registerLook(id, l);

// ---- Behaviours
const B = {
  bluegroper: { type: 'wander', radius: 22, speed: 0.45, alt: [1, 4], flee: 1.5, curious: true },
  redmorwong: { type: 'ambush', radius: 6, speed: 0.25, alt: [0.3, 1.2], flee: 2 },
  mado: { type: 'school', speed: 0.35, alt: [1.5, 4], flee: 2.5, groupSize: 30 },
  luderick: { type: 'grazer', radius: 14, speed: 0.45, alt: [0.6, 2.5], flee: 3 },
  kingfish: { type: 'vortex', speed: 1.5, alt: [4, 8], flee: 3, groupSize: 25, at: [-25, -72], y: -10 },
  oldwife: { type: 'pair', radius: 8, speed: 0.3, alt: [1, 3], flee: 2 },
  snapper: { type: 'wander', radius: 20, speed: 0.4, alt: [1, 3], flee: 3 },
  easternbluedevil: { type: 'ambush', radius: 2, speed: 0.15, alt: [0.2, 0.7], flee: 4 },
  greynurse: { type: 'patrol', speed: 0.55, flee: 5, center: [-10, -58], y: -12 },
  portjackson: { type: 'rest', speed: 0.6, flee: 2 },
  wobbegong: { type: 'rest', speed: 0.5, flee: 1.2, camo: true },
  fiddlerray: { type: 'rest', speed: 0.7, flee: 2.5 },
  weedyseadragon: { type: 'hover', gen: 'seadragon', place: 'coral:kelp,crayweed', onTop: 0.55, camo: true, radius: 0.25, scale: [1.4, 1.8], range: 0.25 },
  octopus: { type: 'static', gen: 'octopus', place: 'reef', depth: [-12, -4], camo: true, radius: 0.35, scale: [0.9, 1.3] },
  urchin: { type: 'static', gen: 'urchin', place: 'barren', radius: 0.18, scale: [0.9, 1.4] },
  abalone: { type: 'static', gen: 'abalone', place: 'reef', depth: [-10, -3], radius: 0.12 },
  rocklobster: { type: 'static', gen: 'rocklobster', place: 'reef', depth: [-14, -5], radius: 0.3, scale: [1.2, 1.6] },
  cunjevoi: { type: 'static', gen: 'cunjevoi', place: 'reef', depth: [-6, -2], radius: 0.25, scale: [1, 1.6] },
};
for (const [id, b] of Object.entries(B)) registerBehaviour(id, b);

export const rocky = {
  id: 'rocky',
  name: 'NSW rocky reef & kelp',
  place: 'Illawarra, NSW',
  blurb: 'Cool green water over a boulder reef: kelp forest, blue gropers, weedy seadragons — and an urchin barren.',
  terrainSize: 320, terrainSegments: 256, seabedKind: 'sand', ripple: 0.35, seed: 77,
  heightAt, colorAt, reefiness,
  bounds: { xMin: -75, xMax: 75, zMin: -90, zMax: 60 },
  water: {
    shafts: 0,
    absorb: [0.34, 0.1, 0.09], fog: 0x2d6a6c, fogDeep: 0x0f3236, fogDensity: 0.06,
    shallow: 0x5aa59a, mid: 0x2a7a80, deep: 0x0e3a48,
    skyTop: 0x3a78c0, skyHorizon: 0xc0d8e2, sun: [0.55, 0.62, -0.3], sunColor: 0xfff0dc, sunIntensity: 2.3,
    hemiSky: 0xbfe0e8, hemiGround: 0x3a5a4a,
  },
  sound: { wash: 1.2, wind: 0.4, shrimp: 0.6, gulls: 1 },
  surf: { H: 1.7, speed: 5.0, peel: 5.6, peakX: 20, z0: -50, breakZ: 14, endZ: 62, lineupZ: 4, lineupX: 12, breakName: 'Sandbar beach break',
    intro: 'Beach break on a sandbar. Waves come in sets — watch behind you, then paddle (hold W) when one approaches.' },
  diveSpawn: { x: 0, z: -18 },
  island: { x: 0, z: 290, r: 240, h: 20 }, islandKind: 'headland',
  speciesInfo, missions,
  placers: {
    // Urchins are scattered across the whole reef; outside the starting barren they are hidden until a lab run spreads it.
    barren: (rnd, terrain) => {
      for (let i = 0; i < 60; i++) {
        const a = rnd() * 6.283, r = (i < 30 && rnd() < 0.45 ? BARREN.r : 80) * Math.sqrt(rnd());
        const x = BARREN.x + Math.cos(a) * r, z = BARREN.z + Math.sin(a) * r;
        if (reefiness(x, z) > 0.3) return new THREE.Vector3(x, terrain.heightAt(x, z), z);
      }
      return new THREE.Vector3(BARREN.x, terrain.heightAt(BARREN.x, BARREN.z), BARREN.z);
    },
  },
  coral: [
    ['kelp', 1300, (x, z, h) => (inBarren(x, z) ? 0 : 1) * (h < -3 && h > -13 ? 1 : 0.1)],
    ['crayweed', 90, (x, z, h) => (inBarren(x, z) ? 0 : 1) * (h > -7 ? 1 : 0.2)],
    ['fingersponge', 70, (x, z, h) => (h < -11 ? 1 : 0.05)],
    ['vasesponge', 50, (x, z, h) => (h < -12 ? 1 : 0.05)],
    ['boulder', 160, (x, z) => reefiness(x, z)],
  ],
  life: {
    bluegroper: 3, redmorwong: 8, mado: 60, luderick: 14, kingfish: 25, oldwife: 6, snapper: 8, easternbluedevil: 3,
    greynurse: 3, portjackson: 4, wobbegong: 3, fiddlerray: 3, weedyseadragon: 5, octopus: 3, urchin: 420, abalone: 25, rocklobster: 5, cunjevoi: 30,
  },
  lab: {
    title: 'Kelp forest lab',
    intro: 'Blue gropers and rock lobsters eat sea urchins; urchins eat kelp. Change fishing and ocean warming, then fast-forward and watch the forest — or an urchin barren — appear around you.',
    note: 'Simplified teaching model of a trophic cascade. Real barrens depend on many local factors.',
    defaults: { fishing: 0.2, warming: 0, restore: false },
    sliders: [
      { id: 'fishing', label: 'Fishing of urchin predators', min: 0, max: 1, step: 0.05, fmt: v => `${Math.round(v * 100)}%`, help: 'Removal of blue groper, rock lobster and other urchin eaters' },
      { id: 'warming', label: 'Ocean warming (East Australian Current)', min: 0, max: 2, step: 0.1, fmt: v => `+${(+v).toFixed(1)} °C`, help: 'Warmer water helps long-spined urchin larvae survive further south' },
    ],
    toggles: [{ id: 'restore', label: 'Restoration: cull urchins + replant crayweed' }],
    lines: [
      { key: 'kelp', label: 'Kelp cover', color: '#d8b04a' },
      { key: 'barren', label: 'Urchin barren', color: '#e080b0' },
      { key: 'urchin', label: 'Urchins (index)', color: '#9a7aff', dashed: true },
      { key: 'pred', label: 'Predators (index)', color: '#5ab0ff', dashed: true },
    ],
    readouts: [{ key: 'kelp', label: 'kelp cover', fmt: v => `${Math.round(v * 100)}%` }, { key: 'barren', label: 'barren', fmt: v => `${Math.round(v * 100)}%` }],
    simulate: kelpModel,
    explain: inp => [
      inp.fishing > 0.5 ? 'Heavy fishing removes the predators that keep urchins in check.' : 'Predators keep the urchin population low.',
      inp.warming > 0.8 ? 'A warmer East Australian Current lets more urchin larvae survive and stresses kelp.' : '',
      inp.restore ? 'Restoration removes urchins and replants crayweed, so kelp can return.' : '',
      'Once urchins are dense they graze kelp down to bare rock — an "urchin barren" — which can persist even after conditions improve.',
    ].filter(Boolean).join(' '),
    check: r => (r.max.barren > 0.5 ? ['barren'] : []),
    apply(game, s) {
      game.reefHealth = Math.min(1, s.kelp / 0.62);
      // The barren spreads outward from its starting patch: kelp is cleared inside it, thinned elsewhere by heat stress.
      const R = BARREN.r + Math.max(0, s.barren - 0.04) * 75;
      const outside = Math.min(1, s.kelp / Math.max(0.05, 0.62 * (1 - s.barren * 0.9)));
      const keep = (x, z, i) => Math.hypot(x - BARREN.x, z - BARREN.z) > R && ((i * 0.6180339) % 1) < outside;
      game.world.reef.setKindWhere('kelp', keep);
      game.world.reef.setKindWhere('crayweed', keep);
      if (Math.abs((this._lastR ?? 0) - R) > 1.5) {
        this._lastR = R;
        game.world.terrain.recolor((x, z) => {
          const d = Math.hypot(x - BARREN.x, z - BARREN.z);
          if (d > R || reefiness(x, z) < 0.3) return null;
          return noise.n2(x * 0.3, z * 0.3) > 0 ? [0.62, 0.45, 0.5] : [0.5, 0.42, 0.45];
        });
      }
      const life = game.world.life;
      const feeding = Object.fromEntries(speciesInfo.map(sp => [sp.id, sp.feeding]));
      life.setAbundance(id => (id === 'bluegroper' || id === 'rocklobster' ? s.pred : feeding[id] === 'herbivore' && id !== 'urchin' ? Math.min(1, 0.3 + s.kelp) : 1));
      // Urchins last, so the abundance pass doesn't undo the barren footprint.
      for (const a of life.agents) if (a.id === 'urchin') { a.visible = Math.hypot(a.home.x - BARREN.x, a.home.z - BARREN.z) < R && ((a.index * 0.618) % 1) < Math.min(1, 0.3 + s.urchin); life.writeMatrix(a); }
      if (life.kinds.urchin) life.kinds.urchin.mesh.instanceMatrix.needsUpdate = true;
    },
  },
};
