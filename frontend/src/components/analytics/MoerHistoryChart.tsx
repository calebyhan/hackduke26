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

export default function MoerHistoryChart() {
  const { history, loading } = useMoerHistory();

  const chartData = useMemo(() => {
    if (!history?.points.length) return [];
    const buckets: { label: string; moer: number }[] = [];
    let lastDay = history.points.length ? new Date(history.points[0].time).getDay() : -1;
    for (let i = 0; i < history.points.length; i += 3) {
      const slice = history.points.slice(i, i + 3);
      const avg = slice.reduce((s, p) => s + p.moer_lbs_per_mwh, 0) / slice.length;
      const dt = new Date(slice[0].time);
      
      const currentDay = dt.getDay();
      let label = "";
      if (currentDay !== lastDay) {
        label = DAY_LABELS[currentDay];
        lastDay = currentDay;
      }
      
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
      <div className="bg-bg-card rounded-xl p-6 border border-border flex items-center justify-center h-[220px]">
        <span className="text-text-muted text-sm">Loading 7-day history…</span>
      </div>
    );
  }

  return (
    <div className="bg-bg-card rounded-xl p-6 border border-border select-none [&_.recharts-wrapper]:outline-none [&_*]:outline-none">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium flex items-center">
          MOER Trend (7-day)
          <InfoTooltip content="This charts the 7-day historical trend of the grid's Marginal Operating Emissions Rate (MOER). The dashed line shows the average across the week to help identify consistently clean or dirty periods." />
        </h4>
        <SourceBadge source={history!.source} />
      </div>
      <ResponsiveContainer width="100%" height={180} className="focus:outline-none">
        <AreaChart data={chartData} style={{ outline: "none" }}>
          <defs>
            <linearGradient id="moerGradient7d" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#2a2b35" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            interval={0}
            tickLine={false}
            axisLine={{ stroke: "#2a2b35" }}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: "#9ca3af" }} 
            domain={["auto", "auto"]} 
            tickLine={false}
            axisLine={false}
          />
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
