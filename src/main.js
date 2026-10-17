// DeepSwell — game orchestrator: menu -> surf -> (wipeout | kick-out) -> dive, plus science tools.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { Input } from './core/input.js';
import { Audio } from './core/audio.js';
import { loadSettings, saveSettings, TIERS } from './core/settings.js';
import { loadProgress, saveProgress, resetProgress, progressCSV } from './core/save.js';
import { globalUniforms } from './ocean/shaders.js';
import { Environment } from './ocean/environment.js';
import { SetWave, swellHeight } from './ocean/waveProfile.js';
import { Particles } from './world/particles.js';
import { World } from './world/world.js';
import { Surfer } from './surf/surfer.js';
import { SurfSession } from './surf/surfSession.js';
import { Diver, buoyancyAt, pressureAt } from './dive/diver.js';
import { evaluatePhoto, snapshot } from './learn/photo.js';
import { Panels, esc } from './ui/panels.js';
import { ECOSYSTEMS, PLANNED, ecoById } from './ecosystems/index.js';

const $ = s => document.querySelector(s);
const params = new URLSearchParams(location.search);

class Game {
  constructor() {
    this.settings = loadSettings();
    this.quality = TIERS[this.settings.quality];
    this.progress = loadProgress();
    const canvas = $('#gl');
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: this.quality.antialias, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.quality.pixelRatio));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, 1, 0.05, 7000);
    this.input = new Input(canvas);
    this.audio = new Audio(); this.audio.volume = this.settings.volume;
    this.panels = new Panels(this);
    this.env = new Environment(this.scene, this.renderer, this.quality);
    this.fx = new Particles(this.scene, this.quality);
    this.world = new World(this.scene, this.renderer, this.env, this.fx, this.quality);
    this.surfer = new Surfer(this.scene);
    this.diver = new Diver(this.camera, this.input, this.settings);
    this.mode = 'loading';
    this.eco = ecoById(params.get('eco')) ?? ECOSYSTEMS[0];
    this.activeMission = null;
    this.cameraMode = false;
    this.frame = 0; this.time = 0;
    this.boardPos = new THREE.Vector3();
    this.setupComposer();
    addEventListener('resize', () => this.resize());
    this.resize();
    this.input.onLockChange = locked => $('#click-to-play').classList.toggle('hidden', locked || this.mode !== 'dive' || this.panels.isOpen);
    this.bindMenu();
    this.bindKeys();
  }

  setupComposer() {
    if (!this.quality.bloom) { this.composer = null; return; }
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.35, 0.5, 0.86);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
  }
  resize() {
    const w = innerWidth, h = innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.composer?.setSize(w, h);
  }

  async start() {
    const bar = $('#load-bar'), msg = $('#load-msg');
    await this.world.load(this.eco, (f, m) => { bar.style.width = `${f * 100}%`; msg.textContent = m; });
    this.renderer.compile(this.scene, this.camera);
    $('#loading').classList.remove('show');
    this.enterMenu();
    const mid = params.get('mission');
    if (mid) { const m = this.eco.missions.find(x => x.id === mid); if (m) this.trackMission(m); }
    this.clock = new THREE.Clock();
    this.renderer.setAnimationLoop(() => this.loop());
  }

  // ------------------------------------------------------------------ menu
  bindMenu() {
    const cards = $('#eco-cards');
    const all = [...ECOSYSTEMS.map(e => ({ ...e, ready: true })), ...PLANNED.filter(p => !ecoById(p.id))];
    cards.innerHTML = all.map(e => `<button class="eco-card ${e.id === this.eco.id ? 'sel' : ''}" data-id="${e.id}" ${e.ready ? '' : 'disabled'}>
      <b>${esc(e.name)}</b><small>${esc(e.place)} — ${esc(e.blurb)}</small><span class="chip">${e.ready ? `${e.speciesInfo.length} species` : 'Coming soon'}</span></button>`).join('');
    cards.querySelectorAll('.eco-card:not([disabled])').forEach(b => b.onclick = () => this.switchEco(b.dataset.id));
    $('#btn-surf').onclick = () => { this.audio.start(); this.startSurf(); };
    $('#btn-dive').onclick = () => { this.audio.start(); this.startDive(null); };
    $('#btn-journal').onclick = () => this.panels.journal(this.eco, ECOSYSTEMS, this.progress);
    $('#btn-missions').onclick = () => this.panels.missions(this.eco, this.progress, m => this.trackMission(m));
    $('#btn-settings').onclick = () => this.openSettings();
    $('#btn-help').onclick = () => this.panels.help();
    this.updateProgressSummary();
  }
  async switchEco(id) {
    if (id === this.eco.id) return;
    this.eco = ecoById(id);
    $('#loading').classList.add('show'); $('#menu').classList.remove('show');
    this.surfSession = null;
    await this.world.load(this.eco, (f, m) => { $('#load-bar').style.width = `${f * 100}%`; $('#load-msg').textContent = m; });
    $('#loading').classList.remove('show');
    this.activeMission = null; this.updateMissionHUD();
    this.bindMenu();
    this.enterMenu();
  }
  updateProgressSummary() {
    const n = Object.keys(this.progress.journal).length;
    const m = Object.values(this.progress.missions).filter(x => x.complete).length;
    $('#progress-sum').textContent = `${n} species logged · ${m} missions complete`;
  }
  enterMenu() {
    this.mode = 'menu';
    this.input.wantLock = false; this.input.unlock();
    $('#menu').classList.add('show'); $('#hud').classList.add('hidden');
    $('#click-to-play').classList.add('hidden');
    this.surfer.root.visible = false;
    this.menuWave = null; this.menuT = 0;
    $('#btn-surf').textContent = this.eco.surf ? (this.activeMission ? 'Start mission (surf first)' : 'Surf & dive') : 'Surf & dive';
    $('#btn-surf').disabled = !this.eco.surf;
    $('#btn-dive').textContent = this.activeMission && this.activeMission.goal.type !== 'surf-ride' ? 'Start mission (dive)' : (this.eco.diveLabel ?? 'Dive only');
    this.updateProgressSummary();
  }

  // ------------------------------------------------------------------ modes
  startSurf() {
    if (!this.eco.surf) return this.startDive(null);
    this.mode = 'surf';
    $('#menu').classList.remove('show'); $('#hud').classList.remove('hidden');
    $('#surf-hud').classList.remove('hidden'); $('#dive-hud').classList.add('hidden');
    $('#site-name').textContent = `${this.eco.name} · ${this.eco.surf.breakName ?? 'Outer reef break'}`;
    this.input.wantLock = false; this.input.unlock();
    this.diver.active = false;
    this.surfer.root.visible = true; this.surfer.rider.visible = true;
    this.surfSession = new SurfSession({
      eco: this.eco, surfer: this.surfer, camera: this.camera, input: this.input, fx: this.fx, audio: this.audio, settings: this.settings,
      onEnd: r => this.onRideEnd(r), onTrick: (n, p) => this.showTrick(n, p),
    });
    this.setKeys([['W', 'paddle / pump'], ['A D', 'steer'], ['Space', 'pop up'], ['S', 'crouch'], ['P', 'pause']]);
    this.toast(this.eco.surf.intro ?? 'Paddle out complete. Waves come in sets — watch behind you, then paddle (W) to catch one.');
  }
  onRideEnd(r) {
    this.lastRide = r;
    const best = this.progress.best[this.eco.id] ?? 0;
    if (r.score > best) { this.progress.best[this.eco.id] = r.score; this.persist(); }
    this.checkMission('surf-ride', r);
    // Board stays at the surface where the ride ended.
    this.boardPos.set(r.pos.x, 0, r.pos.z);
    const spawn = r.pos.clone(); spawn.y = r.kind === 'wipeout' ? -2.2 : -0.1;
    const breath = r.kind === 'wipeout' ? 0.7 : 1;
    this.startDive(spawn, breath, r.kind === 'wipeout');
    this.panels.result(r, () => this.lockSoon(), () => this.startSurf());
  }
  startDive(spawn, breath = 1, wipeout = false) {
    this.mode = 'dive';
    $('#menu').classList.remove('show'); $('#hud').classList.remove('hidden');
    $('#surf-hud').classList.add('hidden'); $('#dive-hud').classList.remove('hidden');
    $('#site-name').textContent = `${this.eco.name} · ${this.eco.place}`;
    this.surfSession = null;
    const s = this.eco.diveSpawn ?? { x: 0, z: -22 };
    if (!spawn) { spawn = new THREE.Vector3(s.x, s.y ?? -0.1, s.z); this.boardPos.set(s.x + 2, 0, s.z + 1); }
    this.diver.spawn(spawn, Math.PI, breath);
    this.surfer.root.visible = !!this.eco.surf; this.surfer.rider.visible = false; this.surfer.reset();
    this.input.wantLock = true;
    this.cameraMode = false; $('#viewfinder').classList.add('hidden');
    this.setKeys([['WASD', 'swim'], ['Space/C', 'up/down'], ['Shift', 'kick hard'], ['Q', 'equalise'], ['F', 'camera'], ['Click', 'info'], ['J', 'journal'], ['M', 'missions'], ['L', 'lab'], ...(this.eco.surf ? [['E', 'board']] : []), ['P', 'pause']]);
    if (wipeout) { this.flash(); this.fx.bubbleBurst(spawn, 80, 1.5, 0.08); this.audio.bubbles(14, 300); }
    else this.toast(this.eco.diveIntro ?? 'Breathe up at the surface, then look down and swim (W) to duck-dive. Click to look around.');
    if (!this.panels.isOpen) this.lockSoon();
  }
  lockSoon() { if (this.mode === 'dive') { $('#click-to-play').classList.toggle('hidden', this.input.locked); } }
  onPanelClosed() {
    if (this.mode === 'dive') this.lockSoon();
    if (this.mode === 'menu') this.updateProgressSummary();
  }

  // ------------------------------------------------------------------ keys
  bindKeys() {
    addEventListener('keydown', e => {
      if (this.panels.isOpen || this.mode === 'loading' || this.mode === 'menu') return;
      const c = e.code;
      if (c === 'KeyP') this.pauseMenu();
      if (this.mode !== 'dive') return;
      if (c === 'KeyF') this.toggleCamera();
      if (c === 'KeyJ') this.panels.journal(this.eco, ECOSYSTEMS, this.progress);
      if (c === 'KeyM') this.openMissions();
      if (c === 'KeyL') this.openLab();
      if (c === 'KeyE' && this.eco.surf) this.tryBoard();
    });
  }
  setKeys(list) { $('#keys').innerHTML = list.map(([k, v]) => `<span><kbd>${k}</kbd> ${v}</span>`).join(''); }
  pauseMenu() {
    this.panels.open(`<h2>Paused</h2><p>${esc(this.eco.name)}</p>
      <p><button class="btn primary" id="p-resume">Resume</button> <button class="btn" id="p-help">How to play</button> <button class="btn" id="p-set">Settings</button> <button class="btn ghost" id="p-quit">Quit to title</button></p>`);
    $('#p-resume').onclick = () => this.panels.close();
    $('#p-help').onclick = () => this.panels.help();
    $('#p-set').onclick = () => this.openSettings();
    $('#p-quit').onclick = () => { this.panels.onClose = null; this.panels.close(); this.enterMenu(); };
  }
  openSettings() {
    this.panels.settings(this.settings, (k, v) => {
      if (k === 'resetProgress') { resetProgress(); this.progress = loadProgress(); this.panels.close(); this.updateProgressSummary(); return; }
      this.settings[k] = v; saveSettings(this.settings);
      if (k === 'volume') this.audio.setVolume(v);
      if (k === 'quality') location.reload();
    });
  }
  openMissions() { this.panels.missions(this.eco, this.progress, m => this.trackMission(m)); }
  openLab() {
    this.panels.lab(this.eco, s => this.applyLab(s), res => {
      const conds = this.eco.labCheck ? this.eco.labCheck(res) : (res.maxBleach > 0.5 ? ['bleaching'] : []);
      for (const c of conds) this.checkMission('lab', c);
    });
  }
  applyLab(s) {
    if (this.eco.applyLab) return this.eco.applyLab(this, s);
    globalUniforms.uBleach.value = Math.min(1, s.bleach * 1.05);
    const lost = Math.max(0, (0.32 - s.coral) / 0.32);
    globalUniforms.uDead.value = Math.min(1, lost * 1.1);
    const life = this.world.life;
    const herb = ['parrotfish', 'bluetang', 'moorishidol', 'butterflyfish'], pred = ['coraltrout', 'reefshark', 'humpheadwrasse', 'trevally'];
    life.setAbundance(id => herb.includes(id) ? s.herb : pred.includes(id) ? s.pred : id === 'chromis' ? Math.min(1, 0.2 + s.coral / 0.32 * 0.8) : 1);
    life.setCount('cots', Math.min(1, s.cots * 2.5));
  }
  tryBoard() {
    const d = Math.hypot(this.diver.pos.x - this.boardPos.x, this.diver.pos.z - this.boardPos.z);
    if (d < 4 && this.diver.depthNow < 0.6) { this.startSurf(); this.toast('Back on the board. Paddling out to the lineup…'); }
    else this.toast(d < 4 ? 'Surface first, then climb on your board.' : `Your board is ${Math.round(d)} m away${this.boardDirection()}.`);
  }
  boardDirection() {
    const dx = this.boardPos.x - this.diver.pos.x, dz = this.boardPos.z - this.diver.pos.z;
    const ang = Math.atan2(dx, -dz) - (-this.diver.yaw);
    const a = ((ang % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
    return Math.abs(a) < 0.5 ? ' ahead' : Math.abs(a) > 2.6 ? ' behind you' : a > 0 ? ' to your right' : ' to your left';
  }

  // ------------------------------------------------------------------ missions
  trackMission(m) {
    this.activeMission = m;
    this.updateMissionHUD();
    this.toast(`Mission: ${m.title}. ${m.hint}`, 'good');
    if (this.mode === 'menu') this.enterMenu();
    this.checkMission();
  }
  missionProgress(m) {
    const eco = this.eco, g = m.goal, J = this.progress.journal;
    const mine = Object.entries(J).filter(([k]) => k.startsWith(eco.id + ':')).map(([k, v]) => ({ id: k.split(':')[1], ...v }));
    if (g.type === 'photo-species') {
      const ok = mine.filter(e => { const s = eco.speciesInfo.find(x => x.id === e.id); return s && Object.entries(g.filter ?? {}).every(([k, v]) => Array.isArray(v) ? v.includes(s[k]) : s[k] === v); });
      return { n: ok.length, of: g.count };
    }
    if (g.type === 'photo-behaviour') return { n: mine.some(e => (e.behaviours ?? []).includes(g.behaviour)) ? 1 : 0, of: 1 };
    if (g.type === 'depth') return { n: Math.min(g.metres, Math.floor(this.diver.maxDepth ?? 0)), of: g.metres };
    return { n: 0, of: 1 };
  }
  checkMission(type, data) {
    const m = this.activeMission;
    if (!m) return;
    const key = `${this.eco.id}:${m.id}`;
    const st = this.progress.missions[key] ?? {};
    if (st.goalMet) { this.updateMissionHUD(); return; }
    let met = false;
    const g = m.goal;
    if (g.type === 'surf-ride' && type === 'surf-ride') met = data.rode && data.score >= (g.minScore ?? 1);
    else if (g.type === 'lab' && type === 'lab') met = data === g.condition;
    else if (['photo-species', 'photo-behaviour', 'depth'].includes(g.type)) { const p = this.missionProgress(m); met = p.n >= p.of; }
    if (met) {
      this.progress.missions[key] = { ...st, goalMet: true }; this.persist();
      this.toast(`✅ Objective complete: ${m.title}! Press M to answer the check questions.`, 'good');
      this.audio.blip(1180, 0.25, 0.1);
    }
    this.updateMissionHUD();
  }
  updateMissionHUD() {
    const el = $('#mission-track');
    const m = this.activeMission;
    if (!m) { el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
    const st = this.progress.missions[`${this.eco.id}:${m.id}`] ?? {};
    const p = this.missionProgress(m);
    const label = st.complete ? 'Complete ✓' : st.goalMet ? 'Press M — check questions' : ['photo-species', 'depth'].includes(m.goal.type) ? `${p.n} / ${p.of}` : m.hint;
    el.innerHTML = `<b>Mission · ${esc(m.title)}</b>${esc(label)}${['photo-species', 'depth'].includes(m.goal.type) && !st.goalMet ? `<div class="bar"><i style="width:${(p.n / p.of) * 100}%"></i></div>` : ''}`;
  }

  // ------------------------------------------------------------------ camera tool
  toggleCamera() {
    this.cameraMode = !this.cameraMode;
    $('#viewfinder').classList.toggle('hidden', !this.cameraMode);
    $('#crosshair').classList.toggle('hidden', this.cameraMode);
    this.camera.fov = this.cameraMode ? 50 : 70; this.camera.updateProjectionMatrix();
    this.audio.blip(this.cameraMode ? 700 : 500, 0.06, 0.05);
  }
  takePhoto() {
    const res = evaluatePhoto(this.camera, this.world.photoCandidates(this.camera.position), { groundAt: (x, z) => this.world.groundAt(x, z), diverSpeed: this.diver.speed });
    this.audio.shutter();
    $('#fx-flash').style.transition = 'none'; $('#fx-flash').style.opacity = 0.35;
    requestAnimationFrame(() => { $('#fx-flash').style.transition = 'opacity 0.5s'; $('#fx-flash').style.opacity = 0; });
    if (!res.subject || res.quality === 0) { this.toast(res.reason, 'warn'); return; }
    this.pendingPhoto = res; // thumbnail grabbed right after the next render
  }
  storePhoto(res, img) {
    const sp = this.eco.speciesInfo.find(s => s.id === res.subject.id);
    if (!sp) return;
    const key = `${this.eco.id}:${sp.id}`;
    const prev = this.progress.journal[key];
    const isNew = !prev;
    const entry = prev ?? { time: Date.now(), behaviours: [] };
    const better = !prev || res.quality > (prev.quality ?? 0);
    if (better) { entry.quality = res.quality; if (img) entry.photo = img; entry.time = Date.now(); }
    const newB = res.behaviours.filter(b => !entry.behaviours.includes(b));
    entry.behaviours.push(...newB);
    this.progress.journal[key] = entry;
    this.persist();
    const st = '★'.repeat(res.quality) + '☆'.repeat(3 - res.quality);
    if (isNew) this.toast(`📗 New species: ${sp.common} (${sp.sci}) ${st}. ${res.reason} Field notes unlocked — press J.`, 'good');
    else if (better) this.toast(`Better photo of the ${sp.common}! ${st}`, 'good');
    else this.toast(`${sp.common} ${st}. ${res.reason}`);
    if (newB.length) this.toast(`🔎 Behaviour recorded: ${newB.join(', ')} (${sp.common}).`, 'good');
    this.checkMission('photo');
  }
  persist() { if (!saveProgress(this.progress)) this.toast('Storage is full — some old photos were not saved.', 'warn'); }
  exportCSV() {
    const csv = progressCSV(this.progress, (e, id) => ecoById(e)?.speciesInfo.find(s => s.id === id));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'deepswell-field-data.csv'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  // ------------------------------------------------------------------ feedback
  toast(text, kind = '') {
    const box = $('#toast');
    const el = document.createElement('div');
    el.className = `toast ${kind}`; el.textContent = text;
    box.appendChild(el);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => el.remove(), 4200 + text.length * 35);
  }
  showTrick(name, pts) {
    const el = document.createElement('div');
    el.className = 'trick'; el.innerHTML = `${esc(name)}<span>+${pts}</span>`;
    $('#tricks').appendChild(el);
    setTimeout(() => el.remove(), 1700);
  }
  flash() { const f = $('#fx-flash'); f.style.transition = 'none'; f.style.opacity = 0.9; requestAnimationFrame(() => { f.style.transition = 'opacity 1.4s'; f.style.opacity = 0; }); }

  // ------------------------------------------------------------------ main loop
  loop() {
    const dt = Math.min(0.05, this.clock.getDelta());
    this.time += dt; this.frame++;
    globalUniforms.uTime.value = this.time;
    this.world.time = this.time;
    const paused = this.panels.isOpen;
    if (this.mode === 'menu') this.updateMenu(dt);
    else if (this.mode === 'surf' && !paused) this.updateSurf(dt);
    else if (this.mode === 'dive') this.updateDive(dt, paused);
    if (this.mode === 'surf' && paused) this.surfSession?.updateCamera(0);
    // Life keeps moving even with panels open.
    if (this.world.life && this.mode !== 'surf') this.world.life.update(dt, this.mode === 'dive' ? this.diver : null);
    else if (this.world.life && this.frame % 2 === 0) this.world.life.update(dt * 2, null);
    const cam = this.camera.position;
    const surfaceY = this.world.surfaceAt(cam.x, cam.z);
    const depth = surfaceY - cam.y;
    this.env.update(dt, this.camera, depth);
    this.world.ocean.update(this.camera);
    this.world.sky.update(this.camera);
    this.fx.update(dt, this.camera, 0);
    this.audio.update(dt, { under: depth > 0 ? 1 : 0, roar: this.roar ?? 0, depth });
    $('#fx-uw').style.opacity = depth > 0 ? 1 : 0;
    if (this.composer) this.composer.render(); else this.renderer.render(this.scene, this.camera);
    if (this.pendingPhoto) { const img = snapshot(this.renderer.domElement); this.storePhoto(this.pendingPhoto, img); this.pendingPhoto = null; }
    this.input.endFrame();
  }

  updateMenu(dt) {
    // Cinematic: sets roll through the break while the camera drifts along the lineup.
    this.menuT += dt;
    if (this.eco.surf) {
      if (!this.menuWave || this.menuWave.z > this.eco.surf.endZ + 5) {
        const c = this.eco.surf;
        this.menuWave = new SetWave({ H: c.H, speed: c.speed, peel: c.peel, peakX: c.peakX, z0: c.z0 + 10, breakZ: c.breakZ, endZ: c.endZ });
      }
      this.menuWave.update(dt);
      this.world.waveMesh.update(this.menuWave, this.time);
      const w = this.menuWave;
      const px = w.broken ? w.peelX() - 10 : this.eco.surf.peakX;
      const target = new THREE.Vector3(px - 6, 2.2, w.z + w.H * 3.2);
      if (!this.menuCam) this.menuCam = target.clone();
      this.menuCam.lerp(target, 1 - Math.exp(-0.8 * dt));
      this.menuCam.z = target.z; this.menuCam.y = target.y; // never let the wave overtake the camera
      this.camera.position.copy(this.menuCam);
      this.camera.lookAt(px + 8, w.H * 0.6, w.z - 2);
    } else {
      const a = this.menuT * 0.05;
      this.camera.position.set(Math.cos(a) * 25, -8, Math.sin(a) * 25);
      this.camera.lookAt(0, -12, 0);
    }
  }

  updateSurf(dt) {
    const s = this.surfSession;
    s.update(dt, this.time);
    this.world.waveMesh.update(s.wave, this.time);
    this.roar = s.wave && s.wave.broken ? Math.max(0, 1 - Math.abs(s.pos.x - s.wave.peelX()) / 40) : 0;
    $('#surf-score').textContent = Math.round(s.score);
    $('#surf-speed').textContent = Math.round((s.ride?.v ?? s.paddleSpeed) * 3.6);
    const pr = $('#prompt');
    const text = s.state === 'wipeout' ? 'WIPEOUT!' : s.msgTimer > 0 ? s.msg : s.prompt;
    if (s.msgTimer > 0) s.msgTimer -= dt;
    pr.textContent = text || '';
    pr.classList.toggle('hot', /POP UP|WIPEOUT/.test(text || ''));
    // Catch meter while paddling for a wave
    const meter = $('#surf-meter');
    if (s.state === 'paddle' && s.waveInfo && s.waveInfo.s > -s.waveInfo.H && s.waveInfo.s < 30) {
      meter.classList.remove('hidden');
      // 0 = far ahead of the wave … 100 = wave passed
      const x = 100 - Math.min(100, Math.max(0, (s.waveInfo.s + s.waveInfo.H * 1.2) / (30 + s.waveInfo.H * 1.2) * 100));
      $('#surf-marker').style.left = `${x}%`;
    } else meter.classList.add('hidden');
  }

  updateDive(dt, paused) {
    const d = this.diver;
    const cardOpen = paused && this.panels.body.querySelector('.card-top');
    d.freeze = paused && !(cardOpen && !this.settings.freezeBreathInCards);
    if (!paused) {
      d.update(dt, this.world);
      for (const c of this.input.takeClicks()) {
        if (!this.input.locked) continue;
        if (c.button === 2) { this.toggleCamera(); continue; }
        if (this.cameraMode) this.takePhoto();
        else {
          const hit = this.world.pick(this.camera.position, d.lookDir);
          if (hit) { const sp = this.eco.speciesInfo.find(s => s.id === hit.id); if (sp) this.panels.card(sp, this.progress.journal[`${this.eco.id}:${sp.id}`]); }
        }
      }
    } else if (cardOpen && !this.settings.freezeBreathInCards) {
      // Breath keeps ticking while reading (teacher can turn this off).
      d.breath = Math.max(0, d.breath - dt / 75 * 0.7 * (d.depthNow > 0.45 ? 1 : 0));
    }
    for (const e of d.takeEvents()) this.onDiverEvent(e);
    // Board bobbing at the surface
    if (this.eco.surf) {
      const bx = this.boardPos.x, bz = this.boardPos.z;
      this.surfer.root.position.set(bx, swellHeight(bx, bz, this.time) + 0.02, bz);
      this.surfer.root.rotation.set(Math.sin(this.time * 0.9) * 0.05, 0.6, Math.sin(this.time * 0.7) * 0.04);
    }
    this.world.waveMesh.update(null, this.time);
    this.roar = 0;
    // Hover label
    if (this.frame % 5 === 0 && !paused) {
      const hit = this.input.locked && !this.cameraMode ? this.world.pick(this.camera.position, d.lookDir, 12) : null;
      const lbl = $('#target-label');
      if (hit) { const sp = this.eco.speciesInfo.find(s => s.id === hit.id); lbl.innerHTML = sp ? `${esc(sp.common)} <i>· click for info</i>` : ''; lbl.classList.toggle('show', !!sp); }
      else lbl.classList.remove('show');
      if (this.cameraMode) {
        const r = evaluatePhoto(this.camera, this.world.photoCandidates(this.camera.position), { groundAt: (x, z) => this.world.groundAt(x, z), diverSpeed: d.speed });
        const sp = r.subject && this.eco.speciesInfo.find(s => s.id === r.subject.id);
        $('#vf-subject').textContent = sp ? `${sp.common} ${'★'.repeat(r.quality)}${'☆'.repeat(3 - r.quality)}` : 'no subject';
      }
    }
    // HUD
    const pct = Math.round(d.breath * 100);
    $('#breath-pct').textContent = pct;
    $('#breath-ring').style.strokeDashoffset = 264 * (1 - d.breath);
    const br = $('.breath'); br.classList.toggle('low', d.breath < 0.35); br.classList.toggle('crit', d.breath < 0.15);
    $('#depth-m').textContent = (d.depthNow ?? 0).toFixed(1);
    $('#pressure').textContent = `${pressureAt(d.depthNow ?? 0).toFixed(1)} atm`;
    $('#max-depth').textContent = Math.floor(d.maxDepth);
    const bu = buoyancyAt(d.depthNow ?? 0);
    $('#buoy').textContent = (d.depthNow ?? 0) < 0.45 ? 'At the surface — breathing' : bu > 0.05 ? 'Buoyancy: floating up ↑' : bu < -0.05 ? 'Buoyancy: sinking ↓ (freefall)' : 'Buoyancy: neutral';
    $('#eq-prompt').classList.toggle('hidden', d.ear < 0.35);
    const v = 0.3 + (d.breath < 0.3 ? (0.3 - d.breath) * 2.2 : 0) + Math.min(0.4, d.ear * 0.2);
    $('#fx-vignette').style.setProperty('--v', v.toFixed(2));
    if (d.breath < 0.3 && !paused) {
      this.hbT = (this.hbT ?? 0) - dt;
      if (this.hbT <= 0) { this.audio.heartbeat(0.6); this.hbT = 0.5 + d.breath * 3; }
    }
    if (d.outOfBounds && this.frame % 240 === 0) this.toast(this.eco.boundsMsg ?? 'You\'re leaving the dive site — your buddy signals you to turn back.', 'warn');
    if (this.activeMission?.goal.type === 'depth' && this.frame % 30 === 0) this.checkMission('depth');
    $('#prompt').textContent = '';
  }

  onDiverEvent(e) {
    const d = this.diver;
    if (e === 'surface') { this.audio.breath(true); this.fx.bubbleBurst(d.pos, 6, 0.2); if (d.maxDepth > 3) this.toast(`Surfaced from ${d.maxDepth.toFixed(1)} m. Breathe and recover before the next dive.`); }
    if (e === 'dive') { this.audio.bubbles(4, 600); }
    if (e === 'equalise') { this.audio.blip(330, 0.12, 0.05); }
    if (e === 'earPain') this.toast('Ouch — pressure on your eardrums! Press Q to equalise. (Pressure at 10 m is double the surface.)', 'warn');
    if (e === 'lowO2') this.toast('Low on oxygen — start ascending now! Turn around before you feel desperate to breathe.', 'warn');
    if (e === 'blackout') this.blackout();
  }
  blackout() {
    const b = $('#fx-black');
    b.style.opacity = 1;
    this.toast('You blacked out. Freedivers can lose consciousness without warning when oxygen runs low ("shallow-water blackout").', 'bad');
    setTimeout(() => {
      const d = this.diver;
      d.spawn(new THREE.Vector3(d.pos.x, -0.1, d.pos.z), d.yaw, 0.5);
      b.style.opacity = 0;
      this.toast('Your dive buddy brought you to the surface and kept your airway clear. This is why you NEVER freedive alone.', 'good');
    }, 2200);
  }
}

const game = new Game();
window.__game = game; // debugging hook
game.start().catch(err => {
  console.error(err);
  $('#load-msg').textContent = 'Something went wrong starting DeepSwell: ' + err.message;
});
