import type { OptimizeResponse } from "../types/optimize";
import { getPstDayStartMs } from "../utils/time";

/**
 * Returns a fixture optimize result with schedule timestamps anchored to
 * TODAY's PDT midnight, so chips always land in the right position on the
 * timeline regardless of which calendar date the app is opened on.
 *
 * Clean window in the fixture MOER data: UTC+4h–+6h from PDT midnight
 * (i.e. 4 AM–6 AM PDT = UTC 11:00–13:00 on March 21).
 * EV is constrained to 6pm PDT onward so it lands in the late-evening
 * moderate window (10pm–11pm PDT is the cleanest evening slot).
 */
export function makeFixtureOptimizeResult(): OptimizeResponse {
  const pstStart = getPstDayStartMs(new Date().toISOString());
  const pst = (h: number) => new Date(pstStart + h * 3_600_000).toISOString();

  return {
    region: "CAISO_NORTH",
    baseline: {
      total_co2_lbs: 41.8,
      total_health_score: 17.1,
    },
    optimized: {
      total_co2_lbs: 28.9,
      total_health_score: 13.8,
    },
    delta: {
      co2_lbs: -12.9,
      co2_percent: -30.9,
      health_score_delta: -3.3,
    },
    schedule: [
      // EV: constrained to start no earlier than 6pm PDT; best available evening window ~10pm PDT
      { appliance_id: "ev",        start: pst(22),   end: pst(24),   avg_moer_lbs_per_mwh: 432.1, avg_health_score: 0.22 },
      // Washer/dryer/dishwasher: no constraints → shift to 4am–6am PDT clean window (UTC 11–13)
      { appliance_id: "dishwasher", start: pst(4),    end: pst(5),    avg_moer_lbs_per_mwh: 372.4, avg_health_score: 0.14 },
      { appliance_id: "washer",     start: pst(4),    end: pst(4.75), avg_moer_lbs_per_mwh: 372.4, avg_health_score: 0.14 },
      { appliance_id: "dryer",      start: pst(4.75), end: pst(5.75), avg_moer_lbs_per_mwh: 383.6, avg_health_score: 0.15 },
      // HVAC: shifted to 4am–12pm PDT clean window
      { appliance_id: "hvac",       start: pst(4),    end: pst(12),   avg_moer_lbs_per_mwh: 372.4, avg_health_score: 0.14 },
    ],
    dr_readiness: {
      program: "CAISO_ELRP_signal",
      qualified_windows: 4,
      total_windows: 6,
      estimated_bill_credit_usd: 4.2,
      eligibility_note: "Potentially eligible, utility enrollment required",
    },
    source: "optimizer_v1",
  };
}
