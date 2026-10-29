import React from 'react';
import { BatteryState } from '../types';
import { BatteryMedium, ShieldAlert, Zap, Layers, Activity } from 'lucide-react';

interface BatteryVisualizerProps {
  state: BatteryState;
  policy?: any;
}

export const BatteryVisualizer: React.FC<BatteryVisualizerProps> = ({ state }) => {
  const capacity = state.capacityKwh || 100.0;
  const available = Math.max(0, Math.min(capacity, state.availableEnergyKwh));
  const allocated = Math.max(0, Math.min(capacity, state.allocatedEnergyKwh));
  const reserveFloor = Math.max(0, Math.min(capacity, state.reserveFloorKwh));
  const shareable = Math.max(0, available - reserveFloor);

  const availablePercent = Math.min(100, Math.max(0, (available / capacity) * 100));
  const allocatedPercent = Math.min(100, Math.max(0, (allocated / capacity) * 100));
  const reservePercent = (reserveFloor / capacity) * 100;
  const shareablePercent = (shareable / capacity) * 100;

  return (
    <div
      className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200"
      aria-label="Community Battery Telemetry and Capacity Gauge"
      role="region"
    >
      {/* Title & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <BatteryMedium className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Live Battery Capacity & State of Charge</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulated community energy storage metrics with strict 30.0 kWh emergency reserve floor.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200/80 text-xs">
          <div>
            <span className="block text-[11px] text-slate-400 font-medium">State of Charge</span>
            <span className="text-xl font-black text-emerald-700">{availablePercent.toFixed(0)}%</span>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div>
            <span className="block text-[11px] text-slate-400 font-medium">System Status</span>
            <span className="inline-flex items-center font-bold text-slate-800 space-x-1">
              <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>{state.status || 'Idle'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* SVG Battery Gauge */}
      <div className="my-8">
        <div className="relative w-full max-w-2xl mx-auto">
          <svg
            viewBox="0 0 600 120"
            className="w-full h-auto drop-shadow-xs"
            role="img"
            aria-label={`Battery Gauge: ${available.toFixed(1)} kWh available of ${capacity} kWh total. Emergency reserve floor is ${reserveFloor.toFixed(1)} kWh. Available shareable pool is ${shareable.toFixed(1)} kWh. Allocated energy is ${allocated.toFixed(1)} kWh.`}
          >
            <defs>
              {/* Pattern for Emergency Reserve Floor */}
              <pattern id="reserveHatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="10" stroke="#be123c" strokeWidth="2.5" />
                <line x1="0" y1="0" x2="10" y2="0" stroke="#f43f5e" strokeWidth="2.5" />
              </pattern>
              {/* Gradient for Shareable Pool */}
              <linearGradient id="shareableGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            {/* Battery Terminal Pin */}
            <path d="M 570 45 L 585 45 L 585 75 L 570 75 Z" fill="#94a3b8" rx="2" />

            {/* Outer Battery Shell */}
            <rect
              x="10"
              y="10"
              width="555"
              height="100"
              rx="14"
              fill="#f8fafc"
              stroke="#64748b"
              strokeWidth="3.5"
            />

            {/* Inactive Empty Battery Zone */}
            <rect x="18" y="18" width="539" height="84" rx="8" fill="#e2e8f0" />

            {/* Layer 1: Protected Emergency Reserve Floor (0 to 30%) */}
            <rect
              x="18"
              y="18"
              width={Math.max(0, 539 * (reservePercent / 100))}
              height="84"
              rx="8"
              fill="#ffe4e6"
            />
            <rect
              x="18"
              y="18"
              width={Math.max(0, 539 * (reservePercent / 100))}
              height="84"
              rx="8"
              fill="url(#reserveHatch)"
              opacity="0.35"
            />

            {/* Layer 2: Shareable Available Pool */}
            {shareable > 0 && (
              <rect
                x={18 + 539 * (reservePercent / 100)}
                y="18"
                width={Math.max(0, 539 * (shareablePercent / 100))}
                height="84"
                fill="url(#shareableGrad)"
              />
            )}

            {/* Reserve Floor Vertical Indicator Line */}
            <line
              x1={18 + 539 * (reservePercent / 100)}
              y1="10"
              x2={18 + 539 * (reservePercent / 100)}
              y2="110"
              stroke="#be123c"
              strokeWidth="3"
              strokeDasharray="4,4"
            />
          </svg>

          {/* SVG Labels Below Gauge */}
          <div className="flex justify-between text-xs font-semibold text-slate-500 mt-2.5 px-3">
            <span>0 kWh</span>
            <span className="text-rose-700 font-bold flex items-center">
              ▲ Protected Reserve ({reserveFloor.toFixed(0)} kWh)
            </span>
            <span className="text-emerald-700 font-bold">
              Available ({available.toFixed(1)} kWh)
            </span>
            <span>Total: {capacity.toFixed(0)} kWh</span>
          </div>
        </div>
      </div>

      {/* 4 Core Energy Breakdown Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* Available Shareable Pool */}
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">
              Shareable Pool
            </span>
            <Zap className="w-4 h-4 text-emerald-700" aria-hidden="true" />
          </div>
          <div className="text-2xl font-black text-emerald-800 mt-1">{shareable.toFixed(1)} kWh</div>
          <p className="text-[11px] text-emerald-700 mt-1">
            Available for regular consumer requests.
          </p>
        </div>

        {/* Protected Emergency Reserve */}
        <div className="bg-rose-50 rounded-2xl p-4 border border-rose-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-900">
              Emergency Reserve
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-700" aria-hidden="true" />
          </div>
          <div className="text-2xl font-black text-rose-800 mt-1">{reserveFloor.toFixed(1)} kWh</div>
          <p className="text-[11px] text-rose-700 mt-1">
            Protected floor. Never cut by standard requests.
          </p>
        </div>

        {/* Active Allocated Energy */}
        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900">
              Committed Allocation
            </span>
            <Layers className="w-4 h-4 text-purple-700" aria-hidden="true" />
          </div>
          <div className="text-2xl font-black text-purple-800 mt-1">{allocated.toFixed(1)} kWh</div>
          <p className="text-[11px] text-purple-700 mt-1">
            {allocatedPercent.toFixed(0)}% committed to consumer demands.
          </p>
        </div>

        {/* Total Available Capacity */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
              Available Charge
            </span>
            <BatteryMedium className="w-4 h-4 text-slate-700" aria-hidden="true" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{available.toFixed(1)} kWh</div>
          <p className="text-[11px] text-slate-600 mt-1">
            {availablePercent.toFixed(0)}% of total {capacity.toFixed(0)} kWh capacity.
          </p>
        </div>
      </div>
    </div>
  );
};
