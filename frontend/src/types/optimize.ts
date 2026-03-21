export interface ScheduleEntry {
  appliance_id: string;
  start: string;
  end: string;
  avg_moer_lbs_per_mwh: number;
  avg_health_score: number;
}

export interface AggregateMetrics {
  total_co2_lbs: number;
  total_health_score: number;
}

export interface DeltaMetrics {
  co2_lbs: number;
  co2_percent: number;
  health_score_delta: number;
}

export interface DRReadiness {
  program: string;
  qualified_windows: number;
  total_windows: number;
  estimated_bill_credit_usd: number;
  eligibility_note: string;
}

export interface OptimizeResponse {
  region: string;
  baseline: AggregateMetrics;
  optimized: AggregateMetrics;
  delta: DeltaMetrics;
  schedule: ScheduleEntry[];
  dr_readiness: DRReadiness;
  source: string;
}
