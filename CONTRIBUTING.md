# Contributing

## Purpose

This document defines how to set up, run, and contribute to GridGhost consistently.

## Repository Structure (Target)

- frontend/: React + Vite app
- backend/: FastAPI services
- docs/: product and technical docs

## Prerequisites

1. Node.js 20+
2. Python 3.11+
3. pip or uv

## Environment Variables

Backend:
- WATTTIME_USERNAME
- WATTTIME_PASSWORD
- GEMINI_API_KEY
- EIA_API_KEY

Frontend:
- VITE_API_BASE_URL

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Branching and PRs

1. Create feature branches from main.
2. Keep PRs focused by feature or subsystem.
3. Link PR to task IDs in TASK_BOARD.md.

## Definition of Done

1. Feature behavior matches corresponding spec document.
2. API contract changes are reflected in API_CONTRACTS.md.
3. UI changes are reflected in FRONTEND_UX_SPEC.md where relevant.
4. Fallback behavior implemented for external dependency failures.

## Validation Checklist Before Merge

1. Command tab loads with timeline and appliance state.
2. Optimize flow returns valid schedule and animated update.
3. AI brief renders valid schema response or fallback.
4. No secrets are committed.
5. Docs updated for any behavior or contract changes.

## Troubleshooting

1. WattTime 401:
- Verify credentials.
- Check token refresh logic and clock drift.

2. Gemini parse failure:
- Ensure JSON response mode is enabled.
- Verify schema validator and fallback path.

3. EIA empty payload:
- Confirm endpoint includes /data/ suffix.
- Confirm respondent facet and API key.

4. Time alignment issues:
- Confirm backend stores UTC.
- Convert timezone only at UI rendering layer.

## Documentation Discipline

When implementation diverges from plan, update docs in the same PR so specs remain trustworthy.
