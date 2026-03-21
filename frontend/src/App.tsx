import { useState } from "react";
import Navbar from "./components/layout/Navbar";
import CommandView from "./components/command/CommandView";
import AnalyticsView from "./components/analytics/AnalyticsView";

export type Tab = "command" | "analytics";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("command");

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="px-4 pb-8 max-w-[1400px] mx-auto">
        {activeTab === "command" ? <CommandView /> : <AnalyticsView />}
      </main>
    </div>
  );
}
