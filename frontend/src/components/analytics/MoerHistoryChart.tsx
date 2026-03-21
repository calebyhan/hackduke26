import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useMemo } from "react";
import type { ForecastResponse } from "../../types/forecast";
import { formatHourShort } from "../../utils/time";

interface MoerHistoryChartProps {
  forecast: ForecastResponse;
}

export default function MoerHistoryChart({ forecast }: MoerHistoryChartProps) {
  // Use hourly averages
  const chartData = useMemo(() => {
    const hourly: { time: string; moer: number }[] = [];
    for (let i = 0; i < forecast.points.length; i += 12) {
      const slice = forecast.points.slice(i, i + 12);
      const avg =
        slice.reduce((s, p) => s + p.moer_lbs_per_mwh, 0) / slice.length;
      hourly.push({
        time: formatHourShort(slice[0].start),
        moer: Math.round(avg),
      });
    }
    return hourly;
  }, [forecast.points]);

  return (
    <div className="bg-bg-card rounded-xl p-4 border border-border">
      <h4 className="text-sm font-medium mb-3">MOER Trend (24h)</h4>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="moerGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#2a2b35" strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            interval={2}
          />
          <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
          <Tooltip
            contentStyle={{
              background: "#1a1b23",
              border: "1px solid #2a2b35",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value) => [`${value} lbs/MWh`, "MOER"]}
          />
          <Area
            type="monotone"
            dataKey="moer"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#moerGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
