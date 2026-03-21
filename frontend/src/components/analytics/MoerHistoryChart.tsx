import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { useMemo } from "react";
import { useMoerHistory } from "../../hooks/useMoerHistory";
import SourceBadge from "../command/SourceBadge";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MoerHistoryChart() {
  const { history, loading } = useMoerHistory();

  const chartData = useMemo(() => {
    if (!history?.points.length) return [];
    // Group into 3-hour buckets for readability (56 points over 7 days)
    const buckets: { label: string; moer: number }[] = [];
    for (let i = 0; i < history.points.length; i += 3) {
      const slice = history.points.slice(i, i + 3);
      const avg = slice.reduce((s, p) => s + p.moer_lbs_per_mwh, 0) / slice.length;
      const dt = new Date(slice[0].time);
      const dayName = DAY_LABELS[dt.getUTCDay()];
      const hour = dt.getUTCHours();
      // Only label midnight ticks
      const label = hour === 0 ? dayName : "";
      buckets.push({ label, moer: Math.round(avg) });
    }
    return buckets;
  }, [history]);

  const avgMoer = useMemo(() => {
    if (!chartData.length) return null;
    return Math.round(chartData.reduce((s, p) => s + p.moer, 0) / chartData.length);
  }, [chartData]);

  if (loading || !chartData.length) {
    return (
      <div className="bg-bg-card rounded-xl p-4 border border-border flex items-center justify-center h-[220px]">
        <span className="text-text-muted text-sm">Loading 7-day history…</span>
      </div>
    );
  }

  return (
    <div className="bg-bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">MOER Trend (7-day)</h4>
        <SourceBadge source={history!.source} />
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="moerGradient7d" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#2a2b35" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            interval={0}
          />
          <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{
              background: "#1a1b23",
              border: "1px solid #2a2b35",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value) => [`${value} lbs/MWh`, "MOER"]}
            labelFormatter={() => ""}
          />
          {avgMoer && (
            <ReferenceLine
              y={avgMoer}
              stroke="#6b7280"
              strokeDasharray="4 4"
              label={{ value: `avg ${avgMoer}`, position: "insideTopRight", fontSize: 9, fill: "#6b7280" }}
            />
          )}
          <Area
            type="monotone"
            dataKey="moer"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#moerGradient7d)"
            dot={false}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
