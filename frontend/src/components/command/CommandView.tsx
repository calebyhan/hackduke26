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
import { useWeather } from "../../hooks/useWeather";
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

export default function CommandView() {
  const { forecast } = useForecast();
  const { weather } = useWeather();
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
    <main className="w-full">
      {/* TOP HALF: 24-HOUR MOER TIMELINE */}
      <section className="relative w-full h-[320px] bg-surface-container-low overflow-hidden">
        {/* Background MOER Gradient Layer */}
        <div className="absolute inset-0 flex">
          <div className="w-1/4 h-full bg-gradient-to-r from-primary-container/20 to-secondary-container/20"></div>
          <div className="w-1/4 h-full bg-gradient-to-r from-secondary-container/20 to-tertiary-container/30"></div>
          <div className="w-1/4 h-full bg-gradient-to-r from-tertiary-container/30 to-secondary-container/20"></div>
          <div className="w-1/4 h-full bg-gradient-to-r from-secondary-container/20 to-primary-container/20"></div>
        </div>
        {/* Grid Lines Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'linear-gradient(#86948a 1px, transparent 1px), linear-gradient(90deg, #86948a 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
        </div>
        {/* Content Overlay */}
        <div className="relative h-full flex flex-col justify-between px-6 py-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-primary/80">Grid Intensity Forecast</span>
              <h1 className="font-headline text-4xl font-bold tracking-tight mt-1 tnum">{Math.round(currentCo2)}<span className="text-lg font-normal text-on-surface-variant ml-2 uppercase">kg/MWh</span></h1>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <span className="block font-headline text-[10px] uppercase tracking-widest text-on-surface-variant">Peak Demand</span>
                <span className="block font-mono text-sm text-tertiary">19:42 UTC</span>
              </div>
              <div className="text-right border-l border-outline-variant/30 pl-4">
                <span className="block font-headline text-[10px] uppercase tracking-widest text-on-surface-variant">Grid Health</span>
                <span className="block font-headline text-sm text-primary uppercase">Stable</span>
              </div>
            </div>
          </div>
          {/* Subtle Temperature/MOER Line Visualization Placeholder */}
          <div className="flex-grow flex items-end mb-8 relative w-full">
            <Timeline
              forecast={forecast}
              schedule={schedule}
              appliances={defaultAppliances}
              weather={weather}
            />
          </div>
          {/* Time Axis */}
          <div className="flex justify-between font-headline text-[10px] uppercase tracking-[0.15em] text-on-surface-variant/60 border-t border-outline-variant/15 pt-2">
            <span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>23:59</span>
          </div>
        </div>
      </section>
      {/* MIDDLE: OPTIMIZE BUTTON */}
      <div className="px-6 mt-4 relative z-10 flex items-center gap-6">
        <OptimizePanel
          isOptimizing={isOptimizing}
          isOptimized={isOptimized}
          onOptimize={handleOptimize}
          onReset={handleReset}
          result={optimizeResult}
        />
        <CarbonCounter
          value={currentCo2}
          baselineValue={baselineCo2}
          isOptimized={isOptimized}
        />
      </div>
      {/* BOTTOM HALF: TWO COLUMNS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 pb-24">
        {/* LEFT COLUMN: APPLIANCE CARDS */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-primary"></div>
            <h2 className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant">Tactical Fleet Status</h2>
          </div>
          <ApplianceList
            appliances={defaultAppliances}
            schedule={schedule}
          />
        </div>
        {/* RIGHT COLUMN: TACTICAL BRIEFING */}
        <div className="flex flex-col gap-6">
          <AiBriefCard brief={brief} />
        </div>
      </section>
      {/* SECONDARY ROW: POLICY IMPACT, SCALED IMPACT, AUTOMATION */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 pb-24">
        <PolicyImpact result={optimizeResult} />
        <ImpactProjection result={optimizeResult} />
        <AutomationCta />
      </section>
    </main>
  );
}
