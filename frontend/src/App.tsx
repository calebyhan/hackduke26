import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import TechnologyPage from "./pages/TechnologyPage";
import Navbar from "./components/layout/Navbar";
import CommandView from "./components/command/CommandView";
import AnalyticsView from "./components/analytics/AnalyticsView";
import CommunityView from "./components/community/CommunityView";

export type Tab = "command" | "analytics" | "community";

function Dashboard() {
  const [activeTab, setActiveTab] = React.useState<Tab>("command");

  return (
    <div className="min-h-screen">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="pt-16">
        {activeTab === "command" && <CommandView />}
        {activeTab === "analytics" && <AnalyticsView />}
        {activeTab === "community" && <CommunityView />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/technology" element={<TechnologyPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
