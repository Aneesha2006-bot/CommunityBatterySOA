import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DischargeRequest, RejectedRequest } from '../types';
import { Clock, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

export const RequestsPage: React.FC = () => {
  const { user, isCoordinator } = useAuth();
  const [requests, setRequests] = useState<DischargeRequest[]>([]);
  const [rejections, setRejections] = useState<RejectedRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [reqs, rejs] = await Promise.all([api.listDischarges(), api.listRejected()]);
        // Filter by member if not coordinator
        if (!isCoordinator && user?.subject) {
          setRequests(reqs.filter((r) => r.memberRef === user.subject || r.memberRef.includes(user.username)));
          setRejections(rejs.filter((r) => r.memberRef === user.subject || r.memberRef.includes(user.username)));
        } else {
          setRequests(reqs);
          setRejections(rejs);
        }
      } catch {
        // offline safe
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, isCoordinator]);

  return (
    <div className="space-y-8 py-4">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Discharge Requests & Audit Ledger
        </h1>
        <p className="mt-2 text-base text-slate-600">
          {isCoordinator
            ? 'Energy Coordinator View: Auditing all community member allocations and reserve rejections.'
            : `Member View (${user?.username}): Reviewing your historical energy draw authorizations.`}
        </p>
      </div>

      {/* Rejections Callout / Table if any exist */}
      {rejections.length > 0 && (
        <section
          className="bg-rose-50 rounded-2xl p-6 border border-rose-200 shadow-xs space-y-4"
          aria-labelledby="rejections-heading"
        >
          <div className="flex items-center space-x-2 text-rose-900">
            <ShieldAlert className="w-5 h-5 text-rose-700" aria-hidden="true" />
            <h2 id="rejections-heading" className="text-xl font-bold">
              Protected Reserve Rejection Ledger (`rejected_requests`)
            </h2>
          </div>
          <p className="text-xs text-rose-800">
            These rows record requests that were curtailed or rejected to safeguard the 30.0 kWh emergency reserve or
            individual daily caps.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs bg-white rounded-xl border border-rose-200 overflow-hidden">
              <thead className="bg-rose-100/60 text-rose-950 font-semibold border-b border-rose-200">
                <tr>
                  <th className="py-2.5 px-3">Request ID</th>
                  <th className="py-2.5 px-3">Member Ref</th>
                  <th className="py-2.5 px-3">Denied (kWh)</th>
                  <th className="py-2.5 px-3">Reason Code</th>
                  <th className="py-2.5 px-3">Correlation ID</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-100 text-slate-700">
                {rejections.map((rej) => (
                  <tr key={rej.id} className="hover:bg-rose-50/50">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{rej.requestId}</td>
                    <td className="py-2.5 px-3 font-mono">{rej.memberRef}</td>
                    <td className="py-2.5 px-3 font-bold text-rose-700">+{rej.deniedKwh.toFixed(1)} kWh</td>
                    <td className="py-2.5 px-3">
                      <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                        {rej.reasonCode}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{rej.correlationId}</td>
                    <td className="py-2.5 px-3 text-slate-500">{new Date(rej.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Main Request History Table */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4" aria-labelledby="history-heading">
        <h2 id="history-heading" className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <Clock className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          <span>Allocation History</span>
        </h2>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-sm">Loading allocation records...</div>
        ) : requests.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No discharge requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Requested</th>
                  <th className="py-3 px-4">Granted</th>
                  <th className="py-3 px-4">Denied</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Processed By</th>
                  <th className="py-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 text-xs">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">{req.id}</td>
                    <td className="py-3 px-4 font-mono">{req.memberRef}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{req.requestedKwh.toFixed(1)} kWh</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">{req.grantedKwh.toFixed(1)} kWh</td>
                    <td className="py-3 px-4 font-bold text-rose-700">
                      {req.deniedKwh > 0 ? `${req.deniedKwh.toFixed(1)} kWh` : '0.0'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          req.status === 'GRANTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'PARTIALLY_GRANTED'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {req.status === 'GRANTED' && <CheckCircle className="w-3 h-3 mr-1" aria-hidden="true" />}
                        {req.status === 'PARTIALLY_GRANTED' && (
                          <AlertTriangle className="w-3 h-3 mr-1" aria-hidden="true" />
                        )}
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{req.processedByInstance}</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(req.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
