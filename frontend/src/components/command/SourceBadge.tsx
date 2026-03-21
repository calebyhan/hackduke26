import clsx from "clsx";

interface SourceBadgeProps {
  source: string;
}

const colorMap: Record<string, string> = {
  live: "bg-emerald-dim text-emerald",
  cache: "bg-amber-dim text-amber",
  fixture: "bg-bg-card-hover text-text-muted",
  fallback: "bg-bg-card-hover text-text-muted",
};

export default function SourceBadge({ source }: SourceBadgeProps) {
  return (
    <span
      className={clsx(
        "text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider",
        colorMap[source] ?? colorMap.fixture
      )}
    >
      {source}
    </span>
  );
}
