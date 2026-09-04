import React, { useState, useEffect } from 'react';
import { LiveGridTelemetry, ZoneTelemetry } from '../types/grid';
import { api } from '../services/api';
import { SectionHeader } from '../components/common/SectionHeader';
import { DelhiMapSVG } from '../components/grid/DelhiMapSVG';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Activity,
  Layers,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Server
} from 'lucide-react';

export const LiveGridPage: React.FC = () => {
  const [data, setData] = useState<LiveGridTelemetry | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('South');
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getLiveGrid();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedZone = data?.zones.find((z) => z.id === selectedZoneId) || data?.zones[0];

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Live Grid Monitoring • Delhi Distribution Sectors"
        subtitle="Zonal load dispatch telemetry across BRPL, BYPL, TPDDL, and NDMC operational areas"
        actions={
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded text-xs font-semibold tracking-wider uppercase transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </button>
        }
      />

      {/* 5 Operational Zone Summary Cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {data.zones.map((zone) => {
            const isSelected = selectedZoneId === zone.id;
            return (
              <div
                key={zone.id}
                onClick={() => setSelectedZoneId(zone.id)}
                className={`p-3 rounded border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">{zone.name}</span>
                  <StatusBadge status={zone.status} size="sm" />
                </div>
                <div className="text-[10px] text-slate-500 font-medium">{zone.discom}</div>
                <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-slate-100">
                  <span className="text-lg font-bold font-mono-num text-slate-900">
                    {zone.demand_mw.toLocaleString('en-IN')}{' '}
                    <span className="text-xs text-slate-500 font-normal">MW</span>
                  </span>
                  <span className="text-xs font-mono-num font-bold text-slate-700">
                    {zone.load_pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Grid View: SVG Map + Zone Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* SVG Map Section */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Delhi Geographic Grid Sectors (Click Zone to Inspect)
            </span>
            <span className="text-[10px] text-slate-500">
              Active Selection: <strong className="text-blue-700">{selectedZone?.name}</strong>
            </span>
          </div>

          <DelhiMapSVG
            zones={data?.zones || []}
            selectedZoneId={selectedZoneId}
            onSelectZone={(id) => setSelectedZoneId(id)}
          />
        </div>

        {/* Selected Zone Deep Dive Panel */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded p-4 shadow-xs flex flex-col justify-between space-y-3">
          {selectedZone ? (
            <>
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase">
                      {selectedZone.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedZone.discom}</p>
                  </div>
                  <StatusBadge status={selectedZone.status} size="md" />
                </div>

                {/* Quantitative Grid Parameters */}
                <div className="mt-4 space-y-2.5 text-xs">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                    <span className="text-slate-500">Current Load:</span>
                    <span className="text-base font-bold font-mono-num text-slate-900">
                      {selectedZone.demand_mw.toLocaleString('en-IN')} MW
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                    <span className="text-slate-500">Forecast Load:</span>
                    <span className="text-base font-bold font-mono-num text-blue-700">
                      {selectedZone.forecast_mw.toLocaleString('en-IN')} MW
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                    <span className="text-slate-500">Available Capacity:</span>
                    <span className="text-base font-bold font-mono-num text-slate-800">
                      {selectedZone.capacity_mw.toLocaleString('en-IN')} MW
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                    <span className="text-slate-500">Capacity Utilization:</span>
                    <span className="text-base font-bold font-mono-num text-slate-900">
                      {selectedZone.load_pct}%
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                    <span className="text-slate-500">Load Trend:</span>
                    <span className="font-semibold flex items-center gap-1 font-mono-num text-amber-700">
                      {selectedZone.trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
                      {selectedZone.trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
                      {selectedZone.trend === 'stable' && <Minus className="w-3.5 h-3.5" />}
                      {selectedZone.trend.toUpperCase()} (+1.8% / hr)
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                    <span className="text-slate-500">Reactive Power (Q):</span>
                    <span className="font-mono-num font-semibold text-slate-800">
                      {selectedZone.reactive_mvar} MVAR (pf: {selectedZone.power_factor})
                    </span>
                  </div>
                </div>

                {/* Key Substation Nodes */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">
                    Key EHV Substations in Sector
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedZone.key_substations.map((sub, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded text-[11px] font-mono-num"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sector Summary Note */}
              <div className="p-2.5 bg-blue-50/50 border border-blue-200 rounded text-[11px] text-blue-950">
                <span className="font-bold">SLDC Dispatch Note: </span>
                {selectedZone.summary}
              </div>
            </>
          ) : (
            <div className="text-xs text-slate-400 text-center py-20">Select an operational zone</div>
          )}
        </div>
      </div>
    </div>
  );
};
