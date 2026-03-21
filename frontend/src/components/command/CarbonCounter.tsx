import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

interface CarbonCounterProps {
  value: number;
  baselineValue: number;
  isOptimized: boolean;
}

export default function CarbonCounter({
  value,
  baselineValue,
  isOptimized,
}: CarbonCounterProps) {
  const motionValue = useMotionValue(baselineValue);
  const rounded = useTransform(motionValue, (v) => v.toFixed(1));
  const displayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1.5,
      ease: "easeInOut",
    });
    return controls.stop;
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => {
      if (displayRef.current) {
        displayRef.current.textContent = v;
      }
    });
    return unsubscribe;
  }, [rounded]);

  const delta = isOptimized ? value - baselineValue : 0;
  const pct = isOptimized
    ? (((value - baselineValue) / baselineValue) * 100).toFixed(1)
    : null;

  return (
    <div className="flex items-center gap-4">
      <div className="bg-bg-card rounded-xl px-5 py-3 flex items-center gap-3">
        <span className="text-text-muted text-sm">Weekly CO₂</span>
        <span className="text-2xl font-mono font-bold text-text-primary">
          <motion.span ref={displayRef}>{baselineValue.toFixed(1)}</motion.span>
          <span className="text-sm text-text-muted ml-1">lbs</span>
        </span>
      </div>

      {isOptimized && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <span className="text-emerald font-mono font-bold">
            {delta > 0 ? "+" : ""}
            {delta.toFixed(1)} lbs
          </span>
          <span className="text-xs bg-emerald-dim text-emerald px-2 py-0.5 rounded-full">
            {pct}%
          </span>
        </motion.div>
      )}
    </div>
  );
}
