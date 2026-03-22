import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import type { OptimizeResponse } from "../../types/optimize";

const STEPS = [
  "Reading grid signal...",
  "Analyzing appliances...",
  "Finding clean windows...",
  "Calculating savings...",
];

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
}: OptimizePanelProps) {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (!isOptimizing) {
      setStepIdx(0);
      return;
    }
    const id = setInterval(() => setStepIdx((i) => (i + 1) % STEPS.length), 500);
    return () => clearInterval(id);
  }, [isOptimizing]);

  const label = isOptimizing
    ? STEPS[stepIdx]
    : isOptimized
    ? "Reset Grid Load"
    : "Optimize Grid Load";

  return (
    <button
      onClick={isOptimized ? onReset : onOptimize}
      disabled={isOptimizing}
      className="w-full max-w-md mx-auto bg-primary py-6 flex items-center justify-center gap-4 active:scale-[0.98] transition-all group overflow-hidden shadow-[0_12px_40px_rgba(16,185,129,0.4)] hover:shadow-[0_16px_50px_rgba(16,185,129,0.6)] disabled:opacity-70 disabled:cursor-not-allowed rounded-lg glow-emerald"
    >
      <span className="material-symbols-outlined text-on-primary-fixed text-3xl group-hover:rotate-12 transition-transform">
        {isOptimizing ? "hourglass_empty" : "bolt"}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={label}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
          className="font-headline font-bold text-xl uppercase tracking-[0.2em] text-on-primary-fixed"
        >
          {label}
        </motion.span>
      </AnimatePresence>
      <span className="material-symbols-outlined text-on-primary-fixed text-xl opacity-40">
        chevron_right
      </span>
    </button>
  );
}
