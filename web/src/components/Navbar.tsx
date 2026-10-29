import React from 'react';
import { useAuth } from '../context/AuthContext';
import { NotificationDrawer } from './NotificationDrawer';
import { BatteryCharging, User, Shield, LogOut, ArrowLeftRight } from 'lucide-react';

interface NavbarProps {
  onNavigateHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateHome }) => {
  const { user, logout, isCoordinator, switchDemoUser } = useAuth();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={onNavigateHome}
            className="flex items-center space-x-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <BatteryCharging className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight block">
                CommunityBattery
              </span>
              <span className="text-[11px] text-emerald-800 font-semibold block -mt-1">
                Reserve Priority SOA
              </span>
            </div>
          </div>

          {/* Right Section: Role info, Notification, Switcher, Logout */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Quick Demo Switcher */}
            <div className="hidden lg:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs">
              <span className="text-[10px] text-slate-500 font-bold px-2 uppercase tracking-wider flex items-center">
                <ArrowLeftRight className="w-3 h-3 mr-1" />
                Switch:
              </span>
              <button
                onClick={() => switchDemoUser('member-a')}
                className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                  user.username === 'member-a'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                Alice (A)
              </button>
              <button
                onClick={() => switchDemoUser('member-b')}
                className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                  user.username === 'member-b'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                Bob (B)
              </button>
              <button
                onClick={() => switchDemoUser('coordinator-1')}
                className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                  user.username === 'coordinator-1'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'text-rose-800 hover:bg-rose-100'
                }`}
              >
                Coordinator
              </button>
            </div>

            {/* Notification Drawer */}
            <NotificationDrawer />

            {/* User Profile Pill */}
            <div className="flex items-center space-x-2.5 pl-2 sm:pl-3 border-l border-slate-200">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  isCoordinator
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {isCoordinator ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className="hidden sm:block text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                    {user.fullName}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                      isCoordinator
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isCoordinator ? 'Coordinator' : 'Consumer'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono block">
                  {user.accountNumber}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
