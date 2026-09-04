import React, { useState, useEffect, useMemo } from 'react';
import { FeederTelemetry } from '../types/grid';
import { api } from '../services/api';
import { SectionHeader } from '../components/common/SectionHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { FeederDetailDrawer } from '../components/grid/FeederDetailDrawer';
import {
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

type SortField = 'id' | 'area' | 'current_load_mw' | 'forecast_peak_mw' | 'capacity_mw' | 'utilization_pct' | 'status';

export const FeederAnalysisPage: React.FC = () => {
  const [feeders, setFeeders] = useState<FeederTelemetry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFeeder, setSelectedFeeder] = useState<FeederTelemetry | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [areaFilter, setAreaFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [minUtilization, setMinUtilization] = useState<number>(0);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('utilization_pct');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getFeeders();
      setFeeders(res);
      // Auto-select FD-204 initially for demonstration
      if (!selectedFeeder && res.length > 0) {
        const defaultFeeder = res.find(f => f.id === 'FD-204') || res[0];
        const detail = await api.getFeederById(defaultFeeder.id);
        setSelectedFeeder(detail);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectFeeder = async (f: FeederTelemetry) => {
    const detail = await api.getFeederById(f.id);
    setSelectedFeeder(detail || f);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filteredFeeders = useMemo(() => {
    return feeders
      .filter((f) => {
        const matchesSearch =
          f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.substation.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesArea = areaFilter === 'All' || f.area.toLowerCase().includes(areaFilter.toLowerCase());
        const matchesStatus = statusFilter === 'All' || f.status.toUpperCase() === statusFilter.toUpperCase();
        const matchesUtil = f.utilization_pct >= minUtilization;
        return matchesSearch && matchesArea && matchesStatus && matchesUtil;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];
        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [feeders, searchTerm, areaFilter, statusFilter, minUtilization, sortField, sortAsc]);

  const areas = ['All', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi'];
  const statuses = ['All', 'NORMAL', 'WATCH', 'HIGH', 'CRITICAL'];

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Feeder-Level Load Analysis & Advisory"
        subtitle="Operational telemetry for 33kV & 11kV primary distribution feeders across Delhi DISCOM grids"
        actions={
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded text-xs font-semibold tracking-wider uppercase transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync Feeders
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter feeder ID, name, or substation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Area filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold text-[11px] uppercase">Area:</span>
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="px-2 py-1 border border-slate-300 rounded bg-slate-50 text-xs font-medium text-slate-800"
            >
              {areas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold text-[11px] uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1 border border-slate-300 rounded bg-slate-50 text-xs font-medium text-slate-800"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Min Utilization Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold text-[11px] uppercase">Min Load:</span>
            <select
              value={minUtilization}
              onChange={(e) => setMinUtilization(Number(e.target.value))}
              className="px-2 py-1 border border-slate-300 rounded bg-slate-50 text-xs font-medium text-slate-800 font-mono-num"
            >
              <option value={0}>All (&gt; 0%)</option>
              <option value={75}>&gt;= 75%</option>
              <option value={85}>&gt;= 85% (High)</option>
              <option value={90}>&gt;= 90% (Critical)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase text-[10px] tracking-wider select-none">
                <th
                  onClick={() => handleSort('id')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Feeder</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('area')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Area</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('current_load_mw')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Current Load</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('forecast_peak_mw')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Forecast Peak</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('capacity_mw')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Capacity</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('utilization_pct')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Utilization</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center">Trend</th>
                <th
                  onClick={() => handleSort('status')}
                  className="py-2.5 px-3 text-center cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {filteredFeeders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400 text-xs">
                    No feeders match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredFeeders.map((feeder) => {
                  const isSelected = selectedFeeder?.id === feeder.id;
                  return (
                    <tr
                      key={feeder.id}
                      onClick={() => handleSelectFeeder(feeder)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50/60 font-semibold' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono-num font-bold text-blue-700">
                        {feeder.id}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">{feeder.area}</td>
                      <td className="py-2.5 px-3 text-right font-mono-num text-slate-900">
                        {feeder.current_load_mw} MW
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-num font-bold text-amber-800">
                        {feeder.forecast_peak_mw} MW
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-num text-slate-600">
                        {feeder.capacity_mw} MW
                      </td>
                      <td className={`py-2.5 px-3 text-right font-mono-num font-bold ${
                        feeder.utilization_pct >= 92 ? 'text-red-700' : feeder.utilization_pct >= 85 ? 'text-amber-700' : 'text-slate-800'
                      }`}>
                        {feeder.utilization_pct}%
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        {feeder.trend === 'up' && <span className="text-red-600">↑</span>}
                        {feeder.trend === 'down' && <span className="text-emerald-600">↓</span>}
                        {feeder.trend === 'stable' && <span className="text-slate-400">━</span>}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <StatusBadge status={feeder.status} size="sm" />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectFeeder(feeder);
                          }}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium inline-flex items-center gap-1 border border-slate-200"
                        >
                          <Eye className="w-3 h-3" />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Out Detail Drawer */}
      <FeederDetailDrawer
        feeder={selectedFeeder}
        onClose={() => setSelectedFeeder(null)}
      />
    </div>
  );
};
