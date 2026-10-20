// Extra Great Barrier Reef life: looks, behaviours and simple procedural fallbacks for six more species.
// (Species cards live in content/gbr.js; cosy Blender models in tools/blender/creatures.py.)
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { registerBehaviour, registerLook, registerStatic } from '../life/life.js';
import { paint as P } from '../life/looks.js';

const { C, mix, sm, withEye, hash } = P;

const looks = {
  // Blue-and-yellow fusilier (Caesio teres): blue body, yellow back from mid-body to a yellow forked tail.
  fusilier: {
    length: 0.3, depth: 0.3, width: 0.12, peak: 0.55, snout: 0.9, tailFrac: 0.2, tail: 'forked', tailSpan: 1.4, pectoral: 0.13,
    dorsal: { from: 0.25, to: 0.7, height: 0.06 }, anal: { from: 0.2, to: 0.4, height: 0.05 },
    paint: {
      body: withEye((u, s) => (s > 0.35 - (0.6 - u) * 0.9 && u < 0.7 ? C(0xffd21a) : mix(C(0x2a6ae0), C(0xa8c8ff), sm(0.2, -0.9, s))), 0.88, 0.25, 0.05),
      fin: (u, part) => part === 'tail' ? C(0xffd21a) : C(0x6a9ae8),
    },
    swim: { freq: 7, amp: 0.8 },
  },
  // Common lionfish (Pterois volitans): red-brown and white vertical stripes, fan-like pectorals, long dorsal spines.
  lionfish: {
    length: 0.3, depth: 0.32, width: 0.14, peak: 0.6, snout: 0.8, tailFrac: 0.18, tail: 'round', pectoral: 0.26, pecWing: 1.1,
    dorsal: { from: 0.2, to: 0.85, height: 0.3, shape: 'sail' }, anal: { from: 0.2, to: 0.4, height: 0.1 },
    paint: {
      body: withEye((u, s) => Math.sin(u * 46 + s * 1.5) > 0.1 ? C(0xa8402a) : C(0xf6ece4), 0.86, 0.3, 0.04),
      fin: (u, part, f) => Math.sin(f * 14 + u * 20) > -0.2 ? C(0xa8402a) : C(0xf2e6dc), // red-banded fin rays
    },
    swim: { freq: 2.4, amp: 0.3 },
  },
  // Giant moray (Gymnothorax javanicus): long and thick, yellow-brown with dark leopard spots, dark gill spot.
  giantmoray: {
    length: 1.6, depth: 0.13, width: 0.1, peak: 0.6, snout: 0.9, tailFrac: 0.02, tail: 'none', pectoral: 0, peduncle: 0.35, waveK: 2.2,
    dorsal: { from: 0.05, to: 0.85, height: 0.035 }, anal: { from: 0.05, to: 0.45, height: 0.03 },
    paint: {
      body: withEye((u, s) => {
        if (u > 0.83 && u < 0.87 && s < 0.2 && s > -0.4) return C(0x1a1410);
        const sp = hash(Math.floor(u * 70), Math.floor(s * 10 + 10)) > 0.5;
        return sp ? C(0x3a2a14) : mix(C(0x8a7a38), C(0xc8b870), sm(-0.4, 0.8, s));
      }, 0.93, 0.35, 0.012),
      fin: () => C(0x6a5a2a),
    },
    swim: { freq: 1.6, amp: 0.9 },
  },
  // Harlequin tuskfish (Choerodon fasciatus): orange-red bars edged in blue, blue "tusk" teeth.
  tuskfish: {
    length: 0.3, depth: 0.42, width: 0.14, peak: 0.55, snout: 0.6, tailFrac: 0.16, tail: 'truncate', pectoral: 0.12,
    dorsal: { from: 0.2, to: 0.8, height: 0.07 }, anal: { from: 0.2, to: 0.45, height: 0.06 },
    paint: {
      body: withEye((u, s) => {
        if (u > 0.97) return C(0x4a8aff);
        const k = (u * 9) % 1;
        if (u < 0.15) return C(0x2a2a3a);
        return k < 0.45 ? C(0xff6a2a) : k < 0.55 ? C(0x3a7ae0) : C(0xf2ecd8);
      }, 0.88, 0.3, 0.035),
      fin: (u, part) => part === 'tail' ? C(0xff7a3a) : C(0x5a8af0),
    },
    swim: { freq: 4, amp: 0.5 },
  },
};
for (const [id, l] of Object.entries(looks)) registerLook(id, l);

const B = {
  fusilier: { type: 'school', speed: 0.7, alt: [3, 8], flee: 2.5, groupSize: 45 },
  lionfish: { type: 'ambush', radius: 3, speed: 0.12, alt: [0.4, 1.4], flee: 0.8, curious: true },
  giantmoray: { type: 'ambush', radius: 1.5, speed: 0.1, alt: [0.15, 0.5], flee: 1.5 },
  tuskfish: { type: 'wander', radius: 10, speed: 0.4, alt: [0.3, 1.8], flee: 2 },
  blueseastar: { type: 'static', place: 'reef', radius: 0.14, scale: [0.8, 1.2] },
  xmasworm: { type: 'static', place: 'coral:porites,braincoral', onTop: 0.85, radius: 0.08, scale: [1.4, 1.9] },
};
for (const [id, b] of Object.entries(B)) registerBehaviour(id, b);

// Procedural fallbacks (realistic look / if the model set fails to load).
const vcol = (g, c) => { const n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) a.set(c, i * 3); g.setAttribute('color', new THREE.BufferAttribute(a, 3)); for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'color'].includes(k)) g.deleteAttribute(k); return g.index ? g.toNonIndexed() : g; };
registerStatic('blueseastar', () => {
  const parts = [vcol(new THREE.SphereGeometry(0.03, 10, 6).scale(1, 0.5, 1).translate(0, 0.012, 0), [0.15, 0.35, 0.95])];
  for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; const g = new THREE.CapsuleGeometry(0.016, 0.13, 4, 8); g.rotateZ(Math.PI / 2); g.translate(0.08, 0.012, 0); g.rotateY(a); parts.push(vcol(g, [0.18, 0.4, 0.98])); }
  return mergeGeometries(parts);
});
registerStatic('xmasworm', () => {
  const parts = [];
  for (const [x, c] of [[-0.012, [0.95, 0.3, 0.25]], [0.012, [0.95, 0.3, 0.25]]]) { const g = new THREE.ConeGeometry(0.014, 0.04, 8); g.translate(x, 0.02, 0); parts.push(vcol(g, c)); }
  return mergeGeometries(parts);
});

export const moreLife = { fusilier: 60, lionfish: 3, giantmoray: 2, tuskfish: 3, blueseastar: 12, xmasworm: 40 };
