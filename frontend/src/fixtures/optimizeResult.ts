import type { OptimizeResponse } from "../types/optimize";

export const fixtureOptimizeResult: OptimizeResponse = {
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
    {
      appliance_id: "ev",
      start: "2026-03-21T02:00:00Z",
      end: "2026-03-21T06:00:00Z",
      avg_moer_lbs_per_mwh: 428.3,
      avg_health_score: 0.25,
    },
    {
      appliance_id: "dishwasher",
      start: "2026-03-21T05:00:00Z",
      end: "2026-03-21T06:00:00Z",
      avg_moer_lbs_per_mwh: 445.1,
      avg_health_score: 0.27,
    },
    {
      appliance_id: "washer",
      start: "2026-03-21T06:00:00Z",
      end: "2026-03-21T06:45:00Z",
      avg_moer_lbs_per_mwh: 462.8,
      avg_health_score: 0.29,
    },
    {
      appliance_id: "dryer",
      start: "2026-03-21T06:45:00Z",
      end: "2026-03-21T07:45:00Z",
      avg_moer_lbs_per_mwh: 478.2,
      avg_health_score: 0.31,
    },
    {
      appliance_id: "hvac",
      start: "2026-03-21T08:00:00Z",
      end: "2026-03-21T16:00:00Z",
      avg_moer_lbs_per_mwh: 512.9,
      avg_health_score: 0.41,
    },
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
