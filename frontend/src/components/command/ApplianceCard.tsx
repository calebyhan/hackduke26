import clsx from "clsx";
import { motion } from "framer-motion";
import type { Appliance } from "../../types/appliance";
import type { ScheduleEntry } from "../../types/optimize";
import { formatHour } from "../../utils/time";
import { moerToColor, healthScoreToColor } from "../../utils/colors";

interface ApplianceCardProps {
  appliance: Appliance;
  scheduleEntry?: ScheduleEntry;
}

export default function ApplianceCard({
  appliance,
  scheduleEntry,
}: ApplianceCardProps) {
  return (
    <motion.div
      layout
      className={clsx(
        "bg-bg-card rounded-lg p-3 border border-border",
        !appliance.shiftable && "opacity-60"
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{appliance.name}</span>
        <span
          className={clsx(
            "text-[10px] px-1.5 py-0.5 rounded-full",
            appliance.shiftable
              ? "bg-emerald-dim text-emerald"
              : "bg-bg-card-hover text-text-muted"
          )}
        >
          {appliance.shiftable ? "Shiftable" : "Fixed"}
        </span>
      </div>

      <div className="text-xs text-text-muted space-y-0.5">
        <div className="flex justify-between">
          <span>{appliance.duration_minutes} min</span>
          <span>{appliance.power_kw} kW</span>
        </div>

        {scheduleEntry && (
          <>
            <div className="flex justify-between">
              <span>
                {formatHour(scheduleEntry.start)} –{" "}
                {formatHour(scheduleEntry.end)}
              </span>
            </div>
            <div className="flex gap-3 mt-1">
              <span className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{
                    backgroundColor: moerToColor(
                      scheduleEntry.avg_moer_lbs_per_mwh
                    ),
                  }}
                />
                CO₂: {scheduleEntry.avg_moer_lbs_per_mwh}
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{
                    backgroundColor: healthScoreToColor(
                      scheduleEntry.avg_health_score
                    ),
                  }}
                />
                Health: {scheduleEntry.avg_health_score.toFixed(2)}
              </span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
