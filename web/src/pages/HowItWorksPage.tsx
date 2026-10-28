import React from 'react';
import { ShieldCheck, GitCommit, Layers, AlertTriangle } from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Domain Architecture & Allocation Logic
        </h1>
        <p className="mt-2 text-base text-slate-600 leading-relaxed">
          Comprehensive specification of the framework-free Reserve Allocator, event choreography, and regulatory
          safeguards governing the shared battery.
        </p>
      </div>

      {/* 1. Mathematical Domain Rules */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center space-x-3 text-emerald-800">
          <Layers className="w-6 h-6" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-slate-900">1. Pure Domain Rule (`ReserveAllocator.java`)</h2>
        </div>

        <p className="text-slate-600 text-sm leading-relaxed">
          The allocation logic is completely decoupled from Spring frameworks, HTTP controllers, and databases,
          enabling exhaustive unit testing and deterministic verification:
        </p>

        <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-sm space-y-2 overflow-x-auto">
          <div className="text-emerald-400 font-bold">// 1. Calculate shareable energy pool above emergency floor</div>
          <div>shareablePool = Math.max(0.0, currentCharge - reserveFloor);</div>
          <div className="text-emerald-400 font-bold mt-2">// 2. Compute non-emergency allocation grant</div>
          <div>granted = Math.min(requested, Math.min(shareablePool, remainingMemberDailyCap));</div>
          <div>denied = requested - granted;</div>
          <div className="text-emerald-400 font-bold mt-2">// 3. Reason code evaluation</div>
          <div>if (denied &gt; 0 && granted == shareablePool) =&gt; RESERVE_PROTECTED</div>
          <div>if (denied &gt; 0 && granted == remainingMemberDailyCap) =&gt; MEMBER_CAP</div>
        </div>

        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-sm flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <strong className="block font-semibold">Emergency Request Override Rule:</strong>
            Only an authenticated user possessing the <code className="font-mono text-xs bg-amber-100 px-1 py-0.5 rounded">energyCoordinator</code>{' '}
            role may authorize use of the protected reserve. Draws below an absolute minimum safety margin (5.0 kWh default)
            are strictly rejected under all circumstances. Member-flagged emergencies without coordinator approval are
            queued as <code className="font-mono text-xs bg-amber-100 px-1 py-0.5 rounded">PENDING_COORDINATOR_REVIEW</code>.
          </div>
        </div>
      </section>

      {/* 2. Step-by-Step Scenario Walkthrough */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center space-x-3 text-emerald-800">
          <GitCommit className="w-6 h-6" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-slate-900">2. The Row-Specific Edge Case Walkthrough</h2>
        </div>

        <div className="space-y-4 text-sm text-slate-600">
          <p>
            Consider the exact seed state defined in the project specification (Capacity = 100 kWh, Initial Charge = 80 kWh,
            Floor = 30 kWh, Member Cap = 50 kWh):
          </p>

          <ol className="list-decimal list-inside space-y-3 pl-2">
            <li>
              <strong>Initial State:</strong> Battery is at 80.0 kWh. Shareable pool is 80 - 30 = 50.0 kWh.
            </li>
            <li>
              <strong>Step 1 (Normal Request):</strong> <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">member-a</code> requests
              <strong>12.0 kWh</strong>. Result is <strong className="text-emerald-700">GRANTED</strong>. Battery charge
              transitions to <strong>68.0 kWh</strong>. Shareable pool is now 68 - 30 = 38.0 kWh.
            </li>
            <li>
              <strong>Step 2 (The Edge Case):</strong> <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">member-b</code> requests
              <strong>45.0 kWh</strong>.
              <ul className="list-disc list-inside pl-5 mt-1 text-slate-700">
                <li>Shareable pool available: <strong>38.0 kWh</strong></li>
                <li>Granted volume: min(45, 38, 50) = <strong>38.0 kWh</strong></li>
                <li>Denied volume: 45 - 38 = <strong>7.0 kWh</strong></li>
                <li>Status: <strong className="text-amber-700">PARTIALLY_GRANTED</strong></li>
                <li>Reason Code: <strong className="text-rose-700 font-mono">RESERVE_PROTECTED</strong></li>
                <li>
                  Final Battery Charge: 68.0 - 38.0 = <strong className="text-slate-900 font-mono">30.0 kWh</strong> (lands
                  precisely on the emergency reserve floor!).
                </li>
              </ul>
            </li>
          </ol>
        </div>
      </section>

      {/* 3. Event Choreography & Transactional Outbox */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center space-x-3 text-emerald-800">
          <ShieldCheck className="w-6 h-6" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-slate-900">3. Transactional Outbox & Idempotency</h2>
        </div>

        <p className="text-slate-600 text-sm leading-relaxed">
          To prevent distributed dual-write inconsistency between Postgres and Kafka:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm mb-1">Transactional Outbox</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Discharge decisions, rejected request rows, and an <code className="font-mono bg-white px-1 py-0.5 rounded">OutboxEvent</code> are
              committed inside a single atomic database transaction. An asynchronous relay processes them with
              <code className="font-mono bg-white px-1 py-0.5 rounded ml-1">SELECT ... FOR UPDATE SKIP LOCKED</code>, guaranteeing zero duplicate
              publishes even with multiple instances running.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm mb-1">Idempotent Consumer</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              <code className="font-mono bg-white px-1 py-0.5 rounded">BatteryStateService</code> listens on Kafka topic
              <code className="font-mono bg-white px-1 py-0.5 rounded ml-1">soa.s10.t03.events</code>. It writes to
              <code className="font-mono bg-white px-1 py-0.5 rounded ml-1">processed_events(event_id UNIQUE)</code>. If a network hiccup causes an
              event to be delivered twice, the second execution yields zero extra charge deduction.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
