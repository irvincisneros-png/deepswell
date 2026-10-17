// Procedural soundscape (no audio files): surf roar, wind, underwater rumble, reef crackle,
// bubbles, breathing, heartbeat and UI blips. Started on first user gesture.
export class Audio {
  constructor() { this.ctx = null; this.volume = 0.8; this.under = 0; this.started = false; }
  start() {
    if (this.started) { this.ctx?.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.started = true;
    const ctx = this.ctx = new AC();
    this.master = ctx.createGain(); this.master.gain.value = this.volume; this.master.connect(ctx.destination);
    // White/brown noise buffer
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    this.brown = buf;
    const wbuf = ctx.createBuffer(1, len, ctx.sampleRate), wd = wbuf.getChannelData(0);
    for (let i = 0; i < len; i++) wd[i] = Math.random() * 2 - 1;
    this.white = wbuf;
    const loop = (b) => { const s = ctx.createBufferSource(); s.buffer = b; s.loop = true; s.start(); return s; };
    // Above-water: surf wash (brown noise through a slowly swept lowpass) + breaking roar
    this.surfF = ctx.createBiquadFilter(); this.surfF.type = 'lowpass'; this.surfF.frequency.value = 600;
    this.surfG = ctx.createGain(); this.surfG.gain.value = 0.3;
    loop(this.brown).connect(this.surfF).connect(this.surfG).connect(this.master);
    this.roarF = ctx.createBiquadFilter(); this.roarF.type = 'bandpass'; this.roarF.frequency.value = 900; this.roarF.Q.value = 0.4;
    this.roarG = ctx.createGain(); this.roarG.gain.value = 0;
    loop(this.white).connect(this.roarF).connect(this.roarG).connect(this.master);
    // Underwater: deep muffled rumble
    this.uwF = ctx.createBiquadFilter(); this.uwF.type = 'lowpass'; this.uwF.frequency.value = 220;
    this.uwG = ctx.createGain(); this.uwG.gain.value = 0;
    loop(this.brown).connect(this.uwF).connect(this.uwG).connect(this.master);
    // Reef crackle (snapping shrimp): sparse clicks through a highpass
    this.crackleG = ctx.createGain(); this.crackleG.gain.value = 0;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2500;
    hp.connect(this.crackleG).connect(this.master);
    this.crackleIn = hp;
    this.nextCrackle = 0;
  }
  setVolume(v) { this.volume = v; if (this.master) this.master.gain.value = v; }
  /** Called every frame. under: 0..1, roar: 0..1 (breaking wave nearby), depth in metres. */
  update(dt, { under = 0, roar = 0, depth = 0 } = {}) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const k = 1 - Math.exp(-dt * 6);
    this.under += (under - this.under) * k;
    const u = this.under;
    this.surfG.gain.value = (0.25 + 0.1 * Math.sin(t * 0.4)) * (1 - u);
    this.surfF.frequency.value = 500 + 300 * Math.sin(t * 0.23);
    this.roarG.gain.value += (roar * 0.35 * (1 - u * 0.7) - this.roarG.gain.value) * k;
    this.uwG.gain.value = u * (0.5 + Math.min(depth, 20) * 0.01);
    this.crackleG.gain.value = u * 0.5;
    if (u > 0.5 && t > this.nextCrackle) {
      for (let i = 0; i < 6; i++) this.click(t + Math.random() * 0.25, 0.15 + Math.random() * 0.3);
      this.nextCrackle = t + 0.15 + Math.random() * 0.2;
    }
  }
  click(when, amp) {
    const ctx = this.ctx, s = ctx.createBufferSource(); s.buffer = this.white;
    const g = ctx.createGain(); g.gain.setValueAtTime(amp, when); g.gain.exponentialRampToValueAtTime(0.001, when + 0.008);
    s.connect(g).connect(this.crackleIn); s.start(when, Math.random() * 3, 0.01);
  }
  bubbles(n = 6, base = 500) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (let i = 0; i < n; i++) {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      const w = t + i * 0.05 + Math.random() * 0.05, f = base + Math.random() * base;
      o.frequency.setValueAtTime(f, w); o.frequency.exponentialRampToValueAtTime(f * 2.2, w + 0.06);
      g.gain.setValueAtTime(0.0001, w); g.gain.exponentialRampToValueAtTime(0.06, w + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, w + 0.07);
      o.connect(g).connect(this.master); o.start(w); o.stop(w + 0.09);
    }
  }
  breath(inhale = true) {
    if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime, s = ctx.createBufferSource(); s.buffer = this.white;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = inhale ? 1400 : 900; f.Q.value = 0.7;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.35); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    s.connect(f).connect(g).connect(this.master); s.start(t, Math.random(), 1.2);
  }
  heartbeat(rate = 1) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (const off of [0, 0.22]) {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.frequency.value = 55; g.gain.setValueAtTime(0.0001, t + off); g.gain.exponentialRampToValueAtTime(0.5 * rate, t + off + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + off + 0.18);
      o.connect(g).connect(this.master); o.start(t + off); o.stop(t + off + 0.2);
    }
  }
  blip(freq = 880, dur = 0.08, vol = 0.08) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master); o.start(t); o.stop(t + dur + 0.02);
  }
  shutter() { this.blip(2200, 0.03, 0.1); setTimeout(() => this.blip(1500, 0.05, 0.08), 60); }
  splash() {
    if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime, s = ctx.createBufferSource(); s.buffer = this.white;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(4000, t); f.frequency.exponentialRampToValueAtTime(300, t + 1.2);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
    s.connect(f).connect(g).connect(this.master); s.start(t, 0, 1.5);
  }
}
