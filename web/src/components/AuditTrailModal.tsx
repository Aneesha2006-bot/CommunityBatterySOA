import React from 'react';
import { BatteryRequest } from '../types';
import { History, X, User, Shield, ArrowRight } from 'lucide-react';

interface AuditTrailModalProps {
  request: BatteryRequest | null;
  onClose: () => void;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({ request, onClose }) => {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-xs">
              <History className="w-5 h-5 text-emerald-400" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Audit Trail: {request.id}</h2>
              <span className="text-xs text-slate-500">
                Consumer: <strong className="text-slate-800">{request.consumerName}</strong> ({request.consumerId})
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Request Summary Banner */}
        <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Requested</span>
            <span className="font-extrabold text-slate-900 text-sm">{request.requestedKwh.toFixed(1)} kWh</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Approved / Active</span>
            <span className="font-extrabold text-emerald-700 text-sm">
              {request.allocatedKwh ? `${request.allocatedKwh.toFixed(1)} kWh` : request.approvedKwh ? `${request.approvedKwh.toFixed(1)} kWh` : 'Pending'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Status</span>
            <span className="font-bold font-mono text-[11px] uppercase text-slate-800">{request.status}</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Lifecycle Events</h3>
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {request.auditTrail.map((entry, idx) => (
              <div key={entry.id || idx} className="relative">
                {/* Timeline Dot */}
                <span className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs ${
                  entry.action === 'ALLOCATED'
                    ? 'bg-emerald-600 ring-4 ring-emerald-100'
                    : entry.action === 'APPROVED' || entry.action === 'MODIFIED'
                    ? 'bg-sky-600 ring-4 ring-sky-100'
                    : entry.action === 'REJECTED'
                    ? 'bg-rose-600 ring-4 ring-rose-100'
                    : entry.action === 'DEALLOCATED'
                    ? 'bg-amber-600 ring-4 ring-amber-100'
                    : 'bg-slate-500 ring-4 ring-slate-100'
                }`}></span>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`font-extrabold font-mono text-[10px] px-2 py-0.5 rounded uppercase tracking-wider ${
                      entry.action === 'ALLOCATED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : entry.action === 'APPROVED'
                        ? 'bg-sky-100 text-sky-800'
                        : entry.action === 'MODIFIED'
                        ? 'bg-purple-100 text-purple-800'
                        : entry.action === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : entry.action === 'DEALLOCATED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-800'
                    }`}>
                      {entry.action}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-slate-600 font-medium text-[11px]">
                    {entry.role === 'coordinator' ? (
                      <Shield className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                    )}
                    <span>{entry.performedBy}</span>
                  </div>

                  {entry.previousKwh !== undefined && entry.newKwh !== undefined && entry.previousKwh !== entry.newKwh && (
                    <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center space-x-2 font-mono text-[11px]">
                      <span className="text-slate-500">{entry.previousKwh.toFixed(1)} kWh</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-emerald-700 font-bold">{entry.newKwh.toFixed(1)} kWh</span>
                    </div>
                  )}

                  {entry.remarks && (
                    <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/60 text-xs italic">
                      &quot;{entry.remarks}&quot;
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
