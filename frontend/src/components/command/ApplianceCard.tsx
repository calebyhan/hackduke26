import clsx from "clsx";
import { motion } from "framer-motion";
import type { Appliance } from "../../types/appliance";
import type { ScheduleEntry } from "../../types/optimize";

interface ApplianceCardProps {
  appliance: Appliance;
  scheduleEntry?: ScheduleEntry;
}

const APPLIANCE_DETAILS: Record<string, { name: string; fleetId: string; icon: string; borderColor: string }> = {
  ev: { name: "Tesla Model 3", fleetId: "EV-9402", icon: "ev_charger", borderColor: "border-primary-container" },
  washer: { name: "Main Washer", fleetId: "WH-1102", icon: "local_laundry_service", borderColor: "border-secondary-container" },
  dishwasher: { name: "Dishwasher", fleetId: "DW-0041", icon: "dishwasher", borderColor: "border-outline-variant/30" },
};

export default function ApplianceCard({
  appliance,
  scheduleEntry,
}: ApplianceCardProps) {
  const details = APPLIANCE_DETAILS[appliance.id] || { name: appliance.name, fleetId: "UNKNOWN", icon: "device_unknown", borderColor: "border-outline-variant/30" };

  const status = scheduleEntry ? "Scheduled" : appliance.id === "dishwasher" ? "Inactive" : "Standby";
  const statusColor = scheduleEntry ? "bg-primary-container/20 text-primary" : appliance.id === "dishwasher" ? "bg-surface-container-highest text-on-surface-variant" : "bg-secondary-container/20 text-secondary";

  return (
    <motion.div
      layout
      className={clsx(
        "surface-container bg-[#1e1f26] p-4 flex flex-col gap-4 border-l-2 hover:bg-surface-container-high transition-colors",
        details.borderColor
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 bg-surface-container-highest flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">{details.icon}</span>
          </div>
          <div>
            <h3 className="font-headline font-bold text-sm tracking-tight">{details.name}</h3>
            <span className="block text-[10px] uppercase font-mono text-on-surface-variant/60">Fleet ID: {details.fleetId}</span>
          </div>
        </div>
        <div className="text-right">
          <span className={clsx("inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter", statusColor)}>{status}</span>
        </div>
      </div>
      {scheduleEntry ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-lowest p-2">
            <span className="block text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Window</span>
            <span className="block font-mono text-xs">{scheduleEntry.start.slice(11,16)} — {scheduleEntry.end.slice(11,16)}</span>
          </div>
          <div className="bg-surface-container-lowest p-2">
            <span className="block text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Duration</span>
            <span className="block font-mono text-xs">{Math.floor(appliance.duration_minutes / 60)}h {appliance.duration_minutes % 60}m</span>
          </div>
        </div>
      ) : appliance.id === "dishwasher" ? (
        <div className="flex justify-between items-center pt-2 border-t border-outline-variant/10">
          <span className="text-[10px] text-on-surface-variant/40 italic">No cycles pending for today.</span>
          <button className="px-3 py-1 bg-surface-container-highest text-[10px] font-bold uppercase tracking-widest hover:bg-outline-variant/20 transition-colors">Schedule</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-lowest p-2">
            <span className="block text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Next Start</span>
            <span className="block font-mono text-xs">Today, 22:15</span>
          </div>
          <div className="bg-surface-container-lowest p-2">
            <span className="block text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Est. Savings</span>
            <span className="block font-mono text-xs text-primary">$1.42</span>
          </div>
        </div>
      )}
      {scheduleEntry && (
        <div className="flex justify-between items-center pt-2 border-t border-outline-variant/10">
          <div className="flex gap-4">
            <div>
              <span className="block text-[9px] uppercase tracking-widest text-on-surface-variant">CO2 Score</span>
              <span className="font-headline font-bold text-primary tnum">{Math.round(scheduleEntry.avg_moer_lbs_per_mwh)}<span className="text-[10px] font-normal text-on-surface-variant/60">/100</span></span>
            </div>
            <div>
              <span className="block text-[9px] uppercase tracking-widest text-on-surface-variant">Health Impact</span>
              <span className="font-headline font-bold text-secondary tnum">{scheduleEntry.avg_health_score.toFixed(0)}<span className="text-[10px] font-normal text-on-surface-variant/60">/100</span></span>
            </div>
          </div>
          <button className="material-symbols-outlined text-on-surface-variant/40 hover:text-primary transition-colors">edit_square</button>
        </div>
      )}
    </motion.div>
  );
}
