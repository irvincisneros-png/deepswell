// Local progress: journal entries, missions, best scores. No accounts, nothing leaves the device.
const KEY = 'deepswell.progress.v1';

export function loadProgress() {
  try { return { journal: {}, missions: {}, best: {}, lab: {}, transects: [], ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return { journal: {}, missions: {}, best: {}, lab: {}, transects: [] }; }
}
export function saveProgress(p) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); return true; }
  catch {
    // Quota: drop the oldest photos and retry once.
    try {
      const entries = Object.entries(p.journal).sort((a, b) => (a[1].time ?? 0) - (b[1].time ?? 0));
      for (const [, e] of entries.slice(0, Math.ceil(entries.length / 2))) delete e.photo;
      localStorage.setItem(KEY, JSON.stringify(p)); return true;
    } catch { return false; }
  }
}
export function resetProgress() { try { localStorage.removeItem(KEY); } catch { /* ignore */ } }

/** CSV export of journal + survey data for the class. */
export function progressCSV(p, speciesById) {
  const rows = [['type', 'ecosystem', 'species', 'scientific name', 'photo quality', 'behaviours', 'date']];
  for (const [key, e] of Object.entries(p.journal)) {
    const [eco, id] = key.split(':');
    const s = speciesById(eco, id);
    rows.push(['journal', eco, s?.common ?? id, s?.sci ?? '', e.quality ?? '', (e.behaviours ?? []).join(' '), new Date(e.time ?? Date.now()).toISOString().slice(0, 10)]);
  }
  for (const t of p.transects ?? []) for (const [id, n] of Object.entries(t.counts)) {
    const s = speciesById(t.eco, id);
    rows.push(['transect ' + t.n, t.eco, s?.common ?? id, s?.sci ?? '', '', 'count=' + n, new Date(t.time).toISOString().slice(0, 10)]);
  }
  rows.push([]);
  rows.push(['mission', 'ecosystem', 'mission id', 'field task done', 'best score', 'attempts', 'complete']);
  for (const [key, m] of Object.entries(p.missions ?? {})) { const [eco, id] = key.split(':'); rows.push(['mission', eco, id, m.goalMet ? 'yes' : 'no', m.best ?? '', m.attempts ?? 0, m.complete ? 'yes' : 'no']); }
  rows.push([]);
  rows.push(['lab run', 'ecosystem', 'inputs', 'final state', 'date']);
  for (const [eco, runs] of Object.entries(p.lab ?? {})) for (const r of [].concat(runs)) {
    if (!r?.inputs) continue;
    const fmt = o => Object.entries(o).map(([k, v]) => `${k}=${typeof v === 'number' ? +v.toFixed(2) : v}`).join(' ');
    rows.push(['lab run', eco, fmt(r.inputs), fmt(r.final ?? {}), new Date(r.time).toISOString().slice(0, 10)]);
  }
  return rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
}
