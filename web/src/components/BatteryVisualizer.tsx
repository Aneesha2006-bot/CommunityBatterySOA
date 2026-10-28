import React from 'react';
import { BatteryState, ReservePolicy } from '../types';
import { ShieldAlert, Zap, BatteryMedium } from 'lucide-react';

interface BatteryVisualizerProps {
  state: BatteryState;
  policy: ReservePolicy;
}

export const BatteryVisualizer: React.FC<BatteryVisualizerProps> = ({ state, policy }) => {
  const capacity = state.capacityKwh || 100.0;
  const currentCharge = Math.min(state.currentChargeKwh || 80.0, capacity);
  const reserveFloor = Math.min(policy.reserveFloorKwh || 30.0, capacity);
  const shareablePool = Math.max(0, currentCharge - reserveFloor);

  // Percentages for SVG positioning
  const currentPercent = (currentCharge / capacity) * 100;
  const reservePercent = (reserveFloor / capacity) * 100;
  const shareablePercent = (shareablePool / capacity) * 100;

  return (
    <div
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
      aria-label="Battery Status Visualizer"
      role="region"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BatteryMedium className="w-6 h-6 text-emerald-700" aria-hidden="true" />
            <h2 className="text-xl font-bold text-slate-900">Community Battery Physical State</h2>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time telemetry showing live charge, protected emergency floor, and available shareable pool.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-sm">
          <div className="text-right">
            <span className="block text-xs text-slate-500 font-medium">Current Charge</span>
            <span className="text-lg font-extrabold text-slate-900">
              {currentCharge.toFixed(1)}{' '}
              <span className="text-xs font-normal text-slate-500">/ {capacity.toFixed(0)} kWh</span>
            </span>
          </div>
          <div className="w-px h-8 bg-slate-300"></div>
          <div className="text-right">
            <span className="block text-xs text-slate-500 font-medium">State of Charge</span>
            <span className="text-lg font-extrabold text-emerald-700">{currentPercent.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* SVG Battery Gauge */}
      <div className="my-8">
        <div className="relative w-full max-w-2xl mx-auto">
          {/* Battery Body SVG */}
          <svg
            viewBox="0 0 600 120"
            className="w-full h-auto drop-shadow-sm"
            role="img"
            aria-label={`Battery Gauge: ${currentCharge} kWh of ${capacity} kWh charged. Emergency reserve floor is at ${reserveFloor} kWh. Shareable pool is ${shareablePool} kWh.`}
          >
            <defs>
              {/* Pattern for Reserve Floor */}
              <pattern id="reserveStripe" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="10" stroke="#be123c" strokeWidth="3" />
                <line x1="0" y1="0" x2="10" y2="0" stroke="#f43f5e" strokeWidth="3" />
              </pattern>
              {/* Gradient for Shareable Pool */}
              <linearGradient id="poolGrad" x1="0%" y1="0%" x2="100%" y2="0%">
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
              rx="12"
              fill="#f1f5f9"
              stroke="#64748b"
              strokeWidth="4"
            />

            {/* Inactive Empty Battery Zone */}
            <rect x="18" y="18" width="539" height="84" rx="8" fill="#e2e8f0" />

            {/* Layer 1: Protected Reserve Floor (Red/Rose Pattern) */}
            <rect
              x="18"
              y="18"
              width={Math.max(0, 539 * (reservePercent / 100))}
              height="84"
              rx="8"
              fill="#ffe4e6"
              stroke="#f43f5e"
              strokeWidth="2"
            />
            <rect
              x="18"
              y="18"
              width={Math.max(0, 539 * (reservePercent / 100))}
              height="84"
              rx="8"
              fill="url(#reserveStripe)"
              opacity="0.35"
            />

            {/* Layer 2: Shareable Pool (Emerald Gradient) */}
            {shareablePool > 0 && (
              <rect
                x={18 + 539 * (reservePercent / 100)}
                y="18"
                width={Math.max(0, 539 * (shareablePercent / 100))}
                height="84"
                fill="url(#poolGrad)"
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
          <div className="flex justify-between text-xs font-semibold text-slate-500 mt-2 px-3">
            <span>0 kWh</span>
            <span className="text-rose-700 font-bold flex items-center">
              ▲ Protected Reserve Floor ({reserveFloor.toFixed(0)} kWh)
            </span>
            <span className="text-emerald-700 font-bold">
              Current Charge ({currentCharge.toFixed(1)} kWh)
            </span>
            <span>{capacity.toFixed(0)} kWh</span>
          </div>
        </div>
      </div>

      {/* Metrics Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        {/* Shareable Pool Card */}
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Available Shareable Pool</span>
            <Zap className="w-4 h-4 text-emerald-700" aria-hidden="true" />
          </div>
          <div className="text-2xl font-black text-emerald-800 mt-2">{shareablePool.toFixed(1)} kWh</div>
          <p className="text-xs text-emerald-700 mt-1">Available for regular member discharge requests.</p>
        </div>

        {/* Protected Emergency Reserve Card */}
        <div className="bg-rose-50 rounded-xl p-4 border border-rose-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">Protected Emergency Reserve</span>
            <ShieldAlert className="w-4 h-4 text-rose-700" aria-hidden="true" />
          </div>
          <div className="text-2xl font-black text-rose-800 mt-2">{reserveFloor.toFixed(1)} kWh</div>
          <p className="text-xs text-rose-700 mt-1">
            Strictly guarded floor. Only energyCoordinator may authorize draws.
          </p>
        </div>

        {/* Member 24h Quota Card */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Member 24h Cap</span>
            <span className="text-xs font-mono bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">Policy</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{policy.perMemberDailyCapKwh.toFixed(1)} kWh</div>
          <p className="text-xs text-slate-600 mt-1">Maximum energy grant per member in a rolling 24-hour window.</p>
        </div>
      </div>
    </div>
  );
};
