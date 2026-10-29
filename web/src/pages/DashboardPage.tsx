import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BatteryState, ReservePolicy, DischargeRequest } from '../types';
import { BatteryVisualizer } from '../components/BatteryVisualizer';
import { Zap, AlertCircle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, isCoordinator, purposeConsent, setPurposeConsent } = useAuth();

  const [state, setState] = useState<BatteryState>({
    capacityKwh: 100.0,
    availableEnergyKwh: 80.0,
    allocatedEnergyKwh: 0.0,
    reserveFloorKwh: 30.0,
    remainingShareableKwh: 50.0,
    currentChargeKwh: 80.0,
    percentage: 80.0,
    status: 'Idle',
    lastUpdated: new Date().toISOString(),
    version: 1,
  });

  const [policy, setPolicy] = useState<ReservePolicy>({
    reserveFloorKwh: 30.0,
    perMemberDailyCapKwh: 50.0,
    version: 1,
    updatedBy: 'coordinator-1',
    updatedAt: new Date().toISOString(),
  });

  const [requestedKwh, setRequestedKwh] = useState<string>('12.0');
  const [isEmergency, setIsEmergency] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<DischargeRequest | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');

  const refreshData = async () => {
    try {
      const [s, p] = await Promise.all([api.getBatteryState(), api.getReservePolicy()]);
      setState(s);
      setPolicy(p);
    } catch {
      // offline safe
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const kwh = parseFloat(requestedKwh);
    if (isNaN(kwh) || kwh <= 0) {
      setErrorMsg('Please specify a positive energy quantity greater than 0 kWh.');
      return;
    }

    if (!purposeConsent) {
      setErrorMsg('DPDP Compliance: You must provide affirmative purpose consent before requesting energy allocation.');
      return;
    }

    setLoading(true);
    try {
      const result = await api.submitDischarge(kwh, isEmergency, user?.subject);
      setLastResult(result);
      await refreshData();
      const announce = `Allocation decision: ${result.status}. Granted ${result.grantedKwh} kWh, Denied ${result.deniedKwh} kWh.`;
      setLiveAnnouncement(announce);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Discharge request failed';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreset = (amount: number, emergency = false) => {
    setRequestedKwh(amount.toString());
    setIsEmergency(emergency);
  };

  return (
    <div className="space-y-8 py-4">
      {/* WCAG 2.2 Live Region for Dynamic Announcements */}
      <div className="sr-only" aria-live="polite" role="status">
        {liveAnnouncement}
      </div>

      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Live Energy Allocation Console
        </h1>
        <p className="mt-2 text-base text-slate-600">
          Submit discharge requests, monitor battery state of charge, and observe strict reserve floor protection in
          real time.
        </p>
      </div>

      {/* Real-Time SVG Visualizer */}
      <BatteryVisualizer state={state} policy={policy} />

      {/* Allocation Request & Preset Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Card */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs" aria-labelledby="form-heading">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <h2 id="form-heading" className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-emerald-700" aria-hidden="true" />
              <span>Submit Discharge Request</span>
            </h2>
            <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-md">
              Actor: {user?.username}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Requested kWh Input */}
            <div>
              <label htmlFor="requested-kwh" className="block text-sm font-semibold text-slate-900 mb-1">
                Requested Energy (kWh)
              </label>
              <div className="relative">
                <input
                  id="requested-kwh"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100.0"
                  required
                  value={requestedKwh}
                  onChange={(e) => setRequestedKwh(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-slate-900 font-medium text-lg pr-16"
                  placeholder="e.g. 12.0"
                  aria-describedby="kwh-helper"
                />
                <span className="absolute right-4 top-3 text-sm font-bold text-slate-400">kWh</span>
              </div>
              <p id="kwh-helper" className="text-xs text-slate-500 mt-1.5">
                Maximum daily allowance per member: {policy.perMemberDailyCapKwh} kWh.
              </p>
            </div>

            {/* Emergency Toggle (Coordinator Only) */}
            {isCoordinator && (
              <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 flex items-start space-x-3">
                <input
                  id="emergency-check"
                  type="checkbox"
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                  className="mt-1 h-4 w-4 text-rose-600 focus:ring-rose-500 border-rose-300 rounded"
                />
                <label htmlFor="emergency-check" className="text-xs text-rose-950 font-medium cursor-pointer">
                  <strong className="block text-rose-900">Coordinator Emergency Override</strong>
                  Authorizes discharge cutting into the 30.0 kWh emergency reserve floor (absolute safety buffer 5.0 kWh
                  still strictly preserved).
                </label>
              </div>
            )}

            {/* Explicit Purpose-Specific Consent (DPDP Act 2023 / Rules 2025) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-start space-x-3">
                <input
                  id="purpose-consent"
                  type="checkbox"
                  checked={purposeConsent}
                  onChange={(e) => setPurposeConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 text-emerald-700 focus:ring-emerald-600 border-slate-300 rounded"
                  required
                />
                <label htmlFor="purpose-consent" className="text-xs text-slate-700 cursor-pointer">
                  <strong className="block text-slate-900 font-semibold mb-0.5">
                    DPDP Affirmative Purpose Consent (Unticked by Default)
                  </strong>
                  I explicitly consent to the processing of my pseudonymous member identifier solely for verifying
                  daily allocation budgets and recording battery state under India’s DPDP Act 2023. I understand this
                  consent can be revoked at any time.
                </label>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div
                className="p-3 bg-rose-50 text-rose-900 border border-rose-200 rounded-xl text-xs flex items-center space-x-2"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" aria-hidden="true" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-800 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Evaluating Allocation...</span>
              ) : (
                <>
                  <span>Submit Discharge Request</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          {/* Quick Preset Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              One-Click Scenario Presets
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handlePreset(12.0)}
                className="p-2.5 text-xs text-left font-medium bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <strong className="block text-emerald-950">Normal Flow (12 kWh)</strong>
                Fully granted, floor untouched.
              </button>
              <button
                type="button"
                onClick={() => handlePreset(45.0)}
                className="p-2.5 text-xs text-left font-medium bg-amber-50 text-amber-900 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <strong className="block text-amber-950">Edge Case (45 kWh)</strong>
                38 granted, 7 denied (RESERVE_PROTECTED).
              </button>
            </div>
          </div>
        </section>

        {/* Real-Time Decision Receipt Card */}
        <section
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between"
          aria-labelledby="decision-heading"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h2 id="decision-heading" className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                <span>Decision & Outbox Receipt</span>
              </h2>
              {lastResult && (
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    lastResult.status === 'GRANTED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : lastResult.status === 'PARTIALLY_GRANTED'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {lastResult.status}
                </span>
              )}
            </div>

            {lastResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="block text-xs text-slate-500 font-medium">Requested Volume</span>
                    <span className="text-xl font-black text-slate-900">{lastResult.requestedKwh.toFixed(1)} kWh</span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="block text-xs text-emerald-800 font-medium">Granted Energy</span>
                    <span className="text-xl font-black text-emerald-800">{lastResult.grantedKwh.toFixed(1)} kWh</span>
                  </div>
                </div>

                {lastResult.deniedKwh > 0 && (
                  <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
                    <div className="flex items-center justify-between text-xs font-bold text-rose-800 mb-1">
                      <span>Denied Volume (Protected Reserve)</span>
                      <span className="font-mono bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded">
                        {lastResult.reasonCode}
                      </span>
                    </div>
                    <span className="text-2xl font-black text-rose-800">{lastResult.deniedKwh.toFixed(1)} kWh</span>
                    <p className="text-xs text-rose-700 mt-1">
                      This volume would have cut below the 30.0 kWh emergency reserve floor. A RejectedRequest row was
                      persisted for audit.
                    </p>
                  </div>
                )}

                <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono space-y-1.5">
                  <div className="text-emerald-400 font-semibold mb-1">// Transactional Outbox Event Metadata</div>
                  <div>
                    <span className="text-slate-400">request_id:</span> {lastResult.id}
                  </div>
                  <div>
                    <span className="text-slate-400">member_ref:</span> {lastResult.memberRef}
                  </div>
                  <div>
                    <span className="text-slate-400">processed_by:</span> {lastResult.processedByInstance}
                  </div>
                  <div>
                    <span className="text-slate-400">timestamp:</span> {lastResult.createdAt}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <CheckCircle2 className="w-12 h-12 mx-auto text-slate-300" aria-hidden="true" />
                <p className="text-sm">No allocation requests submitted in this session yet.</p>
                <p className="text-xs text-slate-400">
                  Select a preset or input a value above to trigger the ReserveAllocator domain engine.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
            Decisions are recorded in the PostgreSQL <code className="font-mono text-slate-700">discharge_requests</code>{' '}
            table and published to Kafka topic <code className="font-mono text-slate-700">soa.s10.t03.events</code>.
          </div>
        </section>
      </div>
    </div>
  );
};
