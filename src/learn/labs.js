// Simplified ecosystem models for the rocky-reef, seagrass, open-ocean and deep-sea labs.
// Each returns monthly snapshots; values are fractions 0..1 (cover or relative abundance).
// They show the direction of change for teaching, not forecasts.

const clamp01 = x => Math.min(1, Math.max(0, x));
const sm = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

/** Kelp forest trophic cascade: predators (blue groper, rock lobster) eat urchins; urchins eat kelp.
 *  Barrens show hysteresis: they form once urchins pass ~0.3 but only recover when urchins fall below ~0.12. */
export function kelpModel(inp, years = 5, start = null) {
  const s = start ? { ...start } : { kelp: 0.62, urchin: 0.12, pred: 1, barren: 0.04, month: 0 };
  const out = [{ ...s }];
  for (let m = 1; m <= years * 12; m++) {
    s.month = (s.month ?? 0) + 1;
    const dt = 1 / 12;
    s.pred += ((1 - 0.85 * inp.fishing) - s.pred) * dt * 0.8;
    const recruit = 0.55 * (1 + 0.9 * inp.warming);       // a warmer East Australian Current helps urchin larvae
    const cull = inp.restore ? 0.9 : 0;
    // Urchins sheltering in barrens are harder for predators to control (feedback that keeps barrens stable).
    const predation = 0.9 * s.pred * (1 - 0.5 * s.barren);
    s.urchin += (recruit * s.urchin * (1 - s.urchin) - predation * s.urchin - cull * s.urchin) * dt;
    s.urchin = Math.min(1, Math.max(0.01, s.urchin));
    const form = s.urchin > 0.3 ? 1.6 * (s.urchin - 0.3) * (1 - s.barren) : 0;
    const recover = s.urchin < 0.12 ? 0.35 * s.barren : 0;
    s.barren = clamp01(s.barren + (form - recover - (inp.restore ? 0.12 * s.barren : 0)) * dt * 3);
    const heat = Math.max(0, inp.warming - 0.8) * 0.25;
    const replant = inp.restore ? 0.1 : 0;
    s.kelp += (0.5 * s.kelp * Math.max(0, 0.92 - s.barren - s.kelp) + replant * (1 - s.barren) * 0.3 - heat * s.kelp - 1.2 * s.barren * s.kelp * 0.2) * dt;
    s.kelp = Math.min(0.9, Math.max(0.01, Math.min(s.kelp, 0.92 - s.barren)));
    out.push({ ...s });
  }
  return out;
}

/** Seagrass light limitation: sediment and nutrient-fed epiphytes shade the meadow; dugongs and juvenile fish depend on it. */
export function seagrassModel(inp, years = 5, start = null) {
  const s = start ? { ...start } : { seagrass: 0.6, epiphyte: 0.1, light: 0.8, dugong: 0.8, fish: 0.75, month: 0 };
  const out = [{ ...s }];
  for (let m = 1; m <= years * 12; m++) {
    const dt = 1 / 12;
    s.month = (s.month ?? 0) + 1;
    const flood = inp.flood && s.month >= 2 && s.month <= 5 ? 1.4 : 0; // a big flood plume in the first wet season (only once, even across continued runs)
    // A flood brings both mud (shading) and a pulse of nutrients that feeds epiphytes.
    s.epiphyte += ((0.1 + inp.nutrients * 0.8 + (flood ? 0.4 : 0)) - s.epiphyte) * dt * 2;
    s.light = Math.exp(-(0.25 + inp.sediment * 1.4 + flood + s.epiphyte * 0.8));
    const growth = 0.9 * (s.light - 0.38);
    s.seagrass += growth * s.seagrass * (growth > 0 ? (1 - s.seagrass) : 1) * dt * 1.5;
    s.seagrass = Math.min(0.9, Math.max(0.01, s.seagrass));
    s.dugong += (Math.min(1, s.seagrass / 0.5) - s.dugong) * dt * 0.8;
    s.fish += (Math.min(1, 0.15 + s.seagrass * 1.2) - s.fish) * dt * 1.2;
    out.push({ ...s });
  }
  return out;
}

/** Plankton food chain: nutrients (upwelling/eddies) -> phytoplankton -> krill -> sardines -> predators. */
export function planktonModel(inp, years = 5, start = null) {
  const s = start ? { ...start } : { phyto: 0.35, krill: 0.35, sardine: 0.45, pred: 0.5, month: 0 };
  const out = [{ ...s }];
  for (let m = 1; m <= years * 12; m++) {
    const dt = 1 / 12;
    s.month = (s.month ?? 0) + 1;
    const season = 0.5 + 0.5 * Math.sin(((s.month % 12) - 8) / 12 * Math.PI * 2); // spring bloom
    const mixing = Math.max(0, inp.upwelling * (1 - 0.35 * inp.warming)); // warm surface layers block mixing
    const nutrients = 0.15 + mixing * 0.85 * (0.6 + 0.4 * season);
    s.phyto += (2.2 * nutrients * s.phyto * (1 - s.phyto) - 1.2 * s.krill * s.phyto) * dt * 3;
    s.krill += (1.4 * s.phyto * s.krill * (1 - s.krill) - 0.9 * s.sardine * s.krill - 0.15 * s.krill) * dt * 3;
    s.sardine += (1.9 * s.krill * s.sardine * (1 - s.sardine) - 0.35 * s.pred * s.sardine - 0.9 * inp.fishing * s.sardine) * dt * 2;
    s.pred += (0.7 * s.sardine * s.pred * (1 - s.pred) - 0.1 * s.pred) * dt * 1.5;
    for (const k of Object.keys(s)) s[k] = Math.min(1, Math.max(0.01, s[k]));
    out.push({ ...s });
  }
  return out;
}

/** Seamount trawling: deep-sea coral grows ~1 mm per year; orange roughy live 100+ years and mature late. */
export function seamountModel(inp, years = 10, start = null) {
  const s = start ? { ...start } : { coral: 0.7, roughy: 0.8, rubble: 0.05, month: 0 };
  const out = [{ ...s }];
  for (let m = 1; m <= years * 12; m++) {
    const dt = 1 / 12;
    s.month = (s.month ?? 0) + 1;
    const trawl = inp.protect && s.month > 12 ? 0 : inp.trawl;
    s.coral += (0.004 * s.coral * (1 - s.coral) - 0.9 * trawl * s.coral) * dt;
    s.roughy += (0.06 * s.roughy * (1 - s.roughy) - 0.35 * trawl * s.roughy) * dt;
    s.coral = Math.max(0.005, s.coral); s.roughy = Math.max(0.01, s.roughy);
    s.rubble = clamp01(0.75 - s.coral);
    out.push({ ...s });
  }
  return out;
}
