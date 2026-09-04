import React, { useState, useEffect } from 'react';
import { ForecastResponse } from '../types/grid';
import { api } from '../services/api';
import { SectionHeader } from '../components/common/SectionHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { Calendar, Filter, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

export const DemandForecastPage: React.FC = () => {
  const [horizon, setHorizon] = useState<'24h' | '7d'>('24h');
  const [area, setArea] = useState<string>('Delhi');
  const [date, setDate] = useState<string>('2026-09-04');
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getForecast(horizon, area);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [horizon, area]);

  const areas = ['Delhi', 'North', 'South', 'East', 'West'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <SectionHeader
        title="Demand Forecast Workspace"
        subtitle="Multi-horizon probabilistic load prediction with 95% confidence intervals and peak margin analytics"
      />

      {/* Operational Top Controls Bar */}
      <div className="bg-white border border-slate-200 rounded p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        {/* Horizon Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Horizon:
          </span>
          <div className="inline-flex rounded border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              onClick={() => setHorizon('24h')}
              className={`px-3 py-1 font-semibold rounded transition-colors ${
                horizon === '24h'
                  ? 'bg-blue-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Next 24 Hours
            </button>
            <button
              onClick={() => setHorizon('7d')}
              className={`px-3 py-1 font-semibold rounded transition-colors ${
                horizon === '7d'
                  ? 'bg-blue-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Next 7 Days
            </button>
          </div>
        </div>

        {/* Area Filter Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Area:
          </span>
          <div className="inline-flex rounded border border-slate-200 p-0.5 bg-slate-50 text-xs">
            {areas.map((a) => (
              <button
                key={a}
                onClick={() => setArea(a)}
                className={`px-2.5 py-1 font-semibold rounded transition-colors ${
                  area === a
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {a === 'Delhi' ? 'NCT Delhi' : a}
              </button>
            ))}
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-xs font-mono-num border border-slate-300 rounded px-2.5 py-1 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 text-slate-800"
          />
          <button
            onClick={loadData}
            className="p-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded"
            title="Refresh Forecast"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Confidence Interval Summary Callout Strip */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200 rounded p-3">
            <div className="text-[10px] uppercase font-bold text-slate-500">
              {area} Operating Capacity
            </div>
            <div className="text-xl font-bold font-mono-num text-slate-900 mt-1">
              {data.capacity_mw.toLocaleString('en-IN')} <span className="text-xs text-slate-500 font-normal">MW</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Assigned transmission limit</div>
          </div>

          <div className="bg-white border border-slate-200 rounded p-3">
            <div className="text-[10px] uppercase font-bold text-slate-500">
              Lower Bound (95% CI)
            </div>
            <div className="text-xl font-bold font-mono-num text-slate-700 mt-1">
              {data.lower_bound_mw.toLocaleString('en-IN')} <span className="text-xs text-slate-500 font-normal">MW</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">-2.1% lower confidence limit</div>
          </div>

          <div className="bg-white border border-blue-200 bg-blue-50/40 rounded p-3">
            <div className="text-[10px] uppercase font-bold text-blue-900">
              Peak Forecast Value
            </div>
            <div className="text-xl font-bold font-mono-num text-blue-700 mt-1">
              {data.current_peak_forecast_mw.toLocaleString('en-IN')} <span className="text-xs text-blue-900 font-normal">MW</span>
            </div>
            <div className="text-[11px] text-blue-800 font-medium mt-0.5">XGBoost model point estimate</div>
          </div>

          <div className="bg-white border border-slate-200 rounded p-3">
            <div className="text-[10px] uppercase font-bold text-slate-500">
              Upper Bound (95% CI)
            </div>
            <div className="text-xl font-bold font-mono-num text-red-700 mt-1">
              {data.upper_bound_mw.toLocaleString('en-IN')} <span className="text-xs text-slate-500 font-normal">MW</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">+2.2% upper thermal stress limit</div>
          </div>
        </div>
      )}

      {/* Main Forecast Chart with Confidence Band */}
      {data && (
        <div className="bg-white border border-slate-200 rounded p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 mb-3 gap-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                {horizon === '24h'
                  ? `24-Hour Probabilistic Demand Forecast • ${area}`
                  : `7-Day Forward Dispatch Horizon • ${area}`}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Shaded band represents ±1.96σ empirical residual confidence interval
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-blue-600" />
                <span className="text-slate-600 font-medium">Model Forecast</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-2 bg-blue-200/60 border border-blue-400" />
                <span className="text-slate-600 font-medium">95% Confidence Band</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-red-600 stroke-dash" />
                <span className="text-red-700 font-medium">Thermal Capacity</span>
              </div>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {horizon === '24h' ? (
                <ComposedChart
                  data={data.curve_24h}
                  margin={{ top: 15, right: 20, left: 0, bottom: 5 }}
                >
                  <XAxis dataKey="timestamp" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    unit=" MW"
                    tickFormatter={(val) => val.toLocaleString('en-IN')}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <ReferenceLine
                    y={data.capacity_mw}
                    stroke="#dc2626"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{ value: 'Capacity Limit', fill: '#dc2626', fontSize: 10, position: 'insideTopRight' }}
                  />
                  {/* Upper Bound & Lower Bound Confidence Area */}
                  <Area
                    type="monotone"
                    dataKey="upper_bound"
                    stroke="none"
                    fill="#93c5fd"
                    fillOpacity={0.25}
                    name="Upper Bound (95% CI)"
                  />
                  <Area
                    type="monotone"
                    dataKey="lower_bound"
                    stroke="none"
                    fill="#ffffff"
                    fillOpacity={1.0}
                    name="Lower Bound (95% CI)"
                  />
                  {/* Forecast Line */}
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    name="Demand Forecast"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  {/* Actual demand up to current hour */}
                  <Line
                    type="monotone"
                    dataKey="actual"
                    name="Actual Telemetry"
                    stroke="#0f172a"
                    strokeWidth={2.5}
                    connectNulls={false}
                    dot={{ r: 2.5, fill: '#0f172a' }}
                  />
                </ComposedChart>
              ) : (
                <ComposedChart
                  data={data.seven_day_curve}
                  margin={{ top: 15, right: 20, left: 0, bottom: 5 }}
                >
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    unit=" MW"
                    tickFormatter={(val) => val.toLocaleString('en-IN')}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <ReferenceLine
                    y={data.capacity_mw}
                    stroke="#dc2626"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{ value: 'Capacity Limit', fill: '#dc2626', fontSize: 10, position: 'insideTopRight' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="upper_bound"
                    stroke="none"
                    fill="#93c5fd"
                    fillOpacity={0.25}
                    name="Upper Bound"
                  />
                  <Area
                    type="monotone"
                    dataKey="lower_bound"
                    stroke="none"
                    fill="#ffffff"
                    fillOpacity={1.0}
                    name="Lower Bound"
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast_peak"
                    name="Predicted Peak"
                    stroke="#b91c1c"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#b91c1c' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast_avg"
                    name="Average Load"
                    stroke="#2563eb"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={{ r: 2, fill: '#2563eb' }}
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 7-Day Forward Forecast Table */}
      {data && (
        <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
              7-Day Operational Peak Forecast Table • {area}
            </div>
            <div className="text-[11px] text-slate-500">
              Risk assessment based on Delhi SLDC reserve criteria
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Day</th>
                  <th className="py-2.5 px-3 text-right">Predicted Peak</th>
                  <th className="py-2.5 px-3">Peak Window</th>
                  <th className="py-2.5 px-3 text-right">Avg Demand</th>
                  <th className="py-2.5 px-3 text-right">Capacity Margin</th>
                  <th className="py-2.5 px-3 text-center">Operational Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {data.seven_day_table.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/80 transition-colors font-medium"
                  >
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{row.date}</td>
                    <td className="py-2.5 px-3 text-slate-500">{row.day_name}</td>
                    <td className="py-2.5 px-3 text-right font-mono-num font-bold text-slate-900">
                      {row.predicted_peak_mw.toLocaleString('en-IN')} MW
                    </td>
                    <td className="py-2.5 px-3 font-mono-num text-slate-700">{row.peak_time} IST</td>
                    <td className="py-2.5 px-3 text-right font-mono-num text-slate-600">
                      {row.avg_demand_mw.toLocaleString('en-IN')} MW
                    </td>
                    <td className={`py-2.5 px-3 text-right font-mono-num font-bold ${
                      row.capacity_margin_mw < 250 ? 'text-red-700' : row.capacity_margin_mw < 500 ? 'text-amber-700' : 'text-slate-700'
                    }`}>
                      {row.capacity_margin_mw.toLocaleString('en-IN')} MW
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <StatusBadge status={row.risk} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
