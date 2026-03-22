import { useEffect, useRef } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import type { CommunityMetrics } from "../../utils/communityMath";

interface MetricCardProps {
  label: string;
  value: number;
  format: (v: number) => string;
  sublabel: string;
  accent?: string;
}

function AnimatedMetricCard({ label, value, format, sublabel, accent = "#4edea3" }: MetricCardProps) {
  const motionVal = useMotionValue(0);
  const displayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 0.8,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, motionVal]);

  useEffect(() => {
    const unsub = motionVal.on("change", (v) => {
      if (displayRef.current) {
        displayRef.current.textContent = format(v);
      }
    });
    return unsub;
  }, [motionVal, format]);

  return (
    <div className="bg-[#111319] border border-[#86948a]/15 rounded-lg p-4 flex flex-col gap-1">
      <span
        className="font-['Space_Grotesk'] text-[9px] uppercase tracking-[0.2em]"
        style={{ color: "#86948a" }}
      >
        {label}
      </span>
      <span
        className="font-mono text-2xl font-bold leading-none"
        style={{ color: accent }}
      >
        <motion.span ref={displayRef}>{format(0)}</motion.span>
      </span>
      <span className="font-['Space_Grotesk'] text-[10px] text-[#86948a]/60 mt-0.5">
        {sublabel}
      </span>
    </div>
  );
}

interface CommunityMetricsProps {
  metrics: CommunityMetrics;
}

export default function CommunityMetricsPanel({ metrics }: CommunityMetricsProps) {
  const fmtTons = (v: number) =>
    v >= 1000
      ? `${(v / 1000).toFixed(1)}K`
      : v >= 1 ? v.toFixed(0) : v.toFixed(1);

  const fmtMw = (v: number) =>
    v >= 1000 ? `${(v / 1000).toFixed(1)}GW` : v >= 1 ? `${v.toFixed(0)}` : v.toFixed(2);

  const fmtCars = (v: number) =>
    v >= 1_000_000
      ? `${(v / 1_000_000).toFixed(2)}M`
      : v >= 1000
      ? `${(v / 1000).toFixed(1)}K`
      : v.toFixed(0);

  const fmtDollars = (v: number) =>
    v >= 1_000_000
      ? `$${(v / 1_000_000).toFixed(1)}M`
      : v >= 1000
      ? `$${(v / 1000).toFixed(0)}K`
      : `$${v.toFixed(0)}`;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <AnimatedMetricCard
        label="CO₂ Avoided"
        value={metrics.co2TonsPerYear}
        format={(v) => `${fmtTons(v)} t`}
        sublabel="tons per year"
        accent="#4edea3"
      />
      <AnimatedMetricCard
        label="Peak Demand Cut"
        value={metrics.peakMwReduced}
        format={(v) => `${fmtMw(v)} MW`}
        sublabel="removed from 5–9pm fossil peak"
        accent="#60a5fa"
      />
      <AnimatedMetricCard
        label="Cars Equivalent"
        value={metrics.carsEquivalent}
        format={fmtCars}
        sublabel="passenger vehicles removed/yr"
        accent="#f59e0b"
      />
      <AnimatedMetricCard
        label="DR Credits"
        value={metrics.drCreditsPerYear}
        format={fmtDollars}
        sublabel="estimated annual bill savings"
        accent="#a78bfa"
      />
    </div>
  );
}
