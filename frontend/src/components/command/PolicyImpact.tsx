import { motion, AnimatePresence } from "framer-motion";
import type { OptimizeResponse } from "../../types/optimize";

interface PolicyImpactProps {
  result: OptimizeResponse | null;
}

export default function PolicyImpact({ result }: PolicyImpactProps) {
  return (
    <div className="bg-bg-card rounded-lg p-4 border border-border">
      <h4 className="text-sm font-medium mb-2">Policy Impact</h4>
      <AnimatePresence>
        {result ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2 text-xs"
          >
            <p className="text-text-secondary">
              Your optimized schedule avoids load during{" "}
              <span className="text-amber font-medium">
                {result.dr_readiness.qualified_windows} of{" "}
                {result.dr_readiness.total_windows}
              </span>{" "}
              peak grid-stress windows this week.
            </p>
            <p className="text-text-secondary">
              This aligns with{" "}
              <span className="text-text-primary font-medium">
                CAISO demand-response goals
              </span>{" "}
              — reducing strain during high-emissions periods when the grid
              relies most on fossil peakers.
            </p>
            <p className="text-text-muted text-[10px] italic mt-2">
              This is a readiness signal based on forecast stress windows, not
              a direct utility enrollment confirmation.
            </p>
          </motion.div>
        ) : (
          <p className="text-xs text-text-muted">
            Run optimization to see policy impact analysis.
          </p>
        )}
      </AnimatePresence>
    </div>
  );
}
