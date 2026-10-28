import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BatteryCharging, ShieldAlert, User, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { user, login, isCoordinator } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      {/* WCAG 2.2 Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-700 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600"
      >
        Skip to main content
      </a>

      {/* Synthetic Demo Banner */}
      <div className="bg-amber-500 text-amber-950 px-4 py-1 text-xs font-medium text-center flex items-center justify-center space-x-2">
        <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
        <span>
          <strong>Academic Demo Mode (SOA s10.t03):</strong> All telemetry, members, and kWh units are synthetic.
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-sm">
              <BatteryCharging className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight block">CommunityBattery</span>
              <span className="text-xs text-emerald-800 font-semibold block -mt-1">Reserve Priority SOA</span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'home'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('how-it-works')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'how-it-works'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              How It Works
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'dashboard'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Live Dashboard
            </button>
            <button
              onClick={() => onNavigate('requests')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'requests'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              My Requests
            </button>
            {isCoordinator && (
              <button
                onClick={() => onNavigate('coordinator')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                  currentPage === 'coordinator'
                    ? 'bg-rose-50 text-rose-800 font-semibold'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 mr-1" aria-hidden="true" />
                <span>Coordinator Console</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('privacy-rights')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'privacy-rights'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              DPDP Rights
            </button>
          </nav>

          {/* User Switcher Dropdown / Quick Switch */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-slate-100 rounded-lg p-1 text-xs">
              <span className="text-slate-500 pl-2 font-medium flex items-center">
                <User className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                Role:
              </span>
              <button
                onClick={() => login('member-a', 'member')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  user?.username === 'member-a'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-white'
                }`}
              >
                member-a
              </button>
              <button
                onClick={() => login('member-b', 'member')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  user?.username === 'member-b'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-white'
                }`}
              >
                member-b
              </button>
              <button
                onClick={() => login('coordinator-1', 'coordinator')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  user?.username === 'coordinator-1'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'text-rose-800 hover:bg-rose-100'
                }`}
              >
                coordinator-1
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
