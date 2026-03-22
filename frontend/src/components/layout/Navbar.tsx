import type { Tab } from "../../App";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { useSignalIndex } from "../../hooks/useSignalIndex";
import { moerToColor, moerToLabel } from "../../utils/colors";

interface NavbarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const { moer } = useSignalIndex();
  const moerColor = moer != null ? moerToColor(moer) : "#6b7280";
  const moerLabel = moer != null ? moerToLabel(moer) : null;

  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#111319] dark:bg-[#111319] border-b border-emerald-500/15 shadow-[0_0_15px_rgba(16,185,129,0.1)] font-['Space_Grotesk'] tracking-tight text-on-surface">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-2xl font-bold tracking-tighter text-emerald-500 uppercase hover:text-emerald-400 transition-colors">GridGhost</Link>
        <nav className="hidden md:flex gap-6 items-center h-full pt-1">
          <a className={clsx("uppercase text-xs tracking-widest transition-colors cursor-pointer border-b-2 pb-1", activeTab === "command" ? "text-emerald-400 border-emerald-500 font-bold" : "text-slate-500 border-transparent hover:text-emerald-300")} onClick={() => onTabChange("command")}>Command</a>
          <a className={clsx("uppercase text-xs tracking-widest transition-colors cursor-pointer border-b-2 pb-1", activeTab === "analytics" ? "text-emerald-400 border-emerald-500 font-bold" : "text-slate-500 border-transparent hover:text-emerald-300")} onClick={() => onTabChange("analytics")}>Grid Analytics</a>
          <a className={clsx("uppercase text-xs tracking-widest transition-colors cursor-pointer border-b-2 pb-1", activeTab === "community" ? "text-emerald-400 border-emerald-500 font-bold" : "text-slate-500 border-transparent hover:text-emerald-300")} onClick={() => onTabChange("community")}>Impact</a>
        </nav>
      </div>

      <div className="flex items-center gap-4">
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

        <div className="flex items-center gap-1">
          <span title="IoT device sync — coming soon" className="w-9 h-9 flex items-center justify-center rounded-full text-slate-600 cursor-default">
            <span className="material-symbols-outlined text-[20px]">sensors</span>
          </span>
          <span title="Notifications — coming soon" className="w-9 h-9 flex items-center justify-center rounded-full text-slate-600 cursor-default">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </span>
          <span title="Account — coming soon" className="w-9 h-9 flex items-center justify-center rounded-full text-slate-600 cursor-default">
            <span className="material-symbols-outlined text-[20px]">account_circle</span>
          </span>
        </div>
      </div>
    </header>
  );
}
