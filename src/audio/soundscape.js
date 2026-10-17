// The living soundscape: continuous layers (surf wash, wind, underwater rumble, reef crackle, board carve,
// submersible hum, boat generator) plus animal voices placed where the animals actually are.
// Each ecosystem tunes it with an optional `sound` block (see SITE_DEFAULTS).
import { spatialMix } from './engine.js';

export const SITE_DEFAULTS = { wash: 1, wind: 0.3, shrimp: 0, gulls: 0, mangroveBirds: 0, deep: 0 };

/** Which species make sound, and how. `every` = seconds between calls (random in range). */
export const VOICES = {
  humpback: { sounds: ['whaleSong'], every: [5, 11], max: 600, ref: 90, reverb: 0.7, breath: 'whaleBlow', breathMax: 300 },
  commondolphin: { sounds: ['dolphinWhistle', 'dolphinWhistle', 'dolphinClicks'], every: [1.2, 3.5], max: 80, ref: 12, breath: 'dolphinChuff', chargeClicks: true },
  bottlenose: { sounds: ['dolphinWhistle', 'dolphinClicks'], every: [2, 5], max: 80, ref: 12, breath: 'dolphinChuff' },
  dugong: { sounds: ['dugongChirp'], every: [5, 12], max: 40, ref: 6, breath: 'dugongBreath' },
  parrotfish: { sounds: ['parrotfishCrunch'], every: [1.5, 4], max: 20, ref: 3 },
  luderick: { sounds: ['parrotfishCrunch'], every: [3, 7], max: 14, ref: 2, gain: 0.6 },
  humpheadwrasse: { sounds: ['fishGrunt'], every: [7, 15], max: 22, ref: 4, pitch: 95 },
  coraltrout: { sounds: ['fishGrunt'], every: [8, 16], max: 18, ref: 3, pitch: 140 },
  bluegroper: { sounds: ['fishGrunt'], every: [7, 14], max: 22, ref: 4, pitch: 110 },
  snapper: { sounds: ['fishGrunt'], every: [8, 18], max: 18, ref: 3, pitch: 150 },
  redmorwong: { sounds: ['fishGrunt'], every: [9, 18], max: 15, ref: 3, pitch: 170 },
  bream: { sounds: ['fishGrunt'], every: [10, 20], max: 14, ref: 3, pitch: 190 },
  grenadier: { sounds: ['fishGrunt'], every: [10, 20], max: 25, ref: 4, pitch: 80, reverb: 0.5 },
  trevally: { sounds: ['schoolTurn'], every: [5, 10], max: 30, ref: 6 },
  kingfish: { sounds: ['schoolTurn'], every: [5, 10], max: 30, ref: 6 },
  sardine: { sounds: ['schoolTurn'], every: [2.5, 6], max: 35, ref: 8, gain: 1.4 },
  mullet: { sounds: ['schoolTurn'], every: [6, 12], max: 20, ref: 4, gain: 0.7 },
  urchin: { sounds: ['urchinScrape'], every: [1.5, 4], max: 9, ref: 2 },
  shearwater: { sounds: ['seabirdCry'], every: [2.5, 6], max: 140, ref: 18, medium: 'air', plunge: true },
};

const rand = (a, b) => a + Math.random() * (b - a);

export class Soundscape {
  constructor(engine) {
    this.E = engine;
    this.site = { ...SITE_DEFAULTS };
    this.cool = {}; this.scanT = 0; this.prev = new WeakMap();
    this.timers = { shrimp: 0, stroke: 0, fin: 0, sonar: 3, creak: 5, gull: 4, bird: 6, slap: 2 };
    this.surfPrev = null; this.wavePrev = null; this.subVy = 0;
  }
  /** Build the continuous layers (needs a running AudioContext). */
  init() {
    const E = this.E, B = E.buses;
    this.wash = E.loopLayer('brown', 'lowpass', 600, B.amb);
    this.wind = E.loopLayer('pink', 'bandpass', 700, B.amb, 0.4);
    this.roar = E.loopLayer('white', 'bandpass', 900, B.amb, 0.4);
    this.uw = E.loopLayer('brown', 'lowpass', 220, B.amb);
    this.drone = E.loopLayer('brown', 'lowpass', 70, B.amb, 2);
    this.carve = E.loopLayer('pink', 'bandpass', 1200, B.world, 0.8);
    this.tube = E.loopLayer('pink', 'bandpass', 500, B.world, 6);
    // Submersible: electric motor hum + thruster whine
    const ctx = E.ctx;
    this.subG = ctx.createGain(); this.subG.gain.value = 0; this.subG.connect(B.world);
    const hf = E.filter('lowpass', 260, 1.5); hf.connect(this.subG);
    this.subHum = ctx.createOscillator(); this.subHum.type = 'sawtooth'; this.subHum.frequency.value = 50; this.subHum.connect(hf); this.subHum.start();
    this.whineG = ctx.createGain(); this.whineG.gain.value = 0; this.whineG.connect(B.world);
    this.whine = ctx.createOscillator(); this.whine.type = 'triangle'; this.whine.frequency.value = 320; this.whine.connect(this.whineG); this.whine.start();
    // Dive boat generator: a low throb, placed at the boat.
    this.boatG = ctx.createGain(); this.boatG.gain.value = 0;
    this.boatP = ctx.createStereoPanner(); this.boatF = E.filter('lowpass', 240, 1);
    this.boatG.connect(this.boatF).connect(this.boatP).connect(B.world);
    this.boatOsc = ctx.createOscillator(); this.boatOsc.type = 'sawtooth'; this.boatOsc.frequency.value = 41;
    const am = ctx.createGain(); am.gain.value = 0.6;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 6.5; const lfoG = ctx.createGain(); lfoG.gain.value = 0.35;
    lfo.connect(lfoG).connect(am.gain); lfo.start();
    this.boatOsc.connect(am).connect(this.boatG); this.boatOsc.start();
  }
  setSite(eco) {
    this.site = { ...SITE_DEFAULTS, ...(eco?.sound ?? {}) };
    this.cool = {}; this.prev = new WeakMap(); this.surfPrev = null; this.wavePrev = null;
  }

  /** Called every frame with a snapshot of the game. */
  update(dt, g) {
    const E = this.E;
    if (!E.ctx || !this.wash) return;
    const t = E.t, S = this.site;
    const under = g.depth > 0, u = under ? 1 : 0;
    const k = 1 - Math.exp(-dt * 5);
    const set = (param, v, kk = k) => { param.value += (v - param.value) * kk; };
    const deepSite = S.deep > 0;
    // --- ambience above water
    const air = 1 - u;
    set(this.wash.gain.gain, (0.22 + 0.08 * Math.sin(t * 0.4)) * S.wash * air);
    this.wash.filter.frequency.value = 450 + 300 * Math.sin(t * 0.23);
    const gust = 0.6 + 0.4 * Math.sin(t * 0.17) * Math.sin(t * 0.071 + 1);
    set(this.wind.gain.gain, 0.12 * S.wind * gust * air);
    this.wind.filter.frequency.value = 500 + 500 * gust;
    set(this.roar.gain.gain, (g.roar ?? 0) * 0.4 * (1 - u * 0.7));
    // --- ambience below water
    set(this.uw.gain.gain, u * (deepSite ? 0.18 : 0.42 + Math.min(g.depth, 20) * 0.012));
    set(this.drone.gain.gain, u * S.deep * 0.5);
    E.setReverb(under ? (deepSite ? 0.35 : 0.18) : 0.04);
    // Snapping shrimp crackle — the background sound of every healthy shallow reef.
    if (under && S.shrimp > 0) {
      this.timers.shrimp -= dt;
      if (this.timers.shrimp <= 0) {
        const n = Math.round(2 + S.shrimp * 6 * (g.reefHealth ?? 1));
        for (let i = 0; i < n; i++) E.play('shrimpSnap', { delay: Math.random() * 0.25, gain: S.shrimp });
        this.timers.shrimp = rand(0.12, 0.3);
      }
    }
    // Above-water birds
    if (!under && S.gulls > 0 && (this.timers.gull -= dt) <= 0) {
      const p = g.camera.position;
      E.play('seabirdCry', { at: { x: p.x + rand(-60, 60), y: 15, z: p.z + rand(-60, 20) }, medium: 'air', max: 140, ref: 20, gain: S.gulls * 0.8 });
      this.timers.gull = rand(6, 16);
    }
    if (S.mangroveBirds > 0 && (this.timers.bird -= dt) <= 0) {
      const m = S.mangroveAt ?? [0, 0];
      E.play('mangroveBird', { at: { x: m[0] + rand(-45, 45), y: 3, z: m[1] + rand(-6, 10) }, medium: 'air', max: 90, ref: 12, gain: S.mangroveBirds });
      this.timers.bird = rand(3, 9);
    }
    if (g.surf) this.updateSurf(dt, g); else { set(this.carve.gain.gain, 0); set(this.tube.gain.gain, 0); }
    if (g.diver?.active && g.mode === 'dive') this.updateDiver(dt, g); else { set(this.subG.gain, 0); set(this.whineG.gain, 0); }
    this.updateBoat(dt, g);
    if (g.life) this.updateLife(dt, g);
  }

  updateSurf(dt, g) {
    const E = this.E, s = g.surf, k = 1 - Math.exp(-dt * 8);
    const st = s.state;
    if (this.surfPrev && st !== this.surfPrev) {
      const at = { x: s.pos.x, y: s.pos.y, z: s.pos.z };
      if (st === 'ride') { E.play('popUp', { at, medium: 'air', ref: 6 }); E.play('splash', { at, medium: 'air', ref: 6, gain: 0.5, size: 0.6 }); }
      if (st === 'wipeout') { E.play('splash', { at, medium: 'air', ref: 8, gain: 1.2 }); E.play('wipeoutTumble', { delay: 0.35 }); }
      if (st === 'done') E.play('kickOut', { at, medium: 'air', ref: 6 });
    }
    this.surfPrev = st;
    // The lip pitching: big crash where the wave first breaks.
    const w = s.wave;
    const broken = !!(w && w.broken);
    if (broken && this.wavePrev === false) E.play('waveCrash', { at: { x: w.peelX(), y: 0, z: w.z }, medium: 'air', ref: 25, max: 220 });
    this.wavePrev = w ? broken : null;
    // Paddling strokes, alternating arms.
    if ((st === 'paddle' || st === 'wait') && s.paddling) {
      this.timers.stroke -= dt;
      if (this.timers.stroke <= 0) {
        this.arm = -(this.arm ?? 1);
        const R = E.listener.right;
        E.play('paddleStroke', { at: { x: s.pos.x + R.x * this.arm * 0.6, y: s.pos.y, z: s.pos.z + R.z * this.arm * 0.6 }, medium: 'air', ref: 5 });
        this.timers.stroke = 0.42;
      }
    }
    // Rail carving through the face: louder with speed and hard turns; hollow roar inside the barrel.
    const R = s.ride;
    const riding = st === 'ride' && R;
    const speed = riding ? R.v : 0;
    const turning = riding ? Math.min(1, Math.abs(R.lean) * 2) : 0;
    this.carve.gain.gain.value += ((riding ? 0.05 + speed * 0.018 + turning * 0.12 : 0) - this.carve.gain.gain.value) * k;
    this.carve.filter.frequency.value = 900 + speed * 90 + turning * 900;
    const inTube = riding && s.face && s.face.curl > 0.55 && s.face.d > -6;
    this.tube.gain.gain.value += ((inTube ? 0.35 : 0) - this.tube.gain.gain.value) * k;
    this.tube.filter.frequency.value = 380 + 120 * Math.sin(E.t * 2.3);
  }

  updateDiver(dt, g) {
    const E = this.E, d = g.diver, k = 1 - Math.exp(-dt * 4);
    const sub = d.vehicle === 'sub';
    if (sub) {
      this.subG.gain.value += (0.12 - this.subG.gain.value) * k;
      const thrust = Math.min(1, d.speed / 6);
      this.whineG.gain.value += (thrust * 0.035 - this.whineG.gain.value) * k;
      this.whine.frequency.value = 280 + thrust * 520;
      this.subHum.frequency.value = 48 + thrust * 10;
      // Ballast pumps when changing depth quickly.
      const vy = Math.abs(d.vel.y);
      if (vy > 2.2 && this.subVy <= 2.2) E.play('ballast');
      this.subVy = vy;
      if ((this.timers.sonar -= dt) <= 0) { E.play('sonarPing', { reverb: 0.8 }); this.timers.sonar = rand(7, 10); }
      if ((this.timers.creak -= dt) <= 0) {
        E.play('hullCreak', { reverb: 0.3, gain: Math.min(1, 0.3 + d.depthNow / 800) });
        this.timers.creak = rand(6, 16) * (600 / Math.max(200, d.depthNow));
      }
      return;
    }
    this.subG.gain.value += (0 - this.subG.gain.value) * k;
    this.whineG.gain.value += (0 - this.whineG.gain.value) * k;
    if (d.freeze || g.blackedOut) return;
    // Fins under water, arm strokes at the surface.
    if (d.kick > 0.25) {
      this.timers.fin -= dt;
      if (this.timers.fin <= 0) {
        const surface = (d.depthNow ?? 0) < 0.45;
        E.play(surface ? 'surfaceStroke' : 'finKick', { gain: 0.6 + d.kick * 0.5 });
        this.timers.fin = surface ? 0.6 : 1.0 - d.kick * 0.45;
      }
    } else this.timers.fin = Math.min(this.timers.fin, 0.15);
  }

  updateBoat(dt, g) {
    const E = this.E, k = 1 - Math.exp(-dt * 4);
    const b = g.boat;
    if (!b?.visible) { this.boatG.gain.value += (0 - this.boatG.gain.value) * k; return; }
    const L = E.listener;
    const m = spatialMix(L.pos, L.right, b.position, { ref: 10, max: 160, medium: 'air', listenerMedium: L.medium });
    this.boatG.gain.value += (m.gain * 0.22 - this.boatG.gain.value) * k;
    this.boatP.pan.value = m.pan;
    this.boatF.frequency.value = m.muffled ? 140 : 260;
    // Hull slapping on the swell when you're near.
    if (m.d < 25 && (this.timers.slap -= dt) <= 0) {
      E.play('smallSplash', { at: b.position, medium: 'air', ref: 4, max: 40, gain: 0.5 });
      this.timers.slap = rand(1.6, 3.5);
    }
  }

  updateLife(dt, g) {
    const E = this.E, L = E.listener, life = g.life;
    // Per-frame transitions: breaths at the surface, seabird plunges, dolphin echolocation buzzes.
    for (const a of life.agents) {
      const v = VOICES[a.id];
      if (!v || a.visible === false) continue;
      const prev = this.prev.get(a);
      const state = a.state, y = a.pos.y;
      if (prev) {
        if (v.breath && state === 'breathe' && prev.state !== 'breathe') E.play(v.breath, { at: a.pos, medium: 'air', ref: v.ref, max: v.breathMax ?? v.max * 1.5 });
        if (v.plunge && prev.y >= 0 && y < 0) E.play('birdPlunge', { at: a.pos, medium: 'air', ref: 8, max: 120 });
        if (v.chargeClicks && state === 'charge' && prev.state !== 'charge' && Math.random() < 0.5) E.play('dolphinClicks', { at: a.pos, ref: v.ref, max: v.max });
        prev.state = state; prev.y = y;
      } else this.prev.set(a, { state, y });
    }
    // Calls: a few times a second, the nearest member of each vocal species may call.
    this.scanT -= dt;
    if (this.scanT > 0) return;
    this.scanT = 0.25;
    const now = E.t;
    const nearest = {};
    for (const a of life.agents) {
      const v = VOICES[a.id];
      if (!v || a.visible === false) continue;
      const d = a.pos.distanceToSquared(L.pos);
      if (!nearest[a.id] || d < nearest[a.id].d) nearest[a.id] = { a, d };
    }
    for (const id in nearest) {
      const v = VOICES[id], { a, d } = nearest[id];
      if (d > v.max * v.max) continue;
      if ((this.cool[id] ?? 0) > now) continue;
      this.cool[id] = now + rand(v.every[0], v.every[1]);
      const name = v.sounds[Math.floor(Math.random() * v.sounds.length)];
      E.play(name, { at: a.pos, medium: v.medium ?? 'water', ref: v.ref, max: v.max, reverb: v.reverb ?? (L.medium === 'water' ? 0.25 : 0), gain: v.gain ?? 1, pitch: v.pitch });
    }
  }
}
