export interface Appliance {
  id: string;
  name: string;
  shiftable: boolean;
  duration_minutes: number;
  deadline?: string;
  earliest_start?: string;
  power_kw: number;
  dependencies: string[];
  preferred_start?: string;
}
