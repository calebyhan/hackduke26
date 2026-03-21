import React from "react";
import Navbar from "./components/layout/Navbar";
import CommandView from "./components/command/CommandView";
import AnalyticsView from "./components/analytics/AnalyticsView";

export type Tab = "command" | "analytics";

export default function App() {
  const [activeTab, setActiveTab] = React.useState<Tab>("command");

  return (
    <div className="min-h-screen">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="pt-16">
        {activeTab === "command" ? <CommandView /> : <AnalyticsView />}
      </main>
    </div>
  );
}
