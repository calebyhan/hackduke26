# GridGhost

Real-time carbon intelligence for the home.

GridGhost shows how household carbon impact changes by time of day and helps users shift flexible loads into cleaner grid windows without reducing total energy use.

## Why It Matters

Most consumer tools use average emissions. GridGhost uses marginal emissions (MOER), which better reflects the carbon impact of when energy is consumed.

## Core Experience

1. View a 24-hour carbon intensity timeline for CAISO_NORTH.
2. See where household appliances are currently scheduled.
3. Press Optimize to shift flexible loads into cleaner windows under real constraints.
4. Watch the carbon counter and appliance blocks animate to the improved schedule.
5. Read an AI-generated plain-English carbon brief.

## Architecture Snapshot

- Frontend: React + Vite + Tailwind CSS
- Backend: FastAPI (Python)
- Grid signals: WattTime v3
- Weather overlay: Open-Meteo
- Generation mix: EIA Open Data API
- Narrative: Gemini 2.5 Flash

## Documentation

- PRODUCT_REQUIREMENTS.md
- SYSTEM_ARCHITECTURE.md
- API_CONTRACTS.md
- OPTIMIZER_SPEC.md
- AI_BRIEF_SPEC.md
- FRONTEND_UX_SPEC.md
- DATA_SOURCES_AND_LIMITS.md
- DECISION_LOG.md
- RISKS_AND_MITIGATIONS.md
- TASK_BOARD.md
- CONTRIBUTING.md

## Status

Planning and detailed implementation spec complete. Build work in progress.
