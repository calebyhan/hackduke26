import { useCallback } from "react";
import { ADOPTION_PRESETS, formatAdoptionLabel } from "../../utils/communityMath";

interface AdoptionSliderProps {
  value: number;
  onChange: (n: number) => void;
}

const MIN_LOG = Math.log10(100);
const MAX_LOG = Math.log10(100_000);

function logToLinear(log: number): number {
  return Math.round(Math.pow(10, log));
}

function linearToLog(n: number): number {
  return Math.log10(Math.max(100, n));
}

export default function AdoptionSlider({ value, onChange }: AdoptionSliderProps) {
  const sliderVal = linearToLog(value);

  const handleSlider = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(logToLinear(parseFloat(e.target.value)));
    },
    [onChange]
  );

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Label */}
      <div className="flex items-baseline justify-between">
        <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-[0.2em] text-[#86948a]">
          Adoption Scale
        </span>
        <span className="font-mono text-2xl font-bold text-[#4edea3]">
          {formatAdoptionLabel(value)}
          <span className="text-sm text-[#86948a] ml-1 font-normal">households</span>
        </span>
      </div>

      {/* Slider */}
      <div className="relative w-full">
        <input
          type="range"
          min={MIN_LOG}
          max={MAX_LOG}
          step={0.001}
          value={sliderVal}
          onChange={handleSlider}
          className="w-full h-1 appearance-none cursor-pointer rounded-full"
          style={{
            background: `linear-gradient(to right, #4edea3 0%, #4edea3 ${
              ((sliderVal - MIN_LOG) / (MAX_LOG - MIN_LOG)) * 100
            }%, #1e2a24 ${
              ((sliderVal - MIN_LOG) / (MAX_LOG - MIN_LOG)) * 100
            }%, #1e2a24 100%)`,
          }}
        />
        <style>{`
          input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #4edea3;
            box-shadow: 0 0 10px rgba(78,222,163,0.5);
            cursor: pointer;
          }
          input[type=range]::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #4edea3;
            box-shadow: 0 0 10px rgba(78,222,163,0.5);
            cursor: pointer;
            border: none;
          }
        `}</style>
      </div>

      {/* Preset buttons */}
      <div className="flex gap-2">
        {ADOPTION_PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => onChange(preset)}
            className={`flex-1 py-1.5 rounded text-xs font-['Space_Grotesk'] uppercase tracking-widest transition-all ${
              value === preset
                ? "bg-[#4edea3]/15 text-[#4edea3] border border-[#4edea3]/40"
                : "bg-[#1e1f26] text-[#86948a] border border-[#86948a]/20 hover:border-[#4edea3]/30 hover:text-[#4edea3]/70"
            }`}
          >
            {formatAdoptionLabel(preset)}
          </button>
        ))}
      </div>
    </div>
  );
}
