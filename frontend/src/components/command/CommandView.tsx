import { useState, useCallback } from "react";
import type { ScheduleEntry } from "../../types/optimize";
import type { OptimizeResponse } from "../../types/optimize";
import type { BriefResponse } from "../../types/brief";
import type { ForecastPoint } from "../../types/forecast";
import type { Appliance } from "../../types/appliance";
import {
  defaultAppliances,
  baselineSchedule,
} from "../../fixtures/appliances";
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
import PolicyImpact from "./PolicyImpact";
import ImpactProjection from "./ImpactProjection";
import AutomationCta from "./AutomationCta";

function buildLiveAppliances(appliances: Appliance[], points: ForecastPoint[]): Appliance[] {
  if (!points.length) return appliances;
  const peakIdx = points.reduce(
    (best, p, i) => (p.moer_lbs_per_mwh > points[best].moer_lbs_per_mwh ? i : best),
    0
  );
  const peakStart = points[peakIdx].start;
  const dryerStart = new Date(
    new Date(peakStart).getTime() + 45 * 60 * 1000
  ).toISOString();
  return appliances.map((a) => {
    if (!a.shiftable) return a;
    return { ...a, preferred_start: a.id === "dryer" ? dryerStart : peakStart };
  });
}

function computeBaseline(appliances: Appliance[]): ScheduleEntry[] {
  const today = new Date().toISOString().slice(0, 10);
  return appliances.map((a) => {
    const existing = baselineSchedule.find((s) => s.appliance_id === a.id);
    if (existing) return existing;
    const start = a.preferred_start ?? `${today}T18:00:00Z`;
    const end = new Date(new Date(start).getTime() + a.duration_minutes * 60_000).toISOString();
    return { appliance_id: a.id, start, end, avg_moer_lbs_per_mwh: 800, avg_health_score: 0.68 };
  });
}

export default function CommandView() {
  const { forecast } = useForecast();
  const { weather } = useWeather();
  const [appliances, setAppliances] = useState<Appliance[]>(defaultAppliances);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>(baselineSchedule);
  const [optimizeResult, setOptimizeResult] = useState<OptimizeResponse | null>(null);
  const [brief, setBrief] = useState<BriefResponse | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);

  const handleOptimize = useCallback(async () => {
    setIsOptimizing(true);
    const liveAppliances = buildLiveAppliances(appliances, forecast.points);
    let result: OptimizeResponse;
    try {
      result = await fetchOptimize(
        forecast.region,
        forecast.points,
        liveAppliances
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
  }, [forecast, appliances]);

  const handleReset = useCallback(() => {
    setSchedule(computeBaseline(appliances));
    setOptimizeResult(null);
    setBrief(null);
    setIsOptimized(false);
  }, [appliances]);

  const handleUpdateAppliance = useCallback((id: string, changes: Partial<Appliance>) => {
    setAppliances((prev) => prev.map((a) => (a.id === id ? { ...a, ...changes } : a)));
    if (changes.duration_minutes !== undefined) {
      setSchedule((prev) =>
        prev.map((s) => {
          if (s.appliance_id !== id) return s;
          const newEnd = new Date(
            new Date(s.start).getTime() + changes.duration_minutes! * 60_000
          ).toISOString();
          return { ...s, end: newEnd };
        })
      );
    }
  }, []);

  const handleUpdateEntry = useCallback(
    (id: string, startHHMM: string) => {
      const today = new Date().toISOString().slice(0, 10);
      const startISO = `${today}T${startHHMM}:00Z`;
      const appliance = appliances.find((a) => a.id === id);
      const durationMin = appliance?.duration_minutes ?? 60;
      const endISO = new Date(new Date(startISO).getTime() + durationMin * 60_000).toISOString();
      setSchedule((prev) =>
        prev.map((s) => (s.appliance_id === id ? { ...s, start: startISO, end: endISO } : s))
      );
    },
    [appliances]
  );

  const handleAddAppliance = useCallback((appliance: Appliance) => {
    const today = new Date().toISOString().slice(0, 10);
    const start = `${today}T18:00:00Z`;
    const end = new Date(new Date(start).getTime() + appliance.duration_minutes * 60_000).toISOString();
    setAppliances((prev) => [...prev, appliance]);
    setSchedule((prev) => [
      ...prev,
      { appliance_id: appliance.id, start, end, avg_moer_lbs_per_mwh: 800, avg_health_score: 0.68 },
    ]);
  }, []);

  const handleDeleteAppliance = useCallback((id: string) => {
    setAppliances((prev) => prev.filter((a) => a.id !== id));
    setSchedule((prev) => prev.filter((s) => s.appliance_id !== id));
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
              <h1 className="font-headline text-4xl font-bold tracking-tight mt-1 tnum">{Math.round(currentCo2)}<span className="text-lg font-normal text-on-surface-variant ml-2 uppercase">lbs CO₂</span></h1>
            </div>
            <div className="flex gap-4 items-start">
              <div className="text-right">
                <span className="block font-headline text-[10px] uppercase tracking-widest text-on-surface-variant">Peak Demand</span>
                <span className="block font-mono text-sm text-tertiary">19:42 UTC</span>
              </div>
              <div className="text-right border-l border-outline-variant/30 pl-4">
                <span className="block font-headline text-[10px] uppercase tracking-widest text-on-surface-variant">Grid Health</span>
                <span className="block font-headline text-sm text-primary uppercase">Stable</span>
              </div>
              <div className="text-right border-l border-outline-variant/30 pl-4">
                <span className="block font-headline text-[10px] uppercase tracking-widest text-on-surface-variant">Weekly CO₂</span>
                <span className="block font-mono text-sm text-on-surface tnum">{currentCo2.toFixed(1)} <span className="text-on-surface-variant text-xs">lbs</span></span>
                {isOptimized && (
                  <span className="block font-mono text-xs text-primary">
                    {((currentCo2 - baselineCo2) / baselineCo2 * 100).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Subtle Temperature/MOER Line Visualization Placeholder */}
          <div className="flex-grow flex items-end mb-8 relative w-full">
            <Timeline
              forecast={forecast}
              schedule={schedule}
              appliances={appliances}
              weather={weather}
            />
          </div>
        </div>
      </section>
      {/* MIDDLE: OPTIMIZE BUTTON */}
      <div className="px-6 mt-4 relative z-10 flex justify-center">
        <OptimizePanel
          isOptimizing={isOptimizing}
          isOptimized={isOptimized}
          onOptimize={handleOptimize}
          onReset={handleReset}
          result={optimizeResult}
        />
      </div>
      {/* BOTTOM HALF: TWO COLUMNS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 pb-24">
        {/* LEFT COLUMN: APPLIANCE CARDS */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-0">
            <div className="w-1 h-4 bg-primary"></div>
            <h2 className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant">Appliances</h2>
          </div>
          <ApplianceList
            appliances={appliances}
            schedule={schedule}
            onUpdateAppliance={handleUpdateAppliance}
            onUpdateEntry={handleUpdateEntry}
            onAddAppliance={handleAddAppliance}
            onDeleteAppliance={handleDeleteAppliance}
          />
        </div>
        {/* RIGHT COLUMN: TACTICAL BRIEFING */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-0">
            <div className="w-1 h-4 bg-primary"></div>
            <h2 className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant">Tactical Briefing</h2>
          </div>
          <AiBriefCard
            brief={brief}
            pctReduction={optimizeResult ? Math.round((1 - optimizeResult.optimized.total_co2_lbs / optimizeResult.baseline.total_co2_lbs) * 100) : undefined}
          />
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
