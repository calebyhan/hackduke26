import React from 'react';
import type { Tab } from '../../App';
import clsx from 'clsx';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-[#111319]/80 backdrop-blur-xl border-t border-[#86948a]/15 shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
      <a className={clsx("flex flex-col items-center justify-center rounded-sm px-4 py-1 active:scale-90 transition-transform", activeTab === "command" ? "bg-[#10b981]/10 text-[#4edea3] shadow-[0_0_12px_rgba(16,185,129,0.2)]" : "text-[#e2e2eb]/40 hover:bg-[#1e1f26] hover:text-[#4edea3]")} onClick={() => onTabChange("command")}>
        <span className="material-symbols-outlined">dashboard</span>
        <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest mt-1">Fleet</span>
      </a>
      <a className={clsx("flex flex-col items-center justify-center rounded-sm px-4 py-1 active:scale-90 transition-transform", activeTab === "analytics" ? "bg-[#10b981]/10 text-[#4edea3] shadow-[0_0_12px_rgba(16,185,129,0.2)]" : "text-[#e2e2eb]/40 hover:bg-[#1e1f26] hover:text-[#4edea3]")} onClick={() => onTabChange("analytics")}>
        <span className="material-symbols-outlined">electric_bolt</span>
        <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest mt-1">Grid</span>
      </a>
      <a className="flex flex-col items-center justify-center text-[#e2e2eb]/40 px-4 py-1 hover:bg-[#1e1f26] hover:text-[#4edea3] active:scale-90 transition-transform">
        <span className="material-symbols-outlined">timeline</span>
        <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest mt-1">Forecast</span>
      </a>
      <a className="flex flex-col items-center justify-center text-[#e2e2eb]/40 px-4 py-1 hover:bg-[#1e1f26] hover:text-[#4edea3] active:scale-90 transition-transform">
        <span className="material-symbols-outlined">settings</span>
        <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest mt-1">Settings</span>
      </a>
    </nav>
  );
}