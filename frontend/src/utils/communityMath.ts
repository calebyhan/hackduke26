// Per-household baseline numbers derived from fixture optimization result
const SAVINGS_LBS_PER_WEEK = 12.9; // lbs CO2 saved per optimized household/week
const PEAK_KW_SHIFTED = 1.5;       // kW shifted out of 5–9pm fossil peak per household
const DR_CREDIT_PER_WEEK = 4.2;    // $ CAISO ELRP estimated credit per household/week
const WEEKS_PER_YEAR = 52;
const LBS_PER_TON = 2000;
const CO2_TONS_PER_CAR_YEAR = 4.6; // EPA average passenger vehicle
const PEAKER_MW = 500;             // Typical CAISO peaker plant capacity (MW)

/**
 * Diversity factor accounts for synchronization degradation at scale.
 * Below 1K households, natural usage diversity prevents rebound peaks.
 * Above 10K, coordinated staggered dispatch is required; efficiency degrades.
 * GridGhost uses randomized dispatch windows to mitigate this, but at
 * 100K+ scale the factor reflects realistic coordinated-dispatch limits.
 */
export function diversityFactor(n: number): number {
  if (n <= 1000) return 0.95;
  if (n <= 5000) return 0.88;
  if (n <= 10000) return 0.82;
  if (n <= 25000) return 0.74;
  if (n <= 50000) return 0.68;
  return 0.58;
}

export interface CommunityMetrics {
  co2TonsPerYear: number;
  peakMwReduced: number;
  carsEquivalent: number;
  drCreditsPerYear: number;
  peakerPlantsAvoided: number;
  efficiencyPct: number;
}

export function computeMetrics(n: number): CommunityMetrics {
  const eff = diversityFactor(n);
  const co2TonsPerYear = (n * SAVINGS_LBS_PER_WEEK * WEEKS_PER_YEAR / LBS_PER_TON) * eff;
  const peakMwReduced = (n * PEAK_KW_SHIFTED / 1000) * eff;
  const carsEquivalent = co2TonsPerYear / CO2_TONS_PER_CAR_YEAR;
  const drCreditsPerYear = n * DR_CREDIT_PER_WEEK * WEEKS_PER_YEAR * eff;
  const peakerPlantsAvoided = peakMwReduced / PEAKER_MW;
  return {
    co2TonsPerYear,
    peakMwReduced,
    carsEquivalent,
    drCreditsPerYear,
    peakerPlantsAvoided,
    efficiencyPct: Math.round(eff * 100),
  };
}

// 24-hour baseline CAISO duck curve load profile (normalized, arbitrary units)
// Represents typical residential + commercial demand shape
const BASELINE_LOAD_PROFILE = [
  42, 39, 37, 36, 36, 37, 41, 48, 56, 62, 66, 68,
  67, 65, 64, 65, 68, 74, 82, 88, 90, 86, 76, 60,
];

export interface DuckCurvePoint {
  hour: number;
  label: string;
  baseline: number;
  optimized: number;
}

export function computeDuckCurve(n: number): DuckCurvePoint[] {
  const eff = diversityFactor(n);
  // Scale effect logarithmically so it's visually meaningful across the full
  // slider range (100 → 100K). At 100 households the grid impact is near-zero;
  // at 100K it's a meaningful fraction of peak load.
  const LOG_MIN = Math.log10(100);
  const LOG_MAX = Math.log10(100_000);
  const logRatio = (Math.log10(Math.max(100, n)) - LOG_MIN) / (LOG_MAX - LOG_MIN);
  // Square the ratio so small adoption stays near-zero and impact only becomes
  // dramatic at 10K–100K scale — tells a clearer story for the demo
  const scaledShift = Math.pow(logRatio, 2) * eff;

  return BASELINE_LOAD_PROFILE.map((load, hour) => {
    let delta = 0;
    if (hour >= 17 && hour <= 21) delta = -scaledShift * 18; // remove from peak
    const label = `${String(hour).padStart(2, "0")}:00`;
    return {
      hour,
      label,
      baseline: load,
      optimized: Math.max(30, load + delta),
    };
  });
}

// Preset adoption tiers
export const ADOPTION_PRESETS = [100, 1_000, 10_000, 100_000] as const;

export function formatAdoptionLabel(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
}
