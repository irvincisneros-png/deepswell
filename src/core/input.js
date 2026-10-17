// Keyboard + mouse with pointer lock. Game code polls `keys` and drains mouse deltas.
export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.pressed = new Set(); // keys pressed since last frame
    this.mx = 0; this.my = 0;
    this.clicks = []; this.locked = false;
    this.wantLock = false;
    this.mouseDown = { 0: false, 2: false };
    addEventListener('keydown', e => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.code;
      if (!this.keys.has(k)) this.pressed.add(k);
      this.keys.add(k);
      if (['Space', 'ArrowUp', 'ArrowDown', 'Tab'].includes(k)) e.preventDefault();
    });
    addEventListener('keyup', e => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());
    addEventListener('mousemove', e => { if (this.locked) { this.mx += e.movementX; this.my += e.movementY; } });
    canvas.addEventListener('mousedown', e => {
      this.mouseDown[e.button] = true;
      if (this.wantLock && !this.locked) { this.lock(); return; }
      this.clicks.push({ button: e.button, x: e.clientX, y: e.clientY });
    });
    addEventListener('mouseup', e => { this.mouseDown[e.button] = false; });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('pointerlockchange', () => { this.locked = document.pointerLockElement === canvas; this.onLockChange?.(this.locked); });
  }
  lock() { try { const p = this.canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch { /* ignore */ } }
  unlock() { if (document.pointerLockElement) document.exitPointerLock(); }
  down(...codes) { return codes.some(c => this.keys.has(c)); }
  hit(...codes) { return codes.some(c => this.pressed.has(c)); }
  takeMouse() { const r = [this.mx, this.my]; this.mx = 0; this.my = 0; return r; }
  takeClicks() { const c = this.clicks; this.clicks = []; return c; }
  endFrame() { this.pressed.clear(); }
}
