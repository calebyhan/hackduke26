import type { Tab } from "../../App";
import clsx from "clsx";
import { useForecast } from "../../hooks/useForecast";
import { moerToColor, moerToLabel } from "../../utils/colors";

interface NavbarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const { forecast } = useForecast();
  const currentPoint = forecast.points[0];
  const moer = currentPoint?.moer_lbs_per_mwh;
  const moerColor = moer != null ? moerToColor(moer) : "#6b7280";
  const moerLabel = moer != null ? moerToLabel(moer) : null;

  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#111319] dark:bg-[#111319] border-b border-emerald-500/15 shadow-[0_0_15px_rgba(16,185,129,0.1)] font-['Space_Grotesk'] tracking-tight text-on-surface">
      <div className="flex items-center gap-8">
        <span className="text-2xl font-bold tracking-tighter text-emerald-500 uppercase">GridGhost</span>
        <nav className="hidden md:flex gap-6 items-center h-full pt-1">
          <a className={clsx("uppercase text-xs tracking-widest transition-colors", activeTab === "command" ? "text-emerald-400 border-b-2 border-emerald-500 pb-1 font-bold" : "text-slate-500 hover:text-emerald-300")} onClick={() => onTabChange("command")}>Command</a>
          <a className={clsx("uppercase text-xs tracking-widest transition-colors", activeTab === "analytics" ? "text-emerald-400 border-b-2 border-emerald-500 pb-1 font-bold" : "text-slate-500 hover:text-emerald-300")} onClick={() => onTabChange("analytics")}>Grid Analytics</a>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        {moer != null && (
          <div className="flex items-center gap-2 text-sm">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: moerColor }}
            />
            <span className="font-mono text-text-primary">
              {Math.round(moer)}{" "}
              <span className="text-text-muted text-xs">lbs/MWh</span>
            </span>
            <span className="text-xs text-text-muted capitalize">{moerLabel}</span>
          </div>
        )}

        <div className="flex bg-bg-card rounded-lg p-0.5">
          {(["command", "analytics"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={clsx(
                "px-4 py-1.5 text-sm rounded-md transition-colors capitalize",
                activeTab === tab
                  ? "bg-bg-card-hover text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              {tab === "command" ? "Command" : "Grid Analytics"}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
