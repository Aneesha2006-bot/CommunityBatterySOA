import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { BatteryCharging, Shield, User, Lock, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [activeRole, setActiveRole] = useState<UserRole>('consumer');
  const [username, setUsername] = useState<string>('member-a');
  const [password, setPassword] = useState<string>('member-a-pass');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleRoleTabChange = (role: UserRole) => {
    setActiveRole(role);
    setError(null);
    if (role === 'consumer') {
      setUsername('member-a');
      setPassword('member-a-pass');
    } else {
      setUsername('coordinator-1');
      setPassword('coord-pass');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const success = await login(username, password, activeRole);
      if (success) {
        onSuccess();
      } else {
        setError(
          activeRole === 'coordinator'
            ? 'Invalid coordinator credentials. Use coordinator-1 / coord-pass'
            : 'Invalid consumer credentials. Use member-a / member-a-pass or member-b / member-b-pass'
        );
      }
    } catch {
      setError('An error occurred during authentication. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofill = (u: string, p: string, r: UserRole) => {
    setActiveRole(r);
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100">
        {/* Header & Logo */}
        <div className="text-center">
          <div className="w-14 h-14 bg-emerald-700 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <BatteryCharging className="w-8 h-8" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Community Battery Portal
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Reserve Priority Energy Management & Allocation
          </p>
        </div>

        {/* Dual Role Selector Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl" role="tablist" aria-label="Login Role Selection">
          <button
            type="button"
            role="tab"
            aria-selected={activeRole === 'consumer'}
            onClick={() => handleRoleTabChange('consumer')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
              activeRole === 'consumer'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            <span>Consumer Login</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeRole === 'coordinator'}
            onClick={() => handleRoleTabChange('coordinator')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
              activeRole === 'coordinator'
                ? 'bg-white text-rose-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4 text-rose-700" aria-hidden="true" />
            <span>Coordinator Login</span>
          </button>
        </div>

        {/* Role Description Badge */}
        <div
          className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
            activeRole === 'consumer'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <CheckCircle2
            className={`w-4 h-4 flex-shrink-0 ${
              activeRole === 'consumer' ? 'text-emerald-700' : 'text-rose-700'
            }`}
            aria-hidden="true"
          />
          <span>
            {activeRole === 'consumer'
              ? 'Consumer Portal: Request battery energy, track pending allocations, and view consumption.'
              : 'Coordinator Administration: Review consumer requests, approve, modify allocations, and manage battery.'}
          </span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              className="p-3 bg-rose-50 text-rose-900 border border-rose-200 rounded-xl text-xs flex items-center space-x-2"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="username-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Username or ID
            </label>
            <div className="relative">
              <input
                id="username-input"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={activeRole === 'consumer' ? 'member-a or member-b' : 'coordinator-1'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 text-sm font-medium"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" aria-hidden="true" />
            </div>
          </div>

          <div>
            <label htmlFor="password-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 text-sm font-medium"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" aria-hidden="true" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 ${
              activeRole === 'consumer'
                ? 'bg-emerald-700 hover:bg-emerald-800 focus-visible:ring-emerald-600'
                : 'bg-rose-700 hover:bg-rose-800 focus-visible:ring-rose-600'
            } disabled:opacity-50`}
          >
            <span>{loading ? 'Authenticating...' : `Sign In as ${activeRole === 'consumer' ? 'Consumer' : 'Coordinator'}`}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </form>

        {/* 1-Click Demo Accounts Autofill */}
        <div className="pt-4 border-t border-slate-100">
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 text-center mb-2.5">
            Quick 1-Click Demo Logins
          </span>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleAutofill('member-a', 'member-a-pass', 'consumer')}
              className="w-full text-left p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs text-slate-700"
            >
              <div>
                <strong className="block text-slate-900">Alice Sharma (Consumer A)</strong>
                <span className="text-slate-400 font-mono">user: member-a • pass: member-a-pass</span>
              </div>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">Consumer</span>
            </button>

            <button
              type="button"
              onClick={() => handleAutofill('member-b', 'member-b-pass', 'consumer')}
              className="w-full text-left p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs text-slate-700"
            >
              <div>
                <strong className="block text-slate-900">Bob Patel (Consumer B)</strong>
                <span className="text-slate-400 font-mono">user: member-b • pass: member-b-pass</span>
              </div>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">Consumer</span>
            </button>

            <button
              type="button"
              onClick={() => handleAutofill('coordinator-1', 'coord-pass', 'coordinator')}
              className="w-full text-left p-2 rounded-xl border border-slate-200 hover:bg-rose-50/50 transition-colors flex items-center justify-between text-xs text-slate-700"
            >
              <div>
                <strong className="block text-slate-900">Vikram Rao (Chief Coordinator)</strong>
                <span className="text-slate-400 font-mono">user: coordinator-1 • pass: coord-pass</span>
              </div>
              <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[10px] font-bold">Coordinator</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
