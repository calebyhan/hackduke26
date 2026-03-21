# AI Brief Specification

## Objective

Generate a concise, structured carbon brief from optimization results using Gemini 2.5 Flash, with strict schema validation and safe fallback behavior.

## Model Configuration

- Model: gemini-2.5-flash
- Response MIME type: application/json
- Max output tokens: 1000
- Temperature: low-to-moderate (recommend 0.3)

## Required Output Schema

```json
{
  "headline": "string",
  "weekly_co2_lbs": "number",
  "savings_vs_unoptimized": "number",
  "miles_equivalent": "number",
  "dr_readiness": {
    "label": "string",
    "qualified_windows": "number",
    "total_windows": "number",
    "estimated_bill_credit_usd": "number",
    "program": "string",
    "eligibility_note": "string"
  },
  "nudges": ["string"],
  "grid_trend": "string",
  "source": "gemini|fallback"
}
```

## Prompt Contract

Input payload to model must include:

1. Region and forecast context.
2. Baseline total CO2 and optimized total CO2.
3. Absolute and percent savings.
4. Top device-level schedule changes.
5. Notable grid trend summary.
6. DR readiness summary with qualified/total windows and estimated bill-credit signal.

System instruction requirements:

1. Return JSON only.
2. No markdown, no preamble.
3. Use concise, non-technical language.
4. Keep nudges actionable and specific.
5. Do not invent unsupported numeric values.

## Validation Rules

1. Parse JSON strictly.
2. Verify all required fields exist.
3. Enforce types:
- headline string
- weekly_co2_lbs number
- savings_vs_unoptimized number
- miles_equivalent number
- dr_readiness object with:
  - label string
  - qualified_windows number
  - total_windows number
  - estimated_bill_credit_usd number
  - program string
  - eligibility_note string
- nudges array of 1-3 strings
- grid_trend string
- source string with value gemini or fallback
4. Reject responses with extra wrapper text.

## Fallback Behavior

If model call fails or validation fails:

1. Generate deterministic template brief from optimization metrics.
2. Mark source as fallback.
3. Preserve same response schema.

Fallback template example:

```json
{
  "headline": "You cut carbon by 31% with schedule shifts",
  "weekly_co2_lbs": 28.9,
  "savings_vs_unoptimized": 12.9,
  "miles_equivalent": 16,
  "dr_readiness": {
    "label": "Demand-Response Readiness",
    "qualified_windows": 4,
    "total_windows": 6,
    "estimated_bill_credit_usd": 4.2,
    "program": "CAISO_ELRP_signal",
    "eligibility_note": "Potentially eligible, utility enrollment required"
  },
  "nudges": [
    "Charge EV overnight when the grid is cleaner.",
    "Run dishwasher before morning demand ramps."
  ],
  "grid_trend": "Afternoon periods are forecast dirtier due to heat-driven demand.",
  "source": "fallback"
}
```

## Quality Bar

1. Headline must describe reduction clearly.
2. Nudges must map to actual optimized shifts.
3. Grid trend sentence must align with forecast direction.
4. DR readiness values must be copied from backend-calculated metrics, not invented by model.
5. Total latency target under 3s for brief generation.
