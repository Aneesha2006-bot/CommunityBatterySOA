import React, { useState } from 'react';
import { BUSINESS_CONFIG } from '../config/business';
import { ShieldAlert, FileText, Lock, Cookie, RefreshCw, Eye } from 'lucide-react';

interface LegalPageProps {
  initialTab?: 'privacy' | 'terms' | 'cookie' | 'refund' | 'accessibility';
}

export const LegalPage: React.FC<LegalPageProps> = ({ initialTab = 'privacy' }) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'cookie' | 'refund' | 'accessibility'>(initialTab);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Prominent Mandatory Legal Draft Alert */}
      <div
        className="p-4 bg-amber-50 rounded-2xl border border-amber-300 text-amber-950 text-xs sm:text-sm flex items-start space-x-3 shadow-xs"
        role="alert"
      >
        <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <strong className="block font-bold text-amber-900 mb-0.5">{BUSINESS_CONFIG.legalDraftNotice}</strong>
          <span>
            These draft legal terms reflect the exact technical and operational behavior of this codebase (data inventory,
            zero non-essential cookies, pseudonymous tokens). They must be formally reviewed and ratified by a licensed
            advocate prior to commercial grid deployment.
          </span>
        </div>
      </div>

      {/* Legal Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2" role="tablist" aria-label="Legal Documents">
        <button
          role="tab"
          aria-selected={activeTab === 'privacy'}
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'privacy'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-4 h-4" aria-hidden="true" />
          <span>Privacy Policy</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'terms'}
          onClick={() => setActiveTab('terms')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'terms'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" aria-hidden="true" />
          <span>Terms & Conditions</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'cookie'}
          onClick={() => setActiveTab('cookie')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'cookie'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Cookie className="w-4 h-4" aria-hidden="true" />
          <span>Cookie Policy</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'refund'}
          onClick={() => setActiveTab('refund')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'refund'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          <span>Refund & Cancellation</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'accessibility'}
          onClick={() => setActiveTab('accessibility')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'accessibility'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Eye className="w-4 h-4" aria-hidden="true" />
          <span>Accessibility</span>
        </button>
      </div>

      {/* Tab 1: Privacy Policy */}
      {activeTab === 'privacy' && (
        <article className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6 text-slate-700 text-sm leading-relaxed">
          <header className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-extrabold text-slate-900">
              Privacy Policy (Designed to Support India DPDP Act 2023 & Rules 2025)
            </h1>
            <p className="text-xs text-slate-500 mt-1">Last Updated: October 2026 • Document Version 1.0 (Draft)</p>
          </header>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">1. Data Fiduciary & Contact Details</h2>
            <p>
              The platform is operated by <strong>{BUSINESS_CONFIG.organizationName}</strong> (&quot;Data Fiduciary&quot;). For any questions or
              to exercise statutory rights, contact our designated Grievance Officer:
            </p>
            <ul className="list-disc list-inside pl-3 space-y-1 text-xs">
              <li>Officer: {BUSINESS_CONFIG.grievanceOfficerName}</li>
              <li>Email: {BUSINESS_CONFIG.grievanceOfficerEmail}</li>
              <li>Data Protection Office: {BUSINESS_CONFIG.dpoEmail}</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">2. Real Data Inventory & Processing Purposes</h2>
            <p>
              In adherence to Section 4 and Section 6 of the DPDP Act 2023, data processing is strictly limited to the
              following specific purposes:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs bg-slate-50 rounded-lg border border-slate-200">
                <thead className="bg-slate-100 font-semibold text-slate-900">
                  <tr>
                    <th className="p-2.5">Data Category</th>
                    <th className="p-2.5">Exact Purpose</th>
                    <th className="p-2.5">Statutory Legal Basis</th>
                    <th className="p-2.5">Retention Period</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2.5 font-medium">Username & Hashed Credentials</td>
                    <td className="p-2.5">Authentication and RS256 token issuance</td>
                    <td className="p-2.5">Explicit Consent / Contract</td>
                    <td className="p-2.5">Duration of active account</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Pseudonymous Member Ref (`sub`)</td>
                    <td className="p-2.5">Computing 24h rolling member discharge cap (50 kWh)</td>
                    <td className="p-2.5">Contractual Necessity / Consent</td>
                    <td className="p-2.5">1 year for operational audit</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Consent Records</td>
                    <td className="p-2.5">Evidencing affirmative consent under DPDP Sec 6</td>
                    <td className="p-2.5">Legal Obligation</td>
                    <td className="p-2.5">7 years (statutory compliance)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">3. Rights of the Data Principal (Sections 11–14)</h2>
            <p>Under the DPDP Act 2023, you have the right to:</p>
            <ul className="list-disc list-inside pl-3 space-y-1.5">
              <li><strong>Right to Access (Sec. 11):</strong> Request a summary of personal data being processed and identities of Data Fiduciaries.</li>
              <li><strong>Right to Correction & Erasure (Sec. 12):</strong> Correct inaccurate data or request deletion of data no longer required for energy allocation.</li>
              <li><strong>Right to Grievance Redressal (Sec. 13):</strong> Register a complaint with our Grievance Officer, who must respond within 72 hours under DPDP Rules 2025.</li>
              <li><strong>Right to Nominate (Sec. 14):</strong> Nominate an individual to exercise rights in event of death or incapacity.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">4. Breach Notification Protocol</h2>
            <p>
              In accordance with Section 8(6) of the DPDP Act 2023, in the event of any personal data breach affecting this system,
              the Data Fiduciary will notify both the Data Protection Board of India and affected Data Principals without undue delay.
            </p>
          </section>
        </article>
      )}

      {/* Tab 2: Terms & Conditions */}
      {activeTab === 'terms' && (
        <article className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6 text-slate-700 text-sm leading-relaxed">
          <header className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-extrabold text-slate-900">Terms & Conditions of Service</h1>
            <p className="text-xs text-slate-500 mt-1">Last Updated: October 2026 • Document Version 1.0 (Draft)</p>
          </header>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">1. Acceptance & Academic Nature of Platform</h2>
            <p>
              By accessing the Community Battery Reserve Priority platform, you acknowledge that this system is an
              academic software demonstration (SOA s10.t03). All energy balances, financial units, and device telemetry
              are purely synthetic simulations. No physical battery discharge or financial transaction occurs.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">2. Emergency Reserve Priority Rule</h2>
            <p>
              Energy allocations are strictly conditional upon maintaining the 30.0 kWh protected emergency reserve
              floor. The system domain engine has unilateral authority to curtail, deny, or partially grant requests
              that cut into the protected reserve.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">3. Fair Use & Rate Limiting</h2>
            <p>
              Each member account is bound by a maximum 24-hour quota of 50.0 kWh. Requests exceeding this quota are
              automatically denied with reason code <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">MEMBER_CAP</code>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">4. Governing Law & Dispute Resolution</h2>
            <p>
              These draft terms are interpreted under the laws of India. Any statutory disputes under the DPDP Act 2023
              are subject to the jurisdiction of the Data Protection Board of India and the Telecom Disputes Settlement
              and Appellate Tribunal (TDSAT).
            </p>
          </section>
        </article>
      )}

      {/* Tab 3: Cookie Policy */}
      {activeTab === 'cookie' && (
        <article className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6 text-slate-700 text-sm leading-relaxed">
          <header className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-extrabold text-slate-900">Cookie & Storage Policy (Zero Non-Essential Cookies)</h1>
            <p className="text-xs text-slate-500 mt-1">Last Updated: October 2026 • Document Version 1.0 (Draft)</p>
          </header>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">1. Architectural Zero-Cookie Stance</h2>
            <p>
              We firmly respect your privacy and have deliberately designed this application to function with{' '}
              <strong>zero non-essential cookies</strong>. We do NOT use third-party advertising cookies, Google Analytics,
              tracking pixels, or cross-site fingerprinting scripts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">2. Strictly Necessary Storage</h2>
            <p>The only client-side storage mechanisms utilized are strictly necessary for core functionality:</p>
            <ul className="list-disc list-inside pl-3 space-y-1 text-xs">
              <li><strong>Session Storage / In-Memory JWT:</strong> Holds short-lived Bearer tokens for API Gateway routing. Cleared when tab closes.</li>
              <li><strong>Local Storage (Preferences):</strong> Retains your dark/light UI preference and local consent toggle cache.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">3. Absence of Invasive Cookie Banners</h2>
            <p>
              Because zero profiling or marketing cookies are written, an intrusive cookie consent popup is unnecessary under
              the ePrivacy Directive and India DPDP Act 2023.
            </p>
          </section>
        </article>
      )}

      {/* Tab 4: Refund & Cancellation Policy */}
      {activeTab === 'refund' && (
        <article className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6 text-slate-700 text-sm leading-relaxed">
          <header className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-extrabold text-slate-900">Refund & Allocation Adjustment Policy</h1>
            <p className="text-xs text-slate-500 mt-1">Last Updated: October 2026 • Document Version 1.0 (Draft)</p>
          </header>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">1. Synthetic Nature Disclaimer</h2>
            <p>
              In this academic prototype, all kWh allocations and financial credits are synthetic simulations. No monetary
              payments or billing transactions are collected, and consequently no cash refunds are processed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">2. Grid Quota Re-crediting (Future Grid Deployment)</h2>
            <p>
              In a commercial community battery deployment, if a granted discharge is aborted due to grid inverter trip or
              power failure, the unconsumed portion of the allocation is automatically refunded to the member&apos;s daily quota
              ledger within 15 minutes via the Kafka dead-letter and reconciliation saga.
            </p>
          </section>
        </article>
      )}

      {/* Tab 5: Accessibility Statement */}
      {activeTab === 'accessibility' && (
        <article className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6 text-slate-700 text-sm leading-relaxed">
          <header className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-extrabold text-slate-900">Accessibility Statement (WCAG 2.2 AA)</h1>
            <p className="text-xs text-slate-500 mt-1">Last Updated: October 2026 • Document Version 1.0 (Draft)</p>
          </header>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">1. Conformance Target & Principles</h2>
            <p>
              The Community Battery Reserve platform is engineered to comply with the <strong>Web Content Accessibility Guidelines (WCAG) 2.2 Level AA</strong>{' '}
              and India&apos;s Rights of Persons with Disabilities Act 2016.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">2. Key Accessibility Features Implemented</h2>
            <ul className="list-disc list-inside pl-3 space-y-1.5 text-xs">
              <li><strong>Skip-to-Main Link:</strong> Allows keyboard users to bypass navigation directly to `#main-content`.</li>
              <li><strong>High Contrast Ratios:</strong> All body text achieves contrast ratios exceeding 4.5:1 (audited via `scripts/check-contrast.cjs`).</li>
              <li><strong>Semantic HTML5 Landmarks:</strong> Structured with standard landmarks (&lt;header&gt;, &lt;nav&gt;, &lt;main&gt;, &lt;footer&gt;, &lt;section&gt;, &lt;article&gt;).</li>
              <li><strong>Visible Focus Rings:</strong> Unambiguous 2px focus outlines for all keyboard interactive controls.</li>
              <li><strong>Screen Reader Live Regions:</strong> Allocation decisions announced dynamically via `aria-live=&quot;polite&quot;`.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">3. Accessibility Feedback Contact</h2>
            <p>
              If you experience any accessibility barrier using this application, please email our team at{' '}
              <a href={`mailto:${BUSINESS_CONFIG.supportEmail}`} className="text-emerald-700 underline font-medium">
                {BUSINESS_CONFIG.supportEmail}
              </a>.
            </p>
          </section>
        </article>
      )}
    </div>
  );
};
