export interface Appliance {
  id: string;
  name: string;
  shiftable: boolean;
  duration_minutes: number;
  deadline?: string;
  power_kw: number;
  dependencies: string[];
}
