// Great Barrier Reef — outer reef site. Shore is toward +z.
// Fore-reef slope with spur-and-groove (z < -15) -> shallow reef crest where the wave breaks -> sandy back-reef lagoon with bommies.
import { makeNoise, smoothstep, lerp, clamp } from '../core/noise.js';
import { species as speciesInfo, missions } from '../content/gbr.js';
import { simulate, explain } from '../learn/reefModel.js';
import { globalUniforms } from '../ocean/shaders.js';

const noise = makeNoise(42);
const BOMMIES = [
  [-22, -46, 6, 4.2], [18, -52, 7, 5.5], [-45, -10, 5, 3.2], [35, 18, 6, 3.5], [-30, 30, 7, 3.6],
  [8, 40, 5, 3], [52, -25, 6, 2.2], [-60, -45, 6, 6], [-8, 15, 4, 2.5], [25, -5, 4, 2.2],
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
const STATION = { x: -22, z: -46 };   // cleaning station on top of a bommie
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
  // Healthy coral reefs crackle with snapping shrimp; quieter as coral dies (game.reefHealth from the lab).
  sound: { wash: 1, wind: 0.25, shrimp: 1, gulls: 0.5 },
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
  lab: {
    title: 'Reef health lab',
    intro: 'Change the pressures on this reef and fast-forward time. The reef around you changes too — press "Look at the reef" to swim among the results, then explain what happened.',
    note: 'Simplified teaching model: it shows the direction of change, not a forecast. Heat stress assumes about 6 weeks above the bleaching threshold each hot summer.',
    defaults: { temp: 0, every: false, nutrients: 0.2, cots: 0.15, fishing: 0.2 },
    sliders: [
      { id: 'temp', label: 'Summer sea temperature', min: 0, max: 3, step: 0.1, fmt: v => `+${(+v).toFixed(1)} °C`, help: '°C above the normal summer maximum' },
      { id: 'nutrients', label: 'Nutrient runoff', min: 0, max: 1, step: 0.05, fmt: v => `${Math.round(v * 100)}%`, help: 'Fertiliser and sediment from farms and rivers' },
      { id: 'cots', label: 'Crown-of-thorns starfish', min: 0, max: 1, step: 0.05, fmt: v => `${Math.round(v * 100)}%`, help: 'Starting starfish density (relative)' },
      { id: 'fishing', label: 'Fishing pressure', min: 0, max: 1, step: 0.05, fmt: v => `${Math.round(v * 100)}%`, help: 'Removal of herbivores and predators' },
    ],
    toggles: [{ id: 'every', label: 'Heatwave every summer (not just year 1)' }],
    lines: [
      { key: 'coral', label: 'Coral cover', color: '#ff8f6b' },
      { key: 'algae', label: 'Algae cover', color: '#8bd16a' },
      { key: 'bleach', label: 'Colonies bleached', color: '#f2f2f2' },
      { key: 'cots', label: 'Starfish (relative index)', color: '#c58bff', dashed: true },
    ],
    readouts: [{ key: 'coral', label: 'coral cover', fmt: v => `${Math.round(v * 100)}%` }, { key: 'algae', label: 'algae cover', fmt: v => `${Math.round(v * 100)}%` }],
    simulate: (inp, years, start) => simulate(inp, years, start ?? undefined),
    explain,
    check: r => (r.max.bleach > 0.5 ? ['bleaching'] : []),
    apply(game, s) {
      game.reefHealth = Math.min(1, s.coral / 0.32);
      globalUniforms.uBleach.value = Math.min(1, s.bleach * 1.05);
      globalUniforms.uDead.value = Math.min(1, Math.max(0, (0.32 - s.coral) / 0.32) * 1.1);
      // Functional groups come from the species cards so the lab never contradicts the field guide.
      const feeding = Object.fromEntries(speciesInfo.map(sp => [sp.id, sp.feeding]));
      game.world.life.setAbundance(id => feeding[id] === 'herbivore' ? s.herb : feeding[id] === 'carnivore' ? s.pred
        : (feeding[id] === 'planktivore' || feeding[id] === 'corallivore') ? Math.min(1, 0.2 + s.coral / 0.32 * 0.8) : 1);
      game.world.life.setCount('cots', Math.min(1, s.cots * 2.5));
    },
  },
};
