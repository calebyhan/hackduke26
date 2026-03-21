export interface BriefDRReadiness {
  label: string;
  qualified_windows: number;
  total_windows: number;
  estimated_bill_credit_usd: number;
  program: string;
  eligibility_note: string;
}

export interface BriefResponse {
  headline: string;
  weekly_co2_lbs: number;
  savings_vs_unoptimized: number;
  miles_equivalent: number;
  dr_readiness: BriefDRReadiness;
  nudges: string[];
  grid_trend: string;
  source: "gemini" | "fallback";
}

export interface GenerationMixEntry {
  fuel: string;
  mw: number;
  percent: number;
}

export interface GenerationMixResponse {
  respondent: string;
  as_of: string;
  fuel_mix: GenerationMixEntry[];
  source: string;
}
