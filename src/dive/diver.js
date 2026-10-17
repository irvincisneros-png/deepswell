// First-person freediver: swimming, buoyancy that changes with depth, breath-hold, pressure and equalising.
import * as THREE from 'three';
import { clamp, damp } from '../core/noise.js';

export const BREATH_SECONDS = 75; // gameplay breath-hold at rest (real recreational freedivers: ~1–2 min)

/** Net buoyant acceleration (m/s², +up) at depth: wetsuit + lungs compress as pressure rises. */
export function buoyancyAt(depth) {
  if (depth < 0.3) return 0.35;
  // Positive near the surface, neutral around 10 m, sinking ("freefall") deeper.
  return 0.3 * (1 - depth / 10) - (depth > 10 ? 0.012 * (depth - 10) : 0);
}
/** Absolute pressure in atmospheres. */
export const pressureAt = depth => 1 + Math.max(0, depth) / 10;

export class Diver {
  constructor(camera, input, settings) {
    this.camera = camera; this.input = input; this.settings = settings;
    this.pos = new THREE.Vector3(); this.vel = new THREE.Vector3();
    this.yaw = 0; this.pitch = 0;
    this.breath = 1; this.active = false;
    this.eqDepth = 0; this.ear = 0; // ear = unequalised pressure build-up 0..1+
    this.surfaced = true; this.kick = 0; this.speed = 0; this.maxDepth = 0;
    this.blackout = false; this.lowWarned = false;
    this.events = []; // 'surface', 'dive', 'equalise', 'earPain', 'lowO2', 'blackout'
    this.freeze = false; // pause breath (info cards with teacher option)
  }
  spawn(pos, yaw = 0, breath = 1) {
    this.pos.copy(pos); this.vel.set(0, 0, 0); this.yaw = yaw; this.pitch = -0.2;
    this.breath = breath; this.eqDepth = Math.max(0, -pos.y); this.ear = 0; this.blackout = false; this.maxDepth = 0; this.earWarned = false; this.lowWarned = false;
    this.surfaced = pos.y > -0.5; this.active = true;
  }
  get depth() { return Math.max(0, -this.pos.y); }

  update(dt, world) {
    const inp = this.input, ev = this.events;
    const [mx, my] = inp.takeMouse();
    const sens = 0.0022 * (this.settings.sensitivity ?? 1);
    this.yaw -= mx * sens;
    this.pitch = clamp(this.pitch - my * sens * (this.settings.invertY ? -1 : 1), -1.45, 1.45);
    const surfaceH = world.surfaceAt(this.pos.x, this.pos.z);
    const depth = Math.max(0, surfaceH - this.pos.y);
    const atSurface = depth < 0.45;

    // Swim input: W/S along the view direction, A/D strafe, Space up, C/Ctrl down, Shift = strong kicks.
    const fwd = new THREE.Vector3(-Math.sin(this.yaw) * Math.cos(this.pitch), Math.sin(this.pitch), -Math.cos(this.yaw) * Math.cos(this.pitch));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const wish = new THREE.Vector3();
    if (inp.down('KeyW', 'ArrowUp')) wish.add(fwd);
    if (inp.down('KeyS', 'ArrowDown')) wish.sub(fwd);
    if (inp.down('KeyD', 'ArrowRight')) wish.add(right);
    if (inp.down('KeyA', 'ArrowLeft')) wish.sub(right);
    if (inp.down('Space')) wish.y += 1;
    if (inp.down('KeyC', 'ControlLeft', 'ControlRight')) wish.y -= 1;
    const sprint = inp.down('ShiftLeft', 'ShiftRight');
    const sub = this.vehicle === 'sub';
    let effort = 0;
    if (wish.lengthSq() > 0) { wish.normalize(); effort = sprint ? 1 : 0.55; }
    // At the surface you can only duck-dive by pitching down and kicking.
    if (atSurface && wish.y > 0) wish.y = 0;
    if (this.vehicle === 'sub') wish.y *= 2.2; // ballast tanks: fast vertical travel
    const earBlock = this.ear > 1 && wish.y < 0; // can't descend with painful unequalised ears
    if (earBlock) wish.y = 0;
    this.kick = damp(this.kick, effort, 4, dt);
    const thrust = (sprint ? 2.6 : 1.7) * (sub ? 2.4 : 1);
    this.vel.addScaledVector(wish, thrust * dt * 1.6);
    // Buoyancy + drag (the submersible trims itself neutral)
    if (sub) { /* neutral */ }
    else if (!atSurface) this.vel.y += buoyancyAt(depth) * dt;
    else this.vel.y += (surfaceH - 0.05 - this.pos.y) * 4 * dt; // float at the surface
    this.vel.multiplyScalar(Math.exp(-1.25 * dt));
    if (sub && this.pos.y > (this.ceiling ?? -150)) { this.pos.y = this.ceiling ?? -150; if (this.vel.y > 0) this.vel.y = 0; }
    if (earBlock && this.vel.y < 0) this.vel.y *= Math.exp(-6 * dt);
    this.pos.addScaledVector(this.vel, dt);
    this.speed = this.vel.length();

    // Collisions: seabed, coral pick spheres, surface ceiling, soft site boundary.
    const ground = world.groundAt(this.pos.x, this.pos.z) + (sub ? 1.6 : 0.45);
    if (this.pos.y < ground) { this.pos.y = ground; if (this.vel.y < 0) this.vel.y = 0; }
    for (const c of world.nearbyColliders(this.pos, 3)) {
      const d = this.pos.distanceTo(c.center);
      const r = c.r + 0.3;
      if (d < r && d > 1e-3) { const n = this.pos.clone().sub(c.center).normalize(); this.pos.addScaledVector(n, r - d); const vn = this.vel.dot(n); if (vn < 0) this.vel.addScaledVector(n, -vn); }
    }
    if (this.pos.y > surfaceH + 0.05) { this.pos.y = surfaceH + 0.05; this.vel.y = Math.min(0, this.vel.y); }
    const b = world.bounds;
    const push = (v, lo, hi) => v < lo ? (lo - v) : v > hi ? (hi - v) : 0;
    const px = push(this.pos.x, b.xMin, b.xMax), pz = push(this.pos.z, b.zMin, b.zMax);
    if (px || pz) { this.vel.x += px * dt * 2; this.vel.z += pz * dt * 2; this.outOfBounds = true; } else this.outOfBounds = false;

    // Breath: consumption rises with effort; breathe up at the surface.
    const d2 = Math.max(0, surfaceH - this.pos.y);
    if (sub) { this.breath = 1; this.ear = 0; this.depthNow = d2; this.maxDepth = Math.max(this.maxDepth, d2); }
    else if (d2 < 0.45) {
      if (!this.surfaced) { ev.push('surface'); this.surfaced = true; }
      this.breath = Math.min(1, this.breath + dt * 0.09); // recovery breathing takes time
      this.eqDepth = 0; this.ear = 0; this.lowWarned = false; this.earWarned = false;
    } else {
      if (this.surfaced) { ev.push('dive'); this.surfaced = false; }
      if (!this.freeze) this.breath -= dt / BREATH_SECONDS * (0.7 + effort * 0.9);
      if (this.breath < 0.25 && !this.lowWarned) { ev.push('lowO2'); this.lowWarned = true; }
      if (this.breath <= 0 && !this.blackout) { this.blackout = true; ev.push('blackout'); }
      // Equalising: every ~2 m of descent the ears need equalising (Q).
      if (d2 < this.eqDepth) this.eqDepth = d2;
      const need = d2 - this.eqDepth;
      this.ear = need > 1.2 ? (need - 1.2) / 1.6 : 0;
      if (this.ear > 1 && !this.earWarned) { ev.push('earPain'); this.earWarned = true; this.painDepth = d2; }
      if (inp.hit('KeyQ')) {
        // Under pain you must rise a little before equalising works — never force it.
        if (this.earWarned && d2 > (this.painDepth ?? 0) - 0.8) ev.push('eqFail');
        else { this.eqDepth = d2; this.ear = 0; this.earWarned = false; ev.push('equalise'); }
      }
      this.maxDepth = Math.max(this.maxDepth, d2);
    }
    this.breath = clamp(this.breath, 0, 1);
    this.depthNow = d2;
    this.speed = this.vel.length();

    // Camera: gentle bob at the surface, slight sway with kicks.
    const bob = d2 < 0.45 ? Math.sin(performance.now() * 0.0016) * 0.04 : 0;
    this.camera.position.set(this.pos.x, this.pos.y + 0.12 + bob, this.pos.z);
    const roll = this.settings.reducedMotion ? 0 : Math.sin(performance.now() * 0.004) * 0.006 * this.kick;
    this.camera.quaternion.setFromEuler(new THREE.Euler(this.pitch, this.yaw, roll, 'YXZ'));
  }
  takeEvents() { const e = this.events; this.events = []; return e; }
  get lookDir() { return new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion); }
}
