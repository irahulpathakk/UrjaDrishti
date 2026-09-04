import React, { useState, useEffect } from 'react';
import { PageTab } from './Sidebar';
import { ShieldCheck, User, LogOut, Radio } from 'lucide-react';

interface HeaderProps {
  activeTab: PageTab;
  onLogout: () => void;
  isLiveBackend: boolean;
  driftValue: number;
}

const tabTitles: Record<PageTab, string> = {
  overview: 'Overview',
  forecast: 'Demand Forecast',
  live_grid: 'Live Grid Monitoring',
  feeders: 'Feeder & Area Analysis',
  weather: 'Weather & Sensitivity',
  alerts: 'Operational Alerts',
  historical: 'Historical Analytics',
  model_performance: 'ML Model Performance'
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onLogout,
  isLiveBackend,
  driftValue
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-5 flex items-center justify-between flex-shrink-0">
      {/* Left: Title & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 tracking-tight">
            <span>Delhi Power Demand Intelligence</span>
            <span className="text-slate-300">/</span>
            <span className="text-blue-700 font-bold">{tabTitles[activeTab]}</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono-num">
            NCT of Delhi SLDC • Transmission & DISCOM Control Room
          </div>
        </div>
      </div>

      {/* Right side operational telemetry & user */}
      <div className="flex items-center gap-4 text-xs">
        {/* Live Drift Telemetry Indicator */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-[11px] font-mono-num text-slate-600">
          <Radio className="w-3 h-3 text-blue-600 animate-pulse" />
          <span>Telemetry Drift:</span>
          <span className="font-semibold text-slate-800">
            {driftValue >= 0 ? `+${driftValue} MW` : `${driftValue} MW`}
          </span>
        </div>

        {/* System Status */}
        <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
          <span className="hidden sm:inline">System</span> Operational
        </div>

        {/* Timestamp */}
        <div className="text-slate-600 font-mono-num text-right hidden sm:block">
          <div className="text-[10px] uppercase text-slate-500">Last updated</div>
          <div className="font-bold text-slate-800">{currentTime || '20:24:12'} IST</div>
        </div>

        {/* Operator Info */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-7 h-7 rounded bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="hidden lg:block text-left">
            <div className="font-semibold text-slate-800 text-xs">Grid Operations</div>
            <div className="text-[10px] text-slate-500 font-mono-num">SLDC-OP-408</div>
          </div>
        </div>

        {/* Sign Out button */}
        <button
          onClick={onLogout}
          title="Sign out from Grid Console"
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
