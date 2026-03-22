import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import type { GenerationMixResponse } from "../../types/brief";
import SourceBadge from "../command/SourceBadge";

interface GenerationMixChartProps {
  data: GenerationMixResponse;
}

const FUEL_NAME_MAPPING: Record<string, string> = {
  ng: "Natural Gas",
  wat: "Hydro",
  oth: "Other",
  nuc: "Nuclear",
  geo: "Geothermal",
  wnd: "Wind",
  oil: "Oil",
  col: "Coal",
  sun: "Solar",
};

const FUEL_NORMALIZE: Record<string, string> = {
  ng: "natural_gas",
  wat: "hydro",
  oth: "other",
  nuc: "nuclear",
  geo: "geothermal",
  wnd: "wind",
  oil: "oil",
  col: "coal",
  sun: "solar",
};

const FUEL_COLORS: Record<string, string> = {
  natural_gas: "#9ca3af",
  solar: "#facc15",
  wind: "#06b6d4",
  hydro: "#3b82f6",
  nuclear: "#a855f7",
  imports: "#f97316",
  geothermal: "#ef4444",
  oil: "#4b5563",
  coal: "#1c1917",
  other: "#6b7280",
};

function formatFuelName(fuel: string): string {
  const norm = fuel.toLowerCase();
  if (FUEL_NAME_MAPPING[norm]) return FUEL_NAME_MAPPING[norm];
  return fuel
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function GenerationMixChart({ data }: GenerationMixChartProps) {
  const chartData = data.fuel_mix
    .filter((f) => Math.abs(f.mw) > 0)
    .map((f) => {
      const normalizedFuel = FUEL_NORMALIZE[f.fuel.toLowerCase()] || f.fuel.toLowerCase();
      return {
        name: formatFuelName(f.fuel),
        fuel: normalizedFuel,
        mw: f.mw,
        percent: f.percent,
      };
    });

  const isCiso = data.respondent === "CISO";
  const baseStyle = "rounded-xl p-6 select-none [&_.recharts-wrapper]:outline-none [&_*]:outline-none";
  const containerStyle = isCiso
    ? `bg-bg-card border border-[#2a2b35] shadow-md shadow-black/20 ${baseStyle}`
    : `bg-bg-card border border-border ${baseStyle}`;

  return (
    <div className={containerStyle}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">
          Generation Mix - {data.respondent}
        </h4>
        <SourceBadge source={data.source} />
      </div>
      <ResponsiveContainer width="100%" height={280} className="focus:outline-none">
        <BarChart data={chartData} layout="vertical" style={{ outline: "none" }}>
          <XAxis type="number" tick={{ fontSize: 12, fill: "#ffffff" }} label={{ value: "MW", position: "insideBottomRight", offset: -5, fill: "#ffffff", fontSize: 12 }} />
          <YAxis
            dataKey="name"
            type="category"
            width={100}
            tick={{ fontSize: 12, fill: "#ffffff" }}
          />
          <Tooltip
            cursor={false}
            shared={false}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div
                    style={{
                      background: "#1a1b23",
                      border: "1px solid #2a2b35",
                      borderRadius: 8,
                      padding: 8,
                      color: "#ffffff",
                      fontSize: 14,
                    }}
                  >
                    <p>{`${data.name}: ${Number(payload[0].value).toLocaleString()} MW (${data.percent}%)`}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="mw" radius={[0, 4, 4, 0]} activeBar={false} stroke="#33343b" strokeWidth={1}>
            {chartData.map((entry) => (
              <Cell
                key={entry.fuel}
                fill={FUEL_COLORS[entry.fuel] ?? "#6b7280"}
              />
            ))}
            <LabelList
              dataKey="percent"
              position="right"
              formatter={(value: any) => value != null ? `${value}%` : ""}
              style={{ fontSize: 12, fill: "#ffffff" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
