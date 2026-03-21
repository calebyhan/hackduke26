import { useMemo } from "react";

interface NeighborhoodMapProps {
  activeCount: number; // 0–48
}

const COLS = 8;
const ROWS = 6;
const TOTAL = COLS * ROWS;
const HOUSE_W = 36;
const HOUSE_H = 32;
const GAP_X = 16;
const GAP_Y = 20;
const SVG_W = COLS * (HOUSE_W + GAP_X) - GAP_X;
const SVG_H = ROWS * (HOUSE_H + GAP_Y) - GAP_Y + 40; // extra for substation

// Deterministic shuffle using seeded index so house order is stable across renders
function seededOrder(total: number): number[] {
  const arr = Array.from({ length: total }, (_, i) => i);
  // Simple deterministic shuffle (not random — same order every time)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (i * 1103515245 + 12345) % arr.length;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const ACTIVATION_ORDER = seededOrder(TOTAL);

function HouseIcon({
  x,
  y,
  active,
  index,
}: {
  x: number;
  y: number;
  active: boolean;
  index: number;
}) {
  const color = active ? "#4edea3" : "#3a4a42";
  const glowId = `glow-${index}`;

  // House path: roof (triangle) + body (rect) as a single outline
  const rx = x + HOUSE_W / 2;
  const roofPoints = `${rx},${y} ${x + HOUSE_W},${y + 12} ${x},${y + 12}`;
  const doorX = x + HOUSE_W / 2 - 4;
  const doorY = y + 20;

  return (
    <g style={{ transition: "all 0.4s ease" }}>
      {active && (
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      )}
      {/* Glow halo behind house when active */}
      {active && (
        <rect
          x={x - 3}
          y={y - 3}
          width={HOUSE_W + 6}
          height={HOUSE_H + 6}
          rx={3}
          fill="#4edea3"
          opacity={0.08}
        />
      )}
      {/* Roof */}
      <polygon
        points={roofPoints}
        fill="none"
        stroke={color}
        strokeWidth={active ? 1.5 : 1}
        opacity={active ? 1 : 0.3}
        style={{ transition: "all 0.4s ease" }}
      />
      {/* Body */}
      <rect
        x={x}
        y={y + 12}
        width={HOUSE_W}
        height={HOUSE_H - 12}
        fill="none"
        stroke={color}
        strokeWidth={active ? 1.5 : 1}
        opacity={active ? 1 : 0.3}
        style={{ transition: "all 0.4s ease" }}
      />
      {/* Door */}
      <rect
        x={doorX}
        y={doorY}
        width={8}
        height={HOUSE_H - 12 - (doorY - (y + 12))}
        fill={active ? "#4edea3" : "none"}
        stroke={color}
        strokeWidth={active ? 1 : 0.5}
        opacity={active ? 0.6 : 0.2}
        style={{ transition: "all 0.4s ease" }}
      />
      {/* Window */}
      <rect
        x={x + 4}
        y={y + 14}
        width={7}
        height={6}
        fill={active ? "#4edea320" : "none"}
        stroke={color}
        strokeWidth={0.5}
        opacity={active ? 0.8 : 0.15}
        style={{ transition: "all 0.4s ease" }}
      />
    </g>
  );
}

export default function NeighborhoodMap({ activeCount }: NeighborhoodMapProps) {
  const activeSet = useMemo(() => {
    const set = new Set<number>();
    for (let i = 0; i < Math.min(activeCount, TOTAL); i++) {
      set.add(ACTIVATION_ORDER[i]);
    }
    return set;
  }, [activeCount]);

  const houses = useMemo(() => {
    return Array.from({ length: TOTAL }, (_, idx) => {
      const col = idx % COLS;
      const row = Math.floor(idx / COLS);
      const x = col * (HOUSE_W + GAP_X);
      const y = row * (HOUSE_H + GAP_Y);
      return { idx, x, y, active: activeSet.has(idx) };
    });
  }, [activeSet]);

  // Power line Y position — runs horizontally between rows 2 and 3, and 4 and 5
  const lineY1 = 2 * (HOUSE_H + GAP_Y) - GAP_Y / 2 + 4;
  const lineY2 = 4 * (HOUSE_H + GAP_Y) - GAP_Y / 2 + 4;

  // Substation position — centered below the grid
  const substationX = SVG_W / 2 - 20;
  const substationY = ROWS * (HOUSE_H + GAP_Y) - GAP_Y + 6;

  const activeRatio = activeCount / TOTAL;
  const lineColor = activeRatio > 0.5 ? "#4edea3" : "#3a4a42";
  const lineOpacity = 0.2 + activeRatio * 0.4;

  return (
    <div className="w-full flex justify-center">
      <svg
        viewBox={`-10 -10 ${SVG_W + 20} ${SVG_H + 20}`}
        width="100%"
        style={{ maxWidth: 560 }}
        aria-label="Neighborhood grid visualization"
      >
        {/* Background subtle grid */}
        <defs>
          <pattern id="micro-grid" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#86948a" strokeWidth="0.2" opacity="0.15" />
          </pattern>
        </defs>
        <rect x="-10" y="-10" width={SVG_W + 20} height={SVG_H + 20} fill="url(#micro-grid)" />

        {/* Power lines */}
        {[lineY1, lineY2].map((ly, i) => (
          <g key={i}>
            <line
              x1={0} y1={ly} x2={SVG_W} y2={ly}
              stroke={lineColor}
              strokeWidth={1}
              opacity={lineOpacity}
              strokeDasharray="4 3"
              style={{ transition: "all 0.6s ease" }}
            />
            {/* Poles */}
            {Array.from({ length: COLS }, (_, c) => (
              <line
                key={c}
                x1={c * (HOUSE_W + GAP_X) + HOUSE_W / 2}
                y1={ly}
                x2={c * (HOUSE_W + GAP_X) + HOUSE_W / 2}
                y2={ly + 8}
                stroke={lineColor}
                strokeWidth={0.8}
                opacity={lineOpacity * 0.7}
                style={{ transition: "all 0.6s ease" }}
              />
            ))}
          </g>
        ))}

        {/* Substation */}
        <g>
          <rect
            x={substationX}
            y={substationY}
            width={40}
            height={24}
            rx={2}
            fill="none"
            stroke={lineColor}
            strokeWidth={1.2}
            opacity={lineOpacity + 0.1}
            style={{ transition: "all 0.6s ease" }}
          />
          <text
            x={substationX + 20}
            y={substationY + 14}
            textAnchor="middle"
            fill={lineColor}
            fontSize={5}
            fontFamily="Space Grotesk, monospace"
            opacity={0.6}
            style={{ transition: "all 0.6s ease" }}
          >
            SUBSTATION
          </text>
          {/* Feed line from substation up to bottom power line */}
          <line
            x1={substationX + 20}
            y1={substationY}
            x2={SVG_W / 2}
            y2={lineY2}
            stroke={lineColor}
            strokeWidth={0.8}
            opacity={lineOpacity * 0.5}
            strokeDasharray="3 2"
            style={{ transition: "all 0.6s ease" }}
          />
        </g>

        {/* Houses */}
        {houses.map(({ idx, x, y, active }) => (
          <HouseIcon key={idx} x={x} y={y} active={active} index={idx} />
        ))}
      </svg>
    </div>
  );
}
