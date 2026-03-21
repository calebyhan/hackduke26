import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { computeDuckCurve } from "../../utils/communityMath";
import { useMemo } from "react";

interface DuckCurveChartProps {
  n: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111319]/90 border border-[#86948a]/20 rounded px-3 py-2 text-xs font-['Space_Grotesk']">
      <p className="text-[#86948a] mb-1">{label}</p>
      <p className="text-[#f59e0b]">
        Baseline: <span className="font-bold">{payload[0]?.value?.toFixed(1)}</span>
      </p>
      <p className="text-[#4edea3]">
        Optimized: <span className="font-bold">{payload[1]?.value?.toFixed(1)}</span>
      </p>
    </div>
  );
};

export default function DuckCurveChart({ n }: DuckCurveChartProps) {
  const data = useMemo(() => computeDuckCurve(n), [n]);

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-[0.2em] text-[#86948a]">
          CAISO Grid Load Profile
        </span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[10px] text-[#86948a] font-['Space_Grotesk']">
            <span className="w-3 h-0.5 bg-[#f59e0b] inline-block rounded" />
            Unoptimized
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-[#4edea3] font-['Space_Grotesk']">
            <span className="w-3 h-0.5 bg-[#4edea3] inline-block rounded" />
            GridGhost optimized
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="baselineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="optimizedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4edea3" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#4edea3" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="label"
            tick={{ fill: "#86948a", fontSize: 9, fontFamily: "Space Grotesk" }}
            tickLine={false}
            axisLine={{ stroke: "#86948a20" }}
            interval={3}
          />
          <YAxis
            tick={{ fill: "#86948a", fontSize: 9, fontFamily: "Space Grotesk" }}
            tickLine={false}
            axisLine={false}
            domain={[30, 100]}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Evening peak reference band */}
          <ReferenceLine
            x="17:00"
            stroke="#f59e0b"
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.3}
            label={{ value: "Peak", fill: "#f59e0b", fontSize: 8, fontFamily: "Space Grotesk" }}
          />

          <Area
            type="monotone"
            dataKey="baseline"
            stroke="#f59e0b"
            strokeWidth={1.5}
            fill="url(#baselineGrad)"
            animationDuration={400}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="optimized"
            stroke="#4edea3"
            strokeWidth={2}
            fill="url(#optimizedGrad)"
            animationDuration={400}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      <p className="text-[9px] text-[#86948a]/50 font-['Space_Grotesk'] text-right">
        Normalized load units · GridGhost uses staggered dispatch windows to prevent synchronization rebound
      </p>
    </div>
  );
}
