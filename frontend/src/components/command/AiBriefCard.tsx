import { motion, AnimatePresence } from "framer-motion";
import type { BriefResponse } from "../../types/brief";

interface AiBriefCardProps {
  brief: BriefResponse | null;
}

export default function AiBriefCard({ brief }: AiBriefCardProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-text-secondary mb-2">
        Carbon Brief
      </h3>
      <AnimatePresence>
        {brief ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-bg-card rounded-lg p-4 border border-border space-y-3"
          >
            <div>
              <h4 className="text-sm font-semibold text-emerald">
                {brief.headline}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-text-muted">Weekly CO₂</span>
                <p className="font-mono">{brief.weekly_co2_lbs} lbs</p>
              </div>
              <div>
                <span className="text-text-muted">Saved</span>
                <p className="font-mono text-emerald">
                  {brief.savings_vs_unoptimized} lbs
                </p>
              </div>
              <div>
                <span className="text-text-muted">Miles equiv.</span>
                <p className="font-mono">{brief.miles_equivalent} mi</p>
              </div>
            </div>

            {/* DR Readiness */}
            <div className="border-t border-border pt-2">
              <p className="text-xs font-medium text-amber">
                {brief.dr_readiness.label}:{" "}
                {brief.dr_readiness.qualified_windows}/
                {brief.dr_readiness.total_windows} windows this week
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                Est. bill credit: $
                {brief.dr_readiness.estimated_bill_credit_usd.toFixed(2)}
              </p>
              <p className="text-[10px] text-text-muted mt-0.5 italic">
                {brief.dr_readiness.eligibility_note}
              </p>
            </div>

            {/* Nudges */}
            <div className="border-t border-border pt-2">
              <ul className="text-xs text-text-secondary space-y-1">
                {brief.nudges.map((nudge, i) => (
                  <li key={i} className="flex gap-1.5">
                    <span className="text-emerald">•</span>
                    {nudge}
                  </li>
                ))}
              </ul>
            </div>

            {/* Grid trend */}
            <p className="text-[10px] text-text-muted border-t border-border pt-2">
              {brief.grid_trend}
            </p>

            {/* Source badge */}
            <div className="flex justify-end">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-card-hover text-text-muted">
                {brief.source}
              </span>
            </div>
          </motion.div>
        ) : (
          <div className="bg-bg-card rounded-lg p-4 border border-border h-48 flex items-center justify-center text-text-muted text-sm">
            Run optimization to generate brief
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
