import { motion, AnimatePresence } from "framer-motion";
import type { BriefResponse } from "../../types/brief";

interface AiBriefCardProps {
  brief: BriefResponse | null;
}

export default function AiBriefCard({ brief }: AiBriefCardProps) {
  return (
    <AnimatePresence>
      {brief ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="surface-container bg-[#1e1f26] p-8 h-full relative overflow-hidden flex flex-col justify-between"
        >
          {/* Glass Texture Detail */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-4 bg-primary"></div>
              <h2 className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant">Tactical Briefing</h2>
            </div>
            <div className="mb-10">
              <span className="block font-headline text-xs font-medium text-primary mb-2 uppercase tracking-[0.2em]">{brief.headline}</span>
              <h2 className="font-headline text-6xl font-extrabold tracking-tighter text-on-surface mb-2 tnum">{Math.round((brief.savings_vs_unoptimized / brief.weekly_co2_lbs) * 100)}% <span className="text-2xl font-light text-on-surface-variant">REDUCED</span></h2>
              <p className="text-on-surface-variant/80 text-sm leading-relaxed max-w-sm">
                {brief.grid_trend}
              </p>
            </div>
            <div className="flex items-center gap-6 mb-10 border-y border-outline-variant/15 py-6">
              <div className="flex flex-col">
                <span className="font-headline text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Miles Equivalent</span>
                <span className="font-headline text-2xl font-bold tnum">{brief.miles_equivalent} <span className="text-xs font-normal text-on-surface-variant uppercase">Mi</span></span>
              </div>
              <div className="w-px h-10 bg-outline-variant/30"></div>
              <div className="flex flex-col">
                <span className="font-headline text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Carbon Offset</span>
                <span className="font-headline text-2xl font-bold tnum">{brief.savings_vs_unoptimized} <span className="text-xs font-normal text-on-surface-variant uppercase">kg</span></span>
              </div>
              <div className="w-px h-10 bg-outline-variant/30"></div>
              <div className="flex flex-col">
                <span className="font-headline text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">DR Readiness</span>
                <span className="font-headline text-2xl font-bold tnum text-primary">
                  {brief.dr_readiness.qualified_windows}<span className="text-xs font-normal text-on-surface-variant">/{brief.dr_readiness.total_windows}</span>
                </span>
                <span className="font-headline text-[10px] text-emerald mt-0.5">${brief.dr_readiness.estimated_bill_credit_usd.toFixed(2)} est. credit</span>
              </div>
            </div>
            <div className="space-y-4">
              {brief.nudges.slice(0, 2).map((nudge, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="w-6 h-6 rounded-sm bg-primary/10 flex items-center justify-center mt-0.5 group-hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-[16px] text-primary">{i === 0 ? 'psychology' : 'warning'}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    <strong className="text-on-surface">{i === 0 ? 'AI Suggestion:' : 'Grid Alert:'}</strong> {nudge}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-outline-variant/15 flex justify-between items-center">
            <span className="font-headline text-[10px] uppercase tracking-widest text-on-surface-variant">Update Alpha-7.2</span>
            <button className="text-primary font-headline text-[10px] font-bold uppercase tracking-widest hover:underline underline-offset-4 transition-all">Download Full Report</button>
          </div>
        </motion.div>
      ) : (
        <div className="surface-container bg-[#1e1f26] p-8 h-full flex items-center justify-center text-on-surface-variant text-sm">
          Run optimization to generate briefing
        </div>
      )}
    </AnimatePresence>
  );
}
