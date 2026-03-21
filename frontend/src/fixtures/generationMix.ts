import type { GenerationMixResponse } from "../types/brief";

export const fixtureGenerationMix: GenerationMixResponse = {
  respondent: "CISO",
  as_of: "2026-03-21T11:00:00Z",
  fuel_mix: [
    { fuel: "natural_gas", mw: 8231, percent: 41.2 },
    { fuel: "solar", mw: 5210, percent: 26.1 },
    { fuel: "wind", mw: 2105, percent: 10.5 },
    { fuel: "hydro", mw: 1840, percent: 9.2 },
    { fuel: "nuclear", mw: 1120, percent: 5.6 },
    { fuel: "imports", mw: 1050, percent: 5.3 },
    { fuel: "other", mw: 420, percent: 2.1 },
  ],
  source: "fixture",
};
