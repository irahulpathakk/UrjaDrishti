import React, { useState } from 'react';
import { ShieldCheck, Zap, Lock, User, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLogin: (operatorId: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [operatorId, setOperatorId] = useState('SLDC-OP-408');
  const [password, setPassword] = useState('••••••••••••');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!operatorId.trim()) {
      setError('Operator ID is required for audit logging');
      return;
    }
    onLogin(operatorId);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
        {/* Header Banner */}
        <div className="bg-slate-950 p-6 text-center border-b border-slate-800">
          <div className="w-10 h-10 mx-auto mb-2.5 rounded bg-blue-600 flex items-center justify-center text-white">
            <Zap className="w-5 h-5" />
          </div>
          <h1 className="text-base font-extrabold text-white tracking-widest uppercase">
            URJADRISHTI
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Delhi Power Demand Intelligence Platform
          </p>
          <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono-num">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            NCT Grid Dispatch Network: ACTIVE
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Operator ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={operatorId}
                onChange={(e) => setOperatorId(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs font-mono-num border border-slate-300 rounded bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 text-slate-900"
                placeholder="e.g. SLDC-OP-408"
                required
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Delhi SLDC / DISCOM clearance code</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Access Key / Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 text-slate-900"
                placeholder="••••••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs tracking-wider uppercase rounded transition-colors shadow-xs mt-2"
          >
            Sign In to Grid Console
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => onLogin('SLDC-DEMO-DESK')}
              className="text-[11px] text-slate-500 hover:text-blue-700 underline font-medium"
            >
              Direct Demo Bypass (Operator Console Desk 1)
            </button>
          </div>
        </form>

        {/* Security Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>Authorized grid operations personnel only.</span>
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">
            Unauthorized access is monitored under Indian IT Act & Central Electricity Authority standards.
          </div>
        </div>
      </div>
    </div>
  );
};
