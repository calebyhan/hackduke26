export interface ForecastPoint {
  start: string;
  end: string;
  moer_lbs_per_mwh: number;
  health_score: number;
}

export interface ForecastResponse {
  region: string;
  generated_at: string;
  interval_minutes: number;
  points: ForecastPoint[];
  source: "live" | "cache" | "fixture";
}

export interface SignalIndexRegion {
  ba: string;
  index: number;
}

export interface SignalIndexResponse {
  generated_at: string;
  regions: SignalIndexRegion[];
}

export interface WeatherHour {
  time: string;
  temperature_c: number;
}

export interface WeatherResponse {
  latitude: number;
  longitude: number;
  hourly: WeatherHour[];
  source: string;
}
