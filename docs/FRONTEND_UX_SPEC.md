# Frontend UX Specification

## Experience Principles

1. Single-canvas command center feel.
2. Data-dense but immediately readable.
3. One primary action: Optimize.
4. Motion communicates causality, not decoration.

## Theme and Visual Language

- Background: #0f1117
- Clean signal: deep emerald
- Moderate signal: amber
- Dirty signal: crimson
- Muted text for secondary analytics

## Layout

Top navbar:
- logo
- region badge (CAISO_NORTH)
- live MOER readout
- tab switcher (Command, Grid Analytics)

Command tab:
1. Full-width 24-hour timeline at top.
2. Bottom row with 3 columns:
- appliance cards (left)
- optimize action panel (center)
- AI brief card (right)
3. Add a secondary insight row below core cards for policy impact, scaled impact projection, and automation mock CTA.

Grid Analytics tab:
1. Generation mix chart.
2. Dual signal chart.
3. MOER history chart.

## Component Requirements

### Timeline

1. Gradient from forecast MOER values.
2. Tick labels for time progression.
3. Temperature line overlay above gradient.
4. Appliance chips positioned by start and duration.

### Appliance Cards

Each card shows:
1. Device name and shiftability.
2. Scheduled start/end.
3. Duration.
4. CO2 score.
5. Health score.
6. Muted style for non-shiftable devices.

### Optimize Action

1. Single full-width button in center panel.
2. Disabled while optimization in progress.
3. Loading state text and spinner.

### Carbon Counter

1. Live value in top bar.
2. Animates from baseline to optimized value.
3. Indicates direction with color and sign.

### AI Brief Card

1. Headline reduction stat.
2. Miles equivalent.
3. DR Readiness line in format "Demand-Response Readiness: x/y windows this week".
4. Estimated bill-credit line in USD with eligibility note.
5. 2-3 nudge bullets.
6. Grid trend footer line.

### Policy Impact Module

1. Show estimated avoided peak-dirty intervals from optimization.
2. Show demand-response readiness signal for the current schedule.
3. Use plain language connecting results to grid stress and environmental policy outcomes.
4. Reference CAISO demand-response framing explicitly without claiming direct enrollment.

### Impact Projection Module

1. Show annualized household CO2 reduction estimate.
2. Show scaled projection scenarios (for example 1000 and 10000 homes).
3. Label assumptions used in projection math.

### Automation CTA Module (Mock)

1. Provide one-click style controls for "Enable Auto-Schedule" and/or "Check Utility Program".
2. Mark module with demo-only badge.
3. No backend integration required; interaction can use local mock state.

## Motion Specs

1. Appliance chip transition duration: 1.5s.
2. Carbon counter animation synced to chip movement.
3. Brief reveal after timeline animation completes.
4. Use ease-in-out and preserve legibility during motion.

## UI States

1. Initial loading.
2. Loaded with live data.
3. Optimization in progress.
4. Partial data degradation (weather or EIA unavailable).
5. Full fallback mode (fixture forecast).
6. Error state with retry actions.
7. Data source badges visible for key widgets: live, cache, or fixture.

## Responsiveness

1. Desktop-first layout for demo.
2. Tablet: collapse bottom row to stacked cards.
3. Mobile: timeline remains primary, secondary cards stack with reduced density.

## Accessibility

1. Maintain readable color contrast on dark theme.
2. Provide text labels not color-only meaning.
3. Keyboard focus states on all controls.
4. Respect reduced-motion preference by shortening or disabling transitions.
