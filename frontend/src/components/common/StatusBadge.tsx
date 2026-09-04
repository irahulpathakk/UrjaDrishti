import React from 'react';
import { OperationalRisk, AlertStatus } from '../../types/grid';

interface StatusBadgeProps {
  status: OperationalRisk | AlertStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-300';
  let dotColor = 'bg-slate-400';

  if (normalized === 'NORMAL' || normalized === 'RESOLVED') {
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    dotColor = 'bg-emerald-600';
  } else if (normalized === 'WATCH' || normalized === 'ACKNOWLEDGED') {
    colorClasses = 'bg-amber-50 text-amber-900 border-amber-300';
    dotColor = 'bg-amber-500';
  } else if (normalized === 'HIGH') {
    colorClasses = 'bg-orange-50 text-orange-900 border-orange-300';
    dotColor = 'bg-orange-600';
  } else if (normalized === 'CRITICAL' || normalized === 'OPEN') {
    colorClasses = 'bg-red-50 text-red-900 border-red-300';
    dotColor = 'bg-red-600';
  }

  const sizeClasses = size === 'sm' 
    ? 'px-1.5 py-0.5 text-[10px]' 
    : 'px-2 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium tracking-wide uppercase border rounded ${sizeClasses} ${colorClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {status}
    </span>
  );
};
