// Surf gameplay: wait in the lineup, paddle for a set wave, pop up, ride, then wipe out or kick out.
import * as THREE from 'three';
import { SetWave, sampleFace, waveHeightAt, swellHeight } from '../ocean/waveProfile.js';
import { clamp, damp, smoothstep } from '../core/noise.js';

const G = 9.81;

/** First-person paddling arms: wetsuit forearms and hands that stroke alongside the board. */
function makeHands(camera) {
  const g = new THREE.Group();
  const suit = new THREE.MeshStandardMaterial({ color: 0x15191e, roughness: 0.5 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xc89070, roughness: 0.6 });
  const arms = [];
  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.036, 0.3, 4, 10), suit); fore.rotation.x = Math.PI / 2; fore.position.z = -0.2;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), skin); hand.scale.set(0.9, 0.45, 1.4); hand.position.z = -0.42;
    arm.add(fore, hand); arm.userData.side = side; g.add(arm); arms.push(arm);
  }
  g.userData.stroke = (t, paddling, facing) => {
    for (const a of arms) {
      const ph = t * 5.2 + (a.userData.side > 0 ? Math.PI : 0);
      const reach = paddling ? Math.sin(ph) : 0.2;
      a.position.set(a.userData.side * (0.24 + 0.04 * Math.cos(ph) * paddling), -0.2 - 0.07 * Math.max(0, -Math.sin(ph)) * paddling, -0.22);
      a.rotation.set(-0.35 - reach * 0.55 * paddling, a.userData.side * 0.12, 0);
      a.visible = facing > 0.2 || paddling > 0;
    }
  };
  camera.add(g);
  if (!camera.parent) camera.userData.needsScene = true;
  return g;
}

export class SurfSession {
  constructor({ eco, surfer, camera, input, fx, audio, settings, onEnd, onTrick, training = false }) {
    Object.assign(this, { eco, surfer, camera, input, fx, audio, settings, onEnd, onTrick, training });
    this.cfg = eco.surf;
    this.camPos = new THREE.Vector3(); this.camLook = new THREE.Vector3();
    this.reset();
  }
  reset() {
    const c = this.cfg;
    this.state = 'wait'; // wait -> paddle -> ride -> (wipeout | done)
    this.wave = null; this.nextSet = 3;
    this.pos = new THREE.Vector3(c.lineupX, 0, c.lineupZ);
    this.heading = Math.PI / 2; // paddling heading: +z toward shore
    this.paddleSpeed = 0;
    this.ride = null; this.score = 0; this.msg = ''; this.prompt = '';
    this.surfer.reset();
    this.t = 0; this.camInit = false; this.endTimer = 0;
  }
  spawnWave() {
    const c = this.cfg;
    const H = c.H * (0.85 + Math.random() * 0.3);
    this.wave = new SetWave({ H, speed: c.speed, peel: c.peel * (H / c.H), peakX: c.peakX + (Math.random() - 0.5) * 6, z0: c.z0, breakZ: c.breakZ, endZ: c.endZ });
  }
  get waveForRender() { return this.wave; }

  update(dt, time) {
    this.t += dt;
    const inp = this.input;
    if (inp.hit('KeyV')) { this.thirdPerson = !this.thirdPerson; this.msg = this.thirdPerson ? 'Camera: behind the surfer (V)' : 'Camera: your own eyes (V)'; this.msgTimer = 1.5; }
    this.prompt = '';
    if (this.wave) this.wave.update(dt);
    if (this.state === 'wait' || this.state === 'paddle') {
      if (!this.wave) {
        this.nextSet -= dt;
        this.prompt = this.nextSet > 0 ? `Set approaching in ${Math.ceil(this.nextSet)}…` : '';
        if (this.nextSet <= 0) { this.spawnWave(); this.state = 'paddle'; }
      }
      this.updatePaddle(dt, time);
    } else if (this.state === 'ride') {
      this.updateRide(dt, time);
    } else if (this.state === 'wipeout') {
      this.endTimer -= dt;
      this.pos.x += (this.wave ? 0 : 0); this.pos.z += 3 * dt; this.pos.y -= dt * 0.8;
      if (this.endTimer <= 0) this.finish('wipeout');
    } else if (this.state === 'done') {
      this.endTimer -= dt;
      if (this.endTimer <= 0) this.finish('done');
    }
    // Retire waves that have dissipated.
    if (this.wave && this.wave.z > this.cfg.endZ + 10) { this.wave = null; if (this.state === 'paddle') { this.state = 'wait'; this.nextSet = 5; } }
    this.surfer.update(dt, { paddling: this.state === 'paddle' && this.paddling, lean: this.ride?.lean ?? 0, pump: this.ride?.pumpAnim ?? 0 });
    this.updateCamera(dt);
  }

  waterHeight(x, z, time) {
    return swellHeight(x, z, time) + (this.wave ? waveHeightAt(this.wave, x, z) : 0);
  }

  updatePaddle(dt, time) {
    const inp = this.input;
    this.paddling = inp.down('KeyW', 'ArrowUp');
    // Surf assist: paddle for you when a set wave is close.
    const assist = this.settings.surfAssist !== false;
    if (assist && this.wave) { const s0 = this.pos.z - this.wave.z; const H0 = this.wave.H * this.wave.heightScale(); if (s0 > 0 && s0 < Math.max(18, H0 * 3)) this.paddling = true; }
    if (this.paddling) this.paddleSpeed = Math.min(2.3, this.paddleSpeed + dt * 1.1);
    this.paddleSpeed *= Math.exp(-dt * (this.paddling ? 0.25 : 0.7));
    if (inp.down('KeyA', 'ArrowLeft')) this.heading += dt * 0.9;
    if (inp.down('KeyD', 'ArrowRight')) this.heading -= dt * 0.9;
    this.heading = clamp(this.heading, 0.4, Math.PI - 0.4);
    if (inp.down('KeyS', 'ArrowDown')) this.paddleSpeed = Math.max(-0.4, this.paddleSpeed - dt * 1.5);
    let push = 0, s = 0, info = null;
    if (this.wave) {
      s = this.pos.z - this.wave.z;
      const H = this.wave.H * this.wave.heightScale();
      // The front of the wave lifts and pushes the board shoreward.
      if (s > 0 && s < H * 3) push = this.wave.speed * smoothstep(H * 3, H * 0.4, s) * 0.55;
      info = { s, H };
      const col = this.wave.column(this.pos.x, {});
      // Paddling into a section that's already broken = caught inside (not on your first, training wave).
      if (!this.training && col.collapse > 0.4 && s > -1 && s < H * 2) { this.startWipeout('Caught inside! The whitewater rolled you. Next time paddle toward the unbroken shoulder (A/D).'); return; }
      const minSpeed = this.training ? 1.0 : 1.4;
      const catchWindow = s > H * (this.training ? 0.05 : 0.15) && s < H * (this.training ? 1.7 : 1.3);
      if (catchWindow) this.prompt = this.paddleSpeed > minSpeed ? 'POP UP! (Space)' : 'Paddle harder! (hold W)';
      else if (s < 0 && s > -H * 4) this.prompt = '';
      else if (s > 0 && s < 18) this.prompt = 'Paddle now! (hold W) — match the wave\'s speed';
      else if (s > 0 && s < 45) this.prompt = 'Wave coming — get ready to paddle…';
      // Surf assist: pop up automatically if you're still lying down a moment into the catch window.
      this.catchT = catchWindow ? (this.catchT ?? 0) + dt : 0;
      if (assist && catchWindow && this.paddleSpeed > minSpeed && this.catchT > 0.5) { this.startRide(s, H); return; }
      if (inp.hit('Space')) {
        if (catchWindow && this.paddleSpeed > minSpeed) { this.startRide(s, H); return; }
        if (s > H * 1.3 || !this.wave) this.msg = 'Too early — the wave has to lift your board first.';
        else if (s <= H * 0.15 && !this.training) this.startWipeout('Too late — you nosedived over the falls ("pearling"). Pop up while the wave is lifting you.');
        else this.msg = 'Not enough paddle speed to catch it.';
        this.msgTimer = 2.5;
      }
      if (s < -H * 1.5 && this.state === 'paddle') { this.msg = 'Missed it! Wait for the next wave in the set.'; this.msgTimer = 3; this.state = 'wait'; this.nextSet = 7; }
    } else if (inp.hit('Space')) { this.msg = 'Wait for a wave — watch for the set approaching from behind.'; this.msgTimer = 2.5; }
    const v = this.paddleSpeed;
    this.pos.x += Math.cos(this.heading) * v * dt;
    this.pos.z += Math.sin(this.heading) * v * dt + push * dt;
    // Gentle current back to the lineup when idle.
    if (this.state === 'wait') { this.pos.x = damp(this.pos.x, this.cfg.lineupX, 0.08, dt); this.pos.z = damp(this.pos.z, this.cfg.lineupZ, 0.08, dt); }
    this.pos.y = this.waterHeight(this.pos.x, this.pos.z, time);
    this.surfer.setPose('paddle');
    const r = this.surfer.root;
    r.position.set(this.pos.x, this.pos.y + 0.02, this.pos.z);
    // Board points along the heading; tilts with the local slope.
    const e = 0.4, hx = this.waterHeight(this.pos.x + e, this.pos.z, time) - this.waterHeight(this.pos.x - e, this.pos.z, time);
    const hz = this.waterHeight(this.pos.x, this.pos.z + e, time) - this.waterHeight(this.pos.x, this.pos.z - e, time);
    r.rotation.set(0, -this.heading, 0); // model +x = nose
    const along = (Math.cos(this.heading) * hx + Math.sin(this.heading) * hz) / (2 * e);
    r.rotateZ(Math.atan(along));
    this.waveInfo = info;
  }

  startRide(s, H) {
    this.state = 'ride';
    this.surfer.setPose('stand');
    this.ride = { ft: 0.85, theta: -0.55, v: 4.2, time: 0, tube: 0, lean: 0, lastTheta: -0.55, turnAcc: 0, peakFt: 0.85, events: [], pumpCD: 0, pumpAnim: 0, crouch: false, combo: 1, maxSpeed: 0 };
    this.score = 0;
    this.onTrick?.('Pop up!', 50);
    this.score += 50;
  }

  updateRide(dt, time) {
    const inp = this.input, R = this.ride, w = this.wave;
    R.time += dt;
    const face = sampleFace(w, this.pos.x, R.ft, this._face || (this._face = {}));
    const slope = clamp(face.slope, 0.05, 1.45);
    // Steering: A = drop down the face, D = climb up toward the lip (wave wall on the right of the screen).
    const steer = (inp.down('KeyD', 'ArrowRight') ? 1 : 0) - (inp.down('KeyA', 'ArrowLeft') ? 1 : 0);
    const turnRate = 2.4 * (0.6 + Math.min(1, R.v / 6) * 0.6);
    const assist = this.settings.surfAssist !== false;
    if (assist && steer === 0) {
      // Surf assist: trim toward the middle of the face, and drop down for speed when the breaking section gets close.
      const target = clamp((0.5 - R.ft) * 3 - (face.d > -5 ? 0.45 : 0), -0.9, 0.9);
      R.theta = damp(R.theta, target, 2.2, dt);
    } else R.theta = clamp(R.theta + steer * turnRate * dt, -1.35, 1.35);
    R.lean = damp(R.lean, (steer || (assist ? clamp((R.theta - R.lastTheta) * 20, -1, 1) : 0)) * 0.6, 6, dt);
    R.crouch = inp.down('KeyS', 'ArrowDown', 'KeyC') || (assist && face.curl > 0.45 && face.d > -7 && R.ft > 0.3);
    if (assist && R.v < 4.5 && R.pumpCD <= 0 && R.time > 0.6) { R.v += 0.6; R.pumpCD = 0.7; R.pumpAnim = 1; } // gentle auto-pump
    this.surfer.setPose(R.crouch ? 'crouch' : 'stand');
    // Forces along the board: gravity on the face, pocket power near the curl, drag.
    const a_g = -G * Math.sin(slope) * Math.sin(R.theta) * 0.75;
    const pocket = smoothstep(-26, -3, face.d) * (1 - smoothstep(-1, 1.5, face.d));
    const shoulder = 1 - smoothstep(-60, -26, face.d) * 0; // keep simple
    const a_p = (2.2 + 3.2 * pocket) * (face.H / 2.4) * shoulder;
    const drag = 0.035 * R.v * R.v + 0.25;
    R.pumpCD -= dt;
    R.pumpAnim = damp(R.pumpAnim, 0, 6, dt);
    if (inp.down('KeyW', 'ArrowUp') && R.pumpCD <= 0) { R.v += 0.8 * (0.5 + pocket * 0.5); R.pumpCD = 0.55; R.pumpAnim = 1; }
    if (inp.hit('KeyE')) return this.kickOut('You kicked out over the shoulder — nice control.');
    R.v = clamp(R.v + (a_g + a_p - drag) * dt, 0, 13);
    R.maxSpeed = Math.max(R.maxSpeed, R.v);
    const faceLen = Math.max(2.5, face.top / Math.max(0.35, Math.sin(slope))) * 1.8;
    this.pos.x -= Math.cos(R.theta) * R.v * dt;
    R.ft += Math.sin(R.theta) * R.v * dt / faceLen;
    // Top of the face: you can't climb past the lip — gravity swings the board back down unless you push over the back.
    if (R.ft > 1) {
      R.topTime = (R.topTime ?? 0) + dt;
      R.v *= Math.exp(-0.9 * dt);
      if (steer <= 0) R.theta -= 2.2 * dt;
      R.ft = R.topTime > 0.7 && steer > 0 ? R.ft : Math.min(R.ft, 1.0);
    } else R.topTime = 0;
    // Out on the flats in front of the wave you lose speed fast.
    if (R.ft < 0) { R.v -= 2.5 * dt; if (steer >= 0) R.theta += 1.2 * dt; }
    // Tricks: bottom turns and snaps (direction changes at the bottom/top of the face).
    const dTheta = R.theta - R.lastTheta;
    R.turnAcc += Math.abs(dTheta);
    if (R.lastTheta < -0.35 && R.theta >= -0.35 && R.ft < 0.35 && R.v > 4) this.trick('Bottom turn', 80);
    if (R.lastTheta > 0.3 && R.theta <= 0.3 && R.ft > 0.72 && R.v > 3.5) this.trick('Snap!', 150);
    if (Math.abs(dTheta) / dt > 1.8 && R.v > 6 && !R.carving) { R.carving = true; } else if (R.carving && Math.abs(dTheta) / dt < 0.5) { R.carving = false; if (R.turnAcc > 0.9) this.trick('Carve', 60); R.turnAcc = 0; }
    R.lastTheta = R.theta;
    // Tube riding: deep in the pocket under a pitching lip.
    const inTube = face.curl > 0.55 && face.d > -5 && face.d < 0.8 && R.ft < 0.62;
    // Warn before the lip lands, and give a short reaction window.
    const lipDanger = face.curl > 0.45 && face.d > -7 && R.ft > 0.35 && !R.crouch;
    if (lipDanger) { this.prompt = 'The lip is pitching — CROUCH (S)!'; R.lipTimer = (R.lipTimer ?? 0) + dt; } else R.lipTimer = 0;
    this.faceInfo = { ft: R.ft, danger: Math.max(0, Math.min(1, (face.d + 8) / 8)) * face.curl };
    if (inTube && R.crouch) { R.tube += dt; this.score += 70 * dt; if (!R.tubeCalled) { R.tubeCalled = true; this.trick('BARREL!', 200); } }
    else if (R.tubeCalled && !inTube) { R.tubeCalled = false; if (R.tube > 1) this.trick(`Tube ride ${R.tube.toFixed(1)} s`, Math.round(R.tube * 100)); R.tube = 0; }
    this.score += dt * (8 + R.v * 2);
    // Ride-ending conditions
    if (face.d > 1.0) return this.startWipeout('The whitewater caught you — stay ahead of the breaking section (ride toward the open face).');
    if (inTube && !R.crouch && R.ft > 0.4 && R.lipTimer > (this.training ? 1.2 : 0.6)) return this.startWipeout('The lip landed on your head! Crouch (S) when you\'re in the barrel.');
    if (R.ft > 1.0 && R.topTime > 0.7 && steer > 0) {
      if (face.curl > 0.4 && face.d > -8) return this.startWipeout('Over the falls! You went up into the pitching lip.');
      return this.kickOut('Kick-out over the back of the wave.');
    }
    if (R.ft < -0.35 || (R.v < 1.5 && R.time > 1.5)) return this.kickOut(R.time > 4 ? 'The wave outran you — ride finished.' : 'You lost the wave — stay on the steep part of the face for speed.');
    if (face.H < 0.55) return this.kickOut('The wave faded out in the shallows — great ride!');
    R.ft = clamp(R.ft, -0.5, 1.1);
    // Place the board on the face.
    const f2 = sampleFace(w, this.pos.x, clamp(R.ft, 0, 1), this._face2 || (this._face2 = {}));
    this.pos.z = f2.z + (R.ft < 0 ? -R.ft * 2.5 : 0);
    this.pos.y = f2.y + swellHeight(this.pos.x, this.pos.z, time) + 0.03;
    const r = this.surfer.root;
    const dir = new THREE.Vector3(-Math.cos(R.theta), 0, -Math.sin(R.theta) * Math.cos(slope));
    dir.y = Math.sin(R.theta) * Math.sin(slope);
    dir.normalize();
    // Board follows the face; blend toward vertical so the rider stands up like a real surfer leaning into the wave.
    const normal = new THREE.Vector3(0, Math.cos(slope), Math.sin(slope)).lerp(new THREE.Vector3(0, 1, 0), 0.55).normalize();
    const side = new THREE.Vector3().crossVectors(dir, normal).normalize();
    const n2 = new THREE.Vector3().crossVectors(side, dir).normalize();
    const m = new THREE.Matrix4().makeBasis(dir, n2, side);
    r.quaternion.setFromRotationMatrix(m);
    // Rail-to-rail lean in turns
    r.rotateX(-R.lean * 0.5);
    r.position.copy(this.pos);
    // Spray off the rail in hard turns
    if (Math.abs(steer) && R.v > 5 && Math.random() < dt * 30) this.fx.sprayBurst(this.pos, new THREE.Vector3(Math.cos(R.theta) * 0.3, 0, 0.6), 4, 2.5);
    this.face = face;
  }

  trick(name, pts) {
    const R = this.ride;
    R.combo = Math.min(5, R.combo + 0.25);
    const p = Math.round(pts * R.combo);
    this.score += p;
    this.onTrick?.(name, p);
  }

  startWipeout(reason) {
    this.state = 'wipeout';
    this.endTimer = 2.4;
    this.reason = reason;
    this.surfer.wipeout();
    this.fx.sprayBurst(this.pos, new THREE.Vector3(0, 0, 1), 60, 5);
  }
  kickOut(reason) {
    this.state = 'done';
    this.endTimer = 1.6;
    this.reason = reason;
    this.surfer.setPose('sit');
  }
  finish(kind) {
    const result = { kind, reason: this.reason, score: Math.round(this.score), time: this.ride?.time ?? 0, maxSpeed: this.ride?.maxSpeed ?? 0, pos: this.pos.clone(), rode: !!this.ride };
    this.state = 'ended';
    this.onEnd?.(result);
  }

  updateCamera(dt) {
    const p = this.pos;
    let want, look;
    const fp = !this.thirdPerson && (this.state === 'ride' || this.state === 'paddle' || this.state === 'wait');
    this.surfer.rider.visible = !fp; // first person: you are the rider (the board stays in view)
    this.hands ??= makeHands(this.camera);
    this.hands.visible = fp && this.state !== 'ride';
    if (fp && this.state !== 'ride') {
      // Lying on the board: face out to sea while waiting for a set (you have to see it coming),
      // then turn toward the beach to paddle for it, like a real surfer.
      const dist = this.wave ? this.pos.z - this.wave.z : 99;
      const facingShore = this.state === 'paddle' && (this.paddling || dist < 22);
      this.fpTurn = damp(this.fpTurn ?? 0, facingShore ? 1 : 0, 2.5, dt);
      const fwd = new THREE.Vector3(Math.cos(this.heading), 0, Math.sin(this.heading));
      const sea = new THREE.Vector3(0.25, 0, -1).normalize();
      const dir = sea.clone().lerp(fwd, this.fpTurn).normalize();
      const bob = Math.sin(this.t * 1.7) * 0.03;
      want = p.clone().add(new THREE.Vector3(0, 0.55 + bob, 0)).addScaledVector(fwd, -0.15);
      look = want.clone().addScaledVector(dir, 8).add(new THREE.Vector3(0, -0.9 + (1 - this.fpTurn) * 0.7, 0));
      this.camPos.lerp(want, 1 - Math.exp(-14 * dt)); this.camLook.lerp(look, 1 - Math.exp(-6 * dt));
      this.camera.position.copy(this.camPos);
      const minY = this.waterHeight(this.camPos.x, this.camPos.z, this.t) + 0.3;
      if (this.camera.position.y < minY) this.camera.position.y = minY;
      this.camera.lookAt(this.camLook);
      this.hands.userData.stroke(this.t, this.paddling ? 1 : 0, this.fpTurn);
      return;
    }
    if (fp) {
      const R = this.ride;
      const travel = new THREE.Vector3(-Math.cos(R.theta * 0.5), 0, -Math.sin(R.theta * 0.5) * 0.5).normalize();
      const eyeH = R.crouch ? 0.95 : 1.45;
      want = p.clone().add(new THREE.Vector3(0, eyeH, 0)).addScaledVector(travel, -0.25);
      // Look down the line toward the shoulder, a little toward the open face so the wave wall stays in view.
      look = p.clone().addScaledVector(travel, 6).add(new THREE.Vector3(0, eyeH - 2.4, 1.0)); // tilted down: board nose in view
      this.camPos.lerp(want, 1 - Math.exp(-14 * dt)); this.camLook.lerp(look, 1 - Math.exp(-10 * dt));
      this.camera.position.copy(this.camPos);
      const minY = this.waterHeight(this.camPos.x, this.camPos.z, this.t) + 0.3;
      if (this.camera.position.y < minY) this.camera.position.y = minY;
      this.camera.lookAt(this.camLook);
      return;
    }
    if (this.state === 'ride' || this.state === 'done') {
      const R = this.ride;
      const travel = new THREE.Vector3(-Math.cos(R.theta * 0.5), 0, -Math.sin(R.theta * 0.5) * 0.5).normalize();
      const tube = this.face && this.face.curl > 0.55 && this.face.d > -6;
      // Film from the open face side (shoreward), slightly behind: the rider stays in front of the wave wall,
      // never hidden behind the breaking whitewater.
      const back = tube ? 3.0 : 3.4, up = tube ? 0.9 : 1.9;
      want = p.clone().addScaledVector(travel, -back).add(new THREE.Vector3(0, up, tube ? 0.8 : 4.2));
      look = p.clone().addScaledVector(travel, 4.5).add(new THREE.Vector3(0, 0.8, tube ? 0 : -1.2));
      // Line-of-sight check against the wave surface: lift the camera if the water would block the view.
      for (let i = 1; i <= 6; i++) {
        const q = want.clone().lerp(p, i / 7);
        const h = this.waterHeight(q.x, q.z, this.t) + 0.35;
        if (q.y < h) want.y += (h - q.y) * (7 / (7 - i));
      }
    } else if (this.state === 'wipeout') {
      want = p.clone().add(new THREE.Vector3(2, 1.2, 4)); look = p.clone();
    } else {
      // Lineup: look back over your shoulder at the incoming sets.
      const towardWave = this.wave ? Math.min(1, Math.max(0, (60 - (p.z - this.wave.z)) / 60)) : 0.3;
      want = p.clone().add(new THREE.Vector3(-3.5, 2.6, 6.5));
      look = p.clone().add(new THREE.Vector3(0, 0.6 + towardWave, -6 - towardWave * 8));
    }
    if (!this.camInit) { this.camPos.copy(want); this.camLook.copy(look); this.camInit = true; }
    const k = this.settings.reducedMotion ? 3 : 5;
    this.camPos.lerp(want, 1 - Math.exp(-k * dt));
    this.camLook.lerp(look, 1 - Math.exp(-(k + 2) * dt));
    // Keep the camera above the water surface while surfing.
    const minY = this.waterHeight(this.camPos.x, this.camPos.z, this.t) + 0.4;
    if (this.camPos.y < minY && this.state !== 'wipeout') this.camPos.y = minY;
    this.camera.position.copy(this.camPos);
    if (this.state === 'wipeout' && !this.settings.reducedMotion) this.camera.position.add(new THREE.Vector3((Math.random() - 0.5) * 0.15, (Math.random() - 0.5) * 0.15, 0));
    this.camera.lookAt(this.camLook);
  }
}
