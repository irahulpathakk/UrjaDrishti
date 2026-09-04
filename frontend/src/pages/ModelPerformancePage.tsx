import React, { useState, useEffect } from 'react';
import { ModelPerformanceTelemetry } from '../types/grid';
import { api } from '../services/api';
import { SectionHeader } from '../components/common/SectionHeader';
import { KPICard } from '../components/common/KPICard';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import {
  Cpu,
  Layers,
  CheckCircle,
  Database,
  Calendar,
  Sparkles,
  RefreshCw,
  GitCommit
} from 'lucide-react';

export const ModelPerformancePage: React.FC = () => {
  const [data, setData] = useState<ModelPerformanceTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getModelPerformance();
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

  return (
    <div className="space-y-4">
      <SectionHeader
        title="ML Model Diagnostics & Feature Attribution"
        subtitle="Operational telemetry for the primary dispatch forecast engine running in production"
        actions={
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Model Active
            </span>
          </div>
        }
      />

      {/* Model Identification Card */}
      {data && (
        <div className="bg-white border border-slate-200 rounded p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">
                Primary Forecasting Architecture
              </div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight mt-0.5">
                {data.model_name}
              </h2>
              <div className="text-xs text-slate-500 mt-0.5">
                {data.algorithm} • Scikit-learn & XGBoost C++ Runtime
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5">
                <span className="text-slate-500 block text-[10px] uppercase">Training Window</span>
                <span className="font-mono-num font-bold text-slate-800">{data.training_data_range}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5">
                <span className="text-slate-500 block text-[10px] uppercase">Training Samples</span>
                <span className="font-mono-num font-bold text-slate-800">
                  {data.training_samples.toLocaleString('en-IN')} hours
                </span>
              </div>
            </div>
          </div>

          {/* 4 Core Accuracy Evaluation Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase block">MAE</span>
              <span className="text-2xl font-extrabold font-mono-num text-slate-900 mt-1 block">
                {data.mae_mw} <span className="text-xs font-normal text-slate-500">MW</span>
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">Mean Absolute Error</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase block">RMSE</span>
              <span className="text-2xl font-extrabold font-mono-num text-slate-900 mt-1 block">
                {data.rmse_mw} <span className="text-xs font-normal text-slate-500">MW</span>
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">Root Mean Squared Error</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase block">MAPE</span>
              <span className="text-2xl font-extrabold font-mono-num text-blue-700 mt-1 block">
                {data.mape_pct}%
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">Mean Abs. Percentage Error</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase block">R² Score</span>
              <span className="text-2xl font-extrabold font-mono-num text-emerald-700 mt-1 block">
                {data.r2_score}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">Explained Variance Metric</span>
            </div>
          </div>
        </div>
      )}

      {/* Feature Importance & Model Telemetry */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Feature Importance Chart */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded p-4 shadow-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100 mb-2">
              Feature Importance Distribution (SHAP / Gain Attribution)
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Quantitative impact percentage of meteorological, autoregressive, and temporal predictors
            </p>

            <div className="h-68 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.feature_importance}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                >
                  <XAxis type="number" unit="%" tick={{ fontSize: 10 }} />
                  <YAxis
                    type="category"
                    dataKey="feature"
                    tick={{ fontSize: 11, fill: '#334155' }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '11px' }}
                    formatter={(val: any) => [`${val}%`, 'Relative Gain']}
                  />
                  <Bar dataKey="importance_pct" fill="#2563eb" radius={[0, 3, 3, 0]}>
                    {data.feature_importance.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.feature === 'Temperature'
                            ? '#ea580c'
                            : entry.feature === 'Previous Demand'
                            ? '#2563eb'
                            : '#64748b'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Top Driver: <strong className="text-orange-700">Temperature (38%)</strong></span>
              <span>Autoregressive Driver: <strong className="text-blue-700">Previous Demand (24%)</strong></span>
            </div>
          </div>

          {/* Features List & Lifecycle Telemetry */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded p-4 shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100 mb-3">
                Input Feature Pipeline
              </div>
              <div className="space-y-1.5 text-xs">
                {data.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-slate-50 border border-slate-200 rounded flex items-center justify-between"
                  >
                    <span className="font-medium text-slate-800">{feat}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded font-mono-num font-semibold">
                      Rank #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-500">Last Model Update:</span>
                <span className="font-mono-num font-medium text-slate-800">{data.last_model_update}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Prediction Horizon:</span>
                <span className="font-medium text-slate-800">{data.prediction_horizon}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Validation Protocol:</span>
                <span className="font-medium text-slate-800">{data.validation_strategy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Model Status:</span>
                <span className="font-semibold text-emerald-700">{data.model_status}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
