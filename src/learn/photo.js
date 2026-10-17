// Underwater photography: choose the subject in frame and grade the shot.
import * as THREE from 'three';

const _v = new THREE.Vector3();

/**
 * candidates: [{ pos: Vector3, r, id, agent? }]
 * returns { subject, quality: 0..3, reason, behaviours: [] , inFrame: [...] }
 */
export function evaluatePhoto(camera, candidates, { groundAt, maxRange = 14, diverSpeed = 0, frame = 0.78 } = {}) {
  const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const inFrame = [];
  for (const c of candidates) {
    const dist = c.pos.distanceTo(camera.position);
    if (dist > maxRange + c.r || dist < 0.05) continue;
    _v.copy(c.pos).project(camera);
    if (_v.z > 1 || Math.abs(_v.x) > frame || Math.abs(_v.y) > frame) continue;
    if (groundAt && occluded(camera.position, c.pos, groundAt)) continue;
    const size = c.r / (dist * tanHalf); // fraction of half-frame height the subject fills
    const centre = Math.hypot(_v.x, _v.y);
    // What you aim at wins: a tight centre cone first, animals over the coral behind them, then size.
    const aimed = centre < 0.22 + Math.min(0.15, size * 0.3);
    const animal = c.agent ? 1.8 : 1;
    inFrame.push({ c, dist, size, centre, aimed, score: (aimed ? 10 : 0) + size * animal * (1 - 0.55 * centre) * (dist < 9 ? 1 : 0.6) });
  }
  inFrame.sort((a, b) => b.score - a.score);
  const best = inFrame[0];
  if (!best) return { subject: null, quality: 0, reason: 'Nothing in frame — aim at an animal or coral.', behaviours: [], inFrame };
  let quality, reason;
  if (best.size < 0.05) { quality = 0; reason = best.dist > 9 ? 'Too far away — water absorbs light, so get closer (slowly!).' : 'Subject too small — get closer.'; }
  else if (best.size > 0.28 && best.centre < 0.4) { quality = 3; reason = 'Excellent shot — sharp, close and well framed.'; }
  else if (best.size > 0.13) { quality = 2; reason = 'Good shot.'; }
  else { quality = 1; reason = 'Record shot — get closer and centre the subject for a better photo.'; }
  if (diverSpeed > 1.3 && quality > 1) { quality -= 1; reason += ' (A little motion blur — slow down before shooting.)'; }
  const behaviours = new Set();
  const a = best.c.agent;
  if (a) {
    if (a.cleaning) behaviours.add('cleaning');
    if (a.grazing) behaviours.add('grazing');
    if (a.state === 'breathe') behaviours.add('breathing');
    if (a.closed) behaviours.add('closing');
    if (a.b?.type === 'school' || a.b?.type === 'vortex') behaviours.add('schooling');
    if (a.b?.type === 'host') behaviours.add('symbiosis');
  }
  // Behaviours belong to the subject only: a cleaning shot must show the cleaner or the fish being cleaned.
  return { subject: best.c, quality, reason, behaviours: [...behaviours], inFrame };
}

function occluded(from, to, groundAt) {
  for (let i = 1; i < 10; i++) {
    const t = i / 10;
    const x = from.x + (to.x - from.x) * t, y = from.y + (to.y - from.y) * t, z = from.z + (to.z - from.z) * t;
    if (y < groundAt(x, z) - 0.2) return true;
  }
  return false;
}

/** Grab a small JPEG thumbnail from the WebGL canvas (call right after rendering). */
export function snapshot(canvas, w = 360) {
  const h = Math.round(w * 10 / 16);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  const sw = canvas.width * 0.76, sh = sw * 10 / 16;
  g.drawImage(canvas, (canvas.width - sw) / 2, (canvas.height - sh) / 2, sw, sh, 0, 0, w, h);
  try { return c.toDataURL('image/jpeg', 0.72); } catch { return null; }
}
