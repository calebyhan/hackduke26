import { apiClient } from "./client";

export interface MoerHistoryPoint {
  time: string;
  moer_lbs_per_mwh: number;
}

export interface MoerHistoryResponse {
  region: string;
  points: MoerHistoryPoint[];
  source: "live" | "fixture";
}

export async function fetchMoerHistory(
  region = "CAISO_NORTH"
): Promise<MoerHistoryResponse | null> {
  try {
    const { data } = await apiClient.get<MoerHistoryResponse>(
      "/api/moer-history",
      { params: { region } }
    );
    return data;
  } catch {
    return null;
  }
}
