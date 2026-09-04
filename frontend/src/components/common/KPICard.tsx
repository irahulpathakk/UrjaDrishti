import React from 'react';

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  riskBadge?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendText?: string;
  isDrifting?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  unit,
  subtext,
  riskBadge,
  trend,
  trendText,
  isDrifting = false
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded p-3.5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        {riskBadge && <div>{riskBadge}</div>}
      </div>

      <div className="flex items-baseline gap-1.5 my-1">
        <span className={`text-2xl font-bold font-mono-num text-slate-900 transition-all duration-300 ${
          isDrifting ? 'text-blue-700' : ''
        }`}>
          {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
        </span>
        {unit && (
          <span className="text-xs font-semibold text-slate-500 font-mono-num">
            {unit}
          </span>
        )}
      </div>

      {(subtext || trendText) && (
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-1.5">
          <span>{subtext}</span>
          {trendText && (
            <span className={`font-mono-num font-medium flex items-center gap-0.5 ${
              trend === 'up' ? 'text-amber-700' : trend === 'down' ? 'text-emerald-700' : 'text-slate-600'
            }`}>
              {trend === 'up' && '▲'}
              {trend === 'down' && '▼'}
              {trend === 'stable' && '━'}
              {trendText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
