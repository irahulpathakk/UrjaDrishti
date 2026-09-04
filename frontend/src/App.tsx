import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, PageTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginPage } from './pages/LoginPage';
import { OverviewPage } from './pages/OverviewPage';
import { DemandForecastPage } from './pages/DemandForecastPage';
import { LiveGridPage } from './pages/LiveGridPage';
import { FeederAnalysisPage } from './pages/FeederAnalysisPage';
import { WeatherPage } from './pages/WeatherPage';
import { AlertsPage } from './pages/AlertsPage';
import { HistoricalPage } from './pages/HistoricalPage';
import { ModelPerformancePage } from './pages/ModelPerformancePage';
import { api } from './services/api';
import { OverviewTelemetry } from './types/grid';

export const App: React.FC = () => {
  const [operator, setOperator] = useState<string | null>(() => {
    return sessionStorage.getItem('urjadrishti_operator') || null;
  });
  const [activeTab, setActiveTab] = useState<PageTab>('overview');

  // Operational Telemetry Data & Live Drift
  const [overviewData, setOverviewData] = useState<OverviewTelemetry | null>(null);
  const [loadingOverview, setLoadingOverview] = useState<boolean>(true);
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
  const [openAlertsCount, setOpenAlertsCount] = useState<number>(3);

  // Simulated Live Demand Drift (Small, realistic variations every 30s)
  // e.g. 7,842 -> 7,856 -> 7,849 -> 7,845 -> 7,858 -> 7,851 MW
  const driftSequence = [0, 14, 7, 3, 16, 9, -4, 6, 12, -2];
  const [driftIndex, setDriftIndex] = useState<number>(0);
  const [isDrifting, setIsDrifting] = useState<boolean>(false);

  const currentDrift = driftSequence[driftIndex];

  const fetchOverview = useCallback(async (drift: number = 0) => {
    setLoadingOverview(true);
    try {
      const { data, isLiveBackend: live } = await api.getOverview(drift);
      setOverviewData(data);
      setIsLiveBackend(live);
    } catch (e) {
      console.error('Failed to acquire overview telemetry:', e);
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  const refreshAlertCount = useCallback(async () => {
    try {
      const alerts = await api.getAlerts();
      const openOnes = alerts.filter(a => a.status === 'Open').length;
      setOpenAlertsCount(openOnes);
    } catch {
      // Keep default
    }
  }, []);

  useEffect(() => {
    if (operator) {
      fetchOverview(currentDrift);
      refreshAlertCount();
    }
  }, [operator, fetchOverview, refreshAlertCount]);

  // 30-Second Simulated Live Demand Drift Interval
  useEffect(() => {
    if (!operator) return;

    const interval = setInterval(() => {
      setDriftIndex((prev) => (prev + 1) % driftSequence.length);
      setIsDrifting(true);
      setTimeout(() => setIsDrifting(false), 1500);
    }, 30000); // exactly every 30 seconds

    return () => clearInterval(interval);
  }, [operator, driftSequence.length]);

  // Whenever driftIndex changes, sync overview telemetry smoothly
  useEffect(() => {
    if (operator) {
      fetchOverview(driftSequence[driftIndex]);
    }
  }, [driftIndex, operator, fetchOverview]);

  const handleLogin = (operatorId: string) => {
    sessionStorage.setItem('urjadrishti_operator', operatorId);
    setOperator(operatorId);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('urjadrishti_operator');
    setOperator(null);
  };

  if (!operator) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 text-slate-900 font-sans">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAlertsCount={openAlertsCount}
        isLiveBackend={isLiveBackend}
      />

      {/* Main Operations Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Operational Header */}
        <Header
          activeTab={activeTab}
          onLogout={handleLogout}
          isLiveBackend={isLiveBackend}
          driftValue={currentDrift}
        />

        {/* Dynamic Page Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100">
          <div className="max-w-[1720px] mx-auto">
            {activeTab === 'overview' && (
              <OverviewPage
                data={overviewData}
                loading={loadingOverview}
                onRefresh={() => fetchOverview(currentDrift)}
                isDrifting={isDrifting}
              />
            )}
            {activeTab === 'forecast' && <DemandForecastPage />}
            {activeTab === 'live_grid' && <LiveGridPage />}
            {activeTab === 'feeders' && <FeederAnalysisPage />}
            {activeTab === 'weather' && <WeatherPage />}
            {activeTab === 'alerts' && <AlertsPage />}
            {activeTab === 'historical' && <HistoricalPage />}
            {activeTab === 'model_performance' && <ModelPerformancePage />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
