import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ReservePolicy } from '../types';
import { ShieldCheck, Sliders, CheckCircle, AlertCircle } from 'lucide-react';

export const CoordinatorPage: React.FC = () => {
  const { isCoordinator, user } = useAuth();

  const [policy, setPolicy] = useState<ReservePolicy>({
    reserveFloorKwh: 30.0,
    perMemberDailyCapKwh: 50.0,
    version: 1,
    updatedBy: 'coordinator-1',
    updatedAt: new Date().toISOString(),
  });

  const [floorInput, setFloorInput] = useState<string>('30.0');
  const [capInput, setCapInput] = useState<string>('50.0');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [updating, setUpdating] = useState<boolean>(false);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const p = await api.getReservePolicy();
        setPolicy(p);
        setFloorInput(p.reserveFloorKwh.toString());
        setCapInput(p.perMemberDailyCapKwh.toString());
      } catch {
        // offline safe
      }
    };
    fetchPolicy();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    const f = parseFloat(floorInput);
    const c = parseFloat(capInput);

    if (isNaN(f) || f < 5.0) {
      setErrorMsg('Reserve floor cannot be set below the absolute minimum safety margin of 5.0 kWh.');
      return;
    }
    if (isNaN(c) || c <= 0.0) {
      setErrorMsg('Member daily cap must be greater than 0 kWh.');
      return;
    }

    setUpdating(true);
    try {
      const updated = await api.updateReservePolicy(f, c);
      setPolicy(updated);
      setSuccessMsg(`Policy updated successfully to Floor: ${f} kWh, Member Cap: ${c} kWh. Version incremented.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update policy';
      setErrorMsg(msg);
    } finally {
      setUpdating(false);
    }
  };

  if (!isCoordinator) {
    return (
      <div className="py-16 text-center space-y-4">
        <ShieldCheck className="w-16 h-16 text-rose-500 mx-auto" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-slate-900">Coordinator Access Required</h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          You are currently logged in as <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">{user?.username}</code> with
          member permissions. Please use the top bar to switch to <code className="font-mono bg-rose-100 text-rose-800 px-1 py-0.5 rounded">coordinator-1</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div>
        <div className="inline-flex items-center space-x-2 bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-xs font-semibold mb-3">
          <ShieldCheck className="w-4 h-4 text-rose-700" aria-hidden="true" />
          <span>Restricted Coordinator Privilege</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Reserve Policy Administration
        </h1>
        <p className="mt-2 text-base text-slate-600">
          Modify the protected reserve floor and individual quota allocations. Enforced with Hibernate optimistic
          concurrency control (<code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">@Version</code>).
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-rose-700" aria-hidden="true" />
            <span>Policy Parameters</span>
          </h2>
          <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
            Entity Version: {policy.version}
          </span>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="floor-input" className="block text-sm font-semibold text-slate-900 mb-1">
                Protected Reserve Floor (kWh)
              </label>
              <input
                id="floor-input"
                type="number"
                step="0.5"
                min="5.0"
                max="90.0"
                required
                value={floorInput}
                onChange={(e) => setFloorInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-600 font-medium text-slate-900"
              />
              <p className="text-xs text-slate-500 mt-1">Must be ≥ 5.0 kWh absolute safety margin.</p>
            </div>

            <div>
              <label htmlFor="cap-input" className="block text-sm font-semibold text-slate-900 mb-1">
                Per-Member 24h Quota (kWh)
              </label>
              <input
                id="cap-input"
                type="number"
                step="0.5"
                min="1.0"
                max="100.0"
                required
                value={capInput}
                onChange={(e) => setCapInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-600 font-medium text-slate-900"
              />
              <p className="text-xs text-slate-500 mt-1">Rolling 24-hour limit per pseudonymous member.</p>
            </div>
          </div>

          {successMsg && (
            <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-700 flex-shrink-0" aria-hidden="true" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-rose-50 text-rose-900 border border-rose-200 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={updating}
              className="px-6 py-2.5 bg-rose-700 text-white font-bold rounded-xl hover:bg-rose-800 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 disabled:opacity-50"
            >
              {updating ? 'Saving Policy...' : 'Commit Policy Changes'}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
          <span>Last modified by: {policy.updatedBy}</span>
          <span>Timestamp: {new Date(policy.updatedAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
