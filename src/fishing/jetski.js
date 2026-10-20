// A jet ski (personal watercraft) to ride around the bay and fish from. W throttle, S brake/reverse, A/D steer,
// E get off (in the shallows you wade ashore; out deeper you slip into the water and can dive).
import * as THREE from 'three';
import { damp, clamp } from '../core/noise.js';

export class JetSki {
  constructor(scene) {
    this.root = makeJetSki();
    this.root.visible = false;
    scene.add(this.root);
    this.pos = new THREE.Vector3(); this.heading = 0; this.speed = 0; this.lean = 0;
  }
  /** Replace the placeholder with the Blender jet ski and a seated rider built from the character parts. */
  useModels(models) {
    const hull = models.get('jetski'); if (!hull) return;
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55 });
    const g = new THREE.Group();
    const add = (name, pos, rot = [0, 0, 0], parent = g) => { const geo = models.get(name); if (!geo) return null; const m = new THREE.Mesh(geo, mat); m.position.set(...pos); m.rotation.set(...rot); m.castShadow = true; parent.add(m); return m; };
    const hullM = add('jetski', [0, 0, 0]); hullM.scale.set(1.1, 1.45, 1.05); // a real PWC stands ~1.1 m tall
    // Seated rider (you), leaning forward to the handlebars, in a lifejacket.
    // The character faces +z but the jet ski's nose is -z: turn the rider round, then lean forward to the bars.
    const rider = new THREE.Group(); rider.position.set(0, 0.98, 0.3); rider.rotation.set(0.3, Math.PI, 0, 'YXZ'); g.add(rider);
    add('char_hips', [0, 0, 0], [0, 0, 0], rider); add('char_chest', [0, 0, 0], [0, 0, 0], rider); add('char_vest', [0, 0, 0.005], [0, 0, 0], rider);
    add('char_head', [0, 0.56, 0], [0.2, 0, 0], rider);
    for (const s of [-1, 1]) {
      const sh = new THREE.Group(); sh.position.set(0.2 * s, 0.47, 0); sh.rotation.set(-1.15, 0, s * 0.12); rider.add(sh);
      add('char_upperarm', [0, 0, 0], [0, 0, 0], sh);
      const el = new THREE.Group(); el.position.y = -0.3; el.rotation.x = -0.35; sh.add(el); add('char_forearm', [0, 0, 0], [0, 0, 0], el);
      const hp = new THREE.Group(); hp.position.set(0.11 * s, -0.04, 0); hp.rotation.set(-1.35, 0, s * 0.18); rider.add(hp);
      add('char_thigh', [0, 0, 0], [0, 0, 0], hp);
      const kn = new THREE.Group(); kn.position.y = -0.42; kn.rotation.x = 1.45; hp.add(kn); add('char_shin', [0, 0, 0], [0, 0, 0], kn);
    }
    this.scene = this.root.parent;
    const old = this.root; g.visible = old.visible; g.position.copy(old.position); g.quaternion.copy(old.quaternion);
    old.parent?.add(g); old.parent?.remove(old);
    this.root = g; this.rider = rider;
  }
  park(x, z, heading, world, t) { this.pos.set(x, 0, z); this.heading = heading; this.speed = 0; this.root.visible = true; this.place(world, t, 0); }
  update(dt, t, input, world, bounds) {
    const thr = input.down('KeyW', 'ArrowUp') ? 1 : 0, brk = input.down('KeyS', 'ArrowDown') ? 1 : 0;
    const steer = (input.down('KeyA', 'ArrowLeft') ? 1 : 0) - (input.down('KeyD', 'ArrowRight') ? 1 : 0);
    const top = 14; // m/s (~50 km/h)
    this.speed += (thr * 6 - brk * 7) * dt;
    this.speed -= this.speed * (thr ? 0.12 : 0.6) * dt;
    this.speed = clamp(this.speed, -3, top);
    this.heading += steer * dt * (0.6 + Math.min(1, Math.abs(this.speed) / 6) * 1.2) * Math.sign(this.speed || 1);
    this.lean = damp(this.lean, -steer * Math.min(1, this.speed / 8) * 0.35, 5, dt);
    const fwd = new THREE.Vector3(Math.sin(this.heading), 0, -Math.cos(this.heading));
    const next = this.pos.clone().addScaledVector(fwd, this.speed * dt);
    // Keep to water at least ~0.6 m deep; out of bounds you bump the edge of the bay.
    const depth = world.surfaceAt(next.x, next.z) - world.groundAt(next.x, next.z);
    const inside = next.x > bounds.xMin && next.x < bounds.xMax && next.z > bounds.zMin && next.z < bounds.zMax;
    if (depth > 0.35 && inside) this.pos.copy(next); else this.speed *= -0.25;
    this.shallow = world.surfaceAt(this.pos.x, this.pos.z) - world.groundAt(this.pos.x, this.pos.z) < 1.4;
    this.place(world, t, dt);
  }
  place(world, t, dt) {
    const h = world.surfaceAt(this.pos.x, this.pos.z), e = 0.8;
    const fwd = new THREE.Vector3(Math.sin(this.heading), 0, -Math.cos(this.heading));
    const pitch = Math.atan2(world.surfaceAt(this.pos.x + fwd.x * e, this.pos.z + fwd.z * e) - world.surfaceAt(this.pos.x - fwd.x * e, this.pos.z - fwd.z * e), 2 * e);
    const plane = Math.min(1, this.speed / 8) * 0.12; // nose lifts as it planes
    this.root.position.set(this.pos.x, h + 0.08 + plane * 0.3, this.pos.z);
    this.root.rotation.set(0, 0, 0);
    this.root.rotateY(-this.heading);
    this.root.rotateX(pitch + plane);
    this.root.rotateZ(this.lean);
  }
  /** Camera behind and above the rider. */
  cameraTarget(out, look) {
    const fwd = new THREE.Vector3(Math.sin(this.heading), 0, -Math.cos(this.heading));
    out.copy(this.root.position).addScaledVector(fwd, -4.2).add(new THREE.Vector3(0, 1.9, 0));
    look.copy(this.root.position).addScaledVector(fwd, 6).add(new THREE.Vector3(0, 0.6, 0));
  }
}

/** Rounded, toy-like jet ski (cosy style): hull, seat, handlebars and a rider in a lifejacket. Nose toward -z. */
function makeJetSki() {
  const g = new THREE.Group();
  const M = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.55 });
  const hullMat = M(0xf2f0ea), trim = M(0x18b4c8), dark = M(0x262c34), seatMat = M(0x2a3038), vest = M(0xff7a1a), skin = M(0xc89070);
  const hull = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 1.9, 6, 16), hullMat); hull.rotation.x = Math.PI / 2; hull.scale.set(1, 1, 0.55); hull.position.y = 0.12; g.add(hull);
  const stripe = new THREE.Mesh(new THREE.CapsuleGeometry(0.43, 1.7, 4, 16), trim); stripe.rotation.x = Math.PI / 2; stripe.scale.set(1.01, 1.0, 0.2); stripe.position.y = 0.22; g.add(stripe);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 10), trim); nose.scale.set(0.9, 0.55, 1.1); nose.position.set(0, 0.32, -0.95); g.add(nose);
  const seat = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.9, 4, 12), seatMat); seat.rotation.x = Math.PI / 2; seat.position.set(0, 0.5, 0.25); g.add(seat);
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.45, 10), dark); column.position.set(0, 0.62, -0.5); column.rotation.x = -0.4; g.add(column);
  const bars = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.62, 4, 8), dark); bars.rotation.z = Math.PI / 2; bars.position.set(0, 0.84, -0.6); g.add(bars);
  // Rider: you, in a lifejacket (always wear one on a PWC).
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.42, 4, 12), vest); torso.position.set(0, 1.05, 0.12); torso.rotation.x = -0.25; g.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), skin); head.position.set(0, 1.5, 0.0); g.add(head);
  for (const s of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.45, 4, 8), dark); arm.position.set(s * 0.26, 1.0, -0.25); arm.rotation.x = -1.1; g.add(arm);
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.5, 4, 8), dark); leg.position.set(s * 0.25, 0.55, 0.15); leg.rotation.x = -1.3; g.add(leg);
  }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}
