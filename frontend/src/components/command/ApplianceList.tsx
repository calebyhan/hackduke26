import type { Appliance } from "../../types/appliance";
import type { ScheduleEntry } from "../../types/optimize";
import ApplianceCard from "./ApplianceCard";

interface ApplianceListProps {
  appliances: Appliance[];
  schedule: ScheduleEntry[];
}

export default function ApplianceList({
  appliances,
  schedule,
}: ApplianceListProps) {
  const scheduleMap = Object.fromEntries(
    schedule.map((s) => [s.appliance_id, s])
  );

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-text-secondary mb-2">
        Appliances
      </h3>
      {appliances.map((a) => (
        <ApplianceCard
          key={a.id}
          appliance={a}
          scheduleEntry={scheduleMap[a.id]}
        />
      ))}
    </div>
  );
}
