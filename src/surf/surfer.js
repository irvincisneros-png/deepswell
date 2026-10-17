// Surfboard + articulated surfer with blended poses (paddle, pop-up, stance, crouch, wipeout).
import * as THREE from 'three';

function boardGeometry() {
  const L = 1.85, segs = 40, around = 16;
  const pos = [], col = [], idx = [];
  // Cross-sections along the board (t: 0 tail .. 1 nose)
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const w = 0.255 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.85)), 0.55) * (t > 0.02 ? 1 : 0.5) + 0.002;
    const th = 0.032 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.05)), 0.5) + 0.004;
    const rocker = 0.07 * Math.pow(Math.max(0, t - 0.6) / 0.4, 2.2) + 0.025 * Math.pow(Math.max(0, 0.25 - t) / 0.25, 2);
    for (let j = 0; j <= around; j++) {
      const a = (j / around) * Math.PI * 2;
      const x = (t - 0.5) * L;
      const y = rocker + Math.sin(a) * th * (Math.sin(a) > 0 ? 1 : 0.6);
      const z = Math.cos(a) * w;
      pos.push(x, y, z);
      const stripe = Math.abs(Math.cos(a)) < 0.25 && Math.sin(a) > 0;
      const rail = Math.abs(Math.sin(a)) < 0.35;
      const c = stripe && t > 0.15 && t < 0.85 ? [0.95, 0.35, 0.15] : rail ? [0.85, 0.85, 0.82] : Math.sin(a) < 0 ? [0.92, 0.92, 0.9] : [0.98, 0.97, 0.94];
      col.push(...c);
    }
  }
  for (let i = 0; i < segs; i++) for (let j = 0; j < around; j++) {
    const a = i * (around + 1) + j, b = a + around + 1;
    idx.push(a, b, a + 1, a + 1, b, b + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

// Rider frame: +x toward the board's nose, +y up, chest faces +z (the toe-side rail).
const THIGH = 0.42, SHIN = 0.42;
const PRONE_Q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(
  new THREE.Vector3(0, 0, -1), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, -1, 0)));
const POSES = {
  paddle: { prone: 1, crouch: 0, lean: 0, frontArm: 0, backArm: 0 },
  stand: { prone: 0, crouch: 0.25, lean: 0.25, frontArm: 1.15, backArm: -0.8 },
  crouch: { prone: 0, crouch: 0.85, lean: 0.6, frontArm: 0.8, backArm: -0.5 },
  sit: { prone: 0, crouch: 1, lean: 0.1, frontArm: 0.4, backArm: -0.4 },
};

export class Surfer {
  constructor(scene) {
    this.root = new THREE.Group();
    scene.add(this.root);
    const boardMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0.05 });
    this.board = new THREE.Mesh(boardGeometry(), boardMat);
    const finGeo = new THREE.BufferGeometry();
    finGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, -0.1, 0, 0, -0.09, -0.11, 0], 3));
    finGeo.computeVertexNormals();
    const finMat = new THREE.MeshStandardMaterial({ color: 0x222831, side: THREE.DoubleSide, roughness: 0.4 });
    for (const [x, z] of [[-0.8, 0], [-0.68, 0.17], [-0.68, -0.17]]) { const f = new THREE.Mesh(finGeo, finMat); f.position.set(x, 0.0, z); this.board.add(f); }
    this.root.add(this.board);
    const suit = new THREE.MeshStandardMaterial({ color: 0x15191e, roughness: 0.5 });
    const panel = new THREE.MeshStandardMaterial({ color: 0x0f9fb8, roughness: 0.45 });
    const skin = new THREE.MeshStandardMaterial({ color: 0xc58c62, roughness: 0.6 });
    const hair = new THREE.MeshStandardMaterial({ color: 0x3a2414, roughness: 0.9 });
    this.mats = [boardMat, finMat, suit, panel, skin, hair];
    const limb = (len, r, mat) => { const g = new THREE.CapsuleGeometry(r, len - r * 2, 4, 10); g.translate(0, -len / 2, 0); return new THREE.Mesh(g, mat); };
    this.rider = new THREE.Group(); this.root.add(this.rider);
    this.pelvis = new THREE.Group(); this.rider.add(this.pelvis);
    const hipsM = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.14, 4, 10), suit); hipsM.rotation.z = Math.PI / 2; hipsM.scale.set(1, 1, 0.8); this.pelvis.add(hipsM);
    this.spine = new THREE.Group(); this.pelvis.add(this.spine);
    const chest = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.3, 4, 12), suit); chest.position.y = 0.27; chest.scale.set(1.15, 1, 0.75); this.spine.add(chest);
    const band = new THREE.Mesh(new THREE.CapsuleGeometry(0.152, 0.06, 4, 12), panel); band.position.y = 0.4; band.scale.set(1.16, 1, 0.76); this.spine.add(band);
    this.neck = new THREE.Group(); this.neck.position.y = 0.56; this.spine.add(this.neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 18, 14), skin); head.position.y = 0.1; head.scale.set(0.92, 1.08, 1); this.neck.add(head);
    const hairM = new THREE.Mesh(new THREE.SphereGeometry(0.106, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), hair); hairM.position.y = 0.115; hairM.rotation.x = -0.3; this.neck.add(hairM);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 4), skin); nose.position.set(0, 0.1, 0.1); this.neck.add(nose);
    const arm = (sx) => {
      const sh = new THREE.Group(); sh.position.set(0.2 * sx, 0.47, 0); this.spine.add(sh);
      sh.add(limb(0.3, 0.052, suit));
      const el = new THREE.Group(); el.position.y = -0.3; sh.add(el);
      el.add(limb(0.27, 0.042, skin));
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.048, 8, 6), skin); hand.position.y = -0.29; el.add(hand);
      return { sh, el };
    };
    const leg = (sx) => {
      const hp = new THREE.Group(); hp.position.set(0.1 * sx, -0.04, 0); this.pelvis.add(hp);
      hp.add(limb(THIGH, 0.075, suit));
      const kn = new THREE.Group(); kn.position.y = -THIGH; hp.add(kn);
      kn.add(limb(SHIN, 0.058, suit));
      const ft = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.13, 3, 8), skin); ft.rotation.x = Math.PI / 2; ft.position.set(0, -SHIN, 0.05); kn.add(ft);
      return { hp, kn };
    };
    this.front = { arm: arm(1), leg: leg(1) };
    this.back = { arm: arm(-1), leg: leg(-1) };
    this.cur = { ...POSES.paddle };
    this.pose = 'paddle'; this.t = 0; this.tumble = null;
    this._qs = new THREE.Quaternion();
  }
  setPose(name) { this.pose = name; }
  update(dt, { paddling = false, lean = 0, pump = 0 } = {}) {
    this.t += dt;
    const target = POSES[this.pose];
    const k = 1 - Math.exp(-(this.pose === 'paddle' ? 5 : 9) * dt);
    for (const key of Object.keys(target)) this.cur[key] += (target[key] - this.cur[key]) * k;
    const c = this.cur;
    const pr = c.prone;
    // Standing frame vs prone frame
    this.rider.quaternion.copy(this._qs.identity()).slerp(PRONE_Q, pr);
    // Stance: feet ±0.3 m along the board; hip height from crouch; legs solved with 2-bone IK.
    const crouch = Math.min(1, c.crouch + pump * 0.25);
    const hipH = (THIGH + SHIN) * (0.97 - crouch * 0.42);
    const standY = 0.06 + hipH;
    this.rider.position.set(pr * 0.15, (1 - pr) * standY + pr * 0.12, pr * 0);
    this.pelvis.rotation.set(0, 0, 0);
    for (const [L, sx] of [[this.front, 1], [this.back, -1]]) {
      if (pr > 0.5) {
        L.leg.hp.rotation.set(0.1, 0, sx * 0.05); L.leg.kn.rotation.set(-0.2 - Math.max(0, Math.sin(this.t * 3 + sx)) * 0.2 * (paddling ? 1 : 0), 0, 0);
        continue;
      }
      const footX = 0.3 * sx - 0.1 * sx;
      const d = Math.min(THIGH + SHIN - 0.01, Math.hypot(hipH, footX));
      const interior = Math.acos(Math.min(1, Math.max(-1, (THIGH * THIGH + SHIN * SHIN - d * d) / (2 * THIGH * SHIN))));
      const bend = Math.PI - interior;
      const splay = Math.atan2(footX, hipH);
      const a = Math.acos(Math.min(1, Math.max(-1, (THIGH * THIGH + d * d - SHIN * SHIN) / (2 * THIGH * d))));
      L.leg.hp.rotation.set(-a, 0, splay);
      L.leg.kn.rotation.set(bend, 0, 0);
    }
    // Torso leans forward over the toes and into turns; head looks toward the nose.
    this.spine.rotation.set(c.lean * 0.9 * (1 - pr) - pr * 0.15, 0, lean * 0.35 * (1 - pr));
    this.neck.rotation.set(-c.lean * 0.5 * (1 - pr) - pr * 0.9, (1 - pr) * 1.2, 0);
    if (pr > 0.5) {
      // Prone paddling: alternate arm strokes through the water.
      const ph = this.t * 5.5;
      for (const [A, off] of [[this.front.arm, 0], [this.back.arm, Math.PI]]) {
        const st = paddling ? ph + off : 1.2 + off * 0.3;
        A.sh.rotation.set(-Math.PI / 2 - (Math.PI / 2) * Math.cos(st), 0, 0);
        A.el.rotation.set(-0.2, 0, 0);
      }
    } else {
      this.front.arm.sh.rotation.set(-0.2, 0, c.frontArm + lean * 0.3);
      this.front.arm.el.rotation.set(-0.5, 0, 0);
      this.back.arm.sh.rotation.set(-0.2, 0, c.backArm + lean * 0.3);
      this.back.arm.el.rotation.set(-0.6, 0, 0);
    }
    if (this.tumble) {
      this.tumble.t += dt;
      this.rider.rotation.x += this.tumble.t * this.tumble.spin.x * 0.6; this.rider.rotation.y += this.tumble.t * this.tumble.spin.y * 0.5;
      this.board.rotation.z += dt * 3; this.board.rotation.x += dt * 2;
    } else this.board.rotation.set(0, 0, 0);
  }
  wipeout() { this.tumble = { t: 0, spin: new THREE.Vector3(4 + Math.random() * 3, 3 + Math.random() * 2, 0) }; this.setPose('sit'); }
  reset() { this.tumble = null; this.setPose('paddle'); this.cur = { ...POSES.paddle }; }
}
