import { motion, AnimatePresence } from "framer-motion";
import type { OptimizeResponse } from "../../types/optimize";
import { computeProjections } from "../../utils/projection";

interface ImpactProjectionProps {
  result: OptimizeResponse | null;
}

export default function ImpactProjection({ result }: ImpactProjectionProps) {
  const projections = result
    ? computeProjections(Math.abs(result.delta.co2_lbs))
    : null;

  return (
    <div className="bg-bg-card rounded-lg p-4 border border-border">
      <h4 className="text-sm font-medium mb-2">Scaled Impact</h4>
      <AnimatePresence>
        {projections ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Your household / year</span>
                <span className="font-mono text-emerald">
                  {projections.annualHouseholdLbs.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}{" "}
                  lbs CO₂
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">1,000 homes / year</span>
                <span className="font-mono text-emerald">
                  {projections.scaled1kTons.toLocaleString(undefined, {
                    maximumFractionDigits: 1,
                  })}{" "}
                  tons CO₂
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">10,000 homes / year</span>
                <span className="font-mono text-emerald">
                  {projections.scaled10kTons.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}{" "}
                  tons CO₂
                </span>
              </div>
            </div>
            <p className="text-[10px] text-text-muted italic mt-1">
              Based on today's optimization applied daily. Actual impact varies
              by season, grid mix, and household usage.
            </p>
          </motion.div>
        ) : (
          <p className="text-xs text-text-muted">
            Run optimization to see projected impact.
          </p>
        )}
      </AnimatePresence>
    </div>
  );
}
