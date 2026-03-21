import { useState } from "react";

export default function AutomationCta() {
  const [autoEnabled, setAutoEnabled] = useState(false);

  return (
    <div className="bg-bg-card rounded-lg p-4 border border-border relative">
      <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded bg-amber-dim text-amber font-medium">
        DEMO ONLY
      </span>

      <h4 className="text-sm font-medium mb-3">Automation</h4>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">
            Enable Auto-Schedule
          </span>
          <button
            onClick={() => setAutoEnabled(!autoEnabled)}
            className={`w-10 h-5 rounded-full transition-colors relative ${
              autoEnabled ? "bg-emerald" : "bg-bg-card-hover"
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                autoEnabled ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <button className="w-full text-xs text-accent border border-accent/30 rounded-md py-2 hover:bg-accent/10 transition-colors">
          Check Utility Program Eligibility
        </button>
      </div>

      <p className="text-[10px] text-text-muted mt-3 italic">
        This module is a demonstration mock. No device control or utility
        enrollment is performed.
      </p>
    </div>
  );
}
