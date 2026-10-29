import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BatteryState, BatteryRequest, ReservePolicy } from '../types';
import { BatteryVisualizer } from '../components/BatteryVisualizer';
import { AuditTrailModal } from '../components/AuditTrailModal';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Sliders,
  AlertTriangle,
  Layers,
  ShieldAlert,
} from 'lucide-react';

export const CoordinatorDashboardPage: React.FC = () => {
  const { user, isCoordinator } = useAuth();
  const [batteryState, setBatteryState] = useState<BatteryState | null>(null);
  const [policy, setPolicy] = useState<ReservePolicy | null>(null);
  const [requests, setRequests] = useState<BatteryRequest[]>([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Modals state
  const [modifyingRequest, setModifyingRequest] = useState<BatteryRequest | null>(null);
  const [modifiedKwhInput, setModifiedKwhInput] = useState<string>('');
  const [modifyRemarks, setModifyRemarks] = useState<string>('');

  const [rejectingRequest, setRejectingRequest] = useState<BatteryRequest | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  const [deallocatingRequest, setDeallocatingRequest] = useState<BatteryRequest | null>(null);
  const [deallocateRemarks, setDeallocateRemarks] = useState<string>('');

  const [auditRequest, setAuditRequest] = useState<BatteryRequest | null>(null);

  // Status feedback toast
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchData = async () => {
    try {
      const [bat, pol, reqs] = await Promise.all([
        api.getBatteryState(),
        api.getReservePolicy(),
        api.getRequests(),
      ]);
      setBatteryState(bat);
      setPolicy(pol);
      setRequests(reqs);
    } catch {
      // safe fallback
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!isCoordinator) {
    return (
      <div className="py-20 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />
        <h1 className="text-2xl font-bold text-slate-900">Coordinator Access Restricted</h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          You do not have coordinator permissions. Please log in using coordinator credentials (coordinator-1 / coord-pass).
        </p>
      </div>
    );
  }

  // Coordinator Actions
  const handleApproveFull = async (req: BatteryRequest) => {
    try {
      await api.approveRequest(req.id, req.requestedKwh, 'Approved requested allocation in full.');
      setFeedback({
        type: 'success',
        message: `Request ${req.id} approved for ${req.requestedKwh.toFixed(1)} kWh. Click "Allocate" to commit to battery capacity.`,
      });
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Approval failed';
      setFeedback({ type: 'error', message: msg });
    }
  };

  const handleOpenModify = (req: BatteryRequest) => {
    setModifyingRequest(req);
    setModifiedKwhInput(req.approvedKwh ? req.approvedKwh.toString() : req.requestedKwh.toString());
    setModifyRemarks(req.coordinatorRemarks || 'Adjusted based on available shareable reserve pool.');
  };

  const handleConfirmModify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modifyingRequest) return;

    const val = parseFloat(modifiedKwhInput);
    if (isNaN(val) || val <= 0) {
      setFeedback({ type: 'error', message: 'Approved allocation must be greater than 0 kWh.' });
      return;
    }

    try {
      await api.modifyAllocation(modifyingRequest.id, val, modifyRemarks);
      setFeedback({
        type: 'success',
        message: `Request ${modifyingRequest.id} modified. Original: ${modifyingRequest.requestedKwh.toFixed(1)} kWh -> Approved: ${val.toFixed(1)} kWh.`,
      });
      setModifyingRequest(null);
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to modify allocation';
      setFeedback({ type: 'error', message: msg });
    }
  };

  const handleCommitAllocate = async (req: BatteryRequest) => {
    try {
      await api.allocateRequest(req.id);
      setFeedback({
        type: 'success',
        message: `Energy committed! ${req.approvedKwh?.toFixed(1) ?? req.requestedKwh.toFixed(1)} kWh successfully allocated and deducted from available battery capacity.`,
      });
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Allocation failed';
      setFeedback({ type: 'error', message: msg });
    }
  };

  const handleOpenDeallocate = (req: BatteryRequest) => {
    setDeallocatingRequest(req);
    setDeallocateRemarks('Allocation period finished; releasing energy back to battery capacity.');
  };

  const handleConfirmDeallocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deallocatingRequest) return;

    try {
      await api.deallocateRequest(deallocatingRequest.id, deallocateRemarks);
      setFeedback({
        type: 'success',
        message: `Allocation ${deallocatingRequest.id} deallocated! ${deallocatingRequest.allocatedKwh?.toFixed(1)} kWh restored back to available battery capacity.`,
      });
      setDeallocatingRequest(null);
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Deallocation failed';
      setFeedback({ type: 'error', message: msg });
    }
  };

  const handleOpenReject = (req: BatteryRequest) => {
    setRejectingRequest(req);
    setRejectReason('RESERVE_PROTECTED: Request exceeds shareable capacity above 30.0 kWh emergency reserve floor.');
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRequest) return;

    try {
      await api.rejectRequest(rejectingRequest.id, rejectReason);
      setFeedback({
        type: 'success',
        message: `Request ${rejectingRequest.id} rejected. Rejection reason recorded and consumer notified.`,
      });
      setRejectingRequest(null);
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Rejection failed';
      setFeedback({ type: 'error', message: msg });
    }
  };

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.consumerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.consumerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || r.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Metric counts
  const pendingCount = requests.filter((r) => r.status === 'PENDING_APPROVAL').length;
  const allocatedCount = requests.filter((r) => r.status === 'ALLOCATED').length;
  const approvedCount = requests.filter((r) => r.status === 'APPROVED' || r.status === 'MODIFIED').length;
  const rejectedCount = requests.filter((r) => r.status === 'REJECTED').length;

  return (
    <div className="space-y-8 py-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-rose-950/80 text-rose-300 px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-rose-800/60">
              <ShieldCheck className="w-4 h-4 text-rose-400" aria-hidden="true" />
              <span>Energy Coordinator Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              Battery Reserve Priority Console
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Coordinator: <strong className="text-white">{user?.fullName}</strong> • Guarding 30.0 kWh Emergency Reserve Floor
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 text-xs">
            <div>
              <span className="block text-slate-300 text-[11px]">Pending Approvals</span>
              <span className="text-2xl font-black text-amber-400">{pendingCount}</span>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div>
              <span className="block text-slate-300 text-[11px]">Active Allocations</span>
              <span className="text-2xl font-black text-emerald-400">{allocatedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Alert Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-medium flex items-center justify-between shadow-sm animate-in fade-in duration-100 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
              : 'bg-rose-50 text-rose-950 border border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs uppercase font-bold text-slate-500 hover:text-slate-800 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Battery State Gauge */}
      {batteryState && <BatteryVisualizer state={batteryState} policy={policy} />}

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">
            Available Shareable
          </span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            {batteryState?.remainingShareableKwh.toFixed(1)} kWh
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Above 30.0 kWh emergency floor
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">
            Committed Active
          </span>
          <span className="text-2xl font-black text-purple-700 mt-1 block">
            {batteryState?.allocatedEnergyKwh.toFixed(1)} kWh
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {allocatedCount} active, {approvedCount} approved pending commit
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">
            Pending Queue
          </span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">
            {pendingCount} Requests
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Awaiting coordinator decision
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">
            Rejected Total
          </span>
          <span className="text-2xl font-black text-rose-700 mt-1 block">
            {rejectedCount} Requests
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Protected reserve safeguarded
          </span>
        </div>
      </div>

      {/* All Consumer Requests Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-slate-700" aria-hidden="true" />
              <span>Consumer Requests & Allocation Management</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review, approve full or modified energy amounts, commit allocations, or release deallocated capacity.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl font-semibold">
              Total: {requests.length} Requests
            </span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
          {/* Search */}
          <div className="md:col-span-5 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by consumer name, consumer ID, or request ID..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium text-slate-900"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-4 flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved (Ready to Allocate)</option>
              <option value="MODIFIED">Modified by Coordinator</option>
              <option value="ALLOCATED">Active Allocated</option>
              <option value="DEALLOCATED">Deallocated / Released</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="md:col-span-3">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 bg-white"
            >
              <option value="ALL">All Priorities</option>
              <option value="NORMAL">Normal Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="EMERGENCY">Emergency Priority</option>
            </select>
          </div>
        </div>

        {/* Requests Table */}
        {filteredRequests.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <p className="text-sm font-medium">No consumer requests found matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Request ID</th>
                  <th className="py-3 px-3">Consumer</th>
                  <th className="py-3 px-3">Requested</th>
                  <th className="py-3 px-3">Approved</th>
                  <th className="py-3 px-3">Allocated</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Coordinator Remarks</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Request ID & Date */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {req.id}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    {/* Consumer Name & ID */}
                    <td className="py-3 px-3">
                      <strong className="block text-slate-900 font-semibold">{req.consumerName}</strong>
                      <span className="text-[10px] font-mono text-slate-400 block">{req.consumerId}</span>
                    </td>

                    {/* Requested kWh */}
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {req.requestedKwh.toFixed(1)} kWh
                    </td>

                    {/* Approved kWh */}
                    <td className="py-3 px-3 font-bold text-sky-800">
                      {req.approvedKwh !== null ? (
                        `${req.approvedKwh.toFixed(1)} kWh`
                      ) : (
                        <span className="text-slate-300 italic">—</span>
                      )}
                    </td>

                    {/* Allocated kWh */}
                    <td className="py-3 px-3 font-black text-emerald-700">
                      {req.allocatedKwh !== null && req.allocatedKwh > 0 ? (
                        `${req.allocatedKwh.toFixed(1)} kWh`
                      ) : (
                        <span className="text-slate-300 font-normal italic">—</span>
                      )}
                    </td>

                    {/* Priority Badge */}
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

                    {/* Status Badge */}
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
                        {req.status}
                      </span>
                    </td>

                    {/* Remarks */}
                    <td className="py-3 px-3 text-slate-500 max-w-[130px] truncate" title={req.coordinatorRemarks || ''}>
                      {req.coordinatorRemarks || <span className="text-slate-300 italic">—</span>}
                    </td>

                    {/* Actions Column */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Pending Actions */}
                        {req.status === 'PENDING_APPROVAL' && (
                          <>
                            <button
                              onClick={() => handleApproveFull(req)}
                              className="px-2.5 py-1 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 text-[11px] transition-colors"
                              title="Approve requested amount in full"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleOpenModify(req)}
                              className="px-2.5 py-1 bg-sky-100 text-sky-800 font-bold rounded-lg hover:bg-sky-200 text-[11px] transition-colors"
                              title="Modify approved amount"
                            >
                              Modify
                            </button>
                            <button
                              onClick={() => handleOpenReject(req)}
                              className="px-2.5 py-1 bg-rose-100 text-rose-800 font-bold rounded-lg hover:bg-rose-200 text-[11px] transition-colors"
                              title="Reject request"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {/* Approved / Modified Actions */}
                        {(req.status === 'APPROVED' || req.status === 'MODIFIED') && (
                          <>
                            <button
                              onClick={() => handleCommitAllocate(req)}
                              className="px-3 py-1 bg-purple-700 text-white font-bold rounded-lg hover:bg-purple-800 text-[11px] transition-colors shadow-xs"
                              title="Commit allocation to battery"
                            >
                              Allocate
                            </button>
                            <button
                              onClick={() => handleOpenModify(req)}
                              className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-[11px]"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleOpenReject(req)}
                              className="px-2 py-1 text-rose-700 hover:bg-rose-50 rounded-lg text-[11px]"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {/* Allocated Actions */}
                        {req.status === 'ALLOCATED' && (
                          <button
                            onClick={() => handleOpenDeallocate(req)}
                            className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg hover:bg-amber-200 text-[11px] transition-colors flex items-center space-x-1"
                            title="Release allocated energy back to battery"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Deallocate</span>
                          </button>
                        )}

                        {/* Audit Details */}
                        <button
                          onClick={() => setAuditRequest(req)}
                          className="px-2 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-[11px]"
                          title="View complete audit timeline"
                        >
                          Audit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Modify Allocation Modal */}
      {modifyingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center">
                  <Sliders className="w-4 h-4 text-sky-700" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Modify Allocation: {modifyingRequest.id}
                </h3>
              </div>
              <button onClick={() => setModifyingRequest(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmModify} className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Consumer:</span>
                  <span className="font-bold text-slate-900">{modifyingRequest.consumerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Original Requested Energy:</span>
                  <span className="font-bold text-slate-900">{modifyingRequest.requestedKwh.toFixed(1)} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Available Shareable Pool:</span>
                  <span className="font-bold text-emerald-700">
                    {batteryState?.remainingShareableKwh.toFixed(1)} kWh
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Coordinator Approved Energy (kWh)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100.0"
                  required
                  value={modifiedKwhInput}
                  onChange={(e) => setModifiedKwhInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 text-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  The original requested volume of {modifyingRequest.requestedKwh.toFixed(1)} kWh will be preserved in the audit log.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Coordinator Remarks & Justification
                </label>
                <textarea
                  rows={2}
                  required
                  value={modifyRemarks}
                  onChange={(e) => setModifyRemarks(e.target.value)}
                  placeholder="Reason for modifying requested amount..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModifyingRequest(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-700 text-white hover:bg-sky-800"
                >
                  Save Modified Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Reject Modal */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center space-x-2 text-rose-700 pb-3 border-b border-slate-100">
              <XCircle className="w-5 h-5" />
              <h3 className="text-lg font-extrabold text-slate-900">
                Reject Request: {rejectingRequest.id}
              </h3>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <p className="text-xs text-slate-600">
                Are you sure you want to reject this request for{' '}
                <strong>{rejectingRequest.requestedKwh.toFixed(1)} kWh</strong> from{' '}
                <strong>{rejectingRequest.consumerName}</strong>?
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Reason for Rejection
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. RESERVE_PROTECTED, Member cap exceeded..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-600"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectingRequest(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-700 text-white hover:bg-rose-800"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Deallocate Modal */}
      {deallocatingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center space-x-2 text-amber-700 pb-3 border-b border-slate-100">
              <RotateCcw className="w-5 h-5" />
              <h3 className="text-lg font-extrabold text-slate-900">
                Deallocate Energy: {deallocatingRequest.id}
              </h3>
            </div>

            <form onSubmit={handleConfirmDeallocate} className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1 text-amber-900">
                <p>
                  Releasing <strong>{deallocatingRequest.allocatedKwh?.toFixed(1)} kWh</strong> back to the community
                  battery. Available capacity will increase immediately.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Deallocation Remarks
                </label>
                <textarea
                  rows={2}
                  required
                  value={deallocateRemarks}
                  onChange={(e) => setDeallocateRemarks(e.target.value)}
                  placeholder="Reason for releasing energy..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeallocatingRequest(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-700 text-white hover:bg-amber-800"
                >
                  Release Energy Back to Battery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Modal */}
      <AuditTrailModal request={auditRequest} onClose={() => setAuditRequest(null)} />
    </div>
  );
};
