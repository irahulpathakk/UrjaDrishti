import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Activity,
  GitFork,
  CloudSun,
  AlertTriangle,
  History,
  Cpu,
  Zap,
  Server
} from 'lucide-react';

export type PageTab = 
  | 'overview'
  | 'forecast'
  | 'live_grid'
  | 'feeders'
  | 'weather'
  | 'alerts'
  | 'historical'
  | 'model_performance';

interface SidebarProps {
  activeTab: PageTab;
  setActiveTab: (tab: PageTab) => void;
  openAlertsCount: number;
  isLiveBackend: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  openAlertsCount,
  isLiveBackend
}) => {
  const navItems: Array<{ id: PageTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'forecast', label: 'Demand Forecast', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'live_grid', label: 'Live Grid', icon: <Activity className="w-4 h-4" /> },
    { id: 'feeders', label: 'Feeder Analysis', icon: <GitFork className="w-4 h-4" /> },
    { id: 'weather', label: 'Weather', icon: <CloudSun className="w-4 h-4" /> },
    { id: 'alerts', label: 'Alerts', icon: <AlertTriangle className="w-4 h-4" />, badge: openAlertsCount },
    { id: 'historical', label: 'Historical', icon: <History className="w-4 h-4" /> },
    { id: 'model_performance', label: 'Model Performance', icon: <Cpu className="w-4 h-4" /> }
  ];

  return (
    <aside className="w-60 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center gap-2.5 border-b border-slate-800 bg-slate-950">
        <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
          <Zap className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-sm tracking-wider text-white">
            URJADRISHTI
          </span>
          <span className="text-[9px] uppercase tracking-widest text-slate-400 font-medium">
            Delhi Grid Intelligence
          </span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        <div className="px-2 pb-1.5 text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
          Operations Console
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded transition-colors text-left ${
                isActive
                  ? 'bg-blue-700 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-red-600 text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Operational Telemetry Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 text-[11px] text-slate-400 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">System Status</span>
          <span className="inline-flex items-center gap-1 text-emerald-400 font-mono-num font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Operational
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500">Backend API</span>
          <span className={`font-mono-num ${isLiveBackend ? 'text-blue-400' : 'text-amber-400'}`}>
            {isLiveBackend ? 'FastAPI 8001' : 'Fallback Mock'}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
          <span className="text-slate-500 flex items-center gap-1">
            <Server className="w-3 h-3" />
            Delhi SLDC Desk
          </span>
          <span className="font-mono-num text-slate-400">v2.1.0</span>
        </div>
      </div>
    </aside>
  );
};
