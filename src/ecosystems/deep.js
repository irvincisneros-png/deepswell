// Deep sea: a Tasmanian seamount explored by research submersible (twilight zone 200–1000 m).
import * as THREE from 'three';
import { makeNoise, smoothstep, lerp, clamp } from '../core/noise.js';
import { species as speciesInfo, missions } from '../content/deep.js';
import { seamountModel } from '../learn/labs.js';
import { addGenerator } from '../world/reef.js';
import { registerBehaviour, registerLook } from '../life/life.js';
import { paint as P } from '../life/looks.js';
import * as FL from '../world/flora.js';
import { rock } from '../world/coral.js';

const noise = makeNoise(13);
const SCAR = { x: 45, z: 40, r: 38 }; // old trawl ground on the north-east flank
const inScar = (x, z) => Math.hypot(x - SCAR.x, z - SCAR.z) < SCAR.r;
export function heightAt(x, z) {
  const r = Math.hypot(x, z);
  let h = -600 - 360 * smoothstep(10, 170, r) - 40 * smoothstep(170, 260, r);
  // Ridges and pinnacles on the flanks; trawl scar is smoothed and flattened.
  const rough = inScar(x, z) ? 0.35 : 1;
  h += (noise.fbm2(x * 0.02, z * 0.02, 4) * 30 + Math.abs(noise.n2(x * 0.06, z * 0.06)) * 10) * rough;
  return h;
}
export function reefiness(x, z) {
  const h = heightAt(x, z);
  if (inScar(x, z)) return 0.05;
  return clamp(smoothstep(-880, -720, h), 0, 1) * (0.7 + 0.3 * noise.n2(x * 0.05, z * 0.05));
}
export function colorAt(x, z, h) {
  const n = noise.n2(x * 0.2, z * 0.2) * 0.05;
  if (inScar(x, z)) return [0.4 + n, 0.39 + n, 0.37 + n];       // bare rubble left by trawl nets
  const reef = reefiness(x, z);
  return [lerp(0.26, 0.34, reef) + n, lerp(0.24, 0.3, reef) + n, lerp(0.22, 0.28, reef) + n];
}

addGenerator('deepcoral', { fn: FL.deepCoral, variants: 4, scale: [1.2, 2.4], radius: 0.8, sink: 0.05, rough: 0.6, cluster: 10, bleaches: false, as: 'seamountcoral', maxH: -100, detailScale: 30 });
addGenerator('bamboo', { fn: FL.bambooCoral, variants: 3, scale: [1.2, 2.2], radius: 0.5, sink: 0.02, rough: 0.5, sway: 0.02, bleaches: false, as: 'bamboocoral', maxH: -100 });
addGenerator('glasssponge', { fn: FL.glassSponge, variants: 3, scale: [1, 2], radius: 0.4, sink: 0.02, rough: 0.4, bleaches: false, as: 'glasssponge', maxH: -100 });
addGenerator('deeprock', { fn: rock, variants: 3, scale: [1.5, 5], radius: 1.4, sink: 0.4, rough: 0.95, bleaches: false, maxH: -100 });

const { C, mix, sm, withEye, counter, hash } = P;
const looks = {
  lanternfish: { length: 0.09, depth: 0.22, width: 0.12, peak: 0.6, snout: 0.5, tailFrac: 0.2, tail: 'forked', pectoral: 0.1,
    dorsal: { from: 0.4, to: 0.6, height: 0.08 }, anal: { from: 0.2, to: 0.4, height: 0.06 },
    paint: { body: withEye((u, s) => mix(C(0x6a7480), C(0x1a1e26), sm(-0.4, 0.4, s)), 0.86, 0.15, 0.09, 0x050505, 0x8a9ab0),
      glow: (u, s) => ((s < -0.3 && s > -0.85 && (u * 28) % 1 < 0.35) ? 1 : 0), fin: () => C(0x30343c) },
    glowColor: [0.35, 0.75, 1.0], glowIntensity: 3, swim: { freq: 9, amp: 0.9 }, metal: 0.4 },
  hatchetfish: { length: 0.07, depth: 0.75, width: 0.08, peak: 0.6, snout: 0.6, tailFrac: 0.18, tail: 'forked', pectoral: 0.1, peduncle: 0.12,
    dorsal: { from: 0.35, to: 0.5, height: 0.08 }, anal: { from: 0.2, to: 0.45, height: 0.06 },
    paint: { body: withEye((u, s) => mix(C(0xe8eef4), C(0x3a4250), sm(0.2, 0.8, s)), 0.84, 0.35, 0.12, 0x050505, 0xa0b0c8), glow: (u, s) => (s < -0.75 && (u * 20) % 1 < 0.5 ? 1 : 0), fin: () => C(0xb0b8c4) },
    glowColor: [0.3, 0.7, 1.0], glowIntensity: 2.5, swim: { freq: 6, amp: 0.5 }, metal: 0.9 },
  anglerfish: { length: 0.18, depth: 0.7, width: 0.6, peak: 0.55, snout: 0.25, tailFrac: 0.18, tail: 'round', pectoral: 0.1, belly: 0.2,
    dorsal: { from: 0.85, to: 0.95, height: 0.5, streamer: 0.6 }, anal: { from: 0.1, to: 0.25, height: 0.1 },
    paint: { body: withEye((u, s) => (u > 0.93 && Math.abs(s + 0.15) < 0.3 ? C(0xdddddd) : C(0x15100e)), 0.82, 0.45, 0.04, 0x0a0a0a, 0x403020),
      glow: () => 0, glowFin: u => (u > 0.93 ? 1 : 0), fin: (u, part, f) => (part === 'dorsal' && f > 0.75 ? C(0xe0f0ff) : C(0x15100e)) },
    glowColor: [0.5, 0.95, 1.0], glowIntensity: 6, swim: { freq: 2, amp: 0.3 } },
  gulpereel: { length: 0.8, depth: 0.1, width: 0.06, peak: 0.88, snout: 0.15, tailFrac: 0.02, tail: 'none', pectoral: 0.02, peduncle: 0.02,
    dorsal: { from: 0.1, to: 0.8, height: 0.015 }, anal: { from: 0.1, to: 0.7, height: 0.015 },
    paint: { body: withEye(() => C(0x101014), 0.97, 0.3, 0.02), glow: (u) => (u < 0.03 ? 1 : 0), fin: () => C(0x101014) },
    glowColor: [1.0, 0.4, 0.5], glowIntensity: 3, swim: { freq: 2, amp: 1.2 }, waveK: 10 },
  orangeroughy: { length: 0.4, depth: 0.5, width: 0.17, peak: 0.55, snout: 0.5, tailFrac: 0.17, tail: 'forked', pectoral: 0.13,
    dorsal: { from: 0.2, to: 0.75, height: 0.1, shape: 'tri' }, anal: { from: 0.18, to: 0.4, height: 0.08 },
    paint: { body: withEye((u, s) => mix(C(0xf08050), C(0xd85030), sm(-0.4, 0.6, s)).map(v => v * (0.9 + 0.1 * Math.sin(u * 160))), 0.86, 0.3, 0.07, 0x101010, 0xe0a070), fin: () => C(0xe06a40) },
    swim: { freq: 3, amp: 0.5 } },
  oreodory: { length: 0.35, depth: 0.7, width: 0.12, peak: 0.5, snout: 0.6, tailFrac: 0.16, tail: 'truncate', pectoral: 0.12,
    dorsal: { from: 0.25, to: 0.75, height: 0.1, shape: 'tri' }, anal: { from: 0.2, to: 0.5, height: 0.08 },
    paint: { body: withEye((u, s) => mix(C(0x3a3a40), C(0x18181c), sm(-0.4, 0.6, s)), 0.86, 0.25, 0.07, 0x101010, 0x9090a0), fin: () => C(0x222228) },
    swim: { freq: 3, amp: 0.4 } },
  dragonfish: { length: 0.25, depth: 0.12, width: 0.08, peak: 0.75, snout: 0.6, tailFrac: 0.14, tail: 'round', pectoral: 0.04,
    dorsal: { from: 0.05, to: 0.15, height: 0.08 }, anal: { from: 0.05, to: 0.15, height: 0.08 },
    paint: { body: withEye(() => C(0x0a0a0c), 0.93, 0.25, 0.03), glow: (u, s) => (Math.hypot(u - 0.88, (s + 0.05) * 0.4) < 0.025 ? 1 : (s < -0.6 && (u * 30) % 1 < 0.2 ? 0.35 : 0)), fin: () => C(0x0a0a0c) },
    glowColor: [1.0, 0.25, 0.2], glowIntensity: 5, swim: { freq: 3, amp: 0.8 } },
  sixgill: { length: 3.5, depth: 0.15, width: 0.15, peak: 0.6, snout: 0.6, tailFrac: 0.3, tail: 'heterocercal', tailSpan: 1.2, pectoral: 0.15, pecWing: 0.4, pecAt: 0.72,
    dorsal: { from: 0.32, to: 0.4, height: 0.06, shape: 'tri' }, anal: { from: 0.2, to: 0.28, height: 0.04 },
    paint: { body: withEye(counter(0x4a4a42, 0x9a968a, 1), 0.93, 0.2, 0.025, 0x40e080, 0x103020), fin: () => C(0x4a4a42) },
    swim: { freq: 1.2, amp: 0.6 } },
  grenadier: { length: 0.6, depth: 0.2, width: 0.12, peak: 0.85, snout: 0.9, tailFrac: 0.02, tail: 'none', pectoral: 0.08, peduncle: 0.02,
    dorsal: { from: 0.75, to: 0.85, height: 0.12, shape: 'tri' }, anal: { from: 0.05, to: 0.7, height: 0.04 },
    paint: { body: withEye((u, s) => mix(C(0xa8a49a), C(0x6a665e), sm(-0.4, 0.6, s)), 0.92, 0.3, 0.06, 0x101010, 0x8a8a8a), fin: () => C(0x6a665e) },
    swim: { freq: 2, amp: 0.8 }, waveK: 8 },
  snailfish: { length: 0.3, depth: 0.3, width: 0.2, peak: 0.75, snout: 0.35, tailFrac: 0.03, tail: 'round', pectoral: 0.2, pecWing: 0.6, peduncle: 0.05,
    dorsal: { from: 0.05, to: 0.7, height: 0.06 }, anal: { from: 0.05, to: 0.6, height: 0.05 },
    paint: { body: withEye((u, s) => mix(C(0xf0d0d0), C(0xd8a8b0), sm(-0.5, 0.5, s)), 0.92, 0.3, 0.04), fin: () => C(0xe8c0c8) },
    swim: { freq: 2, amp: 0.7 }, transparent: 0.8, smooth: true },
};
for (const [id, l] of Object.entries(looks)) registerLook(id, l);

const B = {
  lanternfish: { type: 'school', speed: 0.35, flee: 2, groupSize: 35, at: [0, -45], spread: 70, y: -330, glow: true },
  hatchetfish: { type: 'school', speed: 0.25, flee: 2, groupSize: 25, at: [25, -30], spread: 50, y: -430, glow: true },
  anglerfish: { type: 'ambush', radius: 3, speed: 0.05, alt: [2, 4], flee: 1, glow: true },
  vampiresquid: { type: 'drift', gen: 'vampiresquid', place: 'water', depth: [-560, -450], emissive: [0.08, 0.2, 0.5], emissiveIntensity: 1.2, radius: 0.25, speed: 0.08, glow: true, scale: [1.2, 1.6] },
  gulpereel: { type: 'wander', radius: 40, speed: 0.2, alt: [6, 25], flee: 1, glow: true },
  orangeroughy: { type: 'school', speed: 0.3, flee: 3, groupSize: 35, at: [8, -14], spread: 20, y: -612 },
  oreodory: { type: 'school', speed: 0.3, flee: 3, groupSize: 20, at: [-30, 15], spread: 20, y: -660 },
  dragonfish: { type: 'wander', radius: 30, speed: 0.3, alt: [15, 60], flee: 2, glow: true },
  atolla: { type: 'drift', gen: 'jellyfish', opts: { radius: 0.12, color: [0.5, 0.05, 0.08], rim: [0.7, 0.1, 0.12], ring: [0.3, 0.6, 1.0], arms: 0, tentacles: 20, tentLen: 1.5, dome: 0.35 }, place: 'water', depth: [-600, -380], emissive: [0.15, 0.35, 0.9], emissiveIntensity: 1.6, pulse: true, transparent: 0.85, radius: 0.2, speed: 0.06, glow: true },
  siphonophore: { type: 'drift', gen: 'siphonophore', place: 'water', depth: [-520, -300], emissive: [0.2, 0.25, 0.6], emissiveIntensity: 0.8, transparent: 0.75, radius: 1.5, speed: 0.04, glow: true, scale: [1.5, 2.5] },
  combjelly: { type: 'drift', gen: 'combjelly', place: 'water', depth: [-560, -250], emissive: [0.35, 0.25, 0.5], emissiveIntensity: 0.8, transparent: 0.6, radius: 0.12, speed: 0.05, scale: [1, 2] },
  giantisopod: { type: 'crawl', gen: 'isopod', place: 'reef', speed: 0.02, radius: 0.25, scale: [1.2, 1.6] },
  brittlestar: { type: 'static', gen: 'brittlestar', place: 'coral:seamountcoral', onTop: 0.7, radius: 0.15, scale: [1, 1.8] },
  sixgill: { type: 'patrol', speed: 0.5, flee: 4, center: [0, 0], y: -650 },
  grenadier: { type: 'wander', radius: 35, speed: 0.25, alt: [0.6, 2], flee: 2 },
  snailfish: { type: 'wander', radius: 20, speed: 0.15, alt: [0.3, 1.2], flee: 1.5 },
};
for (const [id, b] of Object.entries(B)) registerBehaviour(id, b);

export const deep = {
  id: 'deep',
  name: 'Deep sea',
  place: 'Tasmanian seamount, by submersible',
  blurb: 'Pilot a research submersible into the twilight zone: bioluminescence, orange roughy and a slow-growing deep-sea coral reef.',
  terrainSize: 520, terrainSegments: 192, seabedKind: 'rock', seed: 13, rocks: 0,
  heightAt, colorAt, reefiness, reefRange: [-880, -600],
  bounds: { xMin: -150, xMax: 150, zMin: -150, zMax: 150 },
  vehicle: 'sub', ceiling: -150,
  water: {
    shafts: 0,
    absorb: [0, 0, 0], caustics: 0, fog: 0x02101c, fogDeep: 0x000306, fogDensity: 0.05, fogDepthScale: 700,
    shallow: 0x0a3050, mid: 0x062038, deep: 0x020a14,
    skyTop: 0x1a4a8a, skyHorizon: 0x8ab0d0, sun: [0.3, 0.9, -0.3], sunIntensity: 0, ambient: 0.05, envBelow: 0,
    hemiSky: 0x203850, hemiGround: 0x000000,
  },
  sound: { wash: 0.3, wind: 0.3, shrimp: 0, deep: 1 },
  surf: null,
  diveSpawn: { x: 0, y: -170, z: -70, yaw: Math.PI },
  menuCam: { look: [-28, -619, 14], r: 9, y: -603 },
  diveLabel: 'Launch submersible',
  diveIntro: 'Submersible launched at 170 m — sunlight is almost gone. Hold C to descend (Shift to boost) toward the seamount summit at about 600 m. Your lights only reach a few metres: look for living light.',
  boundsMsg: 'Sonar warning: leaving the survey area. Turn back toward the seamount.',
  growMsg: 'Growing a thousand-year-old coral reef…',
  island: null,
  speciesInfo, missions,
  coral: [
    ['deepcoral', 1100, (x, z, h) => (inScar(x, z) ? 0 : 1) * (h > -820 ? 1 : 0.1)],
    ['bamboo', 90, (x, z, h) => (inScar(x, z) ? 0 : 1) * (h < -650 ? 1 : 0.3)],
    ['glasssponge', 70, (x, z, h) => (h < -700 ? 1 : 0.2)],
    ['deeprock', 140, (x, z) => (inScar(x, z) ? 1 : 0.4)],
  ],
  life: {
    lanternfish: 140, hatchetfish: 50, anglerfish: 3, vampiresquid: 3, gulpereel: 2, orangeroughy: 70, oreodory: 40, dragonfish: 4,
    atolla: 10, siphonophore: 3, combjelly: 14, giantisopod: 5, brittlestar: 40, sixgill: 1, grenadier: 10, snailfish: 5,
  },
  lab: {
    title: 'Seamount trawling lab',
    intro: 'Bottom trawling for orange roughy drags heavy nets across seamounts. Set the trawling effort, decide whether a marine park protects the seamount after year 1, then fast-forward up to 10 years.',
    note: 'Simplified teaching model. Deep-sea coral grows about 1 mm a year, so real recovery takes centuries.',
    defaults: { trawl: 0.4, protect: false, years: 10 },
    sliders: [
      { id: 'trawl', label: 'Trawling effort', min: 0, max: 1, step: 0.05, fmt: v => `${Math.round(v * 100)}%`, help: 'How often nets are dragged over the seamount each year' },
    ],
    toggles: [{ id: 'protect', label: 'Declare a no-trawl marine park after year 1' }],
    lines: [
      { key: 'coral', label: 'Living coral cover', color: '#f0e0e0' },
      { key: 'rubble', label: 'Rubble', color: '#8a8a8a' },
      { key: 'roughy', label: 'Orange roughy (index)', color: '#ff8a50', dashed: true },
    ],
    readouts: [{ key: 'coral', label: 'living coral', fmt: v => `${Math.round(v * 100)}%` }, { key: 'roughy', label: 'roughy index', fmt: v => v.toFixed(2) }],
    simulate: seamountModel,
    explain: inp => [
      inp.trawl > 0 ? `Trawling at ${Math.round(inp.trawl * 100)}% smashes coral much faster than it can grow back.` : 'No trawling: the reef keeps growing very slowly.',
      inp.protect ? 'The marine park stops trawling after year 1 — notice how little the coral recovers within 10 years.' : '',
      'Orange roughy can live over 100 years and breed late, so their numbers recover slowly too.',
    ].filter(Boolean).join(' '),
    check: r => (r.final.coral < 0.21 ? ['trawled'] : []),
    apply(game, s) {
      game.world.reef.setKindFraction('seamountcoral', Math.min(1, s.coral / 0.7));
      game.world.reef.setKindFraction('bamboocoral', Math.min(1, s.coral / 0.7));
      game.world.life.setCount('orangeroughy', Math.min(1, s.roughy / 0.8));
      game.world.life.setCount('brittlestar', Math.min(1, s.coral / 0.7));
    },
  },
};
