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

const POSES = {
  // [hips y, hip yaw, torso pitch, torso yaw, head pitch, lArm(shoulder x,z, elbow), rArm, lLeg(hip x, knee), rLeg]
  paddle: { body: [0.12, 0, 1.45, 0, -1.0], ls: [-2.6, 0.2], le: 0.3, rs: [-2.6, -0.2], re: 0.3, lh: [0.0, 0.05], lk: 0.2, rh: [0.0, -0.05], rk: 0.2, prone: 1 },
  stand: { body: [0.78, 1.3, 0.35, -0.6, -0.2], ls: [0.2, 1.0], le: 0.6, rs: [-0.4, -1.1], re: 0.4, lh: [0.55, 0.35], lk: 1.0, rh: [-0.45, 0.25], rk: 0.9, prone: 0 },
  crouch: { body: [0.55, 1.3, 0.75, -0.5, -0.5], ls: [0.6, 0.6], le: 1.0, rs: [-0.2, -0.8], re: 0.9, lh: [0.85, 0.35], lk: 1.9, rh: [-0.2, 0.25], rk: 1.8, prone: 0 },
  sit: { body: [0.1, 0, 0.0, 0, 0], ls: [0.3, 0.6], le: 0.4, rs: [0.3, -0.6], re: 0.4, lh: [1.4, 0.4], lk: 1.4, rh: [1.4, -0.4], rk: 1.4, prone: 0 },
};

export class Surfer {
  constructor(scene) {
    this.root = new THREE.Group();
    scene.add(this.root);
    const boardMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0.05 });
    this.board = new THREE.Mesh(boardGeometry(), boardMat);
    // Fins (thruster)
    const finGeo = new THREE.BufferGeometry();
    finGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, -0.1, 0, 0, -0.09, -0.11, 0], 3));
    finGeo.computeVertexNormals();
    const finMat = new THREE.MeshStandardMaterial({ color: 0x222831, side: THREE.DoubleSide, roughness: 0.4 });
    for (const [x, z] of [[-0.8, 0], [-0.68, 0.17], [-0.68, -0.17]]) { const f = new THREE.Mesh(finGeo, finMat); f.position.set(x, 0.0, z); this.board.add(f); }
    this.root.add(this.board);

    const suit = new THREE.MeshStandardMaterial({ color: 0x14181d, roughness: 0.55, metalness: 0.0 });
    const panel = new THREE.MeshStandardMaterial({ color: 0x0f8fa8, roughness: 0.5 });
    const skin = new THREE.MeshStandardMaterial({ color: 0xc58c62, roughness: 0.6 });
    const hair = new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 0.9 });
    this.mats = [boardMat, finMat, suit, panel, skin, hair];
    const limb = (len, r, mat) => { const g = new THREE.CapsuleGeometry(r, len, 4, 10); g.translate(0, -len / 2, 0); return new THREE.Mesh(g, mat); };
    // Hierarchy: rider -> hips -> torso -> (head, shoulders) ; hips -> legs
    this.rider = new THREE.Group(); this.root.add(this.rider);
    this.hips = new THREE.Group(); this.rider.add(this.hips);
    const pelvis = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.12, 4, 10), suit); pelvis.rotation.z = Math.PI / 2; this.hips.add(pelvis);
    this.torso = new THREE.Group(); this.hips.add(this.torso);
    const chest = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.32, 4, 12), suit); chest.position.y = 0.26; chest.scale.set(1, 1, 0.75); this.torso.add(chest);
    const stripe = new THREE.Mesh(new THREE.CapsuleGeometry(0.152, 0.1, 4, 12), panel); stripe.position.y = 0.36; stripe.scale.set(1, 1, 0.76); this.torso.add(stripe);
    this.neck = new THREE.Group(); this.neck.position.y = 0.56; this.torso.add(this.neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.105, 16, 12), skin); head.position.y = 0.1; head.scale.set(0.9, 1.05, 0.95); this.neck.add(head);
    const hairM = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), hair); hairM.position.y = 0.115; hairM.rotation.x = -0.25; this.neck.add(hairM);
    const arm = (side) => {
      const sh = new THREE.Group(); sh.position.set(0, 0.47, 0.19 * side); this.torso.add(sh);
      const up = limb(0.24, 0.055, suit); sh.add(up);
      const el = new THREE.Group(); el.position.y = -0.3; sh.add(el);
      const lo = limb(0.22, 0.045, skin); el.add(lo);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), skin); hand.position.y = -0.3; el.add(hand);
      return { sh, el };
    };
    const leg = (side) => {
      const hp = new THREE.Group(); hp.position.set(0, -0.02, 0.1 * side); this.hips.add(hp);
      const th = limb(0.34, 0.075, suit); hp.add(th);
      const kn = new THREE.Group(); kn.position.y = -0.42; hp.add(kn);
      const sh = limb(0.34, 0.06, suit); kn.add(sh);
      const ft = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.14, 3, 8), skin); ft.rotation.z = Math.PI / 2; ft.position.set(0.05, -0.43, 0); kn.add(ft);
      return { hp, kn };
    };
    this.la = arm(1); this.ra = arm(-1); this.ll = leg(1); this.rl = leg(-1);
    this.cur = structuredClone(POSES.paddle);
    this.pose = 'paddle'; this.lean = 0; this.t = 0; this.tumble = null;
  }
  setPose(name) { this.pose = name; }
  update(dt, { paddling = false, lean = 0, pump = 0 } = {}) {
    this.t += dt;
    const target = POSES[this.pose];
    const k = 1 - Math.exp(-(this.pose === 'stand' || this.pose === 'crouch' ? 8 : 5) * dt);
    const c = this.cur;
    const lerpArr = (a, b) => a.forEach((v, i) => { a[i] = v + (b[i] - v) * k; });
    lerpArr(c.body, target.body); lerpArr(c.ls, target.ls); lerpArr(c.rs, target.rs); lerpArr(c.lh, target.lh); lerpArr(c.rh, target.rh);
    for (const key of ['le', 're', 'lk', 'rk', 'prone']) c[key] += (target[key] - c[key]) * k;
    let ls = c.ls[0], rs = c.rs[0];
    if (paddling && this.pose === 'paddle') { ls += Math.sin(this.t * 5) * 1.2; rs += Math.sin(this.t * 5 + Math.PI) * 1.2; }
    const [hy, hyaw, tp, tyaw, hp] = c.body;
    // Prone: rider lies along the board (rotate the whole rider forward 90°).
    this.rider.rotation.z = -c.prone * Math.PI / 2;
    this.rider.position.set(c.prone * 0.3, 0.08 + (1 - c.prone) * 0.0 + pump * 0.05, 0);
    this.hips.position.y = hy * (1 - c.prone) + c.prone * 0.06;
    this.hips.rotation.y = hyaw;
    this.hips.rotation.x = lean * 0.5;
    this.torso.rotation.z = -tp * (1 - c.prone);
    this.torso.rotation.y = tyaw;
    this.torso.rotation.x = lean * 0.4;
    this.neck.rotation.z = hp * (c.prone > 0.5 ? -0.6 : 1) + (c.prone > 0.5 ? 1.1 : 0);
    this.la.sh.rotation.z = ls; this.la.sh.rotation.x = c.ls[1]; this.la.el.rotation.z = c.le;
    this.ra.sh.rotation.z = rs; this.ra.sh.rotation.x = c.rs[1]; this.ra.el.rotation.z = c.re;
    this.ll.hp.rotation.z = c.lh[0]; this.ll.hp.rotation.x = c.lh[1]; this.ll.kn.rotation.z = -c.lk;
    this.rl.hp.rotation.z = c.rh[0]; this.rl.hp.rotation.x = c.rh[1]; this.rl.kn.rotation.z = -c.rk;
    if (this.tumble) {
      this.tumble.t += dt;
      this.rider.rotation.x += dt * this.tumble.spin.x; this.rider.rotation.y += dt * this.tumble.spin.y;
      this.board.rotation.z += dt * 3; this.board.rotation.x += dt * 2;
    } else { this.rider.rotation.x = 0; this.rider.rotation.y = 0; this.board.rotation.set(0, 0, 0); }
  }
  wipeout() { this.tumble = { t: 0, spin: new THREE.Vector3(4 + Math.random() * 3, 3 + Math.random() * 2, 0) }; this.setPose('sit'); }
  reset() { this.tumble = null; this.setPose('paddle'); }
}
