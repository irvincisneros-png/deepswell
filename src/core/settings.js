// Player settings + graphics quality tiers, persisted locally.
const KEY = 'deepswell.settings.v1';

export const TIERS = {
  low: { label: 'Low (school laptop)', pixelRatio: 0.75, oceanSegments: 128, waveColumns: 120, terrainScale: 0.5, coralScale: 0.5, fishScale: 0.45, snow: 250, bloom: false, shafts: false, antialias: false },
  medium: { label: 'Medium', pixelRatio: 1, oceanSegments: 192, waveColumns: 180, terrainScale: 0.75, coralScale: 0.8, fishScale: 0.75, snow: 500, bloom: false, shafts: true, antialias: true },
  high: { label: 'High', pixelRatio: 1.25, oceanSegments: 256, waveColumns: 240, terrainScale: 1, coralScale: 1, fishScale: 1, snow: 800, bloom: true, shafts: true, antialias: true },
  ultra: { label: 'Ultra (gaming PC)', pixelRatio: 2, oceanSegments: 320, waveColumns: 320, terrainScale: 1.5, coralScale: 1.5, fishScale: 1.3, snow: 1200, bloom: true, shafts: true, antialias: true },
};

export const DEFAULTS = {
  quality: null, // auto-detected on first run
  sensitivity: 1, invertY: false, volume: 0.8, reducedMotion: false,
  freezeBreathInCards: false, // teacher option
  subtitles: true,
};

export function guessTier() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    if (!gl) return 'low';
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const r = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)).toLowerCase() : '';
    const cores = navigator.hardwareConcurrency || 4;
    if (/rtx|radeon rx|geforce gtx 1[0-9]|apple m[2-9] (pro|max|ultra)/.test(r)) return 'ultra';
    if (/apple m|geforce|radeon|arc/.test(r) && cores >= 8) return 'high';
    if (/intel|mali|adreno|powervr|swiftshader|llvmpipe/.test(r) || cores <= 4) return 'low';
    return 'medium';
  } catch { return 'low'; }
}

export function loadSettings() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { /* storage blocked */ }
  const out = { ...DEFAULTS, ...s };
  const q = new URLSearchParams(location.search).get('quality');
  if (q && TIERS[q]) out.quality = q;
  if (!out.quality || !TIERS[out.quality]) out.quality = guessTier();
  return out;
}
export function saveSettings(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ } }
