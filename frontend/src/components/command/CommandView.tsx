import { useState, useCallback } from "react";
import type { ScheduleEntry } from "../../types/optimize";
import type { OptimizeResponse } from "../../types/optimize";
import type { BriefResponse } from "../../types/brief";
import {
  defaultAppliances,
  baselineSchedule,
} from "../../fixtures/appliances";
import { fixtureForecast } from "../../fixtures/forecast";
import { fixtureOptimizeResult } from "../../fixtures/optimizeResult";
import { fixtureBrief } from "../../fixtures/brief";
import { useForecast } from "../../hooks/useForecast";
import { fetchOptimize } from "../../api/optimize";
import { fetchBrief } from "../../api/brief";
import Timeline from "./Timeline";
import ApplianceList from "./ApplianceList";
import OptimizePanel from "./OptimizePanel";
import AiBriefCard from "./AiBriefCard";
import CarbonCounter from "./CarbonCounter";
import PolicyImpact from "./PolicyImpact";
import ImpactProjection from "./ImpactProjection";
import AutomationCta from "./AutomationCta";
import SourceBadge from "./SourceBadge";

export default function CommandView() {
  const { forecast } = useForecast();
  const [schedule, setSchedule] = useState<ScheduleEntry[]>(baselineSchedule);
  const [optimizeResult, setOptimizeResult] = useState<OptimizeResponse | null>(
    null
  );
  const [brief, setBrief] = useState<BriefResponse | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);

  const handleOptimize = useCallback(async () => {
    setIsOptimizing(true);

    // Always use fixture forecast for optimization — the fixture appliances and
    // fixture forecast are calibrated together for a compelling CO2 contrast.
    // Live WattTime data is used only for the timeline display.
    let result: OptimizeResponse;
    try {
      result = await fetchOptimize(
        forecast.region,
        fixtureForecast.points,
        defaultAppliances
      );
    } catch {
      // Fallback to fixture
      result = fixtureOptimizeResult;
    }

    setOptimizeResult(result);
    setSchedule(result.schedule);
    setIsOptimized(true);

    // Brief appears after animation completes
    setTimeout(async () => {
      try {
        const briefResult = await fetchBrief(result);
        setBrief(briefResult);
      } catch {
        setBrief(fixtureBrief);
      }
      setIsOptimizing(false);
    }, 1800);
  }, [forecast]);

  const handleReset = useCallback(() => {
    setSchedule(baselineSchedule);
    setOptimizeResult(null);
    setBrief(null);
    setIsOptimized(false);
  }, []);

  const baselineCo2 = optimizeResult?.baseline.total_co2_lbs ?? fixtureOptimizeResult.baseline.total_co2_lbs;
  const currentCo2 = isOptimized
    ? (optimizeResult?.optimized.total_co2_lbs ?? baselineCo2)
    : baselineCo2;

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <CarbonCounter
          value={currentCo2}
          baselineValue={baselineCo2}
          isOptimized={isOptimized}
        />
        <SourceBadge source={forecast.source} />
      </div>

      <Timeline
        forecast={forecast}
        schedule={schedule}
        appliances={defaultAppliances}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ApplianceList
          appliances={defaultAppliances}
          schedule={schedule}
        />
        <OptimizePanel
          isOptimizing={isOptimizing}
          isOptimized={isOptimized}
          onOptimize={handleOptimize}
          onReset={handleReset}
          result={optimizeResult}
        />
        <AiBriefCard brief={brief} />
      </div>

      {/* Secondary insight row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PolicyImpact result={optimizeResult} />
        <ImpactProjection result={optimizeResult} />
        <AutomationCta />
      </div>
    </div>
  );
}
