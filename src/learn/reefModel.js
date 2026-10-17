// Simplified coral-reef dynamics for the health lab. Directionally correct, not a forecast:
// - Heat stress is measured in Degree Heating Weeks (DHW, NOAA Coral Reef Watch):
//   ~4 DHW -> significant bleaching likely, ~8 DHW -> severe bleaching and widespread mortality likely.
// - Nutrient runoff boosts algae growth and crown-of-thorns larval survival (outbreaks).
// - Herbivorous fish graze algae, keeping space open for coral recruits; fishing removes fish.
// Pure functions so the model can be unit-tested.

export const HOTSPOT_WEEKS = 6; // assumed weeks per summer the sea stays above its normal maximum

/** Degree Heating Weeks for a summer where the sea runs `temp` °C above its usual maximum. */
export function dhw(temp) { return temp >= 1 ? temp * HOTSPOT_WEEKS : 0; }
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export function bleachFraction(d) { return sm(2, 8, d); }
export function mortalityOfBleached(d) { return sm(4, 14, d) * 0.85; }

export function initialState() {
  return { coral: 0.32, algae: 0.12, herb: 1, pred: 1, cots: 0.15, bleach: 0, month: 0 };
}

/**
 * Run the model forward month by month.
 * inputs: { temp: 0..3 (°C above normal summer max), every: heatwave every summer (else only the first), nutrients: 0..1, cots: 0..1 (starting starfish density), fishing: 0..1 }
 * Returns an array of monthly snapshots (including month 0).
 */
export function simulate(inputs, years = 5, start = initialState()) {
  const s = { ...start, cots: inputs.cots ?? start.cots };
  const out = [{ ...s }];
  const d = dhw(inputs.temp);
  const bleachPeak = bleachFraction(d);
  const kill = mortalityOfBleached(d);
  const nut = inputs.nutrients, fish = inputs.fishing;
  for (let m = 1; m <= years * 12; m++) {
    const month = m % 12; // 0 = January (southern summer)
    const dt = 1 / 12;
    // Summer heat stress peaks Feb–Mar; bleached colonies either recover their algae or die by winter.
    const heatThisYear = inputs.every || m <= 12;
    if (month === 2 && bleachPeak > 0 && heatThisYear) {
      s.bleach = Math.max(s.bleach, bleachPeak);
      s.coral -= s.coral * bleachPeak * kill;
    }
    s.bleach *= month >= 3 && month <= 8 ? Math.exp(-dt * 6) : 1;
    // Fish
    const herbTarget = (1 - fish * 0.7) * (0.55 + s.coral);
    const predTarget = 1 - fish * 0.9;
    s.herb += (herbTarget - s.herb) * dt * 1.5;
    s.pred += (predTarget - s.pred) * dt * 1.0;
    // Crown-of-thorns: boosted by nutrients (more phytoplankton for larvae), controlled by predators and food.
    const cotsGrowth = (-0.35 + nut * 1.6) * s.cots * (1 - s.cots) * (s.coral > 0.05 ? 1 : -1) - 0.2 * s.pred * s.cots;
    s.cots = Math.min(1, Math.max(0.005, s.cots + cotsGrowth * dt * 3));
    // Coral: slow growth into free space, eaten by COTS.
    const free = Math.max(0, 1 - s.coral - s.algae);
    s.coral += (0.17 * s.coral * free - 0.45 * s.cots * s.coral) * dt;
    // Algae: fast growth into free space (faster with nutrients), grazed by herbivores; dead coral is colonised quickly.
    s.algae += (0.9 * (1 + 2 * nut) * s.algae * free + 0.15 * free - 1.1 * s.herb * s.algae) * dt;
    s.coral = Math.min(0.85, Math.max(0.005, s.coral));
    s.algae = Math.min(0.95 - s.coral, Math.max(0.01, s.algae));
    s.month = m;
    out.push({ ...s });
  }
  return out;
}

/** Plain-language explanation of what the inputs should do. */
export function explain(inputs) {
  const d = dhw(inputs.temp);
  const parts = [];
  if (d === 0) parts.push(`Summer sea temperature +${inputs.temp.toFixed(1)} °C stays below the bleaching threshold (about +1 °C above the normal summer maximum).`);
  else parts.push(`+${inputs.temp.toFixed(1)} °C for ~${HOTSPOT_WEEKS} weeks ≈ ${d.toFixed(0)} Degree Heating Weeks → ${d >= 8 ? 'severe bleaching and coral death likely' : d >= 4 ? 'significant bleaching likely' : 'some bleaching possible'}. Heat-stressed corals expel their symbiotic algae (zooxanthellae), lose their colour and their main food supply.`);
  if (inputs.nutrients > 0.5) parts.push('High nutrient runoff feeds algae, and may help more crown-of-thorns larvae survive — one possible contributor to outbreaks (scientists still debate how much).');
  if (inputs.fishing > 0.5) parts.push('Heavy fishing removes herbivores that graze algae and predators of juvenile starfish.');
  return parts.join(' ');
}
