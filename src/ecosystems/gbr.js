// Great Barrier Reef — outer reef site. Shore is toward +z.
// Fore-reef slope with spur-and-groove (z < -15) -> shallow reef crest where the wave breaks -> sandy back-reef lagoon with bommies.
import { makeNoise, smoothstep, lerp, clamp } from '../core/noise.js';
import { species as speciesInfo, missions } from '../content/gbr.js';

const noise = makeNoise(42);
const BOMMIES = [
  [-22, -32, 6, 5.5], [18, -48, 7, 6], [-45, -10, 5, 3.2], [35, 18, 6, 3.5], [-30, 30, 7, 3.6],
  [8, 40, 5, 3], [52, -25, 6, 5], [-60, -45, 6, 6], [-8, 15, 4, 2.5], [25, -5, 4, 2.2],
];

function baseProfile(z) {
  // depth (negative) along the shore-normal axis
  if (z < -15) {
    const t = smoothstep(-15, -95, z);
    return lerp(-3.4, -23, Math.pow(t, 0.8)) + (z < -95 ? (z + 95) * 0.06 : 0);
  }
  if (z < 8) return lerp(-3.4, -3.0, smoothstep(-15, 0, z)) - smoothstep(2, 8, z) * 1.2;
  return lerp(-4.2, -7.5, smoothstep(8, 40, z)) + smoothstep(90, 150, z) * 6;
}

export function heightAt(x, z) {
  let h = baseProfile(z);
  // Spur-and-groove on the fore-reef.
  const sg = smoothstep(-80, -55, z) * (1 - smoothstep(-22, -12, z));
  h += sg * (Math.sin(x * 0.42 + noise.n2(x * 0.02, z * 0.02) * 3) * 1.6 + 0.6);
  // Reef framework roughness on hard substrate; smoother sand elsewhere.
  const reefy = reefiness(x, z);
  h += noise.fbm2(x * 0.06, z * 0.06, 5) * (0.6 + reefy * 1.4);
  h += noise.fbm2(x * 0.3, z * 0.3, 3) * 0.25 * reefy;
  for (const [bx, bz, r, ht] of BOMMIES) {
    const d = Math.hypot(x - bx, z - bz) / r;
    if (d < 2.2) h += ht * Math.exp(-d * d * 1.6) * (0.85 + 0.3 * noise.n2(x * 0.4, z * 0.4));
  }
  return Math.min(h, -1.6);
}

export function reefiness(x, z) {
  let r = smoothstep(-70, -50, z) * (1 - smoothstep(12, 22, z)); // fore-reef + crest
  r = Math.max(r * (0.75 + 0.25 * noise.n2(x * 0.05, z * 0.05)), 0);
  for (const [bx, bz, rad] of BOMMIES) r = Math.max(r, 1 - smoothstep(rad * 0.8, rad * 1.6, Math.hypot(x - bx, z - bz)));
  return clamp(r, 0, 1);
}

export function colorAt(x, z, h, slope) {
  const reef = reefiness(x, z);
  const sandN = noise.n2(x * 0.15, z * 0.15) * 0.06;
  const sand = [0.74 + sandN, 0.68 + sandN, 0.55 + sandN];
  const n = noise.n2(x * 0.35 + 9, z * 0.35);
  // Reef rock with coralline algae (pink/purple) and turf (olive).
  const rock = n > 0.15 ? [0.62, 0.42, 0.5] : n < -0.2 ? [0.38, 0.4, 0.26] : [0.5, 0.44, 0.38];
  const t = clamp(reef * 1.2 - slope * 0.5, 0, 1);
  return [lerp(sand[0], rock[0], t), lerp(sand[1], rock[1], t), lerp(sand[2], rock[2], t)];
}

// Fixed points of interest
const STATION = { x: -22, z: -32 };   // cleaning station on top of a bommie
const ANEMONES = [[4, 4], [-12, 9]];

export const gbr = {
  id: 'gbr',
  name: 'Great Barrier Reef',
  place: 'Outer reef, Queensland',
  blurb: 'Warm, clear tropical water over a coral reef — the largest living structure on Earth.',
  terrainSize: 320, terrainSegments: 256, seabedKind: 'sand',
  heightAt, colorAt, reefiness,
  bounds: { xMin: -80, xMax: 80, zMin: -90, zMax: 65 },
  water: {
    // Gameplay-tuned light absorption per metre (red lost first) and underwater fog.
    absorb: [0.3, 0.075, 0.05], fog: 0x0b6684, fogDeep: 0x042c44, fogDensity: 0.042,
    shallow: 0x37d6c6, mid: 0x0f86a0, deep: 0x04324a,
    skyTop: 0x1c64c8, skyHorizon: 0xa6d8ef, sun: [0.35, 0.82, -0.45],
  },
  surf: { H: 2.4, speed: 5.5, peel: 6.4, peakX: 22, z0: -75, breakZ: -12, endZ: 60, lineupZ: -26, lineupX: 14 },
  station: STATION,
  anemones: ANEMONES,
  island: { x: 120, z: 520, r: 160, h: 14 },
  speciesInfo,
  missions,
  // Placement rules for corals: [kind, count, zoneFn(x,z,h) -> weight]
  coral: [
    ['staghorn', 550, (x, z, h) => (z > -25 && z < 30 ? 1 : 0.35) * (h > -10 ? 1 : 0.25)],
    ['bushcoral', 300, (x, z, h) => (h > -12 ? 1 : 0.3)],
    ['tablecoral', 175, (x, z, h) => (z > -50 && z < 4 ? 1 : 0.15) * (h > -15 ? 1 : 0.2)],
    ['platecoral', 150, (x, z, h) => (h < -6 ? 1 : 0.3)],
    ['braincoral', 200, () => 1],
    ['porites', 125, (x, z) => (z > -60 ? 1 : 0.4)],
    ['leathercoral', 150, (x, z) => (z < -5 ? 1 : 0.4)],
    ['softtree', 100, (x, z, h) => (h < -8 ? 1 : 0.15)],
    ['sponge', 62, (x, z, h) => (h < -8 ? 1 : 0.1)],
    ['seafan', 75, (x, z, h) => (h < -10 ? 1 : 0.05)],
  ],
  // Creature populations: speciesId -> count (scaled by quality)
  life: {
    clownfish: 6, bluetang: 9, moorishidol: 6, cleanerwrasse: 3, parrotfish: 7, humpheadwrasse: 2, coraltrout: 6,
    chromis: 140, trevally: 55, butterflyfish: 8, angelfish: 5, boxfish: 4, reefshark: 3, manta: 1, bluespottedray: 4,
    turtle: 2, giantclam: 3, cots: 4, seacucumber: 6, anemone: ANEMONES.length,
  },
  labDefaults: { temp: 0, nutrients: 0.2, cots: 0.15, fishing: 0.2 },
};
