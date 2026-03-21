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
    <div className="bg-bg-card rounded-xl p-4 border border-border">
      <h4 className="text-sm font-medium mb-3">
        CO₂ vs Health Signal (24h)
      </h4>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={chartData}>
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
