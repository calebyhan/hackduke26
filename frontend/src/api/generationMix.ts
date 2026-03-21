import { apiClient } from "./client";
import type { GenerationMixResponse } from "../types/brief";
import { fixtureGenerationMix } from "../fixtures/generationMix";

export async function fetchGenerationMix(): Promise<GenerationMixResponse> {
  try {
    const { data } = await apiClient.get<GenerationMixResponse>(
      "/api/generation-mix"
    );
    return data;
  } catch {
    return fixtureGenerationMix;
  }
}
