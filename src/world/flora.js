// Procedural algae, seagrasses, mangroves and deep-sea habitat builders (vertex-coloured, base at y = 0).
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { makeNoise, mulberry32 } from '../core/noise.js';

const noise = makeNoise(19);
const UP = new THREE.Vector3(0, 1, 0);
const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

function colorize(geo, fn) {
  const p = geo.attributes.position, col = new Float32Array(p.count * 3), v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const c = fn(v, i); col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2]; }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return geo;
}
function strip(geo) {
  for (const k of Object.keys(geo.attributes)) if (!['position', 'normal', 'color'].includes(k)) geo.deleteAttribute(k);
  return geo.index ? geo.toNonIndexed() : geo;
}
function tube(a, b, r0, r1, radial, colA, colB) {
  const len = a.distanceTo(b);
  const g = new THREE.CylinderGeometry(r1, r0, len, radial, 1, true);
  g.translate(0, len / 2, 0);
  const dir = new THREE.Vector3().subVectors(b, a).normalize();
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, dir));
  g.translate(a.x, a.y, a.z);
  colorize(g, v => lerp3(colA, colB, Math.min(1, Math.max(0, new THREE.Vector3().subVectors(v, a).dot(dir) / len))));
  return strip(g);
}
/** A flat ribbon following a curve: points[] centre-line, widths[] per point, facing normal. */
function ribbon(points, widths, side, colFn) {
  const pos = [], col = [], idx = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i], w = widths[i];
    const t = i / (points.length - 1);
    const a = p.clone().addScaledVector(side, -w / 2), b = p.clone().addScaledVector(side, w / 2);
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
    const c = colFn(t); col.push(...c, ...c);
    if (i) { const k = (i - 1) * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx); g.computeVertexNormals();
  return strip(g);
}

/** Golden kelp (Ecklonia radiata): stipe topped by a strap-like frond with lateral blades. */
export function kelp(seed) {
  const rnd = mulberry32(seed);
  const parts = [];
  const H = 0.6 + rnd() * 0.5;
  const stipeTop = new THREE.Vector3((rnd() - 0.5) * 0.1, H, (rnd() - 0.5) * 0.1);
  parts.push(tube(new THREE.Vector3(), stipeTop, 0.022, 0.016, 5, [0.32, 0.22, 0.1], [0.45, 0.32, 0.12]));
  // Holdfast
  const hf = new THREE.SphereGeometry(0.07, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2); hf.scale(1.4, 0.6, 1.4);
  colorize(hf, () => [0.3, 0.22, 0.12]); parts.push(strip(hf));
  const gold = [0.62, 0.45, 0.14], dark = [0.4, 0.27, 0.08];
  // Primary frond: blades fanning out from the stipe top, drooping.
  const blades = 6 + Math.floor(rnd() * 4);
  for (let b = 0; b < blades; b++) {
    const ang = rnd() * Math.PI * 2, len = 0.45 + rnd() * 0.35, rise = 0.25 + rnd() * 0.3;
    const dir = new THREE.Vector3(Math.cos(ang), 0, Math.sin(ang));
    const pts = [], ws = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      pts.push(stipeTop.clone().addScaledVector(dir, t * len).add(new THREE.Vector3(0, Math.sin(t * Math.PI * 0.8) * rise * len - t * t * 0.15, 0)));
      ws.push(0.07 * Math.sin(Math.PI * Math.min(1, t * 1.1 + 0.05)) + 0.01);
    }
    const side = new THREE.Vector3().crossVectors(dir, UP).normalize();
    // Twist the blade so it isn't perfectly flat
    side.applyAxisAngle(dir, (rnd() - 0.5) * 0.8);
    parts.push(ribbon(pts, ws, side, t => lerp3(dark, gold, 0.3 + t * 0.7).map(c => c * (0.9 + 0.2 * Math.sin(t * 20 + b)))));
  }
  return mergeGeometries(parts);
}

/** Crayweed (Phyllospora comosa): tall, bushy strands with small leaflets. */
export function crayweed(seed) {
  const rnd = mulberry32(seed);
  const parts = [];
  const strands = 4 + Math.floor(rnd() * 3);
  for (let s = 0; s < strands; s++) {
    const ang = rnd() * Math.PI * 2, H = 1.0 + rnd() * 0.8;
    const lean = new THREE.Vector3(Math.cos(ang) * 0.25, 1, Math.sin(ang) * 0.25).normalize();
    const pts = [], ws = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(lean.clone().multiplyScalar(t * H).add(new THREE.Vector3(Math.sin(t * 5 + s) * 0.05, 0, Math.cos(t * 4 + s) * 0.05))); ws.push(0.03); }
    const side = new THREE.Vector3(-Math.sin(ang), 0, Math.cos(ang));
    parts.push(ribbon(pts, ws, side, t => lerp3([0.25, 0.2, 0.08], [0.45, 0.38, 0.12], t)));
    for (let i = 1; i < 12; i++) {
      const p = pts[i];
      const d = new THREE.Vector3(rnd() - 0.5, 0.3, rnd() - 0.5).normalize();
      parts.push(ribbon([p, p.clone().addScaledVector(d, 0.09)], [0.025, 0.006], new THREE.Vector3(-d.z, 0, d.x).normalize(), () => [0.5, 0.42, 0.14]));
    }
  }
  return mergeGeometries(parts);
}

/** Seagrass clump (Zostera): curved ribbon blades. */
export function seagrassClump(seed, opts = {}) {
  const rnd = mulberry32(seed);
  const parts = [];
  const n = opts.blades ?? 14;
  const base = opts.base ?? [0.15, 0.3, 0.1], tip = opts.tip ?? [0.42, 0.6, 0.2];
  for (let b = 0; b < n; b++) {
    const ang = rnd() * Math.PI * 2, H = (opts.height ?? 0.4) * (0.6 + rnd() * 0.7);
    const off = new THREE.Vector3(Math.cos(ang) * 0.06 * rnd(), 0, Math.sin(ang) * 0.06 * rnd());
    const bend = new THREE.Vector3(Math.cos(ang), 0, Math.sin(ang)).multiplyScalar(0.15 + rnd() * 0.25);
    const pts = [], ws = [];
    for (let i = 0; i <= 6; i++) { const t = i / 6; pts.push(off.clone().add(new THREE.Vector3(bend.x * t * t * H, t * H * (1 - 0.15 * t), bend.z * t * t * H))); ws.push((opts.width ?? 0.008) * (1 - t * 0.4)); }
    const side = new THREE.Vector3(-Math.sin(ang + 1), 0, Math.cos(ang + 1));
    parts.push(ribbon(pts, ws, side, t => lerp3(base, tip, t).map(c => c * (0.85 + rnd() * 0.3))));
  }
  return mergeGeometries(parts);
}
/** Paddle weed (Halophila ovalis): pairs of oval leaves on short stalks, close to the sand. */
export function halophila(seed) {
  const rnd = mulberry32(seed);
  const parts = [];
  for (let i = 0; i < 16; i++) {
    const x = (rnd() - 0.5) * 0.5, z = (rnd() - 0.5) * 0.5;
    for (const s of [-1, 1]) {
      const g = new THREE.CircleGeometry(0.018, 8); g.scale(1, 1.8, 1);
      g.rotateX(-Math.PI / 2 + 0.6 * s); g.translate(x + s * 0.012, 0.03, z);
      colorize(g, () => [0.25 + rnd() * 0.1, 0.45, 0.15]);
      parts.push(strip(g));
    }
  }
  return mergeGeometries(parts);
}

/** Grey mangrove (Avicennia marina): trunk rising above the water with a rounded canopy. */
export function mangroveTree(seed) {
  const rnd = mulberry32(seed);
  const parts = [];
  const bark = [0.42, 0.38, 0.33], leaf = [0.22, 0.32, 0.18];
  const H = 3 + rnd() * 2;
  const top = new THREE.Vector3((rnd() - 0.5) * 0.6, H, (rnd() - 0.5) * 0.6);
  parts.push(tube(new THREE.Vector3(), top, 0.16, 0.09, 8, bark, bark));
  for (let b = 0; b < 5; b++) {
    const ang = rnd() * Math.PI * 2;
    const p0 = new THREE.Vector3().lerp(top, 0.55 + rnd() * 0.4);
    const p1 = p0.clone().add(new THREE.Vector3(Math.cos(ang) * 1.2, 0.8 + rnd(), Math.sin(ang) * 1.2));
    parts.push(tube(p0, p1, 0.07, 0.04, 6, bark, bark));
    for (let k = 0; k < 4; k++) {
      let g = new THREE.IcosahedronGeometry(0.6 + rnd() * 0.5, 2);
      g.deleteAttribute('uv'); g.deleteAttribute('normal'); g = mergeVertices(g);
      const p = g.attributes.position, v = new THREE.Vector3();
      for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); v.multiplyScalar(1 + noise.n3(v.x * 3 + seed, v.y * 3, v.z * 3) * 0.3); p.setXYZ(i, v.x, v.y * 0.7, v.z); }
      g.computeVertexNormals();
      g.translate(p1.x + (rnd() - 0.5) * 1.2, p1.y + (rnd() - 0.3) * 0.6, p1.z + (rnd() - 0.5) * 1.2);
      colorize(g, v => leaf.map(c => c * (0.8 + 0.4 * noise.n3(v.x * 4, v.y * 4, v.z * 4))));
      parts.push(strip(g));
    }
  }
  return mergeGeometries(parts);
}
/** Pneumatophores: pencil-like breathing roots poking up from the mud. */
export function pneumatophores(seed) {
  const rnd = mulberry32(seed);
  const parts = [];
  for (let i = 0; i < 26; i++) {
    const x = (rnd() - 0.5) * 1.6, z = (rnd() - 0.5) * 1.6, h = 0.12 + rnd() * 0.25;
    parts.push(tube(new THREE.Vector3(x, 0, z), new THREE.Vector3(x + (rnd() - 0.5) * 0.03, h, z), 0.012, 0.008, 4, [0.3, 0.27, 0.22], [0.5, 0.45, 0.38]));
  }
  return mergeGeometries(parts);
}

/** Barrel/vase sponge used in temperate sponge gardens and deep glass-sponge fields. */
export function vaseSponge(seed, opts = {}) {
  const rnd = mulberry32(seed);
  const pts = [];
  const H = (opts.height ?? 0.5) * (0.7 + rnd() * 0.6);
  for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push(new THREE.Vector2(0.05 + (opts.flare ?? 0.18) * Math.pow(t, 0.8) + 0.02 * Math.sin(t * 9), t * H)); }
  pts.push(new THREE.Vector2(pts[10].x * 0.85, H * 0.97));
  let g = new THREE.LatheGeometry(pts, 20);
  g.deleteAttribute('uv');
  const col = opts.colors ? opts.colors[seed % opts.colors.length] : [0.85, 0.55, 0.2];
  colorize(g, v => col.map(c => c * (0.75 + 0.35 * (v.y / H))));
  return strip(g);
}
/** Finger sponge: a few upright lobes. */
export function fingerSponge(seed) {
  const rnd = mulberry32(seed);
  const parts = [];
  const cols = [[0.95, 0.75, 0.2], [0.85, 0.35, 0.25], [0.6, 0.3, 0.6]];
  const c = cols[seed % cols.length];
  for (let i = 0; i < 5; i++) {
    const a = rnd() * Math.PI * 2, x = Math.cos(a) * 0.06, z = Math.sin(a) * 0.06;
    parts.push(tube(new THREE.Vector3(x, 0, z), new THREE.Vector3(x * 3, 0.25 + rnd() * 0.25, z * 3), 0.035, 0.03, 6, c, c.map(v => v * 1.1)));
  }
  return mergeGeometries(parts);
}

/** Deep-sea scleractinian reef (Solenosmilia): dense white-pink bushy branching thicket. */
export function deepCoral(seed) {
  const rnd = mulberry32(seed);
  const parts = [];
  const base = [0.85, 0.75, 0.72], tip = [1.0, 0.92, 0.9];
  const grow = (p, dir, len, rad, depth) => {
    const end = p.clone().addScaledVector(dir, len);
    parts.push(tube(p, end, rad, rad * 0.85, 4, base, tip));
    if (depth <= 0) return;
    for (let i = 0; i < 2; i++) {
      const nd = dir.clone().applyAxisAngle(new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(), 0.5 + rnd() * 0.5).normalize();
      if (nd.y < 0.1) nd.y = 0.1;
      grow(end, nd.normalize(), len * 0.85, rad * 0.85, depth - 1);
    }
  };
  for (let i = 0; i < 6; i++) { const a = rnd() * Math.PI * 2; grow(new THREE.Vector3(Math.cos(a) * 0.1, 0, Math.sin(a) * 0.1), new THREE.Vector3(Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5).normalize(), 0.12, 0.018, 5); }
  return mergeGeometries(parts);
}
/** Bamboo coral: tall whip with segmented white/dark joints and fine side branches. */
export function bambooCoral(seed) {
  const rnd = mulberry32(seed);
  const parts = [];
  let p = new THREE.Vector3(), dir = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < 14; i++) {
    const next = p.clone().addScaledVector(dir, 0.12);
    parts.push(tube(p, next, 0.02, 0.018, 5, i % 2 ? [0.25, 0.18, 0.12] : [0.92, 0.9, 0.85], i % 2 ? [0.25, 0.18, 0.12] : [0.92, 0.9, 0.85]));
    if (i > 3 && i % 2 === 0) for (const s of [-1, 1]) {
      const d = new THREE.Vector3(s * 0.8, 0.7, (rnd() - 0.5) * 0.4).normalize();
      parts.push(tube(next, next.clone().addScaledVector(d, 0.25 + rnd() * 0.2), 0.008, 0.004, 3, [0.9, 0.88, 0.82], [0.95, 0.75, 0.6]));
    }
    p = next; dir.add(new THREE.Vector3((rnd() - 0.5) * 0.15, 0, (rnd() - 0.5) * 0.15)).normalize();
  }
  return mergeGeometries(parts);
}
/** Glass sponge: tall translucent-looking vase with lattice ridges. */
export function glassSponge(seed) {
  return vaseSponge(seed, { height: 0.9, flare: 0.12, colors: [[0.85, 0.85, 0.78], [0.8, 0.82, 0.75]] });
}

/** Cunjevoi (Pyura): clumps of leathery barrel-shaped sea squirts. */
export function cunjevoi(seed) {
  const rnd = mulberry32(seed);
  const parts = [];
  for (let i = 0; i < 7; i++) {
    const g = new THREE.CylinderGeometry(0.06, 0.07, 0.16, 10, 2);
    g.translate((rnd() - 0.5) * 0.3, 0.08, (rnd() - 0.5) * 0.3);
    colorize(g, v => v.y > 0.14 ? [0.55, 0.3, 0.25] : [0.35, 0.3, 0.22]);
    parts.push(strip(g));
  }
  return mergeGeometries(parts);
}
/** Long-spined sea urchin. */
export function urchin(seed) {
  const rnd = mulberry32(seed);
  const parts = [];
  const body = new THREE.SphereGeometry(0.06, 12, 8); body.scale(1, 0.7, 1); body.translate(0, 0.04, 0);
  colorize(body, () => [0.12, 0.08, 0.12]); parts.push(strip(body));
  for (let i = 0; i < 70; i++) {
    const d = new THREE.Vector3(rnd() - 0.5, rnd() * 0.9 + 0.05, rnd() - 0.5).normalize();
    const p0 = d.clone().multiplyScalar(0.055).add(new THREE.Vector3(0, 0.04, 0));
    parts.push(tube(p0, p0.clone().addScaledVector(d, 0.14 + rnd() * 0.08), 0.004, 0.001, 3, [0.15, 0.08, 0.18], [0.3, 0.12, 0.35]));
  }
  return mergeGeometries(parts);
}
/** Blacklip abalone: low ear-shaped shell. */
export function abalone(seed) {
  const g = new THREE.SphereGeometry(0.08, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  g.scale(1.4, 0.45, 1);
  colorize(g, v => { const r = Math.hypot(v.x, v.z); return Math.sin(r * 120) > 0.3 ? [0.45, 0.4, 0.32] : [0.3, 0.32, 0.25]; });
  return strip(g);
}
