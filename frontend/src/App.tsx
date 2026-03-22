import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
import LandingPage from "./pages/LandingPage";
import TechnologyPage from "./pages/TechnologyPage";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import CommandView from "./components/command/CommandView";
import AnalyticsView from "./components/analytics/AnalyticsView";
import CommunityView from "./components/community/CommunityView";

export type Tab = "command" | "analytics" | "community";

function Dashboard() {
  const [activeTab, setActiveTab] = React.useState<Tab>("command");

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <div className="min-h-screen">
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />
      <main className="pt-16">
        {activeTab === "command" && <CommandView />}
        {activeTab === "analytics" && <AnalyticsView />}
        {activeTab === "community" && <CommunityView />}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/technology" element={<TechnologyPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
