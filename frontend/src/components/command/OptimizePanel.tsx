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
    <button
      onClick={isOptimized ? onReset : onOptimize}
      disabled={isOptimizing}
      className="w-full max-w-md mx-auto bg-primary py-6 flex items-center justify-center gap-4 active:scale-[0.98] transition-all group overflow-hidden shadow-[0_12px_40px_rgba(16,185,129,0.4)] hover:shadow-[0_16px_50px_rgba(16,185,129,0.6)] disabled:opacity-70 disabled:cursor-not-allowed rounded-lg glow-emerald"
    >
      <span className="material-symbols-outlined text-on-primary-fixed text-3xl group-hover:rotate-12 transition-transform">
        {isOptimizing ? 'hourglass' : 'bolt'}
      </span>
      <span className="font-headline font-bold text-xl uppercase tracking-[0.2em] text-on-primary-fixed">
        {isOptimizing ? 'Optimizing...' : isOptimized ? 'Reset Grid Load' : 'Optimize Grid Load'}
      </span>
      <span className="material-symbols-outlined text-on-primary-fixed text-xl opacity-40">chevron_right</span>
    </button>
  );
}
