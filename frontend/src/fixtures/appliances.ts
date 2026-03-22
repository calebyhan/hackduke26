import type { Appliance } from "../types/appliance";
import { getPstDayStartMs } from "../utils/time";

/**
 * Returns appliances with timestamps anchored to TODAY's PDT midnight.
 * This ensures preferred_start, earliest_start, and deadline always fall
 * within a live or fixture forecast window, regardless of which calendar
 * date the app is opened on.
 */
export function makeDefaultAppliances(): Appliance[] {
  const pstStart = getPstDayStartMs(new Date().toISOString());
  const pst = (h: number) => new Date(pstStart + h * 3_600_000).toISOString();

  return [
    {
      id: "ev",
      name: "EV Charger",
      shiftable: true,
      duration_minutes: 120,
      power_kw: 7.2,
      dependencies: [],
      earliest_start: pst(18),  // 6pm PDT today — when I get home
      deadline: pst(32),        // 8am PDT tomorrow — before work
      preferred_start: pst(18), // baseline: plug in when home
    },
    {
      id: "dishwasher",
      name: "Dishwasher",
      shiftable: true,
      duration_minutes: 60,
      power_kw: 1.8,
      dependencies: [],
      preferred_start: pst(19), // baseline: 7pm PDT evening peak
    },
    {
      id: "washer",
      name: "Washer",
      shiftable: true,
      duration_minutes: 45,
      power_kw: 0.5,
      dependencies: [],
      preferred_start: pst(17), // baseline: 5pm PDT evening peak
    },
    {
      id: "dryer",
      name: "Dryer",
      shiftable: true,
      duration_minutes: 60,
      power_kw: 5.0,
      dependencies: ["washer"],
      preferred_start: pst(17.75), // baseline: 5:45pm PDT, after washer
    },
    {
      id: "hvac",
      name: "HVAC",
      shiftable: true,
      duration_minutes: 480,
      power_kw: 3.5,
      dependencies: [],
      preferred_start: pst(21), // baseline: 9pm PDT (red zone for demo contrast)
      deadline: pst(40),        // must finish by 4pm PDT tomorrow
    },
  ];
}
