import React, { useState, useEffect } from 'react';
import { AlertTelemetry, OperationalRisk, AlertStatus } from '../types/grid';
import { api } from '../services/api';
import { SectionHeader } from '../components/common/SectionHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  RefreshCw,
  Bell,
  ShieldAlert,
  Clock,
  MapPin,
  Check,
  FileText
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertTelemetry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.getAlerts(severityFilter, statusFilter);
      setAlerts(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [severityFilter, statusFilter]);

  const handleAcknowledge = async (id: string) => {
    setAcknowledgingId(id);
    try {
      const ok = await api.acknowledgeAlert(id, 'SLDC-OP-408');
      if (ok) {
        setSuccessToast(`Alert ${id} acknowledged and logged to SLDC dispatch audit trail.`);
        setTimeout(() => setSuccessToast(null), 4000);
        await loadAlerts();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAcknowledgingId(null);
    }
  };

  const severities = ['ALL', 'CRITICAL', 'HIGH', 'WATCH'];
  const statuses = ['All', 'Open', 'Acknowledged', 'Resolved'];

  const openCount = alerts.filter(a => a.status === 'Open').length;
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'Open').length;

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Grid Alarms & Security Constrained Dispatch Advisories"
        subtitle="Real-time threshold exceedance alarms, contingency violations, and operator acknowledgement log"
        actions={
          <button
            onClick={loadAlerts}
            disabled={loading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded text-xs font-semibold tracking-wider uppercase transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Alarms
          </button>
        }
      />

      {/* Success Notification Toast */}
      {successToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{successToast}</span>
        </div>
      )}

      {/* Alarm Status Statistics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded p-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500">Unacknowledged Open</span>
            <div className="text-xl font-bold font-mono-num text-slate-900 mt-0.5">{openCount}</div>
          </div>
          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-600">
            <Bell className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded p-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500">Critical Priority</span>
            <div className="text-xl font-bold font-mono-num text-red-700 mt-0.5">{criticalCount}</div>
          </div>
          <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center text-red-600">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded p-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500">Audit Logging</span>
            <div className="text-xs font-semibold text-emerald-700 mt-1">CEA Compliance Active</div>
          </div>
          <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center text-emerald-600">
            <FileText className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Severity filter buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold text-[11px] uppercase">Severity:</span>
            <div className="inline-flex rounded border border-slate-200 p-0.5 bg-slate-50">
              {severities.map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2 py-0.5 font-semibold rounded text-[11px] transition-colors ${
                    severityFilter === sev
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Status filter buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold text-[11px] uppercase">Status:</span>
            <div className="inline-flex rounded border border-slate-200 p-0.5 bg-slate-50">
              {statuses.map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-0.5 font-semibold rounded text-[11px] transition-colors ${
                    statusFilter === st
                      ? 'bg-blue-700 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        <span className="text-[11px] text-slate-500 font-mono-num">
          Showing {alerts.length} operational alarms
        </span>
      </div>

      {/* Alerts Table / List */}
      <div className="space-y-2.5">
        {alerts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded p-8 text-center text-xs text-slate-400">
            No alarms matching current criteria.
          </div>
        ) : (
          alerts.map((alert) => {
            const isOpen = alert.status === 'Open';
            return (
              <div
                key={alert.id}
                className={`bg-white border rounded p-4 shadow-xs transition-all ${
                  isOpen && alert.severity === 'CRITICAL'
                    ? 'border-red-300 bg-red-50/10'
                    : isOpen && alert.severity === 'HIGH'
                    ? 'border-orange-300'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={alert.severity} size="sm" />
                    <span className="font-mono-num font-bold text-xs text-slate-900">
                      {alert.id}
                    </span>
                    <h3 className="font-bold text-xs text-slate-900 uppercase tracking-tight">
                      {alert.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-mono-num text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {alert.timestamp}
                    </span>
                    <span className="text-slate-500 font-medium text-[11px] flex items-center gap-1 border-l border-slate-200 pl-2">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {alert.area}
                    </span>
                    <StatusBadge status={alert.status} size="sm" />
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-800 mt-2 font-medium">
                  {alert.description}
                </p>

                {/* Recommended Action & Acknowledge Button */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs bg-slate-50 border border-slate-200 rounded p-2 flex-1">
                    <span className="font-bold text-slate-700 block text-[10px] uppercase">
                      Recommended Action:
                    </span>
                    <span className="text-slate-900 font-medium">
                      {alert.recommended_action}
                    </span>
                  </div>

                  {isOpen ? (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      disabled={acknowledgingId === alert.id}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 self-end sm:self-center whitespace-nowrap shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      {acknowledgingId === alert.id ? 'Logging...' : 'Acknowledge Alarm'}
                    </button>
                  ) : (
                    <div className="text-right text-[11px] text-slate-500 self-end sm:self-center font-mono-num">
                      <span className="block text-[10px] uppercase text-slate-400">Acknowledged by</span>
                      <span className="font-medium text-slate-700">{alert.acknowledged_by || 'SLDC Desk'}</span>
                      <span className="block text-[10px] text-slate-400">{alert.acknowledged_at}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
