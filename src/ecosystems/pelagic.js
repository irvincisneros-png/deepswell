// Open ocean off the NSW shelf edge — blue water, no reachable seafloor. Freedive from a boat.
import * as THREE from 'three';
import { makeNoise } from '../core/noise.js';
import { species as speciesInfo, missions } from '../content/pelagic.js';
import { planktonModel } from '../learn/labs.js';
import { registerBehaviour, registerLook } from '../life/life.js';
import { paint as P } from '../life/looks.js';

const noise = makeNoise(5);
const BALL = [0, -26];
export const heightAt = (x, z) => -125 + noise.fbm2(x * 0.01, z * 0.01, 3) * 6;
export const colorAt = () => [0.45, 0.42, 0.36];
export const reefiness = () => 0;

const { C, mix, sm, withEye, spots, counter, hash } = P;
const looks = {
  humpback: { length: 13, depth: 0.2, width: 0.24, peak: 0.42, snout: 0.5, tailFrac: 0.12, tail: 'fluke', tailSpan: 1.7, pectoral: 0.3, pecWing: 0.7, pecAt: 0.7, smooth: true, vertical: true,
    dorsal: { from: 0.28, to: 0.36, height: 0.02 }, anal: null,
    paint: { body: withEye((u, s) => { if (s < -0.25 && u > 0.6) return Math.sin(s * 60) > 0.5 ? C(0x6a6a6a) : C(0xd8d8d0); const knob = u > 0.88 && s > 0.3 && hash(Math.floor(u * 80), Math.floor(s * 20)) > 0.8; return knob ? C(0x5a5a5a) : mix(C(0x2a2c30), C(0x3a3c40), s); }, 0.84, -0.05, 0.006, 0x050505, 0x222222), fin: (u, part) => (part === 'pectoral' ? C(0xe0e0d8) : C(0x2a2c30)) }, swim: { freq: 0.35, amp: 0.8 }, rough: 0.4 },
  bottlenose: { length: 2.6, depth: 0.22, width: 0.22, peak: 0.45, snout: 1.6, tailFrac: 0.13, tail: 'fluke', tailSpan: 1.2, pectoral: 0.09, pecWing: 0.15, pecAt: 0.74, smooth: true, vertical: true,
    dorsal: { from: 0.45, to: 0.6, height: 0.11, shape: 'tri' }, anal: null,
    paint: { body: withEye(counter(0x6a7480, 0xe8ecee, 1), 0.88, 0.15, 0.012, 0x0a0a0a, 0x333333), fin: () => C(0x5a6470) }, swim: { freq: 1.6, amp: 0.8 }, rough: 0.3 },
  commondolphin: { length: 2.0, depth: 0.2, width: 0.2, peak: 0.45, snout: 1.7, tailFrac: 0.13, tail: 'fluke', tailSpan: 1.2, pectoral: 0.08, pecWing: 0.15, pecAt: 0.74, smooth: true, vertical: true,
    dorsal: { from: 0.45, to: 0.6, height: 0.12, shape: 'tri' }, anal: null,
    paint: { body: withEye((u, s) => { if (s > 0.35) return C(0x2a3038); const hour = Math.abs(s - 0.05 + Math.sin(u * Math.PI) * 0.15) < 0.22; if (hour && u > 0.55) return C(0xd8b860); if (hour) return C(0x9aa0a8); return s < -0.3 ? C(0xf0f0ee) : C(0x5a6068); }, 0.88, 0.15, 0.012), fin: () => C(0x2a3038) }, swim: { freq: 2, amp: 0.8 }, rough: 0.3 },
  sardine: { length: 0.18, depth: 0.2, width: 0.11, peak: 0.55, snout: 0.9, tailFrac: 0.2, tail: 'forked', pectoral: 0.08,
    dorsal: { from: 0.45, to: 0.6, height: 0.08 }, anal: { from: 0.15, to: 0.3, height: 0.04 },
    paint: { body: withEye(spots((u, s) => mix(C(0xf0f4f6), C(0x2a5a8a), sm(0.05, 0.6, s)), 0x101820, 20, 0.12, (u, s) => Math.abs(s - 0.1) < 0.12), 0.9, 0.2, 0.06), fin: () => C(0xb0c0c8) }, swim: { freq: 9, amp: 0.9 }, metal: 0.7 },
  yellowfin: { length: 1.4, depth: 0.26, width: 0.17, peak: 0.52, snout: 0.9, tailFrac: 0.2, tail: 'lunate', tailSpan: 1.8, pectoral: 0.17,
    dorsal: { from: 0.4, to: 0.62, height: 0.2, shape: 'sail' }, anal: { from: 0.3, to: 0.45, height: 0.18 },
    paint: { body: withEye((u, s) => { if (Math.abs(s - 0.15) < 0.06 && u > 0.3) return C(0xe8c030); return mix(C(0xe8eef2), C(0x1a2a5a), sm(0, 0.55, s)); }, 0.9, 0.2, 0.03), fin: (u, part) => (part === 'dorsal' || part === 'anal' ? C(0xf0c820) : C(0x2a3a6a)) }, swim: { freq: 4.5, amp: 0.45 }, metal: 0.6 },
  bronzewhaler: { length: 2.5, depth: 0.17, width: 0.16, peak: 0.6, snout: 1.1, tailFrac: 0.24, tail: 'heterocercal', tailSpan: 1.5, pectoral: 0.22, pecWing: 0.6, pecAt: 0.7,
    dorsal: { from: 0.5, to: 0.68, height: 0.13, shape: 'tri' }, anal: { from: 0.12, to: 0.18, height: 0.04 },
    paint: { body: withEye(counter(0x8a7a50, 0xf0ece4, 1.2), 0.93, 0.25, 0.012, 0x050505, 0x222222), fin: () => C(0x7a6a46) }, swim: { freq: 1.8, amp: 0.65 } },
  mako: { length: 2.8, depth: 0.16, width: 0.15, peak: 0.6, snout: 1.4, tailFrac: 0.22, tail: 'lunate', tailSpan: 1.8, pectoral: 0.2, pecWing: 0.5, pecAt: 0.7,
    dorsal: { from: 0.5, to: 0.66, height: 0.13, shape: 'tri' }, anal: { from: 0.12, to: 0.18, height: 0.04 },
    paint: { body: withEye(counter(0x2a4a8a, 0xf2f2f0, 1.4), 0.93, 0.25, 0.015, 0x050505, 0x111111), fin: () => C(0x2a4a8a) }, swim: { freq: 2.4, amp: 0.5 }, metal: 0.2 },
  oceanicmanta: { kind: 'manta', length: 2.4, span: 5.5, thick: 0.28, tail: 0.4,
    paint: (u, v, top) => { if (!top) { const sp = hash(Math.floor(u * 18), Math.floor(v * 18)) > 0.94 && Math.abs(v - 0.5) < 0.2; return sp ? C(0x1a1a1a) : C(0xf2f2ee); } const ch = Math.abs(v - 0.5) > 0.14 && Math.abs(v - 0.5) < 0.38 && u > 0.5 && u < 0.62 + Math.abs(v - 0.5) * 0.3; return ch ? C(0xe8e8e0) : C(0x14181e); }, swim: { freq: 0.9, amp: 0.6 } },
  sunfish: { length: 1.8, depth: 1.0, width: 0.16, peak: 0.45, snout: 0.5, tailFrac: 0.06, tail: 'round', tailSpan: 1.2, pectoral: 0.06, peduncle: 0.55,
    dorsal: { from: 0.12, to: 0.24, height: 0.55, shape: 'tri' }, anal: { from: 0.12, to: 0.24, height: 0.55 },
    paint: { body: withEye((u, s) => mix(C(0xd8dcdc), C(0x7a8086), sm(-0.4, 0.8, s)).map(v => v * (0.92 + 0.12 * hash(Math.floor(u * 40), Math.floor(s * 40)))), 0.84, 0.15, 0.03), fin: () => C(0x7a8086) }, swim: { freq: 0.8, amp: 0.2 } },
  krill: { length: 0.025, depth: 0.16, width: 0.14, peak: 0.6, snout: 1.2, tailFrac: 0.15, tail: 'forked', pectoral: 0.2,
    dorsal: null, anal: { from: 0.4, to: 0.9, height: 0.12 },
    paint: { body: (u, s) => (u > 0.85 ? C(0x111111) : mix(C(0xf0a090), C(0xd86050), sm(-0.3, 0.6, s))), fin: () => C(0xf0b0a0) }, swim: { freq: 14, amp: 1 }, transparent: 0.85 },
  flyingfish: { length: 0.32, depth: 0.16, width: 0.13, peak: 0.6, snout: 0.9, tailFrac: 0.2, tail: 'heterocercal', tailSpan: 1.2, pectoral: 0.5, pecWing: 1.6, pecAt: 0.68,
    dorsal: { from: 0.25, to: 0.4, height: 0.05 }, anal: { from: 0.2, to: 0.32, height: 0.04 },
    paint: { body: withEye((u, s) => mix(C(0xe8eef4), C(0x1a3a7a), sm(0, 0.5, s)), 0.9, 0.2, 0.05), fin: (u, part) => (part === 'pectoral' ? C(0x6a8ab8) : C(0x2a4a8a)) }, swim: { freq: 6, amp: 0.6 }, metal: 0.5 },
  shearwater: { length: 0.42, depth: 0.22, width: 0.22, peak: 0.6, snout: 1.3, tailFrac: 0.15, tail: 'truncate', pectoral: 0.6, pecWing: 2.2, pecAt: 0.62, smooth: true, flap: true,
    dorsal: null, anal: null,
    paint: { body: withEye((u, s) => mix(C(0x8a7a6a), C(0x3a3026), sm(-0.6, 0.3, s)), 0.92, 0.2, 0.03), fin: () => C(0x3a3026) }, swim: { freq: 5, amp: 0.4 } },
};
for (const [id, l] of Object.entries(looks)) registerLook(id, l);

const B = {
  sardine: { type: 'baitball', speed: 0.9, radius: 2.4, at: BALL, y: -9, flee: 1 },
  commondolphin: { type: 'hunter', speed: 2.4, at: BALL, spread: 20, y: -6, breathEvery: 25, breathTime: 2, blow: false },
  yellowfin: { type: 'hunter', speed: 2.8, at: BALL, spread: 20, y: -9 },
  bronzewhaler: { type: 'hunter', speed: 1.4, at: BALL, spread: 30, y: -12 },
  bottlenose: { type: 'breather', radius: 45, speed: 1.6, breathEvery: 18, breathTime: 2, y: -4, flee: 3, at: [30, 10] },
  humpback: { type: 'migrate', speed: 1.5, breathEvery: 35, breathTime: 4, y: -11, lane: 35, blow: true },
  mako: { type: 'patrol', speed: 2.2, center: [-10, -10], y: -16, flee: 6 },
  oceanicmanta: { type: 'patrol', speed: 0.7, center: [-30, 25], y: -9, flee: 3 },
  sunfish: { type: 'patrol', speed: 0.3, center: [25, -5], y: -2.6, flee: 2 },
  loggerhead: { type: 'turtle', speed: 0.4, flee: 2.5, at: [15, 15], y: -4, colors: { shell: [0.52, 0.3, 0.14], skin: 0x8a6040 }, size: 1.1 },
  shearwater: { type: 'bird', speed: 4, at: BALL, spread: 20 },
  krill: { type: 'school', speed: 0.15, flee: 0.5, groupSize: 120, at: [-22, 6], spread: 4, y: -12 },
  flyingfish: { type: 'school', speed: 1.2, flee: 4, groupSize: 8, at: [25, -30], spread: 10, y: -0.7 },
  bluebottle: { type: 'drift', gen: 'bluebottle', place: 'surface', radius: 0.15, speed: 0.12, transparent: 0.85, scale: [1, 1.5] },
  salp: { type: 'drift', gen: 'salp', place: 'water', depth: [-14, -3], radius: 0.4, speed: 0.04, transparent: 0.55 },
  moonjelly: { type: 'drift', gen: 'jellyfish', opts: { radius: 0.18, color: [0.85, 0.88, 0.95], rim: [0.95, 0.95, 1.0], ring: [0.85, 0.7, 0.9], arms: 4, armLen: 1.2, tentacles: 24, tentLen: 0.6, dome: 0.4 }, place: 'water', depth: [-12, -2], transparent: 0.55, pulse: true, radius: 0.25, speed: 0.06 },
  phytoplankton: { type: 'cloud', at: [-18, 0], y: -6, radius: 14, count: 2600, color: [0.5, 0.85, 0.45], size: 0.06 },
};
for (const [id, b] of Object.entries(B)) registerBehaviour(id, b);

export const pelagic = {
  id: 'pelagic',
  name: 'Open ocean',
  place: 'NSW shelf edge',
  blurb: 'Blue water with no bottom in sight: a sardine bait ball, dolphins, tuna, sharks and migrating humpbacks.',
  terrainSize: 400, terrainSegments: 64, seabedKind: 'sand', seed: 5, rocks: 0,
  heightAt, colorAt, reefiness,
  bounds: { xMin: -90, xMax: 90, zMin: -90, zMax: 90 },
  water: {
    shafts: 0.35,
    absorb: [0.26, 0.05, 0.022], fog: 0x0c4f8e, fogDeep: 0x041d40, fogDensity: 0.024, fogDepthScale: 40,
    shallow: 0x0e5e9e, mid: 0x0b4f8a, deep: 0x05274f, caustics: 0.6,
    skyTop: 0x1e66c8, skyHorizon: 0xb8daf2, sun: [0.4, 0.8, -0.4], sunIntensity: 2.7,
    hemiSky: 0xbfe0ff, hemiGround: 0x0a2a50,
  },
  surf: null,
  diveSpawn: { x: 6, z: -6, yaw: Math.PI * 0.9 },
  menuCam: { look: [0, -9, -26], r: 13, y: -7 },
  boat: { x: 0, z: 0 },
  diveIntro: 'Blue water in every direction — the bottom is over 100 m below. Stay close to the boat and look for birds diving: that means a bait ball.',
  boundsMsg: 'You\'re drifting too far from the boat — your buddy signals you back.',
  island: null,
  speciesInfo, missions,
  coral: [],
  life: {
    sardine: 280, commondolphin: 6, yellowfin: 10, bronzewhaler: 3, bottlenose: 4, humpback: 2, mako: 1, oceanicmanta: 1, sunfish: 1,
    loggerhead: 2, shearwater: 6, krill: 240, flyingfish: 8, bluebottle: 24, salp: 25, moonjelly: 18, phytoplankton: 1,
  },
  lab: {
    title: 'Plankton food-chain lab',
    intro: 'Everything here runs on phytoplankton. Change how much nutrient-rich deep water mixes up to the surface, how warm the surface layer is, and how many sardines are fished — then watch the whole food chain respond.',
    note: 'Simplified teaching model. Each line is a relative index (0–1) of that group\'s own maximum — the lines can\'t be compared as amounts of biomass or energy.',
    defaults: { upwelling: 0.3, warming: 0, fishing: 0.2 },
    sliders: [
      { id: 'upwelling', label: 'Upwelling / eddy mixing', min: 0, max: 1, step: 0.05, fmt: v => `${Math.round(v * 100)}%`, help: 'Brings nutrient-rich deep water up into the sunlit layer' },
      { id: 'warming', label: 'Surface warming', min: 0, max: 2, step: 0.1, fmt: v => `+${(+v).toFixed(1)} °C`, help: 'A warm surface layer blocks mixing (stratification)' },
      { id: 'fishing', label: 'Sardine fishing', min: 0, max: 1, step: 0.05, fmt: v => `${Math.round(v * 100)}%` },
    ],
    lines: [
      { key: 'phyto', label: 'Phytoplankton (index)', color: '#7ad06a' },
      { key: 'krill', label: 'Krill (index)', color: '#ff9a8a' },
      { key: 'sardine', label: 'Sardines (index)', color: '#9ac8f0' },
      { key: 'pred', label: 'Predators (index)', color: '#e0c060', dashed: true },
    ],
    readouts: [{ key: 'phyto', label: 'phytoplankton', fmt: v => `${Math.round(v * 100)}%` }, { key: 'sardine', label: 'sardines', fmt: v => `${Math.round(v * 100)}%` }],
    simulate: planktonModel,
    explain: inp => [
      inp.upwelling > 0.6 ? 'Strong mixing brings nutrients up: expect a phytoplankton bloom.' : 'Little mixing: the sunlit layer runs short of nutrients.',
      inp.warming > 0.8 ? 'A warm, stratified surface layer acts like a lid, cutting off the nutrient supply.' : '',
      inp.fishing > 0.6 ? 'Heavy sardine fishing removes food for dolphins, tuna, sharks and seabirds.' : '',
    ].filter(Boolean).join(' '),
    check: r => (r.max.phyto > 0.7 ? ['bloom'] : []),
    apply(game, s) {
      const life = game.world.life;
      for (const a of life.agents) if (a.cloud) { a.cloud.material.opacity = 0.15 + s.phyto * 0.9; a.cloud.material.size = 0.03 + s.phyto * 0.06; }
      life.setCount('krill', Math.min(1, s.krill * 1.6));
      life.setCount('sardine', Math.min(1, s.sardine * 1.8));
      for (const id of ['commondolphin', 'yellowfin', 'bronzewhaler', 'shearwater']) life.setCount(id, Math.min(1, 0.2 + s.pred));
    },
  },
};
