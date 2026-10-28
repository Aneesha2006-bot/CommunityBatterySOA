import React from 'react';
import { BUSINESS_CONFIG } from '../config/business';
import { ShieldCheck, HeartHandshake } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20" aria-label="Site Footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Organization & Mission */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 text-white font-bold text-lg mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" aria-hidden="true" />
              <span>{BUSINESS_CONFIG.organizationName}</span>
            </div>
            <p className="text-sm text-slate-400 mb-4 max-w-md">
              {BUSINESS_CONFIG.projectName}. Research architecture demonstrating transactional outbox event
              choreography, optimistic locking, and strict emergency reserve protection.
            </p>
            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/60 text-xs text-amber-300 flex items-start space-x-2 max-w-md">
              <span className="font-semibold block">{BUSINESS_CONFIG.syntheticDisclaimer}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-emerald-400 transition-colors text-slate-400"
                >
                  Home & Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-emerald-400 transition-colors text-slate-400"
                >
                  How It Works & Math
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-emerald-400 transition-colors text-slate-400"
                >
                  Live Battery Visualizer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privacy-rights')}
                  className="hover:text-emerald-400 transition-colors text-slate-400"
                >
                  DPDP Privacy Rights Intake
                </button>
              </li>
            </ul>
          </div>

          {/* Compliance & Legal Pages */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Compliance & Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('legal-privacy')}
                  className="hover:text-emerald-400 transition-colors text-slate-400 text-left"
                >
                  Privacy Policy (DPDP 2023)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('legal-terms')}
                  className="hover:text-emerald-400 transition-colors text-slate-400 text-left"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('legal-cookie')}
                  className="hover:text-emerald-400 transition-colors text-slate-400 text-left"
                >
                  Cookie Policy (Zero-Cookie)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('legal-refund')}
                  className="hover:text-emerald-400 transition-colors text-slate-400 text-left"
                >
                  Refund & Cancellation
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('legal-accessibility')}
                  className="hover:text-emerald-400 transition-colors text-slate-400 text-left"
                >
                  Accessibility Statement
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="italic">{BUSINESS_CONFIG.legalDraftNotice}</p>
          <div className="flex items-center space-x-1 text-slate-400">
            <HeartHandshake className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <span>DPDP Grievance Contact: {BUSINESS_CONFIG.grievanceOfficerEmail}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
