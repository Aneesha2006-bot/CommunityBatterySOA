import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BatteryState, BatteryRequest, RequestPriority } from '../types';
import { BatteryVisualizer } from '../components/BatteryVisualizer';
import { AuditTrailModal } from '../components/AuditTrailModal';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  History,
  Send,
  AlertTriangle,
  Layers,
} from 'lucide-react';

export const ConsumerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [batteryState, setBatteryState] = useState<BatteryState | null>(null);
  const [requests, setRequests] = useState<BatteryRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Form State
  const [requestedKwh, setRequestedKwh] = useState<string>('12.0');
  const [priority, setPriority] = useState<RequestPriority>('NORMAL');
  const [reason, setReason] = useState<string>('Home solar battery top-up for residential appliances');
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audit modal
  const [selectedRequest, setSelectedRequest] = useState<BatteryRequest | null>(null);

  const fetchData = async () => {
    try {
      const [bat, reqs] = await Promise.all([api.getBatteryState(), api.getRequests()]);
      setBatteryState(bat);
      setRequests(reqs);
    } catch {
      // safe fallback
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const val = parseFloat(requestedKwh);
    if (isNaN(val) || val <= 0) {
      setErrorMessage('Please enter a valid positive energy volume (> 0 kWh).');
      return;
    }

    if (val > user.dailyCapKwh) {
      setErrorMessage(
        `Requested energy (${val.toFixed(1)} kWh) exceeds your 24-hour daily quota of ${user.dailyCapKwh.toFixed(1)} kWh.`
      );
      return;
    }

    setLoading(true);
    try {
      const newReq = await api.submitRequest(val, priority, reason);
      setSuccessMessage(
        `Request ${newReq.id} submitted successfully! Your request is now Pending Approval by the energy coordinator. Available battery capacity will only be deducted once approved and committed.`
      );
      setRequestedKwh('10.0');
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit request';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  // Calculate active allocation for this consumer
  const activeAllocations = requests
    .filter((r) => r.status === 'ALLOCATED')
    .reduce((sum, r) => sum + (r.allocatedKwh || 0), 0);

  const pendingCount = requests.filter((r) => r.status === 'PENDING_APPROVAL').length;

  return (
    <div className="space-y-8 py-6">
      {/* Consumer Header & Account Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-700/60">
              Consumer Energy Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-3">
              Welcome, {user.fullName}
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
              Account: <strong className="text-white font-mono">{user.accountNumber}</strong> • Unique Consumer ID:{' '}
              <strong className="text-white font-mono">{user.subject}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/15 text-xs">
            <div>
              <span className="block text-emerald-200 text-[11px]">Daily Allocation Quota</span>
              <span className="text-xl font-black text-white">{user.dailyCapKwh.toFixed(1)} kWh</span>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div>
              <span className="block text-emerald-200 text-[11px]">Active Allocation</span>
              <span className="text-xl font-black text-emerald-300">{activeAllocations.toFixed(1)} kWh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Battery State Gauge */}
      {batteryState && <BatteryVisualizer state={batteryState} />}

      {/* 2-Column: Request Form + Requests Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Submit Energy Request (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Send className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Request Battery Energy</h2>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-md">
              Cap: {user.dailyCapKwh} kWh
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Consumer ID & Name (Readonly) */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="block text-slate-400 font-medium text-[10px] uppercase">Consumer Name</span>
                <span className="font-bold text-slate-800 truncate block mt-0.5">{user.fullName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="block text-slate-400 font-medium text-[10px] uppercase">Consumer ID</span>
                <span className="font-mono font-bold text-slate-800 truncate block mt-0.5">{user.subject}</span>
              </div>
            </div>

            {/* Requested kWh */}
            <div>
              <label htmlFor="kwh-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Requested Energy Volume (kWh)
              </label>
              <div className="relative">
                <input
                  id="kwh-input"
                  type="number"
                  step="0.1"
                  min="0.5"
                  max={user.dailyCapKwh}
                  required
                  value={requestedKwh}
                  onChange={(e) => setRequestedKwh(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium text-slate-900 pr-14 text-base"
                  placeholder="e.g. 12.0"
                />
                <span className="absolute right-4 top-2.5 text-xs font-bold text-slate-400">kWh</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Remaining capacity for your account: {(user.dailyCapKwh - activeAllocations).toFixed(1)} kWh.
              </p>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Priority / Urgency
              </label>
              <select
                id="priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as RequestPriority)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium text-slate-900 text-sm bg-white"
              >
                <option value="NORMAL">Normal Priority (Standard household consumption)</option>
                <option value="HIGH">High Priority (Time-sensitive, work/EV charging)</option>
                <option value="EMERGENCY">Emergency / Critical (Medical, life-safety reserve)</option>
              </select>
            </div>

            {/* Reason */}
            <div>
              <label htmlFor="reason-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Purpose / Reason
              </label>
              <input
                id="reason-input"
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Residential appliances, Home clinic equipment"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium text-slate-900 text-sm"
              />
            </div>

            {/* Workflow Info Alert */}
            <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-200 text-sky-900 text-xs flex items-start space-x-2.5">
              <Clock className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Approval Workflow:</strong> Your request will enter <strong>Pending Approval</strong>. The
                coordinator can approve or modify the allocation. Available battery capacity will update only after
                formal allocation.
              </span>
            </div>

            {/* Success / Error Messages */}
            {successMessage && (
              <div className="p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3.5 bg-rose-50 text-rose-900 border border-rose-200 rounded-xl text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? <span>Submitting Request...</span> : <span>Transmit Battery Request</span>}
            </button>
          </form>
        </div>

        {/* Right Table: Consumer Request History (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <History className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                <span>My Battery Requests & Allocations</span>
              </h2>
              <span className="text-xs text-slate-400">
                Tracking history for {user.fullName} ({requests.length} requests total)
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filterStatus === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('PENDING_APPROVAL')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filterStatus === 'PENDING_APPROVAL' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setFilterStatus('ALLOCATED')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filterStatus === 'ALLOCATED' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Allocated
              </button>
              <button
                onClick={() => setFilterStatus('REJECTED')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filterStatus === 'REJECTED' ? 'bg-white text-rose-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Layers className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-medium">No requests match this filter.</p>
              <p className="text-xs text-slate-400">Submit a new request using the form on the left.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Request ID</th>
                    <th className="py-3 px-3">Requested</th>
                    <th className="py-3 px-3">Approved / Active</th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Coordinator Remarks</th>
                    <th className="py-3 px-3 text-right">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {req.id}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-bold text-slate-900">
                        {req.requestedKwh.toFixed(1)} kWh
                      </td>

                      <td className="py-3 px-3 font-bold text-emerald-700">
                        {req.allocatedKwh ? (
                          `${req.allocatedKwh.toFixed(1)} kWh`
                        ) : req.approvedKwh ? (
                          <span className="text-sky-700">{req.approvedKwh.toFixed(1)} kWh (Approved)</span>
                        ) : (
                          <span className="text-slate-400 font-normal italic">Pending</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            req.priority === 'EMERGENCY'
                              ? 'bg-rose-100 text-rose-800'
                              : req.priority === 'HIGH'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {req.priority}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                            req.status === 'ALLOCATED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'APPROVED'
                              ? 'bg-sky-100 text-sky-800'
                              : req.status === 'MODIFIED'
                              ? 'bg-purple-100 text-purple-800'
                              : req.status === 'PENDING_APPROVAL'
                              ? 'bg-amber-100 text-amber-800'
                              : req.status === 'DEALLOCATED'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {req.status === 'PENDING_APPROVAL' && <Clock className="w-3 h-3 mr-1" />}
                          {req.status === 'ALLOCATED' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {req.status === 'REJECTED' && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {req.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-500 max-w-[150px] truncate" title={req.coordinatorRemarks || ''}>
                        {req.coordinatorRemarks || <span className="text-slate-300 italic">—</span>}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Audit Modal */}
      <AuditTrailModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />
    </div>
  );
};
