// Places procedural corals over the seabed as instanced meshes and records pick spheres.
import * as THREE from 'three';
import { staghorn, bushCoral, plateCoral, barrelSponge, softTree, tableCoral, brainCoral, porites, leatherCoral, seaFan, rock } from './coral.js';
import { patchUnderwater } from '../ocean/shaders.js';
import { mulberry32 } from '../core/noise.js';

const GENERATORS = {
  staghorn: { fn: staghorn, variants: 4, scale: [0.9, 1.6], radius: 0.9, sink: 0.05, rough: 0.7, cluster: 7 },
  bushcoral: { fn: bushCoral, variants: 3, scale: [0.8, 1.4], radius: 0.5, sink: 0.04, rough: 0.7, cluster: 5, as: 'staghorn' },
  platecoral: { fn: plateCoral, variants: 3, scale: [0.9, 1.6], radius: 0.6, sink: 0.04, rough: 0.75, cluster: 3, as: 'tablecoral' },
  sponge: { fn: barrelSponge, variants: 2, scale: [0.8, 1.6], radius: 0.4, sink: 0.03, rough: 0.9 },
  softtree: { fn: softTree, variants: 3, scale: [0.8, 1.5], radius: 0.4, sink: 0.02, rough: 0.6, sway: 0.35, cluster: 3, as: 'leathercoral' },
  tablecoral: { fn: tableCoral, variants: 3, scale: [0.9, 1.5], radius: 1.1, sink: 0.05, rough: 0.75 },
  braincoral: { fn: brainCoral, variants: 3, scale: [0.6, 1.6], radius: 0.5, sink: 0.05, rough: 0.8 },
  porites: { fn: porites, variants: 3, scale: [0.8, 2.4], radius: 0.95, sink: 0.12, rough: 0.85 },
  leathercoral: { fn: leatherCoral, variants: 2, scale: [0.8, 1.5], radius: 0.45, sink: 0.02, rough: 0.7, sway: 0.25 },
  seafan: { fn: seaFan, variants: 2, scale: [1.4, 2.4], radius: 0.8, sink: 0.02, rough: 0.7, sway: 0.03, upright: true },
  rock: { fn: rock, variants: 3, scale: [0.6, 1.8], radius: 0.5, sink: 0.15, rough: 0.95 },
  // Temperate / other ecosystems register more generators via addGenerator().
};
export function addGenerator(name, def) { GENERATORS[name] = def; }

/** Boost vertex-colour saturation: water strips colour with depth, so corals start out vivid. */
function saturate(geo, sat, val) {
  const c = geo.attributes.color; if (!c) return geo;
  const col = new THREE.Color(), hsl = {};
  for (let i = 0; i < c.count; i++) {
    col.setRGB(c.getX(i), c.getY(i), c.getZ(i)); col.getHSL(hsl);
    col.setHSL(hsl.h, Math.min(1, hsl.s * sat), hsl.l * val);
    c.setXYZ(i, col.r, col.g, col.b);
  }
  return geo;
}

export class Reef {
  constructor(scene, eco, terrain, quality, seed = 11) {
    this.group = new THREE.Group();
    scene.add(this.group);
    this.picks = []; // {x,y,z,r,id}
    this.meshes = [];
    this.byKind = {}; // kind -> [{ im, mats }] for lab-driven visibility
    const rnd = mulberry32(seed);
    const rules = [...eco.coral, ...(eco.rocks === 0 ? [] : [['rock', eco.rocks ?? 160, (x, z) => eco.reefiness(x, z)]])];
    const b = eco.bounds;
    for (const [kind, count0, weightFn] of rules) {
      const gen = GENERATORS[kind];
      if (!gen) continue;
      const count = Math.round(count0 * quality.coralScale);
      const geos = Array.from({ length: gen.variants }, (_, i) => saturate(gen.fn(1000 + i * 17 + seed), kind === 'rock' ? 1.1 : 1.45, kind === 'rock' ? 0.85 : 0.9));
      const placements = geos.map(() => []);
      let tries = 0;
      let cx = 0, cz = 0, left = 0;
      let placed = 0;
      while (placed < count && tries++ < count * 60) {
        let x, z;
        if (gen.cluster && left > 0) { x = cx + (rnd() - 0.5) * 2 * (1 + gen.cluster * 0.35); z = cz + (rnd() - 0.5) * 2 * (1 + gen.cluster * 0.35); }
        else { x = b.xMin - 10 + rnd() * (b.xMax - b.xMin + 20); z = b.zMin - 10 + rnd() * (b.zMax - b.zMin + 20); }
        const h = terrain.heightAt(x, z);
        const reef = eco.reefiness(x, z);
        const w = weightFn(x, z, h) * (kind === 'rock' ? 1 : 0.15 + reef);
        if (rnd() > w) continue;
        if (h > (gen.maxH ?? -1.9) || h < (gen.minH ?? -1e9)) continue; // keep clear of the surface (unless the plant grows out of it)
        // Slope check — sit on reasonably flat ground.
        const e = 0.6;
        const sx = terrain.heightAt(x + e, z) - terrain.heightAt(x - e, z), sz = terrain.heightAt(x, z + e) - terrain.heightAt(x, z - e);
        if (Math.hypot(sx, sz) / (2 * e) > (kind === 'rock' ? 1.4 : 0.8)) continue;
        const s = gen.scale[0] + rnd() * (gen.scale[1] - gen.scale[0]);
        placements[Math.floor(rnd() * gen.variants)].push({ x, z, y: h - gen.sink * s, s, rot: rnd() * Math.PI * 2, n: [sx, sz] });
        placed++;
        if (gen.cluster) { if (left <= 0) { cx = x; cz = z; left = gen.cluster; } else left--; }
      }
      geos.forEach((geo, vi) => {
        const list = placements[vi];
        if (!list.length) return;
        const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: gen.rough, metalness: 0, side: gen.upright ? THREE.DoubleSide : THREE.FrontSide });
        // Only reef-building/soft corals with zooxanthellae bleach (not sea fans, sponges or rock).
        patchUnderwater(mat, { coral: gen.bleaches ?? !['rock', 'seafan', 'sponge'].includes(kind), sway: gen.sway ?? 0, detail: true, detailScale: gen.detailScale ?? 38 });
        const im = new THREE.InstancedMesh(geo, mat, list.length);
        const bleach = new Float32Array(list.length);
        const tint = new THREE.Color();
        const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler();
        list.forEach((p, i) => {
          // Tilt slightly with the slope (except upright sea fans, which face into the current).
          e3.set(gen.upright ? 0 : -p.n[1] * 0.3, p.rot, gen.upright ? 0 : p.n[0] * 0.3);
          q.setFromEuler(e3);
          m.compose(new THREE.Vector3(p.x, p.y, p.z), q, new THREE.Vector3(p.s, p.s * (0.85 + rnd() * 0.3), p.s));
          im.setMatrixAt(i, m);
          // Colony-to-colony colour variation (hue shifts as well as brightness).
          const v = 0.8 + rnd() * 0.35, hueShift = rnd();
          tint.setRGB(v * (hueShift < 0.33 ? 1.1 : 0.92), v * (hueShift > 0.66 ? 1.08 : 0.95), v * (hueShift > 0.33 && hueShift < 0.66 ? 1.12 : 0.9));
          im.setColorAt(i, tint);
          bleach[i] = 0.15 + rnd() * 0.8; // individual colony thresholds -> patchy bleaching
          p.pick = kind !== 'rock' ? { x: p.x, y: p.y + gen.radius * p.s * 0.5, z: p.z, r: gen.radius * p.s * 0.8, id: gen.as ?? kind, kind: 'coral' } : null;
          if (p.pick) this.picks.push(p.pick);
        });
        geo.setAttribute('aBleach', new THREE.InstancedBufferAttribute(bleach, 1));
        im.instanceMatrix.needsUpdate = true;
        im.computeBoundingSphere();
        const mats = []; for (let i = 0; i < list.length; i++) { const mm = new THREE.Matrix4(); im.getMatrixAt(i, mm); mats.push(mm); }
        (this.byKind[gen.as ?? kind] ??= []).push({ im, mats, picks: list.map(p => p.pick) });
        this.group.add(im);
        this.meshes.push(im);
      });
    }
  }
  /** Show only a fraction (0..1) of a habitat-forming kind, e.g. kelp lost to urchin barrens. */
  setKindFraction(kind, f) {
    const zero = new THREE.Matrix4().makeScale(0, 0, 0);
    for (const { im, mats, picks } of this.byKind[kind] ?? []) {
      mats.forEach((m, i) => {
        const show = ((i * 0.6180339) % 1) < f;
        im.setMatrixAt(i, show ? m : zero);
        if (picks[i]) picks[i].hidden = !show; // removed habitat can't be photographed, clicked or bumped into
      });
      im.instanceMatrix.needsUpdate = true;
    }
  }
  dispose() {
    for (const m of this.meshes) { m.geometry.dispose(); m.material.dispose(); }
    this.group.parent?.remove(this.group);
  }
}
