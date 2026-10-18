// DeepSwell — game orchestrator: menu -> surf -> (wipeout | kick-out) -> dive, plus science tools.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { Input } from './core/input.js';
import { Audio } from './audio/index.js';
import { TouchControls, detectTouch } from './ui/touch.js';
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
import { Walker, SWIM_DEPTH } from './land/walker.js';
import { evaluatePhoto, snapshot } from './learn/photo.js';
import { Panels, esc } from './ui/panels.js';
import { ECOSYSTEMS, PLANNED, ecoById } from './ecosystems/index.js';
import { diveBoat } from './life/models2.js';
import { patchUnderwater } from './ocean/shaders.js';

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
    this.stylised = this.settings.style === 'stylised';
    // Neutral tone mapping keeps the stylised palette saturated (ACES pushes bright colours toward white).
    this.renderer.toneMapping = this.stylised ? THREE.NeutralToneMapping : THREE.ACESFilmicToneMapping;
    globalUniforms.uStyle.value = this.stylised ? 1 : 0;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    // Soft sun shadows (high/ultra only): grounds coral, rocks and animals on the seabed.
    this.renderer.shadowMap.enabled = !!this.quality.shadows;
    this.renderer.shadowMap.type = THREE.PCFShadowMap; // PCF honours shadow.radius (PCFSoft ignores it)
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
    this.walker = new Walker(this.camera, this.input, this.settings);
    this.mode = 'loading';
    this.eco = ecoById(params.get('eco')) ?? ECOSYSTEMS[0];
    this.activeMission = null;
    this.cameraMode = false;
    this.frame = 0; this.time = 0;
    this.boardPos = new THREE.Vector3();
    this.setupComposer();
    addEventListener('resize', () => this.resize());
    this.resize();
    this.input.onLockChange = locked => $('#click-to-play').classList.toggle('hidden', locked || !this.firstPerson || this.panels.isOpen);
    this.input.onLockFail = () => { $('#click-to-play').classList.add('hidden'); this.toast('Mouse capture is blocked here — drag with the left mouse button to look around; click to use the camera or open cards.'); };
    this.bindMenu();
    this.bindKeys();
    // Browsers only allow audio after a user gesture: start on the first click or key press anywhere.
    const wake = () => this.audio.start();
    addEventListener('pointerdown', wake, true); addEventListener('keydown', wake, true);
    // Soft tick for every button.
    document.addEventListener('click', e => { if (e.target.closest?.('button:not([disabled])') && !e.target.closest('#touch')) this.audio.play('click'); }, true);
    // Phones / tablets: on-screen joystick, look-drag and buttons.
    this.touch = detectTouch() ? new TouchControls(this) : null;
    if (this.touch) $('.vf-info').innerHTML = '📷 Tap to shoot · 📷 exit · <span id="vf-subject"></span>';
  }

  setupComposer() {
    if (!this.quality.bloom) { this.composer = null; return; }
    // The composer renders into its own target: give it MSAA, otherwise high/ultra lose antialiasing entirely.
    const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: this.quality.antialias ? 4 : 0 });
    if (this.stylised) rt.depthTexture = new THREE.DepthTexture(1, 1); // read by the outline pass
    this.composer = new EffectComposer(this.renderer, rt);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.35, 0.5, 0.86);
    this.composer.addPass(this.bloom);
    if (this.stylised) {
      // Colour grade: a little more saturation and contrast, teal-tinted shadows, gentle vignette.
      // Ink outlines where depth jumps (silhouettes), fading with distance and fog; then the colour grade.
      this.gradePass = new ShaderPass({
        uniforms: { tDiffuse: { value: null }, tDepth: { value: rt.depthTexture }, uRes: { value: new THREE.Vector2(1, 1) }, cameraNear: { value: this.camera.near }, cameraFar: { value: this.camera.far }, uUnder: globalUniforms.uUnderwater },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: `#include <packing>
          uniform sampler2D tDiffuse; uniform sampler2D tDepth; uniform vec2 uRes; uniform float cameraNear; uniform float cameraFar; uniform float uUnder; varying vec2 vUv;
          float vz(vec2 uv) { return -perspectiveDepthToViewZ(texture2D(tDepth, uv).x, cameraNear, cameraFar); }
          void main(){
            vec3 c = texture2D(tDiffuse, vUv).rgb;
            vec2 px = 1.0 / uRes;
            float z = vz(vUv), zl = vz(vUv - vec2(px.x, 0.0)), zr = vz(vUv + vec2(px.x, 0.0)), zd = vz(vUv - vec2(0.0, px.y)), zu = vz(vUv + vec2(0.0, px.y));
            // Second difference ignores smooth slopes (ground at grazing angles) and catches real silhouettes.
            float lap = abs(zl + zr + zd + zu - 4.0 * z) / max(z, 0.1);
            float edge = smoothstep(0.09, 0.18, lap) * (1.0 - smoothstep(uUnder > 0.5 ? 14.0 : 25.0, uUnder > 0.5 ? 35.0 : 70.0, z));
            c = mix(c, c * 0.25, edge * 0.8);
            float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
            c = mix(vec3(l), c, 1.22);
            c = mix(c * vec3(0.92, 1.0, 1.06), c, smoothstep(0.0, 0.6, l));
            vec2 d = vUv - 0.5; c *= 1.0 - dot(d, d) * 0.55;
            gl_FragColor = vec4(max(c, 0.0), 1.0);
          }`,
      });
      this.composer.addPass(this.gradePass);
    }
    this.composer.addPass(new OutputPass());
  }
  resize() {
    const w = innerWidth, h = innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.composer?.setSize(w, h);
    if (this.gradePass) this.gradePass.uniforms.uRes.value.set(w * this.renderer.getPixelRatio(), h * this.renderer.getPixelRatio());
  }

  async start() {
    const bar = $('#load-bar'), msg = $('#load-msg');
    await this.world.load(this.eco, (f, m) => { bar.style.width = `${f * 100}%`; msg.textContent = m; });
    this.ensureBoat(); this.resetEcoState(); this.audio.setSite(this.eco); this.setupShadows();
    this.renderer.compile(this.scene, this.camera);
    $('#loading').classList.remove('show');
    this.enterMenu();
    const mid = params.get('mission');
    if (mid) { const m = this.eco.missions.find(x => x.id === mid); if (m) this.trackMission(m); }
    if (params.get('mode') === 'dive') { $('#btn-dive').classList.add('primary'); $('#btn-surf').classList.remove('primary'); $('#btn-dive').focus(); }
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
    $('#btn-beach').onclick = () => { this.audio.start(); this.startLand(null); };
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
    this.ensureBoat(); this.resetEcoState(); this.audio.setSite(this.eco); this.setupShadows();
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
    document.body.classList.remove('land-mode'); $('#prompt').innerHTML = '';
    this.setupVehicle();
    this.exitCameraMode();
    clearTimeout(this.blackoutTimer); this.blackedOut = false; $('#fx-black').style.opacity = 0;
    this.input.wantLock = false; this.input.unlock();
    $('#menu').classList.add('show'); $('#hud').classList.add('hidden');
    $('#click-to-play').classList.add('hidden');
    this.surfer.root.visible = false;
    this.menuWave = null; this.menuT = 0;
    $('#btn-surf').textContent = this.eco.surf ? (this.activeMission ? 'Start mission (surf first)' : 'Surf & dive') : 'Surf & dive';
    $('#btn-surf').disabled = !this.eco.surf;
    $('#btn-beach').classList.toggle('hidden', !this.eco.land);
    $('#btn-dive').textContent = this.activeMission && this.activeMission.goal.type !== 'surf-ride' ? 'Start mission (dive)' : (this.eco.diveLabel ?? 'Dive only');
    this.updateProgressSummary();
  }

  // ------------------------------------------------------------------ modes
  startSurf() {
    if (!this.eco.surf) return this.startDive(null);
    this.exitCameraMode();
    clearTimeout(this.blackoutTimer); this.blackedOut = false; $('#fx-black').style.opacity = 0;
    this.surfCount = (this.surfCount ?? 0) + 1;
    this.mode = 'surf';
    document.body.classList.remove('land-mode'); $('#prompt').innerHTML = '';
    $('#menu').classList.remove('show'); $('#hud').classList.remove('hidden');
    $('#surf-hud').classList.remove('hidden'); $('#dive-hud').classList.add('hidden');
    $('#site-name').textContent = `${this.eco.name} · ${this.eco.surf.breakName ?? 'Outer reef break'}`;
    this.input.wantLock = false; this.input.unlock();
    this.diver.active = false;
    this.surfer.root.visible = true; this.surfer.rider.visible = true;
    this.surfSession = new SurfSession({
      eco: this.eco, surfer: this.surfer, camera: this.camera, input: this.input, fx: this.fx, audio: this.audio, settings: this.settings,
      onEnd: r => this.onRideEnd(r), onTrick: (n, p) => this.showTrick(n, p),
      training: this.surfCount <= 1,
    });
    this.setKeys([['W', 'paddle / pump'], ['A', 'drop down face'], ['D', 'climb to lip'], ['Space', 'pop up'], ['S', 'crouch'], ['E', 'kick out'], ['P', 'pause']]);
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
  startDive(spawn, breath = 1, wipeout = false, quiet = false) {
    this.mode = 'dive'; this.modeSince = this.time;
    document.body.classList.remove('land-mode'); $('#prompt').innerHTML = '';
    $('#menu').classList.remove('show'); $('#hud').classList.remove('hidden');
    $('#surf-hud').classList.add('hidden'); $('#dive-hud').classList.remove('hidden');
    $('#site-name').textContent = `${this.eco.name} · ${this.eco.place}`;
    this.surfSession = null;
    const s = this.eco.diveSpawn ?? { x: 0, z: -22 };
    if (!spawn) { spawn = new THREE.Vector3(s.x, s.y ?? -0.1, s.z); this.boardPos.set(s.x + 2, 0, s.z + 1); }
    this.diver.vehicle = this.eco.vehicle ?? null;
    this.earToastShown = false;
    this.diver.ceiling = this.eco.ceiling;
    this.diver.spawn(spawn, s.yaw ?? Math.PI, breath);
    this.setupVehicle();
    this.surfer.root.visible = !!this.eco.surf; this.surfer.rider.visible = false; this.surfer.reset();
    this.input.wantLock = true;
    this.exitCameraMode();
    clearTimeout(this.blackoutTimer); this.blackedOut = false; $('#fx-black').style.opacity = 0;
    const sub = this.eco.vehicle === 'sub';
    this.setKeys(sub
      ? [['WASD', 'thrusters'], ['Space/C', 'ascend/descend'], ['Shift', 'boost'], ['T', 'lights'], ['F', 'camera'], ['Click', 'info'], ['J', 'journal'], ['M', 'missions'], ['L', 'lab'], ['E', 'return to ship'], ['P', 'pause']]
      : [['WASD', 'swim'], ['Space/C', 'up/down'], ['Shift', 'kick hard'], ['Q', 'equalise'], ['F', 'camera'], ['Click', 'info'], ['J', 'journal'], ['M', 'missions'], ['L', 'lab'], ['E', this.eco.surf ? 'board' : 'boat'], ['P', 'pause']]);
    document.body.classList.toggle('sub-mode', sub);
    if (wipeout) { this.flash(); this.fx.bubbleBurst(spawn, 80, 1.5, 0.08); }
    else if (!quiet) this.toast(this.eco.diveIntro ?? 'Breathe up at the surface, then look down and swim (W) to duck-dive. Click to look around.');
    if (!this.panels.isOpen) this.lockSoon();
  }
  /** Dive and land are first-person modes (mouse look, crosshair, camera tool, cards). */
  get firstPerson() { return this.mode === 'dive' || this.mode === 'land'; }
  lockSoon() { if (this.firstPerson) { $('#click-to-play').classList.toggle('hidden', this.input.locked || this.input.dragLook); } }
  onPanelClosed() {
    if (this.firstPerson) this.lockSoon();
    if (this.mode === 'menu') this.updateProgressSummary();
  }

  // ------------------------------------------------------------------ keys
  bindKeys() {
    addEventListener('keydown', e => {
      if (this.panels.isOpen || this.mode === 'loading' || this.mode === 'menu') return;
      const c = e.code;
      if (c === 'KeyP') this.pauseMenu();
      if (!this.firstPerson) return;
      if (c === 'KeyF') this.toggleCamera();
      if (c === 'KeyJ') this.panels.journal(this.eco, ECOSYSTEMS, this.progress);
      if (c === 'KeyM') this.openMissions();
      if (c === 'KeyL') this.openLab();
      if (c === 'KeyE') this.mode === 'land' ? this.tryBoardFromBeach() : this.tryBoard();
      if (c === 'KeyT' && this.subLights) { this.audio.play('lightsClunk'); this.subLights.visible = !this.subLights.visible; this.toast(this.subLights.visible ? 'Lights on.' : 'Lights off — let your eyes adjust and watch for living light.'); }
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
  openLab() { if (this.eco.lab) this.panels.lab(this.eco, this); }
  onLabResult(res) {
    this.progress.lab[this.eco.id] = [...(this.progress.lab[this.eco.id] ?? []).slice(-9), { time: Date.now(), inputs: res.inputs, final: res.final }];
    this.persist();
    for (const c of this.eco.lab.check(res)) this.checkMission('lab', c);
  }
  /** Submersible lights / dive boat for sites that need them. */
  setupVehicle() {
    if (this.subLights) { this.camera.remove(this.subLights); this.subLights = null; }
    if (this.eco.vehicle === 'sub') {
      const g = new THREE.Group();
      for (const x of [-0.6, 0.6]) {
        const sp = new THREE.SpotLight(0xdff2ff, 26, 40, 0.5, 0.55, 2);
        sp.position.set(x, -0.3, 0); sp.target.position.set(x * 0.3, -0.25, -10);
        g.add(sp, sp.target);
      }
      const fill = new THREE.PointLight(0x9fc8ff, 3, 10, 2); fill.position.set(0, 0, -1); g.add(fill);
      this.camera.add(g); this.subLights = g;
      if (!this.camera.parent) this.scene.add(this.camera);
    }
  }
  /** Put the ecosystem in its default (pre-lab) state. */
  resetEcoState() {
    const L = this.eco.lab;
    if (!L) return;
    L._lastR = null;
    L.apply(this, L.simulate(L.defaults, 0)[0]);
    if (this.panels.labState) delete this.panels.labState[this.eco.id];
  }
  /** high/ultra: every opaque lit object casts and receives sun shadows (water, sky and particles use their own shaders). */
  setupShadows() {
    if (!this.quality.shadows) return;
    this.scene.traverse(o => {
      const m = o.material;
      if (!o.isMesh || !m || Array.isArray(m) || !m.isMeshStandardMaterial || m.transparent) return;
      o.receiveShadow = true;
      o.castShadow = o !== this.world.terrain?.mesh && !o.userData.noShadow; // the big seabed mesh and small ground plants only receive
    });
  }
  ensureBoat() {
    if (!this.eco.boat) { if (this.boat) this.boat.visible = false; return; }
    if (!this.boat) {
      const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6 });
      patchUnderwater(mat, { key: 'boat' });
      this.boat = new THREE.Mesh(diveBoat(), mat);
      this.scene.add(this.boat);
    }
    this.boat.visible = true;
    this.boat.position.set(this.eco.boat.x, 0, this.eco.boat.z);
  }
  /** The camera-carrying player in first-person modes. */
  get player() { return this.mode === 'land' ? this.walker : this.diver; }

  // ------------------------------------------------------------------ land (beach, dunes, rock platform)
  startLand(spawn, yaw, fromWater = false) {
    const L = this.eco.land;
    if (!L) return this.startDive(null);
    this.exitCameraMode();
    clearTimeout(this.blackoutTimer); this.blackedOut = false; $('#fx-black').style.opacity = 0;
    this.mode = 'land'; this.modeSince = this.time;
    document.body.classList.add('land-mode'); document.body.classList.remove('sub-mode');
    $('#menu').classList.remove('show'); $('#hud').classList.remove('hidden');
    $('#surf-hud').classList.add('hidden'); $('#dive-hud').classList.remove('hidden');
    $('#site-name').textContent = `${this.eco.name} · beach & rock platform`;
    this.surfSession = null; this.diver.active = false;
    if (!spawn) spawn = new THREE.Vector3(L.spawn.x, this.world.groundAt(L.spawn.x, L.spawn.z), L.spawn.z);
    this.walker.spawn(spawn, yaw ?? L.spawn.yaw);
    // Your board waits on the sand above the swash.
    if (this.eco.surf) {
      this.boardPos.set(L.board.x, this.world.groundAt(L.board.x, L.board.z), L.board.z);
      this.surfer.root.visible = true; this.surfer.rider.visible = false; this.surfer.reset();
      this.surfer.root.position.copy(this.boardPos).add(new THREE.Vector3(0, 0.05, 0));
      this.surfer.root.rotation.set(0, 0.35, 0.05);
    }
    this.input.wantLock = true;
    this.setKeys([['WASD', 'walk'], ['Shift', 'run'], ['Space', 'jump'], ['F', 'camera'], ['Click', 'info'], ['J', 'journal'], ['M', 'missions'], ['E', 'board'], ['P', 'pause']]);
    if (fromWater) this.toast('You find your feet and wade ashore.');
    else this.toast(L.intro);
    if (!this.panels.isOpen) this.lockSoon();
  }
  updateLand(dt, paused) {
    const w = this.walker;
    if (!paused) {
      w.update(dt, this.world, this.eco.land.bounds);
      for (const c of this.input.takeClicks()) {
        if (!this.input.lookActive) continue;
        if (c.button === 2) { this.toggleCamera(); continue; }
        if (this.cameraMode) this.takePhoto();
        else {
          const hit = this.world.pick(this.camera.position, w.lookDir);
          if (hit) { const sp = this.eco.speciesInfo.find(s => s.id === hit.id); if (sp) this.panels.card(sp, this.progress.journal[`${this.eco.id}:${sp.id}`]); }
        }
      }
    }
    for (const e of w.takeEvents()) {
      if (e === 'step') this.audio.play('footstep');
      else if (e === 'stepWet') this.audio.play('footstep', { wet: true });
      else if (e === 'splash') this.audio.play('smallSplash');
      else if (e === 'swim' && !paused && this.time - (this.modeSince ?? 0) > 2) {
        // Chest-deep: start swimming at the surface (breath-hold diving from here on).
        this.startDive(new THREE.Vector3(w.pos.x, -0.1, w.pos.z), 1, false, true);
        this.diver.yaw = w.yaw; this.diver.pitch = Math.min(0, w.pitch);
        this.toast('You\'re out of your depth — swimming now. Duck-dive by looking down and kicking (W). Swim back into the shallows to walk ashore.');
        return;
      }
    }
    this.world.waveMesh.update(null, this.time);
    if (this.boat?.visible) { const b = this.boat; b.position.y = swellHeight(b.position.x, b.position.z, this.time) * 0.8 - 0.1; }
    this.roar = 0;
    const nearBoard = this.eco.surf && Math.hypot(w.pos.x - this.boardPos.x, w.pos.z - this.boardPos.z) < 2.6;
    $('#prompt').innerHTML = nearBoard ? this.hint('Press <kbd>E</kbd> to pick up your board and paddle out') : '';
    if (this.frame % 5 === 0 && !paused) {
      const hit = this.input.lookActive && !this.cameraMode ? this.world.pick(this.camera.position, w.lookDir, 12) : null;
      const lbl = $('#target-label');
      if (hit) { const sp = this.eco.speciesInfo.find(s => s.id === hit.id); lbl.innerHTML = sp ? `${esc(sp.common)} <i>· click for info</i>` : ''; lbl.classList.toggle('show', !!sp); }
      else lbl.classList.remove('show');
      if (this.cameraMode) {
        const r = evaluatePhoto(this.camera, this.photoCandidates(), { groundAt: (x, z) => this.world.groundAt(x, z), diverSpeed: w.speed });
        const sp = r.subject && this.eco.speciesInfo.find(s => s.id === r.subject.id);
        $('#vf-subject').textContent = sp ? `${sp.common} ${'★'.repeat(r.quality)}${'☆'.repeat(3 - r.quality)}` : 'no subject';
      }
    }
  }
  tryBoardFromBeach() {
    if (!this.eco.surf) return;
    const w = this.walker, d = Math.hypot(w.pos.x - this.boardPos.x, w.pos.z - this.boardPos.z);
    if (d > 2.6) { this.toast(`Your board is on the sand ${Math.round(d)} m away. Walk over to it and press E.`); return; }
    $('#prompt').innerHTML = '';
    this.toast('You wax up, walk in through the shorebreak and paddle out to the lineup…');
    this.startSurf();
  }
  tryBoard() {
    if (this.eco.vehicle === 'sub') { this.toast('Surfacing the submersible — back to the research ship.'); setTimeout(() => this.enterMenu(), 600); return; }
    if (!this.eco.surf) {
      const b = this.eco.boat ?? { x: 0, z: 0 };
      if (this.diver.depthNow > 0.6) { this.toast('Surface first, then signal the boat.'); return; }
      this.diver.spawn(new THREE.Vector3(b.x + 3, -0.1, b.z + 2), this.diver.yaw, Math.max(this.diver.breath, 0.6));
      this.audio.play('climbAboard');
      this.toast('You climbed aboard the dive boat, rested and slipped back in. (Freedivers rest at the surface for at least twice as long as their dive.)');
      return;
    }
    const d = Math.hypot(this.diver.pos.x - this.boardPos.x, this.diver.pos.z - this.boardPos.z);
    if (this.diver.depthNow > 0.6) { this.toast(`Surface first. Your board is ${Math.round(d)} m away${this.boardDirection()}.`); return; }
    this.startSurf();
    this.toast(d < 4 ? 'Back on the board. Paddling out to the lineup…' : 'Your buddy towed your board over. Paddling back out to the lineup…');
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
      this.audio.play('missionDone');
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
    const label = st.complete ? 'Complete ✓' : st.goalMet ? (st.attempts ? 'Press M — try the questions again' : 'Press M — check questions') : ['photo-species', 'depth'].includes(m.goal.type) ? `${p.n} / ${p.of}` : m.hint;
    el.innerHTML = `<b>Mission · ${esc(m.title)}</b>${esc(label)}${['photo-species', 'depth'].includes(m.goal.type) && !st.goalMet ? `<div class="bar"><i style="width:${(p.n / p.of) * 100}%"></i></div>` : ''}`;
  }

  // ------------------------------------------------------------------ camera tool
  exitCameraMode() {
    this.cameraMode = false;
    $('#viewfinder').classList.add('hidden'); $('#crosshair').classList.remove('hidden');
    this.camera.fov = 70; this.camera.updateProjectionMatrix();
  }
  toggleCamera() {
    this.cameraMode = !this.cameraMode;
    $('#viewfinder').classList.toggle('hidden', !this.cameraMode);
    $('#crosshair').classList.toggle('hidden', this.cameraMode);
    this.camera.fov = this.cameraMode ? 50 : 70; this.camera.updateProjectionMatrix();
    this.audio.play('cameraUp', { up: this.cameraMode });
  }
  photoCandidates() {
    const known = new Set(this.eco.speciesInfo.map(s => s.id));
    return this.world.photoCandidates(this.camera.position).filter(c => known.has(c.id));
  }
  takePhoto() {
    const res = evaluatePhoto(this.camera, this.photoCandidates(), { groundAt: (x, z) => this.world.groundAt(x, z), diverSpeed: this.player.speed });
    this.audio.play('shutter');
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
    this.audio.play(isNew ? 'newSpecies' : better ? 'betterPhoto' : 'click');
    if (newB.length) this.audio.play('behaviour', { delay: 0.5 });
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
    const now = performance.now();
    if (this.lastToast === text && now - this.lastToastT < 4000) return; // no duplicate spam
    this.lastToast = text; this.lastToastT = now;
    const el = document.createElement('div');
    el.className = `toast ${kind}`; el.textContent = this.hint(text);
    if (kind === 'warn') this.audio.play('warn');
    box.appendChild(el);
    while (box.children.length > 2) box.firstChild.remove();
    setTimeout(() => el.remove(), 4200 + text.length * 35);
  }
  /** Keyboard hints become button names on touch devices. */
  hint(text) { return this.touch ? this.touch.label(text) : text; }
  showTrick(name, pts) {
    const el = document.createElement('div');
    el.className = 'trick'; el.innerHTML = `${esc(name)}<span>+${pts}</span>`;
    $('#tricks').appendChild(el);
    this.audio.play('trick', { combo: Math.round(((this.surfSession?.ride?.combo ?? 1) - 1) * 4) });
    setTimeout(() => el.remove(), 1700);
  }
  flash() { const f = $('#fx-flash'); f.style.transition = 'none'; f.style.opacity = 0.9; requestAnimationFrame(() => { f.style.transition = 'opacity 1.4s'; f.style.opacity = 0; }); }

  // ------------------------------------------------------------------ main loop
  /** Test helper: advance the simulation deterministically (used by automated play-tests). */
  advance(seconds, hook) {
    const n = Math.round(seconds * 60);
    for (let i = 0; i < n; i++) { hook?.(this); this.loop(1 / 60, i < n - 1); }
  }
  /** Adaptive resolution: drop the render scale on slow machines (school laptops). */
  adapt(raw) {
    this.ft = (this.ft ?? 0.016) * 0.95 + raw * 0.05;
    this.fps = Math.round(1 / this.ft);
    this.slowT = this.ft > 0.034 ? (this.slowT ?? 0) + raw : 0;
    if (this.slowT > 3 && this.renderer.getPixelRatio() > 0.55) {
      this.renderer.setPixelRatio(Math.max(0.5, this.renderer.getPixelRatio() - 0.15));
      this.resize(); this.slowT = 0;
      if (!this.adaptWarned) { this.adaptWarned = true; this.toast('Lowering resolution to keep things smooth. You can change graphics in Settings.'); }
    }
  }
  loop(fixedDt, skipRender = false) {
    const raw = fixedDt ?? this.clock.getDelta();
    if (!fixedDt && raw < 0.25 && document.visibilityState === 'visible') this.adapt(raw);
    const dt = fixedDt ?? Math.min(0.05, raw);
    this.time += dt; this.frame++;
    globalUniforms.uTime.value = this.time;
    this.world.time = this.time;
    const paused = this.panels.isOpen;
    this.input.gameplay = !paused && (this.mode === 'surf' || this.firstPerson);
    if (this.mode === 'menu') this.updateMenu(dt);
    else if (this.mode === 'surf' && !paused) this.updateSurf(dt);
    else if (this.mode === 'dive') this.updateDive(dt, paused);
    else if (this.mode === 'land') this.updateLand(dt, paused);
    if (this.world.land && this.mode !== 'surf') this.world.land.update(dt, this.mode === 'land' ? this.walker : this.mode === 'dive' ? this.diver : null);
    if (this.mode === 'surf' && paused) this.surfSession?.updateCamera(0);
    // Life keeps moving even with panels open.
    if (this.world.life && this.mode !== 'surf') this.world.life.update(dt, this.mode === 'dive' ? this.diver : null);
    else if (this.world.life && this.frame % 2 === 0) this.world.life.update(dt * 2, null);
    const cam = this.camera.position;
    const surfaceY = this.world.surfaceAt(cam.x, cam.z);
    const depth = surfaceY - cam.y;
    this.env.update(dt, this.camera, depth);
    this.world.ocean.update(this.camera, depth > 0);
    // Underwater, fog hides everything past ~2.6/density metres; above water the reef shows through to ~150 m.
    // Beyond ~1/density metres, fog has softened colonies enough to swap in the low-detail versions.
    this.world.reef?.cull(cam, depth > 0 ? 2.6 / this.env.fogDensityBelow + 4 : 150, depth > 0 ? 0.9 / this.env.fogDensityBelow : 40);
    this.world.sky.update(this.camera);
    this.fx.update(dt, this.camera, 0);
    this.audio.update(dt, { mode: this.mode, depth, camera: this.camera, roar: this.roar ?? 0, surf: this.mode === 'surf' ? this.surfSession : null, diver: this.diver, life: this.world.life, boat: this.boat, eco: this.eco, blackedOut: this.blackedOut, reefHealth: this.reefHealth ?? 1 });
    $('#fx-uw').style.opacity = depth > 0 ? 1 : 0;
    this.touch?.update();
    if (skipRender) { this.input.endFrame(); return; }
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
        this.menuWave = new SetWave({ H: c.H * 1.1, speed: c.speed, peel: c.peel, peakX: c.peakX, z0: c.z0 + 10, breakZ: c.breakZ, endZ: c.endZ });
        this.menuWave.t = this.menuWave.tBreak - 1.5;
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
      // Sites without surf: slow orbit around a signature scene.
      const m = this.eco.menuCam ?? { look: [0, -12, 0], r: 25, y: -8 };
      const a = this.menuT * 0.04;
      this.camera.position.set(m.look[0] + Math.cos(a) * m.r, m.y, m.look[2] + Math.sin(a) * m.r);
      this.camera.lookAt(m.look[0], m.look[1], m.look[2]);
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
    pr.textContent = this.hint(text) || '';
    pr.classList.toggle('hot', /POP UP|WIPEOUT/.test(text || ''));
    // Face position (where you are between the base and the lip) + lip danger while riding
    const fm = $('#face-meter');
    if (s.state === 'ride' && s.faceInfo) {
      fm.classList.remove('hidden');
      $('#fm-dot').style.top = `${(1 - Math.max(0, Math.min(1, s.faceInfo.ft))) * 100}%`;
      $('#fm-danger').style.height = `${s.faceInfo.danger * 45}%`;
    } else fm.classList.add('hidden');
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
    d.freeze = paused || this.blackedOut;
    if (cardOpen && !this.settings.freezeBreathInCards && d.depthNow > 0.45) d.freeze = false;
    if (!paused && !this.blackedOut) {
      d.update(dt, this.world);
      for (const c of this.input.takeClicks()) {
        if (!this.input.lookActive) continue;
        if (c.button === 2) { this.toggleCamera(); continue; }
        if (this.cameraMode) this.takePhoto();
        else {
          const hit = this.world.pick(this.camera.position, d.lookDir);
          if (hit) { const sp = this.eco.speciesInfo.find(s => s.id === hit.id); if (sp) this.panels.card(sp, this.progress.journal[`${this.eco.id}:${sp.id}`]); }
        }
      }
    } else if (!d.freeze) {
      // Challenge mode (teacher option): breath keeps ticking while a card is open; events still fire.
      d.breath = Math.max(0, d.breath - dt / 75 * 0.7);
      if (d.breath < 0.25 && !d.lowWarned) { d.lowWarned = true; d.events.push('lowO2'); }
      if (d.breath <= 0 && !d.blackout) { d.blackout = true; d.events.push('blackout'); this.panels.close(); }
    }
    for (const e of d.takeEvents()) this.onDiverEvent(e);
    // Swim into the shallows of a site with a beach: stand up and wade ashore.
    if (this.eco.land && !paused && d.depthNow < 0.6 && d.pos.z > 70 && this.time - (this.modeSince ?? 0) > 2) {
      const water = -this.world.groundAt(d.pos.x, d.pos.z); // still-water depth
      if (water < SWIM_DEPTH - 0.4) { this.startLand(new THREE.Vector3(d.pos.x, this.world.groundAt(d.pos.x, d.pos.z), d.pos.z), d.yaw, true); return; }
    }
    // Board bobbing at the surface
    if (this.eco.surf) {
      const bx = this.boardPos.x, bz = this.boardPos.z;
      this.surfer.root.position.set(bx, swellHeight(bx, bz, this.time) + 0.02, bz);
      this.surfer.root.rotation.set(Math.sin(this.time * 0.9) * 0.05, 0.6, Math.sin(this.time * 0.7) * 0.04);
    }
    this.world.waveMesh.update(null, this.time);
    if (this.boat?.visible) { const b = this.boat; b.position.y = swellHeight(b.position.x, b.position.z, this.time) * 0.8 - 0.1; b.rotation.set(Math.sin(this.time * 0.8) * 0.03, 0.4, Math.sin(this.time * 0.6) * 0.04); }
    this.roar = 0;
    // Hover label
    if (this.frame % 5 === 0 && !paused) {
      const hit = this.input.lookActive && !this.cameraMode ? this.world.pick(this.camera.position, d.lookDir, 12) : null;
      const lbl = $('#target-label');
      if (hit) { const sp = this.eco.speciesInfo.find(s => s.id === hit.id); lbl.innerHTML = sp ? `${esc(sp.common)} <i>· click for info</i>` : ''; lbl.classList.toggle('show', !!sp); }
      else lbl.classList.remove('show');
      if (this.cameraMode) {
        const r = evaluatePhoto(this.camera, this.photoCandidates(), { groundAt: (x, z) => this.world.groundAt(x, z), diverSpeed: d.speed });
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
    if (d.vehicle === 'sub') $('#buoy').textContent = `Water ~${(4 + 8 * Math.exp(-(d.depthNow - 150) / 250)).toFixed(0)} °C · sunlight ${d.depthNow < 200 ? 'faint' : 'none'}`;
    else $('#buoy').textContent = (d.depthNow ?? 0) < 0.45 ? 'At the surface — breathing' : bu > 0.05 ? 'Buoyancy: floating up ↑' : bu < -0.05 ? 'Buoyancy: sinking ↓ (freefall)' : 'Buoyancy: neutral';
    const eq = $('#eq-prompt');
    eq.classList.toggle('hidden', d.ear < 0.35 && !d.earWarned);
    if (d.earWarned) {
      const need = Math.max(0, (d.depthNow ?? 0) - ((d.painDepth ?? 0) - 0.8));
      eq.innerHTML = this.hint(need > 0 ? `Ear pain — rise <b>${need.toFixed(1)} m</b> (Space), then equalise` : 'Now equalise gently: <kbd>Q</kbd>');
    } else eq.innerHTML = this.hint('Ears filling with pressure — equalise: <kbd>Q</kbd>');
    const v = 0.3 + (d.breath < 0.3 ? (0.3 - d.breath) * 2.2 : 0) + Math.min(0.4, d.ear * 0.2);
    $('#fx-vignette').style.setProperty('--v', v.toFixed(2));
    if (d.breath < 0.3 && !paused) {
      this.hbT = (this.hbT ?? 0) - dt;
      if (this.hbT <= 0) { this.audio.play('heartbeat', { rate: 0.6 + (0.3 - d.breath) * 1.5 }); this.hbT = 0.5 + d.breath * 3; }
    }
    if (d.outOfBounds && this.frame % 240 === 0) this.toast(this.eco.boundsMsg ?? 'You\'re leaving the dive site — your buddy signals you to turn back.', 'warn');
    if (this.activeMission?.goal.type === 'depth' && this.frame % 30 === 0) this.checkMission('depth');
    $('#prompt').textContent = '';
  }

  onDiverEvent(e) {
    const d = this.diver;
    if (e === 'surface') { this.audio.play('breath', { inhale: false }); this.audio.play('breath', { inhale: true, delay: 0.8 }); this.fx.bubbleBurst(d.pos, 6, 0.2); if (d.maxDepth > 3) this.toast(`Surfaced from ${d.maxDepth.toFixed(1)} m. Breathe and recover before the next dive.`); }
    if (e === 'dive') { this.audio.play('smallSplash'); this.audio.play('bubbles', { n: 5, base: 600, delay: 0.15 }); }
    if (e === 'equalise') this.audio.play('equalise');
    if (e === 'earPain') this.audio.play('earPain');
    if (e === 'earPain' && !this.earToastShown) this.earToastShown = true, this.toast('Ear pain! Stop descending, rise a little (Space) and equalise gently (Q). If it won\'t clear, end the dive — never force it.', 'warn');
    if (e === 'eqFail') this.toast('Can\'t equalise under pain — rise about a metre first, then press Q.', 'warn');
    if (e === 'lowO2') this.toast('O₂ reserve low — ascend now. (This gauge is a game reserve: real divers get no reliable warning before blackout.)', 'warn');
    if (e === 'blackout') this.blackout();
  }
  blackout() {
    const b = $('#fx-black');
    b.style.opacity = 1;
    this.blackedOut = true; this.input.clear();
    clearTimeout(this.blackoutTimer);
    this.audio.play('blackout', { priority: true }); this.audio.duck(0.12, 1.5);
    this.toast('You blacked out. Freedivers can lose consciousness without warning when oxygen runs low ("shallow-water blackout").', 'bad');
    this.blackoutTimer = setTimeout(() => {
      if (this.mode !== 'dive') return;
      const d = this.diver;
      d.spawn(new THREE.Vector3(d.pos.x, -0.1, d.pos.z), d.yaw, 0.5);
      b.style.opacity = 0; this.blackedOut = false;
      this.audio.duck(1, 0.6); this.audio.play('recoveryBreaths', { priority: true });
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
