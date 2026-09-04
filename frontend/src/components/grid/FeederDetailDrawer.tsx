import React from 'react';
import { FeederTelemetry } from '../../types/grid';
import { StatusBadge } from '../common/StatusBadge';
import { X, AlertCircle, Info, Zap, TrendingUp, Activity } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine
} from 'recharts';

interface FeederDetailDrawerProps {
  feeder: FeederTelemetry | null;
  onClose: () => void;
}

export const FeederDetailDrawer: React.FC<FeederDetailDrawerProps> = ({ feeder, onClose }) => {
  if (!feeder) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono-num font-bold text-base text-blue-400">{feeder.id}</span>
            <StatusBadge status={feeder.status} size="sm" />
          </div>
          <div className="text-xs text-slate-300 font-medium mt-0.5">{feeder.name}</div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Feeder Hierarchy & Attributes */}
        <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Operating Zone</span>
            <span className="font-medium text-slate-900">{feeder.area}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">DISCOM Jurisdiction</span>
            <span className="font-medium text-slate-900">{feeder.discom}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Feeding Substation</span>
            <span className="font-medium text-slate-900">{feeder.substation}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Operating Voltage</span>
            <span className="font-mono-num font-medium text-slate-900">{feeder.voltage_kv} kV</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Power Factor (cos φ)</span>
            <span className="font-mono-num font-medium text-slate-900">{feeder.power_factor}</span>
          </div>
        </div>

        {/* 4 Core Telemetry Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white border border-slate-200 rounded p-2.5">
            <div className="text-[10px] uppercase font-semibold text-slate-500">Current Load</div>
            <div className="text-lg font-bold font-mono-num text-slate-900">
              {feeder.current_load_mw} <span className="text-xs font-normal text-slate-500">MW</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Utilization: <span className="font-mono-num font-semibold">{feeder.utilization_pct}%</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded p-2.5">
            <div className="text-[10px] uppercase font-semibold text-slate-500">Peak Forecast</div>
            <div className="text-lg font-bold font-mono-num text-amber-700">
              {feeder.forecast_peak_mw} <span className="text-xs font-normal text-slate-500">MW</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Thermal Cap: <span className="font-mono-num font-semibold">{feeder.capacity_mw} MW</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded p-2.5">
            <div className="text-[10px] uppercase font-semibold text-slate-500">Capacity Margin</div>
            <div className={`text-lg font-bold font-mono-num ${
              feeder.capacity_margin_mw < 5 ? 'text-red-700' : 'text-slate-900'
            }`}>
              {feeder.capacity_margin_mw} <span className="text-xs font-normal text-slate-500">MW</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Buffer to Trip</div>
          </div>

          <div className="bg-white border border-slate-200 rounded p-2.5">
            <div className="text-[10px] uppercase font-semibold text-slate-500">Historical Peak</div>
            <div className="text-lg font-bold font-mono-num text-slate-800">
              {feeder.historical_peak_mw} <span className="text-xs font-normal text-slate-500">MW</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Recorded Summer 2024</div>
          </div>
        </div>

        {/* 24-Hour Demand Curve */}
        <div className="bg-white border border-slate-200 rounded p-3">
          <div className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-tight flex items-center justify-between">
            <span>24-Hour Feeder Demand Curve</span>
            <span className="text-[10px] text-slate-500 font-normal">Thermal limit: {feeder.capacity_mw} MW</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={feeder.hourly_curve || []}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickMargin={4} />
                <YAxis domain={[0, Math.ceil(feeder.capacity_mw * 1.1)]} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} MW`, 'Demand']}
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '11px' }}
                />
                <ReferenceLine
                  y={feeder.capacity_mw}
                  stroke="#dc2626"
                  strokeDasharray="3 3"
                  label={{ value: 'Capacity', fill: '#dc2626', fontSize: 9, position: 'insideTopRight' }}
                />
                <Line
                  type="monotone"
                  dataKey="demand_mw"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actionable Load Balancing Recommendation */}
        <div className="bg-amber-50 border border-amber-300 rounded p-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
            <AlertCircle className="w-4 h-4 text-amber-700" />
            <span>OPERATIONAL RECOMMENDATION (ADVISORY ONLY)</span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed font-medium">
            "{feeder.recommendation}"
          </p>
          <div className="mt-2 text-[10px] text-amber-800 bg-amber-100/70 p-1.5 rounded border border-amber-200">
            Note: This is an automated analytical advisory. All actual switching or SCADA breaker trips must adhere to Delhi Transco / SLDC standard operating protocols.
          </div>
        </div>
      </div>
    </div>
  );
};
