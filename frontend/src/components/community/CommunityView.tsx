import { useState, useMemo } from "react";
import NeighborhoodMap from "./NeighborhoodMap";
import AdoptionSlider from "./AdoptionSlider";
import DuckCurveChart from "./DuckCurveChart";
import CommunityMetricsPanel from "./CommunityMetrics";
import { computeMetrics, formatAdoptionLabel } from "../../utils/communityMath";

const TOTAL_HOUSES = 48;

export default function CommunityView() {
  const [n, setN] = useState(1_000);

  const metrics = useMemo(() => computeMetrics(n), [n]);

  // Map N to number of lit houses (log scale, 0–48)
  const activeHouses = useMemo(() => {
    const minLog = Math.log10(100);
    const maxLog = Math.log10(100_000);
    const t = (Math.log10(Math.max(100, n)) - minLog) / (maxLog - minLog);
    return Math.round(t * TOTAL_HOUSES);
  }, [n]);

  return (
    <main className="w-full pb-28">
      {/* Header */}
      <section className="px-6 pt-6 pb-4 border-b border-[#86948a]/10">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-4 bg-[#4edea3]" />
              <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-[0.2em] text-[#86948a]">
                Community Impact Simulator
              </span>
            </div>
            <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-[#e2e2eb] tracking-tight">
              What if your whole neighborhood optimized?
            </h1>
            <p className="text-sm text-[#86948a] mt-1 max-w-lg">
              For HOA leaders, city energy managers, and utility program designers.
              Model the aggregate grid impact of community-scale adoption.
            </p>
          </div>
          {/* Efficiency badge */}
          <div className="text-right shrink-0 ml-4">
            <span className="font-['Space_Grotesk'] text-[9px] uppercase tracking-widest text-[#86948a]">
              Dispatch efficiency
            </span>
            <div className="font-mono text-lg font-bold text-[#4edea3]">
              {metrics.efficiencyPct}%
            </div>
            <span className="text-[9px] text-[#86948a]/50 font-['Space_Grotesk']">
              staggered windows
            </span>
          </div>
        </div>
      </section>

      {/* Neighborhood Map + Slider */}
      <section className="px-6 py-6 border-b border-[#86948a]/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Map */}
          <div className="relative">
            <NeighborhoodMap activeCount={activeHouses} />
            {/* Overlay label */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4edea3] shadow-[0_0_6px_rgba(78,222,163,0.8)]" />
              <span className="font-['Space_Grotesk'] text-[9px] uppercase tracking-widest text-[#4edea3]/70">
                GridGhost optimized
              </span>
              <span className="w-2 h-2 rounded-full bg-[#3a4a42]" />
              <span className="font-['Space_Grotesk'] text-[9px] uppercase tracking-widest text-[#86948a]/50">
                unoptimized
              </span>
            </div>
          </div>

          {/* Slider + context */}
          <div className="flex flex-col gap-6">
            <AdoptionSlider value={n} onChange={setN} />

            {/* Contextual note that updates with scale */}
            <div className="bg-[#111319] border border-[#86948a]/15 rounded-lg p-4">
              <ScaleContext n={n} metrics={metrics} />
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="px-6 py-6 border-b border-[#86948a]/10">
        <div className="mb-3 flex items-center gap-2">
          <div className="w-1 h-4 bg-[#60a5fa]" />
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-[0.2em] text-[#86948a]">
            Annual Impact at {formatAdoptionLabel(n)} Households
          </span>
        </div>
        <CommunityMetricsPanel metrics={metrics} />
        {metrics.peakerPlantsAvoided >= 0.1 && (
          <p className="mt-3 text-[10px] text-[#86948a]/60 font-['Space_Grotesk']">
            ≈ {metrics.peakerPlantsAvoided.toFixed(2)} CAISO peaker plant-equivalents
            avoided during 5–9pm peak ({metrics.peakMwReduced.toFixed(0)} MW ÷ 500 MW/plant)
          </p>
        )}
      </section>

      {/* Duck Curve */}
      <section className="px-6 py-6 border-b border-[#86948a]/10">
        <div className="mb-3 flex items-center gap-2">
          <div className="w-1 h-4 bg-[#f59e0b]" />
          <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-[0.2em] text-[#86948a]">
            Duck Curve Transformation
          </span>
        </div>
        <DuckCurveChart n={n} />
      </section>

      {/* Methodology footer */}
      <section className="px-6 py-4">
        <p className="text-[9px] text-[#86948a]/40 font-['Space_Grotesk'] leading-relaxed max-w-2xl">
          Estimates derived from per-household optimization results (12.9 lbs CO₂/week saved,
          1.5 kW peak shift, $4.20/week CAISO ELRP credit signal). Diversity factor applied to
          account for synchronization degradation at scale — GridGhost uses randomized dispatch
          within clean windows to distribute load. Peaker capacity modeled at 500 MW/plant.
          CO₂ equivalence: 4.6 tons/vehicle/year (EPA). Not a utility enrollment or billing commitment.
        </p>
      </section>
    </main>
  );
}

function ScaleContext({ n, metrics }: { n: number; metrics: ReturnType<typeof computeMetrics> }) {
  if (n <= 500) {
    return (
      <p className="text-xs text-[#86948a] font-['Space_Grotesk'] leading-relaxed">
        At this scale — a single HOA or apartment complex — natural usage diversity prevents
        synchronization. Nearly full efficiency. A{" "}
        <span className="text-[#4edea3]">{metrics.efficiencyPct}% dispatch efficiency</span> with
        minimal coordination overhead.
      </p>
    );
  }
  if (n <= 5_000) {
    return (
      <p className="text-xs text-[#86948a] font-['Space_Grotesk'] leading-relaxed">
        Neighborhood or small city district scale. GridGhost's staggered dispatch windows spread
        load across a 4-hour clean window, preventing rebound peaks.{" "}
        <span className="text-[#4edea3]">{metrics.efficiencyPct}% efficiency</span> — well within
        what CAISO ELRP programs achieve today.
      </p>
    );
  }
  if (n <= 25_000) {
    return (
      <p className="text-xs text-[#86948a] font-['Space_Grotesk'] leading-relaxed">
        City-district or mid-size utility program scale. Coordination matters here — a dedicated
        dispatch signal staggers appliance starts across households.{" "}
        <span className="text-[#f59e0b]">{metrics.efficiencyPct}% efficiency</span> reflects
        realistic coordinated DR program performance.
      </p>
    );
  }
  return (
    <p className="text-xs text-[#86948a] font-['Space_Grotesk'] leading-relaxed">
      Regional utility program scale — comparable to CAISO's largest residential DR enrollments.
      At this size, full staggered dispatch infrastructure is required.{" "}
      <span className="text-[#f59e0b]">{metrics.efficiencyPct}% efficiency</span> matches
      real-world outcomes from programs like OhmConnect and PG&E SmartRate.
    </p>
  );
}
