import { useState } from "react";
import type { Appliance } from "../../types/appliance";
import type { ScheduleEntry } from "../../types/optimize";
import ApplianceCard from "./ApplianceCard";

interface ApplianceListProps {
  appliances: Appliance[];
  schedule: ScheduleEntry[];
  onUpdateAppliance: (id: string, changes: Partial<Appliance>) => void;
  onUpdateEntry: (id: string, startHHMM: string) => void;
  onAddAppliance: (appliance: Appliance) => void;
  onDeleteAppliance: (id: string) => void;
}

const INPUT_CLS =
  "w-full bg-surface-container-lowest px-2 py-1 text-xs font-mono border border-outline-variant/20 focus:border-primary/50 focus:outline-none";

export default function ApplianceList({
  appliances,
  schedule,
  onUpdateAppliance,
  onUpdateEntry,
  onAddAppliance,
  onDeleteAppliance,
}: ApplianceListProps) {
  const scheduleMap = Object.fromEntries(schedule.map((s) => [s.appliance_id, s]));

  const [showAdd, setShowAdd] = useState(false);
  const [atBottom, setAtBottom] = useState(false);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    setAtBottom(el.scrollHeight - el.scrollTop <= el.clientHeight + 2);
  }
  const [newName, setNewName] = useState("");
  const [newDuration, setNewDuration] = useState(60);
  const [newPower, setNewPower] = useState(1.0);
  const [newShiftable, setNewShiftable] = useState(true);

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    const id =
      name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") +
      "_" +
      Date.now().toString(36);
    onAddAppliance({
      id,
      name,
      shiftable: newShiftable,
      duration_minutes: Math.max(1, newDuration),
      power_kw: Math.max(0.1, newPower),
      dependencies: [],
    });
    setNewName("");
    setNewDuration(60);
    setNewPower(1.0);
    setNewShiftable(true);
    setShowAdd(false);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Scrollable card list with bottom fade */}
      <div className="relative">
        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-2" onScroll={handleScroll}>
          {appliances.map((a) => (
            <ApplianceCard
              key={a.id}
              appliance={a}
              scheduleEntry={scheduleMap[a.id]}
              onUpdate={(changes) => onUpdateAppliance(a.id, changes)}
              onUpdateEntry={(startHHMM) => onUpdateEntry(a.id, startHHMM)}
              onDelete={() => onDeleteAppliance(a.id)}
            />
          ))}
        </div>
        {/* Fade overlay at bottom — hides when scrolled to end */}
        {!atBottom && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#13141a] to-transparent" />
        )}
      </div>

      {/* Add form — outside scroll */}
      {showAdd && (
        <div className="bg-[#1e1f26] border-l-2 border-dashed border-outline-variant/40 p-4 flex flex-col gap-3">
          <span className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">New Appliance</span>
          <div>
            <label className="block text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Name</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Water Heater"
              className={INPUT_CLS}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Duration (min)</label>
              <input
                type="number"
                min={1}
                value={newDuration}
                onChange={(e) => setNewDuration(Math.max(1, Number(e.target.value)))}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Power (kW)</label>
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={newPower}
                onChange={(e) => setNewPower(Math.max(0.1, Number(e.target.value)))}
                className={INPUT_CLS}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={newShiftable}
              onChange={(e) => setNewShiftable(e.target.checked)}
              className="accent-primary"
            />
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Shiftable</span>
          </label>
          <div className="flex justify-end gap-2 pt-1 border-t border-outline-variant/10">
            <button
              onClick={() => setShowAdd(false)}
              className="px-3 py-1 text-[10px] uppercase font-bold text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="px-3 py-1 text-[10px] uppercase font-bold bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-40 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Add button — always outside scroll */}
      {!showAdd && (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full border border-dashed border-outline-variant/30 py-2 text-[10px] uppercase tracking-widest text-on-surface-variant/40 hover:text-on-surface-variant hover:border-outline-variant/60 transition-colors flex items-center justify-center gap-1"
        >
          <span className="material-symbols-outlined text-sm leading-none">add</span>
          Add Appliance
        </button>
      )}
    </div>
  );
}
