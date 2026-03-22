import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ScheduleEntry } from "../../types/optimize";
import type { OptimizeResponse } from "../../types/optimize";
import type { BriefResponse } from "../../types/brief";
import type { ForecastPoint } from "../../types/forecast";
import type { Appliance } from "../../types/appliance";
import { makeDefaultAppliances } from "../../fixtures/appliances";
import { makeFixtureOptimizeResult } from "../../fixtures/optimizeResult";
import { fixtureBrief } from "../../fixtures/brief";
import { useForecast } from "../../hooks/useForecast";
import { moerToLabel } from "../../utils/colors";

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
import SourceBadge from "./SourceBadge";

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

function computeBaseline(appliances: Appliance[], avgMoer = 800): ScheduleEntry[] {
  const healthScore = Math.max(0, Math.min(1, 1 - (avgMoer - 300) / 900));
  return appliances.map((a) => {
    const start = a.preferred_start ?? new Date().toISOString();
    const end = new Date(new Date(start).getTime() + a.duration_minutes * 60_000).toISOString();
    return { appliance_id: a.id, start, end, avg_moer_lbs_per_mwh: avgMoer, avg_health_score: +healthScore.toFixed(2) };
  });
}

export default function CommandView() {
  const { forecast } = useForecast();
  const { weather } = useWeather();
  const [appliances, setAppliances] = useState<Appliance[]>(() => makeDefaultAppliances());
  const [schedule, setSchedule] = useState<ScheduleEntry[]>(() => computeBaseline(makeDefaultAppliances()));
  const [baselineSchedule, setBaselineSchedule] = useState<ScheduleEntry[]>([]);
  const [optimizeResult, setOptimizeResult] = useState<OptimizeResponse | null>(null);
  const [brief, setBrief] = useState<BriefResponse | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);

  const handleOptimize = useCallback(async () => {
    setBaselineSchedule(schedule);
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
      result = makeFixtureOptimizeResult();
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
  }, [forecast, appliances, schedule]);

  const handleReset = useCallback(() => {
    setSchedule(computeBaseline(appliances));
    setBaselineSchedule([]);
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

  const forecastAvgMoer = useMemo(() => {
    if (!forecast.points.length) return 800;
    return forecast.points.reduce((s, p) => s + p.moer_lbs_per_mwh, 0) / forecast.points.length;
  }, [forecast.points]);

  const handleAddAppliance = useCallback((appliance: Appliance) => {
    // Round current time up to the next hour as a sensible default start.
    const roundedNow = new Date();
    roundedNow.setMinutes(0, 0, 0);
    roundedNow.setHours(roundedNow.getHours() + 1);
    const start = roundedNow.toISOString();
    const end = new Date(roundedNow.getTime() + appliance.duration_minutes * 60_000).toISOString();
    const healthScore = +(Math.max(0, Math.min(1, 1 - (forecastAvgMoer - 300) / 900))).toFixed(2);
    setAppliances((prev) => [...prev, appliance]);
    setSchedule((prev) => [
      ...prev,
      { appliance_id: appliance.id, start, end, avg_moer_lbs_per_mwh: forecastAvgMoer, avg_health_score: healthScore },
    ]);
  }, [forecastAvgMoer]);

  const handleDeleteAppliance = useCallback((id: string) => {
    setAppliances((prev) => prev.filter((a) => a.id !== id));
    setSchedule((prev) => prev.filter((s) => s.appliance_id !== id));
  }, []);

  const estimatedBaselineCo2 = useMemo(() => {
    // CO2 (lbs) = power_kw * duration_hours * moer_lbs_per_mwh / 1000 (kW→MW)
    return appliances.reduce(
      (sum, a) => sum + a.power_kw * (a.duration_minutes / 60) * forecastAvgMoer / 1000,
      0
    );
  }, [appliances, forecastAvgMoer]);

  const baselineCo2 = optimizeResult?.baseline.total_co2_lbs ?? estimatedBaselineCo2;
  const currentCo2 = isOptimized
    ? (optimizeResult?.optimized.total_co2_lbs ?? baselineCo2)
    : baselineCo2;

  // Tween displayCo2 toward currentCo2 whenever it changes.
  const prevCo2Ref = useRef(currentCo2);
  const [displayCo2, setDisplayCo2] = useState(currentCo2);
  useEffect(() => {
    const from = prevCo2Ref.current;
    const to = currentCo2;
    prevCo2Ref.current = to;
    if (Math.abs(from - to) < 1) { setDisplayCo2(to); return; }
    const DURATION = 1500;
    const t0 = performance.now();
    let raf: number;
    const tick = (ts: number) => {
      const t = Math.min((ts - t0) / DURATION, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplayCo2(from + (to - from) * ease);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [currentCo2]);

  const conflictInfo = useMemo(() => {
    if (!isOptimized || !baselineSchedule.length || !optimizeResult) return null;
    const shifted = optimizeResult.schedule.filter((entry) => {
      const appliance = appliances.find((a) => a.id === entry.appliance_id);
      if (!appliance?.shiftable) return false;
      const base = baselineSchedule.find((b) => b.appliance_id === entry.appliance_id);
      if (!base) return false;
      return Math.abs(new Date(entry.start).getTime() - new Date(base.start).getTime()) >= 30 * 60_000;
    });
    if (!shifted.length) return null;
    return {
      count: shifted.length,
      names: shifted.map((e) => appliances.find((a) => a.id === e.appliance_id)?.name ?? e.appliance_id),
    };
  }, [isOptimized, baselineSchedule, optimizeResult, appliances]);

  const peakPoint = useMemo(() =>
    forecast.points.length
      ? forecast.points.reduce((best, p) => p.moer_lbs_per_mwh > best.moer_lbs_per_mwh ? p : best)
      : null,
    [forecast.points]
  );

  const peakTimeStr = useMemo(() => {
    if (!peakPoint) return "--:--";
    return new Date(peakPoint.start).toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", timeZone: "America/Los_Angeles", hour12: false,
    }) + " PST";
  }, [peakPoint]);

  const gridHealthLabel = useMemo(() => {
    if (!forecast.points.length) return "—";
    const avg = forecast.points.reduce((s, p) => s + p.moer_lbs_per_mwh, 0) / forecast.points.length;
    return { clean: "Clean", moderate: "Moderate", dirty: "Stressed" }[moerToLabel(avg)];
  }, [forecast.points]);

  const gridHealthClass = useMemo(() => {
    if (!forecast.points.length) return "text-on-surface-variant";
    const avg = forecast.points.reduce((s, p) => s + p.moer_lbs_per_mwh, 0) / forecast.points.length;
    const label = moerToLabel(avg);
    return label === "clean" ? "text-primary" : label === "moderate" ? "text-amber-400" : "text-red-400";
  }, [forecast.points]);

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
              <div className="flex items-center gap-2">
                <span className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-primary/80">Grid Intensity Forecast</span>
                <SourceBadge source={forecast.source} />
              </div>
              <h1 className="font-headline text-4xl font-bold tracking-tight mt-1 tnum">{Math.round(displayCo2)}<span className="text-lg font-normal text-on-surface-variant ml-2 uppercase">lbs CO₂</span></h1>
            </div>
            <div className="flex gap-4 items-start">
              <div className="text-right">
                <span className="block font-headline text-[10px] uppercase tracking-widest text-on-surface-variant">Peak Demand</span>
                <span className="block font-mono text-sm text-tertiary">{peakTimeStr}</span>
              </div>
              <div className="text-right border-l border-outline-variant/30 pl-4">
                <span className="block font-headline text-[10px] uppercase tracking-widest text-on-surface-variant">Grid Health</span>
                <span className={`block font-headline text-sm uppercase ${gridHealthClass}`}>{gridHealthLabel}</span>
              </div>
              <div className="text-right border-l border-outline-variant/30 pl-4">
                <span className="block font-headline text-[10px] uppercase tracking-widest text-on-surface-variant">Daily CO₂</span>
                <span className="block font-mono text-sm text-on-surface tnum">{displayCo2.toFixed(1)} <span className="text-on-surface-variant text-xs">lbs</span></span>
                {isOptimized && (
                  <span className="block font-mono text-xs text-primary">
                    {((displayCo2 - baselineCo2) / baselineCo2 * 100).toFixed(1)}%
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
              isOptimized={isOptimized}
              baselineSchedule={baselineSchedule}
            />
          </div>
        </div>
      </section>
      {/* MIDDLE: OPTIMIZE BUTTON */}
      <div className="px-6 mt-4 relative z-10 flex flex-col items-center gap-3">
        <OptimizePanel
          isOptimizing={isOptimizing}
          isOptimized={isOptimized}
          onOptimize={handleOptimize}
          onReset={handleReset}
          result={optimizeResult}
        />
        <AnimatePresence>
          {conflictInfo && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="w-full max-w-md overflow-hidden"
            >
              <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2.5 flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-base mt-0.5 shrink-0">check_circle</span>
                <span className="text-xs text-on-surface-variant leading-relaxed">
                  <span className="text-primary font-semibold">
                    {conflictInfo.count} appliance{conflictInfo.count > 1 ? "s" : ""}
                  </span>
                  {" "}shifted to cleaner windows
                  <span className="text-on-surface-variant/60 ml-1">— {conflictInfo.names.join(", ")}</span>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
