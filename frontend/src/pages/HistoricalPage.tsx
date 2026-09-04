import React, { useState, useEffect } from 'react';
import { HistoricalTelemetry } from '../types/grid';
import { api } from '../services/api';
import { SectionHeader } from '../components/common/SectionHeader';
import { KPICard } from '../components/common/KPICard';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { Calendar, History, Trophy, TrendingUp, Clock, RefreshCw } from 'lucide-react';

export const HistoricalPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [data, setData] = useState<HistoricalTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getHistorical(timeRange);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const ranges: Array<{ id: '7d' | '30d' | '90d' | '1y'; label: string }> = [
    { id: '7d', label: 'Past 7 Days' },
    { id: '30d', label: 'Past 30 Days' },
    { id: '90d', label: 'Past 90 Days' },
    { id: '1y', label: 'Past 1 Year' }
  ];

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Historical Load Analytics & Multi-Year Trends"
        subtitle="Long-term demand aggregation, diurnal peak hour probability, and Year-over-Year (YoY) grid growth analysis"
        actions={
          <div className="inline-flex rounded border border-slate-300 p-0.5 bg-white text-xs shadow-2xs">
            {ranges.map((r) => (
              <button
                key={r.id}
                onClick={() => setTimeRange(r.id)}
                className={`px-3 py-1 font-semibold rounded transition-colors ${
                  timeRange === r.id
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Useful Statistics KPI Row */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <KPICard
            label="Highest Recorded Peak"
            value={data.highest_recorded_demand_mw}
            unit="MW"
            subtext={data.highest_recorded_date}
            trend="up"
            trendText="All-Time Delhi Record"
          />

          <KPICard
            label="Average Peak Demand"
            value={data.average_peak_mw}
            unit="MW"
            subtext={`Across ${timeRange} window`}
            trend="stable"
          />

          <KPICard
            label="YoY Peak Growth"
            value={data.peak_growth_pct}
            subtext="Baseline FY 2024–2026"
            trend="up"
            trendText="Summer CAGR"
          />

          <KPICard
            label="Average Temperature"
            value={`${data.average_temperature_c}°C`}
            subtext="Mean atmospheric temp"
            trend="stable"
          />

          <KPICard
            label="Most Frequent Peak"
            value={data.most_frequent_peak_hour}
            subtext="Dual-peak behavior"
            trend="stable"
            trendText="Afternoon + Night"
          />
        </div>
      )}

      {/* Daily Peak Demand & Average Demand Trend Chart */}
      {data && (
        <div className="bg-white border border-slate-200 rounded p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 mb-3 gap-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Daily Peak Demand vs. Daily Average Demand ({timeRange.toUpperCase()})
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Evaluates load factor fluctuation and peak-to-average ratio in NCT of Delhi
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-red-600" />
                <span className="text-slate-600 font-medium">Daily Peak (MW)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-blue-600 stroke-dash" />
                <span className="text-slate-600 font-medium">Daily Average (MW)</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data.daily_trend}
                margin={{ top: 15, right: 15, left: 0, bottom: 5 }}
              >
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis
                  domain={[4500, 9000]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  unit=" MW"
                  tickFormatter={(v) => v.toLocaleString('en-IN')}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                  formatter={(val: any, name: any) => [`${val.toLocaleString('en-IN')} MW`, name]}
                />
                <ReferenceLine
                  y={8656}
                  stroke="#991b1b"
                  strokeDasharray="4 4"
                  label={{ value: 'All-Time Record 8,656 MW', fill: '#991b1b', fontSize: 10, position: 'insideTopRight' }}
                />
                <Line
                  type="monotone"
                  dataKey="peak_demand_mw"
                  name="Daily Peak"
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={{ r: 2, fill: '#dc2626' }}
                />
                <Line
                  type="monotone"
                  dataKey="avg_demand_mw"
                  name="Daily Average"
                  stroke="#2563eb"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 2-Column Row: Peak Hour Distribution & Year-over-Year Comparison */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Peak Hour Distribution Histogram */}
          <div className="bg-white border border-slate-200 rounded p-4 shadow-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100 mb-2">
              Delhi Peak Hour Occurrence Distribution
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              Percentage frequency of annual peak load occurrence by hour of day (IST)
            </p>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.peak_hour_distribution}
                  margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
                >
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '11px' }}
                    formatter={(val: any) => [`${val}% of Days`, 'Peak Frequency']}
                  />
                  <Bar dataKey="pct" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
              <span>Primary peak: <strong>15:30 IST</strong> (Commercial AC)</span>
              <span>Secondary peak: <strong>22:00 IST</strong> (Domestic AC)</span>
            </div>
          </div>

          {/* Year-over-Year (YoY) Peak Comparison */}
          <div className="bg-white border border-slate-200 rounded p-4 shadow-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100 mb-2">
              Year-over-Year Monthly Peak Demand (2024 vs 2025 vs 2026)
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              Summer surge comparison in Megawatts across consecutive fiscal cycles
            </p>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.yoy_comparison}
                  margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                >
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis
                    domain={[5000, 9000]}
                    tick={{ fontSize: 10 }}
                    unit=" MW"
                    tickFormatter={(v) => v.toLocaleString('en-IN')}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '11px' }}
                    formatter={(val: any, name: any) => [`${val.toLocaleString('en-IN')} MW`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="year_2024" name="Summer 2024" fill="#94a3b8" />
                  <Bar dataKey="year_2025" name="Summer 2025" fill="#38bdf8" />
                  <Bar dataKey="year_2026" name="Summer 2026" fill="#1d4ed8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              Note: June 2024 registered the historic heatwave record of 8,656 MW.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
