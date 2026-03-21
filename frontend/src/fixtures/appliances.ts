import type { Appliance } from "../types/appliance";
import type { ScheduleEntry } from "../types/optimize";

export const defaultAppliances: Appliance[] = [
  {
    id: "ev",
    name: "EV Charger",
    shiftable: true,
    duration_minutes: 240,
    power_kw: 7.2,
    dependencies: [],
    preferred_start: "2026-03-21T18:00:00Z", // baseline: evening peak
  },
  {
    id: "dishwasher",
    name: "Dishwasher",
    shiftable: true,
    duration_minutes: 60,
    power_kw: 1.8,
    dependencies: [],
    preferred_start: "2026-03-21T19:00:00Z", // baseline: evening peak
  },
  {
    id: "washer",
    name: "Washer",
    shiftable: true,
    duration_minutes: 45,
    power_kw: 0.5,
    dependencies: [],
    preferred_start: "2026-03-21T17:00:00Z", // baseline: evening peak
  },
  {
    id: "dryer",
    name: "Dryer",
    shiftable: true,
    duration_minutes: 60,
    power_kw: 5.0,
    dependencies: ["washer"],
    preferred_start: "2026-03-21T17:45:00Z", // baseline: after washer
  },
  {
    id: "hvac",
    name: "HVAC",
    shiftable: false,
    duration_minutes: 480,
    power_kw: 3.5,
    dependencies: [],
    preferred_start: "2026-03-21T08:00:00Z", // fixed: daytime slot, after clean window
  },
];

// Baseline schedule: appliances placed at typical user times (evening/peak)
export const baselineSchedule: ScheduleEntry[] = [
  {
    appliance_id: "ev",
    start: "2026-03-21T18:00:00Z",
    end: "2026-03-21T22:00:00Z",
    avg_moer_lbs_per_mwh: 845.2,
    avg_health_score: 0.72,
  },
  {
    appliance_id: "dishwasher",
    start: "2026-03-21T19:00:00Z",
    end: "2026-03-21T20:00:00Z",
    avg_moer_lbs_per_mwh: 892.1,
    avg_health_score: 0.78,
  },
  {
    appliance_id: "washer",
    start: "2026-03-21T17:00:00Z",
    end: "2026-03-21T17:45:00Z",
    avg_moer_lbs_per_mwh: 810.5,
    avg_health_score: 0.68,
  },
  {
    appliance_id: "dryer",
    start: "2026-03-21T17:45:00Z",
    end: "2026-03-21T18:45:00Z",
    avg_moer_lbs_per_mwh: 838.7,
    avg_health_score: 0.71,
  },
  {
    appliance_id: "hvac",
    start: "2026-03-21T08:00:00Z",
    end: "2026-03-21T16:00:00Z",
    avg_moer_lbs_per_mwh: 512.9,
    avg_health_score: 0.41,
  },
];

// Optimized schedule: shifted to cleaner windows
export const optimizedSchedule: ScheduleEntry[] = [
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
];
