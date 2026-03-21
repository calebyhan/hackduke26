import { motion } from "framer-motion";
import type { OptimizeResponse } from "../../types/optimize";

interface OptimizePanelProps {
  isOptimizing: boolean;
  isOptimized: boolean;
  onOptimize: () => void;
  onReset: () => void;
  result: OptimizeResponse | null;
}

export default function OptimizePanel({
  isOptimizing,
  isOptimized,
  onOptimize,
  onReset,
  result,
}: OptimizePanelProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <button
        onClick={isOptimized ? onReset : onOptimize}
        disabled={isOptimizing}
        className="w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-emerald hover:bg-emerald/90 text-white"
      >
        {isOptimizing ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Optimizing...
          </span>
        ) : isOptimized ? (
          "Reset Schedule"
        ) : (
          "Optimize Schedule"
        )}
      </button>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-bg-card rounded-lg p-4 border border-border"
        >
          <h4 className="text-sm font-medium mb-3">Optimization Results</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-text-muted">Baseline</span>
              <p className="font-mono text-text-primary">
                {result.baseline.total_co2_lbs} lbs
              </p>
            </div>
            <div>
              <span className="text-text-muted">Optimized</span>
              <p className="font-mono text-emerald">
                {result.optimized.total_co2_lbs} lbs
              </p>
            </div>
            <div>
              <span className="text-text-muted">Reduction</span>
              <p className="font-mono text-emerald">
                {result.delta.co2_lbs} lbs ({result.delta.co2_percent}%)
              </p>
            </div>
            <div>
              <span className="text-text-muted">Health Δ</span>
              <p className="font-mono text-text-primary">
                {result.delta.health_score_delta}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
