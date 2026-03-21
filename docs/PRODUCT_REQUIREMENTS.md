# Product Requirements

## Product Summary

GridGhost is a single-page dashboard that visualizes real-time and forecasted grid carbon intensity, optimizes flexible appliance timing, and explains results in plain language.

## Primary User

- Homeowner or renter with routine appliance usage and interest in reducing carbon impact.

## Problem Statement

Consumers cannot easily see how much carbon changes based on when electricity is used. Existing calculators are static and do not support scheduling decisions.

## Product Goals

1. Make hourly carbon variability visible and intuitive.
2. Quantify emissions reduction from schedule shifting.
3. Produce actionable recommendations with minimal user effort.
4. Show carbon and health impact signals side by side.
5. Make policy and environmental-regulation relevance explicit in the product narrative.
6. Quantify impact at household and scaled adoption levels.

## Success Criteria

1. User can run optimization in one click from the main view.
2. Dashboard shows before vs after weekly carbon delta.
3. Every shiftable appliance displays optimized run window and dual signal scores.
4. AI brief renders valid structured content tied to optimization result.

## Functional Requirements

### Sustainability Track Coverage Requirements

1. Policy framing must be visible in-product via a policy impact module.
2. Impact quantification must include annualized household reduction and scaled projection scenarios (for example 1k and 10k households).
3. Actionability beyond insight must be represented by an automation experience mock with no backend integration requirement.
4. Reliability must be demonstrated through visible live, cache, and fixture source states.
5. The optimize before/after moment must remain the primary visual emphasis.
6. AI brief must include a Demand-Response Readiness score based on CAISO peak-stress windows.

### Command View

1. Display 24-hour MOER timeline for CAISO_NORTH using 5-minute intervals.
2. Overlay hourly temperature trend above timeline.
3. Render appliance schedule blocks on timeline.
4. Render appliance cards with:
- name
- duration
- scheduled window
- carbon score
- health score
5. Provide one Optimize action button.
6. Animate appliance block transitions over 1.5s on optimize.
7. Animate carbon counter from pre- to post-optimization.
8. Render AI brief card after optimization completes.
9. Render a policy impact module summarizing demand-response relevance and avoided peak-dirty windows.
10. Render scaled impact projections derived from optimization result (annual household and community-scale estimates).
11. Render an automation CTA module as a mock interaction only (no device control implementation).
12. Render DR Readiness in the brief card as qualified windows over total windows with estimated bill-credit signal.

### Grid Analytics Tab

1. Show EIA generation mix by fuel type for respondent CISO (CAISO).
2. Show 24-hour dual-signal chart (CO2 MOER vs health damage).
3. Show recent MOER history trend (target 7-day context).

### Backend Requirements

1. Proxy external API calls through FastAPI.
2. Refresh WattTime token automatically before expiry.
3. Validate AI brief response schema server-side.
4. Expose deterministic fallback responses for external API failures.
5. Return source metadata needed to label live/cache/fixture states in UI.
6. Compute DR readiness metrics from forecast and optimization outputs using documented CAISO threshold rules.

## Non-Functional Requirements

1. Timeline and core command view should render within 2s on warm load.
2. Optimize response target under 500ms for demo dataset.
3. API failures must degrade gracefully with fallback messaging.
4. All timestamps use ISO8601 and explicit timezone handling.

## Non-Goals

1. Real smart-home device control.
2. Production billing or utility settlement integration.
3. Multi-region raw MOER optimization on free WattTime tier.
4. Production utility demand-response enrollment flows.

## Acceptance Criteria

1. End-to-end flow works using live APIs.
2. End-to-end flow works using fixture mode if live APIs fail.
3. UI visibly demonstrates schedule shift and reduction metric.
4. No hard crash on missing data from any external provider.
5. Policy impact module appears with values derived from optimization output.
6. Impact projection module shows annualized household and scaled scenario estimates.
7. Automation module is clearly marked as demo mock and does not require backend calls.
8. AI brief shows DR Readiness in the form "x/y windows this week" and includes estimated bill-credit signal.
