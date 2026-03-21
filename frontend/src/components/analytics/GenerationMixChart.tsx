import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { GenerationMixResponse } from "../../types/brief";
import SourceBadge from "../command/SourceBadge";

interface GenerationMixChartProps {
  data: GenerationMixResponse;
}

const FUEL_COLORS: Record<string, string> = {
  natural_gas: "#9ca3af",
  solar: "#facc15",
  wind: "#06b6d4",
  hydro: "#3b82f6",
  nuclear: "#a855f7",
  imports: "#f97316",
  other: "#6b7280",
};

function formatFuelName(fuel: string): string {
  return fuel
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function GenerationMixChart({ data }: GenerationMixChartProps) {
  const chartData = data.fuel_mix.map((f) => ({
    name: formatFuelName(f.fuel),
    fuel: f.fuel,
    mw: f.mw,
    percent: f.percent,
  }));

  return (
    <div className="bg-bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">
          Generation Mix — {data.respondent}
        </h4>
        <SourceBadge source={data.source} />
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} layout="vertical">
          <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} />
          <YAxis
            dataKey="name"
            type="category"
            width={85}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
          />
          <Tooltip
            contentStyle={{
              background: "#1a1b23",
              border: "1px solid #2a2b35",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value, _name, entry) => [
              `${Number(value).toLocaleString()} MW (${(entry as { payload: { percent: number } }).payload.percent}%)`,
              "Generation",
            ]}
          />
          <Bar dataKey="mw" radius={[0, 4, 4, 0]}>
            {chartData.map((entry) => (
              <Cell
                key={entry.fuel}
                fill={FUEL_COLORS[entry.fuel] ?? "#6b7280"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
