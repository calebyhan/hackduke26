import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useMemo } from "react";
import type { ForecastResponse } from "../../types/forecast";
import { formatHourShort } from "../../utils/time";

interface DualSignalChartProps {
  forecast: ForecastResponse;
}

function InfoTooltip({ content }: { content: string }) {
  return (
    <div className="group relative inline-flex items-center ml-2 align-middle">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9ca3af] hover:text-white transition-colors cursor-help">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#1a1b23] border border-[#2a2b35] rounded-lg shadow-xl text-xs text-[#f3f4f6] font-normal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
        {content}
      </div>
    </div>
  );
}

export default function DualSignalChart({ forecast }: DualSignalChartProps) {
  // Downsample to hourly for chart readability
  const chartData = useMemo(() => {
    const hourly: {
      time: string;
      moer: number;
      health: number;
    }[] = [];
    for (let i = 0; i < forecast.points.length; i += 12) {
      const slice = forecast.points.slice(i, i + 12);
      const avgMoer =
        slice.reduce((s, p) => s + p.moer_lbs_per_mwh, 0) / slice.length;
      const avgHealth =
        slice.reduce((s, p) => s + p.health_score, 0) / slice.length;
      hourly.push({
        time: formatHourShort(slice[0].start),
        moer: Math.round(avgMoer),
        health: parseFloat(avgHealth.toFixed(2)),
      });
    }
    return hourly;
  }, [forecast.points]);

  return (
    <div className="bg-bg-card rounded-xl p-6 border border-border select-none [&_.recharts-wrapper]:outline-none [&_*]:outline-none">
      <h4 className="text-sm font-medium mb-3 flex items-center">
        CO₂ vs Health Signal (24h)
        <InfoTooltip content="This chart compares the Marginal Operating Emissions Rate (MOER), representing CO₂ intensity, with a Health Score that indicates the optimal timeframe for energy usage. A higher health score means cleaner power!" />
      </h4>
      <ResponsiveContainer width="100%" height={220} className="focus:outline-none">
        <ComposedChart data={chartData} style={{ outline: "none" }}>
          <CartesianGrid stroke="#2a2b35" strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            interval={2}
          />
          <YAxis
            yAxisId="moer"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            label={{
              value: "MOER (lbs/MWh)",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 10, fill: "#9ca3af" },
            }}
          />
          <YAxis
            yAxisId="health"
            orientation="right"
            domain={[0, 1]}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            label={{
              value: "Health Score",
              angle: 90,
              position: "insideRight",
              style: { fontSize: 10, fill: "#9ca3af" },
            }}
          />
          <Tooltip
            contentStyle={{
              background: "#1a1b23",
              border: "1px solid #2a2b35",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Line
            yAxisId="moer"
            type="monotone"
            dataKey="moer"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            activeDot={false}
            name="MOER"
          />
          <Line
            yAxisId="health"
            type="monotone"
            dataKey="health"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            activeDot={false}
            name="Health"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
