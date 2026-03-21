import { useState } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import type { Appliance } from "../../types/appliance";
import type { ScheduleEntry } from "../../types/optimize";

interface ApplianceCardProps {
  appliance: Appliance;
  scheduleEntry?: ScheduleEntry;
  onUpdate: (changes: Partial<Appliance>) => void;
  onUpdateEntry: (startHHMM: string) => void;
  onDelete: () => void;
}

// Must stay in sync with CHIP_IDENTITY_COLORS in Timeline.tsx
const APPLIANCE_DETAILS: Record<string, { fleetId: string; icon: string; accentColor: string }> = {
  ev:         { fleetId: "EV-9402", icon: "ev_charger",            accentColor: "#3b82f6" },
  washer:     { fleetId: "WH-1102", icon: "local_laundry_service", accentColor: "#06b6d4" },
  dishwasher: { fleetId: "DW-0041", icon: "dishwasher",            accentColor: "#8b5cf6" },
  dryer:      { fleetId: "DR-0212", icon: "dry",                   accentColor: "#f97316" },
  hvac:       { fleetId: "HV-0001", icon: "hvac",                  accentColor: "#6b7280" },
};

function getDetails(id: string) {
  return APPLIANCE_DETAILS[id] ?? {
    fleetId: id.replace(/_/g, "-").toUpperCase().slice(0, 10),
    icon: "electrical_services",
    accentColor: "#6b7280",
  };
}

const INPUT_CLS =
  "w-full bg-surface-container-lowest px-2 py-1 text-xs font-mono border border-outline-variant/20 focus:border-primary/50 focus:outline-none";

export default function ApplianceCard({
  appliance,
  scheduleEntry,
  onUpdate,
  onUpdateEntry,
  onDelete,
}: ApplianceCardProps) {
  const details = getDetails(appliance.id);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(appliance.name);
  const [editDuration, setEditDuration] = useState(appliance.duration_minutes);
  const [editStart, setEditStart] = useState(
    scheduleEntry ? scheduleEntry.start.slice(11, 16) : "18:00"
  );
  const [editShiftable, setEditShiftable] = useState(appliance.shiftable);

  const handleEdit = () => {
    setEditName(appliance.name);
    setEditDuration(appliance.duration_minutes);
    setEditStart(scheduleEntry ? scheduleEntry.start.slice(11, 16) : "18:00");
    setEditShiftable(appliance.shiftable);
    setIsEditing(true);
  };

  const handleCancel = () => setIsEditing(false);

  const handleSave = () => {
    const nameChanged = editName.trim() !== appliance.name;
    const durationChanged = editDuration !== appliance.duration_minutes;
    const shiftableChanged = editShiftable !== appliance.shiftable;
    const startChanged = scheduleEntry && editStart !== scheduleEntry.start.slice(11, 16);

    if (nameChanged || durationChanged || shiftableChanged) {
      onUpdate({
        name: editName.trim() || appliance.name,
        duration_minutes: Math.max(1, editDuration),
        shiftable: editShiftable,
      });
    }
    if (startChanged) {
      onUpdateEntry(editStart);
    }
    setIsEditing(false);
  };

  const status = scheduleEntry ? "Scheduled" : "Standby";
  const statusColor = scheduleEntry
    ? "bg-primary-container/20 text-primary"
    : "bg-secondary-container/20 text-secondary";

  // CO₂ score: normalize MOER 200–1100 range to 0–100 (lower MOER = higher score)
  const co2Score = scheduleEntry
    ? Math.max(0, Math.min(100, Math.round(100 - (scheduleEntry.avg_moer_lbs_per_mwh - 200) / 9)))
    : null;

  // Grid impact: avg_health_score 0–1 where lower = cleaner. Invert for display.
  const cleanScore = scheduleEntry
    ? Math.round((1 - scheduleEntry.avg_health_score) * 100)
    : null;
  const cleanColor =
    cleanScore === null ? "text-on-surface-variant" :
    cleanScore >= 60 ? "text-emerald-400" :
    cleanScore >= 35 ? "text-amber-400" : "text-red-400";

  return (
    <motion.div
      layout
      className="surface-container bg-[#1e1f26] p-4 flex flex-col gap-4 border-l-2 hover:bg-surface-container-high transition-colors"
      style={{ borderLeftColor: details.accentColor }}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 bg-surface-container-highest flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">{details.icon}</span>
          </div>
          <div>
            <h3 className="font-headline font-bold text-sm tracking-tight">{appliance.name}</h3>
            <span className="block text-[10px] uppercase font-mono text-on-surface-variant/60">
              Fleet ID: {details.fleetId}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={clsx("inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter", statusColor)}>
            {status}
          </span>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="material-symbols-outlined text-on-surface-variant/40 hover:text-primary transition-colors text-base"
            >
              edit_square
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        /* ── Edit mode ── */
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Name</label>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Duration (min)</label>
              <input
                type="number"
                min={1}
                value={editDuration}
                onChange={(e) => setEditDuration(Math.max(1, Number(e.target.value)))}
                className={INPUT_CLS}
              />
            </div>
            {scheduleEntry && (
              <div>
                <label className="block text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Window Start (UTC)</label>
                <input
                  type="time"
                  value={editStart}
                  onChange={(e) => setEditStart(e.target.value)}
                  className={INPUT_CLS}
                />
              </div>
            )}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={editShiftable}
              onChange={(e) => setEditShiftable(e.target.checked)}
              className="accent-primary"
            />
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Shiftable</span>
          </label>
          <div className="flex justify-between items-center pt-2 border-t border-outline-variant/10">
            <button
              onClick={onDelete}
              className="text-[10px] uppercase font-bold tracking-widest text-red-400/60 hover:text-red-400 transition-colors"
            >
              Delete
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-[10px] uppercase font-bold text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-[10px] uppercase font-bold bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : scheduleEntry ? (
        /* ── Scheduled view ── */
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest p-2">
              <span className="block text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Window</span>
              <span className="block font-mono text-xs">
                {scheduleEntry.start.slice(11, 16)} — {scheduleEntry.end.slice(11, 16)}
              </span>
            </div>
            <div className="bg-surface-container-lowest p-2">
              <span className="block text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Duration</span>
              <span className="block font-mono text-xs">
                {Math.floor(appliance.duration_minutes / 60)}h {appliance.duration_minutes % 60}m
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-outline-variant/10">
            <div className="flex gap-4">
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-on-surface-variant">CO₂ Score</span>
                <span className="font-headline font-bold text-primary tnum">
                  {co2Score}<span className="text-[10px] font-normal text-on-surface-variant/60">/100</span>
                </span>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-on-surface-variant">Cleanliness</span>
                <span className={clsx("font-headline font-bold tnum", cleanColor)}>
                  {cleanScore}<span className="text-[10px] font-normal text-on-surface-variant/60">/100</span>
                </span>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ── Standby view ── */
        <div className="flex justify-between items-center pt-2 border-t border-outline-variant/10">
          <span className="text-[10px] text-on-surface-variant/40 italic">Not yet scheduled.</span>
          <span className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest">Run optimize</span>
        </div>
      )}
    </motion.div>
  );
}
