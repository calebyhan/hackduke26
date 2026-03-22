import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LandingNavbar from '../components/layout/LandingNavbar';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const barVariants = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 0.5 } },
};

const scheduleContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const scheduleBarVariants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.5 } },
};

import Footer from '../components/layout/Footer';

const TechnologyPage: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null);
  const [cursor, setCursor] = useState({ x: -9999, y: -9999 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (rect) setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  const handleMouseLeave = () => setCursor({ x: -9999, y: -9999 });

  return (
    <div className="min-h-screen">
      <LandingNavbar />

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-24 pb-16"
      >
        <div className="absolute inset-0 living-grid z-0" />
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: `radial-gradient(500px circle at ${cursor.x}px ${cursor.y}px, rgba(16,185,129,0.13), transparent 55%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-secondary/10 blur-[120px] rounded-full" />

        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-surface-container-low px-4 py-1.5 rounded-sm border border-outline-variant/30 mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-evident-blink mx-1" />
            <span className="text-[10px] uppercase tracking-[0.1em] font-medium text-primary">Technical Architecture</span>
          </div>
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-white leading-none">
            Under the<br /><span className="text-primary">Hood</span>
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed font-light">
            GridGhost fuses real-time grid telemetry, dual health signals, and AI narrative into a single scheduling engine: here is exactly how.
          </p>
        </div>
      </section>

      {/* ── Data Flow ── */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-16">
            <span className="text-primary font-headline text-sm uppercase tracking-widest mb-4 block">End-to-End Pipeline</span>
            <h2 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">From Grid Signal to Your Schedule</h2>
          </div>

          {/* Flow nodes */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-0">
            {[
              { icon: 'bolt', label: 'WattTime API', sub: 'MOER + Region', color: 'text-primary' },
              { icon: 'dns', label: 'FastAPI Backend', sub: 'Normalization', color: 'text-secondary' },
              { icon: 'psychology', label: 'Gemini 2.5 Flash', sub: 'AI Brief', color: 'text-secondary' },
              { icon: 'tune', label: 'Optimizer', sub: 'Scheduling', color: 'text-primary' },
              { icon: 'smartphone', label: 'Dashboard', sub: 'Your Schedule', color: 'text-primary' },
            ].map((node, i, arr) => (
              <React.Fragment key={node.label}>
                <div className="flex flex-col items-center text-center min-w-[100px]">
                  <div className="glass-card p-4 mb-3 border border-outline-variant/40 group hover:border-primary/50 transition-all">
                    <span
                      className={`material-symbols-outlined text-3xl ${node.color}`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {node.icon}
                    </span>
                  </div>
                  <span className="text-xs font-bold font-headline text-on-surface">{node.label}</span>
                  <span className="text-[10px] text-on-surface-variant mt-0.5">{node.sub}</span>
                </div>
                {i < arr.length - 1 && (
                  <div className="flex items-center mx-2 md:mx-4 my-4 md:my-0">
                    <div className="hidden md:flex items-center gap-1 text-primary/60">
                      <div className="w-8 h-px bg-primary/40" />
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </div>
                    <div className="flex md:hidden flex-col items-center gap-1 text-primary/60">
                      <div className="w-px h-6 bg-primary/40" />
                      <span className="material-symbols-outlined text-base rotate-90">arrow_forward</span>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── MOER ── */}
      <section className="py-32 bg-surface">
        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-20 items-center">
          <div>
            <span className="text-primary font-headline text-sm uppercase tracking-widest mb-4 block">Signal Layer 1</span>
            <h2 className="text-4xl md:text-5xl font-headline font-bold mb-6 tracking-tight">
              Marginal Emissions<br />Rate (MOER)
            </h2>
            <p className="text-on-surface-variant text-lg mb-6 leading-relaxed">
              Most carbon-aware tools use the <span className="text-on-surface font-semibold">average</span> grid mix. GridGhost uses the <span className="text-primary font-semibold">marginal</span> rate: the emissions of the specific generator that responds to the next kilowatt you draw.
            </p>
            <p className="text-on-surface-variant leading-relaxed mb-8">
              Sourced from <span className="text-on-surface font-medium">WattTime's API</span>, MOER is calculated per balancing authority region (CAISO_NORTH, PJM, MISO, etc.) and updated every five minutes, giving us a precise, real-time carbon cost for every action.
            </p>
            <div className="space-y-3">
              {['CAISO_NORTH (California)', 'PJM (Mid-Atlantic)', 'MISO (Midwest)', 'ERCOT (Texas)'].map((region) => (
                <div key={region} className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary glow-pulse flex-shrink-0" />
                  <span className="text-sm text-on-surface-variant font-mono">{region}</span>
                </div>
              ))}
            </div>
          </div>

          {/* MOER visual */}
          <div className="space-y-4">
            <div className="glass-card p-6 border-l-4 border-l-error">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 block mb-3">Average Grid Mix (Misleading)</span>
              <motion.div 
                className="flex items-end gap-1 h-20"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                {[0.6, 0.62, 0.61, 0.63, 0.6, 0.62, 0.61, 0.63, 0.6, 0.62, 0.61, 0.63].map((v, i) => (
                  <motion.div
                    key={i}
                    variants={barVariants}
                    className="flex-1 bg-error/40 rounded-t-sm origin-bottom"
                    style={{ height: `${v * 100}%` }}
                  />
                ))}
              </motion.div>
              <p className="text-[10px] text-slate-500 mt-3">Flat average hides real-time fossil peaks</p>
            </div>
            <div className="glass-card p-6 border-l-4 border-l-primary">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 block mb-3">Marginal MOER (Actual Reality)</span>
              <motion.div 
                className="flex items-end gap-1 h-20"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                {[0.2, 0.15, 0.1, 0.12, 0.3, 0.7, 0.95, 1.0, 0.85, 0.5, 0.25, 0.1].map((v, i) => (
                  <motion.div
                    key={i}
                    variants={barVariants}
                    className="flex-1 rounded-t-sm origin-bottom"
                    style={{
                      height: `${v * 100}%`,
                      background: v > 0.6 ? 'rgb(239,68,68)' : v > 0.35 ? 'rgb(245,158,11)' : 'rgb(16,185,129)',
                    }}
                  />
                ))}
              </motion.div>
              <p className="text-[10px] text-slate-500 mt-3">Real variation exposes the optimal shift window</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Health Score ── */}
      <section className="py-32 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <span className="text-secondary font-headline text-sm uppercase tracking-widest mb-4 block">Signal Layer 2</span>
            <h2 className="text-3xl md:text-4xl font-headline font-bold tracking-tight mb-4">Dual-Signal Health Score</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">
              Carbon intensity tells half the story. Local air quality tells the other half.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card p-8 flex flex-col gap-4">
              <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>co2</span>
              <h3 className="font-headline text-xl font-bold">Carbon Intensity</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                MOER expressed in lbs CO₂ per MWh. Lower is cleaner. Solar noon windows on CAISO_NORTH can drop below 300 lbs/MWh.
              </p>
              <div className="mt-auto pt-4 border-t border-outline-variant/20 flex justify-between items-center">
                <span className="text-[10px] uppercase text-slate-500 tracking-widest">Weight</span>
                <span className="text-primary font-headline font-bold">60%</span>
              </div>
            </div>

            <div className="glass-card p-8 flex flex-col gap-4 bg-gradient-to-br from-surface-container to-surface-container-high border-secondary/30">
              <span className="material-symbols-outlined text-3xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>air</span>
              <h3 className="font-headline text-xl font-bold">Local Air Quality</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                PM2.5 and NOₓ levels from regional monitoring. Fossil peaker plants near residential areas cause disproportionate local harm even at moderate MOER.
              </p>
              <div className="mt-auto pt-4 border-t border-outline-variant/20 flex justify-between items-center">
                <span className="text-[10px] uppercase text-slate-500 tracking-widest">Weight</span>
                <span className="text-secondary font-headline font-bold">40%</span>
              </div>
            </div>

            <div className="glass-card p-8 flex flex-col gap-4">
              <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
              <h3 className="font-headline text-xl font-bold">Composite Score</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                A 0–100 health score fused from both signals. The optimizer targets windows scoring above 70. Displayed live in the analytics view as the green line.
              </p>
              <div className="mt-auto pt-4 border-t border-outline-variant/20 flex justify-between items-center">
                <span className="text-[10px] uppercase text-slate-500 tracking-widest">Target Threshold</span>
                <span className="text-primary font-headline font-bold">&gt; 70</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Optimizer ── */}
      <section className="py-32 bg-surface">
        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-20 items-start">
          <div>
            <span className="text-primary font-headline text-sm uppercase tracking-widest mb-4 block">The Algorithm</span>
            <h2 className="text-4xl md:text-5xl font-headline font-bold mb-6 tracking-tight">Scheduling<br />Optimizer</h2>
            <p className="text-on-surface-variant text-lg mb-8 leading-relaxed">
              Given a 24-hour MOER forecast and a list of household appliances with their power draw and duration, the optimizer finds the minimum-carbon assignment for each device.
            </p>
            <div className="space-y-6">
              {[
                {
                  icon: 'search',
                  title: 'Window Scoring',
                  desc: 'Each hour in the forecast is scored by a weighted combination of MOER and health signal. The optimizer builds a ranked list of clean windows.',
                },
                {
                  icon: 'link',
                  title: 'Dependency Handling',
                  desc: "Appliances with dependencies (dryer must follow washer) are chained: the dryer's earliest start is clamped to the washer's end time.",
                },
                {
                  icon: 'lock_clock',
                  title: 'Preferred Start Constraints',
                  desc: 'Fixed-schedule loads (HVAC, EV overnight charging) respect a preferred_start anchor while shiftable loads get full freedom.',
                },
                {
                  icon: 'bar_chart',
                  title: 'CO₂ Delta Reporting',
                  desc: 'The baseline (naïve) and optimized schedules are both scored so the dashboard can display exact kg of CO₂ avoided.',
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="bg-primary/10 p-2 rounded-sm mt-1 flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl">{item.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface mb-1">{item.title}</h4>
                    <p className="text-sm text-on-surface-variant">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pseudo-schedule visualization */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <span className="font-headline font-bold text-primary uppercase tracking-tighter text-sm">Optimized Schedule Preview</span>
              <span className="text-[10px] text-slate-500">24-hr window</span>
            </div>
            <motion.div 
              variants={scheduleContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {[
                { name: 'Washer', start: 9, dur: 1, color: 'bg-primary' },
                { name: 'Dryer', start: 10, dur: 1.5, color: 'bg-primary/70' },
                { name: 'Dishwasher', start: 11, dur: 2, color: 'bg-secondary' },
                { name: 'EV Charge', start: 22, dur: 3, color: 'bg-secondary/70' },
                { name: 'HVAC', start: 7, dur: 2, color: 'bg-primary/50' },
              ].map((item) => {
                const clampedDuration = Math.max(0, Math.min(item.dur, 24 - item.start));

                return (
                  <div key={item.name} className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] text-on-surface-variant w-20 text-right flex-shrink-0">{item.name}</span>
                    <div className="flex-1 h-6 bg-surface-container-lowest rounded-sm relative">
                      <motion.div
                        variants={scheduleBarVariants}
                        className={`absolute top-0 h-full ${item.color} rounded-sm flex items-center px-2 origin-left`}
                        style={{
                          left: `${(item.start / 24) * 100}%`,
                          width: `${(clampedDuration / 24) * 100}%`,
                        }}
                      >
                        <span className="text-[9px] text-white font-bold whitespace-nowrap overflow-hidden">{item.start}:00</span>
                      </motion.div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
            <div className="flex justify-between mt-4 px-20">
              {['0', '6', '12', '18', '24'].map((h) => (
                <span key={h} className="text-[9px] text-slate-600">{h}h</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Gemini ── */}
      <section className="py-32 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            {/* AI brief mockup */}
            <div className="glass-card p-8 border-l-4 border-l-secondary">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                <div>
                  <span className="block text-xs font-bold text-secondary uppercase tracking-widest">Daily Carbon Brief</span>
                  <span className="text-[10px] text-slate-500">Generated by Gemini 2.5 Flash · 06:00</span>
                </div>
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-4 italic">
                "Good morning. Today's grid in CAISO_NORTH is tracking clean through early afternoon — solar generation is peaking at 14:00 with MOER dipping to <span className="text-primary font-semibold not-italic">314 lbs/MWh</span>. Evening ramp between 18:00-21:00 is forecast at <span className="text-error font-semibold not-italic">1,074 lbs/MWh</span> as gas peakers pick up demand. I've moved your washer and dishwasher to the morning window. Estimated savings: <span className="text-primary font-semibold not-italic">4.0 lbs CO₂</span>."
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="px-2 py-1 bg-primary/10 text-[10px] rounded-sm text-primary">Forecast-aware</span>
                <span className="px-2 py-1 bg-secondary/10 text-[10px] rounded-sm text-secondary">Schedule context</span>
                <span className="px-2 py-1 bg-surface-container-highest text-[10px] rounded-sm text-on-surface-variant">Human-readable</span>
              </div>
            </div>

            <div>
              <span className="text-secondary font-headline text-sm uppercase tracking-widest mb-4 block">AI Narrative Layer</span>
              <h2 className="text-4xl md:text-5xl font-headline font-bold mb-6 tracking-tight">
                Gemini 2.5 Flash<br />Carbon Briefs
              </h2>
              <p className="text-on-surface-variant text-lg mb-6 leading-relaxed">
                Raw MOER numbers mean nothing to most people. Every morning, GridGhost sends the 24-hour forecast, the health score trend, and the proposed appliance schedule to <span className="text-on-surface font-medium">Gemini 2.5 Flash</span>.
              </p>
              <p className="text-on-surface-variant leading-relaxed mb-8">
                Gemini distills this into a short, plain-English brief explaining <em>why</em> your schedule looks the way it does, surfacing the story behind the data without requiring the user to interpret a single chart.
              </p>
              <div className="flex items-start gap-4">
                <div className="bg-secondary/10 p-2 rounded-sm mt-1 flex-shrink-0">
                  <span className="material-symbols-outlined text-secondary text-xl">token</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface mb-1">Structured Prompt + Token Budget</h4>
                  <p className="text-sm text-on-surface-variant">The backend sends a structured JSON context (region, MOER array, schedule, health scores) within a token-budget-constrained prompt, ensuring fast, focused output that fits in the UI card.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-surface text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-headline text-4xl font-bold tracking-tight mb-4">See It In Action</h2>
          <p className="text-on-surface-variant mb-10 leading-relaxed">Every layer described above is running live. Open the dashboard to watch real MOER data flow through the pipeline in real time.</p>
          <Link
            to="/dashboard"
            className="group relative inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-sm text-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_-4px_rgba(78,222,163,0.7)] hover:scale-105 active:scale-100 border-2 border-primary/60"
          >
            <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative">Open Dashboard</span>
            <span className="material-symbols-outlined relative text-xl transition-transform duration-300 group-hover:translate-x-1" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TechnologyPage;
