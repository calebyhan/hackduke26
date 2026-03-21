import type { Tab } from "../../App";
import clsx from "clsx";

interface NavbarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function Navbar({ activeTab, onTabChange }: NavbarProps) {
  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#111319] dark:bg-[#111319] border-b border-emerald-500/15 shadow-[0_0_15px_rgba(16,185,129,0.1)] font-['Space_Grotesk'] tracking-tight text-on-surface">
      <div className="flex items-center gap-8">
        <span className="text-2xl font-bold tracking-tighter text-emerald-500 uppercase">GridGhost</span>
        <nav className="hidden md:flex gap-6 items-center h-full pt-1">
          <a className={clsx("uppercase text-xs tracking-widest transition-colors", activeTab === "command" ? "text-emerald-400 border-b-2 border-emerald-500 pb-1 font-bold" : "text-slate-500 hover:text-emerald-300")} onClick={() => onTabChange("command")}>Command</a>
          <a className={clsx("uppercase text-xs tracking-widest transition-colors", activeTab === "analytics" ? "text-emerald-400 border-b-2 border-emerald-500 pb-1 font-bold" : "text-slate-500 hover:text-emerald-300")} onClick={() => onTabChange("analytics")}>Grid Analytics</a>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center bg-surface-container-lowest border border-outline-variant/20 px-3 py-1.5 rounded-sm gap-2">
          <span className="material-symbols-outlined text-sm text-primary">search</span>
          <input className="bg-transparent border-none focus:ring-0 text-xs font-mono w-48 p-0 text-on-surface-variant" placeholder="SYSTEM_QUERY..." type="text"/>
        </div>
        <div className="flex gap-3">
          <button className="p-2 text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all active:scale-95"><span className="material-symbols-outlined">sensors</span></button>
          <button className="p-2 text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all active:scale-95"><span className="material-symbols-outlined">settings</span></button>
          <button className="p-2 text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all active:scale-95"><span className="material-symbols-outlined">account_circle</span></button>
        </div>
      </div>
    </header>
  );
}
