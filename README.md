# GridGhost

Real-time carbon intelligence for the home.

GridGhost visualizes how a household's carbon footprint shifts throughout the day using marginal operating emissions rate (MOER) data from the electrical grid. Instead of relying on annual averages, it shows the actual carbon cost of electricity at each hour, then helps users reschedule flexible appliances — dishwashers, EV chargers, laundry — into the cleanest available windows without reducing total energy use.

## Why Marginal Emissions Matter

Most energy dashboards report average grid emissions. But when you turn on an appliance, the power plant that ramps up to meet that demand is almost always a fossil fuel "peaker." MOER captures this marginal signal — the emissions intensity of the next unit of electricity — making it a far better metric for deciding *when* to consume energy.

## How It Works

1. A 24-hour carbon intensity timeline colors each hour by MOER (green = clean, amber = moderate, red = dirty), with a temperature overlay and appliance chips positioned by scheduled start time.
2. Household appliances are shown at their currently scheduled times. Users can add, remove, and configure appliances inline.
3. Pressing **Optimize** runs a constrained greedy scheduler that shifts flexible loads into cleaner windows while respecting time-of-use preferences and appliance dependencies (e.g. washer before dryer).
4. The UI animates appliance chips sliding to their new times alongside a live CO₂ counter tweening to the new value.
5. An AI-generated plain-English brief (Gemini 2.5 Flash) summarizes the schedule changes, CO₂ savings, demand-response readiness, and weather context.
6. A **Community** tab simulates grid-scale anti-synchronization effects using an adoption slider and duck curve chart showing how collective scheduling reduces evening demand peaks.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend | FastAPI (Python 3.11+) |
| Grid signals | WattTime v3 API (MOER forecasts + signal index) |
| Weather | Open-Meteo API |
| Air quality | Open-Meteo Air Quality API (PM2.5, NO₂) |
| Generation mix | EIA Open Data API |
| AI narrative | Google Gemini 2.5 Flash |

## Project Structure

```
gridghost/
├── backend/
│   └── app/
│       ├── fixtures/      # Static fallback data
│       ├── models/        # Pydantic request/response schemas
│       ├── routers/       # FastAPI route handlers
│       └── services/      # Business logic and external API clients
├── docs/                  # Product and technical specifications
├── frontend/
│   └── src/
│       ├── api/           # Axios API client modules
│       ├── components/    # React components (analytics, command, community, landing, layout)
│       ├── fixtures/      # Client-side fixture data for offline dev
│       ├── hooks/         # React data-fetching hooks
│       ├── types/         # TypeScript interfaces
│       └── utils/         # Color mapping, time formatting, community math, projections
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # fill in API keys
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # set VITE_API_BASE_URL
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API calls to the backend on port 8000.

## Environment Variables

See `backend/.env.example` and `frontend/.env.example` for the full list. At minimum you need:

- `WATTTIME_USERNAME` / `WATTTIME_PASSWORD` — grid signal data
- `EIA_API_KEY` — generation mix data
- `GEMINI_API_KEY` — AI brief generation

The app includes fixture fallbacks so you can run the full UI without API keys during development.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup details, branching conventions, and the validation checklist.

## License

[MIT](LICENSE)
