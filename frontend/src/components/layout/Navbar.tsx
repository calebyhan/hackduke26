import type { Tab } from "../../App";
import clsx from "clsx";

interface NavbarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function Navbar({ activeTab, onTabChange }: NavbarProps) {
  return (
    <nav className="border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold tracking-tight">GridGhost</h1>
        <span className="text-xs bg-emerald-dim text-emerald px-2 py-0.5 rounded-full font-mono">
          CAISO_NORTH
        </span>
      </div>

      <div className="flex items-center gap-6">
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
    </nav>
  );
}
