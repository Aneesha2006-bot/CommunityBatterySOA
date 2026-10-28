import React from 'react';
import { ShieldCheck, Zap, Activity, ArrowRight, Lock } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pb-16 text-center lg:text-left">
        <div className="max-w-4xl mx-auto lg:mx-0">
          <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold mb-6">
            <ShieldCheck className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            <span>SOA Course Demonstration • Assignment s10.t03</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Shared Community Energy Storage with{' '}
            <span className="text-emerald-700">Guaranteed Emergency Reserve</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl leading-relaxed">
            Honoring regular member energy requests while strictly defending a protected reserve floor (30 kWh)
            for life-critical services, backed by transactional outbox event choreography and optimistic locking.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-3 bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:bg-emerald-800 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 flex items-center space-x-2"
            >
              <span>Launch Live Visualizer</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => onNavigate('how-it-works')}
              className="px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-xl font-semibold hover:bg-slate-50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              Explore Domain Algorithm
            </button>
          </div>
        </div>
      </section>

      {/* 3 Pillars Section */}
      <section aria-labelledby="pillars-heading" className="py-8">
        <h2 id="pillars-heading" className="sr-only">
          Core System Pillars
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Protected Emergency Reserve</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                A hard non-emergency floor (default 30 kWh) is mathematically protected. Any request cutting below the
                floor is cleanly partitioned: non-reserve portions are granted, while the reserve portion is denied with
                <code className="text-xs bg-rose-50 text-rose-800 px-1.5 py-0.5 rounded font-mono ml-1">
                  RESERVE_PROTECTED
                </code>
                .
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Transactional Outbox Choreography</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Zero dual-write anomalies. Decisions and outbox records are saved in a single database transaction. A
                dedicated relay publishes to Kafka with
                <code className="text-xs bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-mono ml-1">
                  SKIP LOCKED
                </code>
                , consumed idempotently by BatteryState.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">DPDP 2023 Privacy Support</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Built to support India’s Digital Personal Data Protection Act 2023 and DPDP Rules 2025. Zero
                non-essential cookies, pseudonymous member references, purpose-specific consent, and a dedicated
                privacy rights intake portal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Row-Specific Demo Highlight Callout */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-10 text-white shadow-lg">
        <div className="max-w-3xl">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800">
            Row-Specific Edge Case Verification
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-4 mb-3">
            Watch the 45 kWh Edge Case in Action
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            When charge is <strong>68 kWh</strong> and emergency floor is <strong>30 kWh</strong>, the shareable pool is{' '}
            <strong>38 kWh</strong>. If member-b requests <strong>45 kWh</strong>, the engine grants exactly 38 kWh and
            denies 7 kWh (RESERVE_PROTECTED), landing the battery precisely on the 30.0 kWh floor.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-lg hover:bg-emerald-400 transition-all flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" aria-hidden="true" />
              <span>Simulate Case on Dashboard</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
