import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LoginPage } from './pages/LoginPage';
import { ConsumerDashboardPage } from './pages/ConsumerDashboardPage';
import { CoordinatorDashboardPage } from './pages/CoordinatorDashboardPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { PrivacyRightsPage } from './pages/PrivacyRightsPage';
import { LegalPage } from './pages/LegalPage';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isCoordinator } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');

  useEffect(() => {
    if (isAuthenticated && currentPage === 'login') {
      setCurrentPage('dashboard');
    }
  }, [isAuthenticated, currentPage]);

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If not logged in, render Dual Login Page
  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
        <header className="bg-white border-b border-slate-200 py-3 px-6 shadow-2xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                ⚡
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
            <span className="text-xs bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full font-semibold border border-emerald-200 hidden sm:inline-block">
              Dual Role Authentication Gateway
            </span>
          </div>
        </header>
        <main className="flex-grow flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <LoginPage onSuccess={() => setCurrentPage('dashboard')} />
          </div>
        </main>
        <Footer onNavigate={navigateTo} />
      </div>
    );
  }

  // Authenticated route rendering
  const renderMainContent = () => {
    switch (currentPage) {
      case 'dashboard':
      case 'home':
        return isCoordinator ? <CoordinatorDashboardPage /> : <ConsumerDashboardPage />;
      case 'how-it-works':
        return <HowItWorksPage />;
      case 'privacy-rights':
        return <PrivacyRightsPage />;
      case 'legal-privacy':
        return <LegalPage initialTab="privacy" />;
      case 'legal-terms':
        return <LegalPage initialTab="terms" />;
      case 'legal-cookie':
        return <LegalPage initialTab="cookie" />;
      case 'legal-refund':
        return <LegalPage initialTab="refund" />;
      case 'legal-accessibility':
        return <LegalPage initialTab="accessibility" />;
      default:
        return isCoordinator ? <CoordinatorDashboardPage /> : <ConsumerDashboardPage />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar onNavigateHome={() => navigateTo('dashboard')} />
      {/* Secondary navigation bar for authenticated users */}
      <div className="bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-11 text-xs">
          <div className="flex items-center space-x-1 sm:space-x-3">
            <button
              onClick={() => navigateTo('dashboard')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                currentPage === 'dashboard'
                  ? isCoordinator
                    ? 'bg-rose-100 text-rose-900'
                    : 'bg-emerald-100 text-emerald-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {isCoordinator ? 'Coordinator Control Center' : 'Consumer Energy Portal'}
            </button>
            <button
              onClick={() => navigateTo('how-it-works')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                currentPage === 'how-it-works'
                  ? 'bg-slate-200 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              System Math & Reserve Rules
            </button>
          </div>
          <div className="text-[11px] text-slate-500 hidden sm:block">
            Signed in as <strong className="text-slate-700">{user.fullName}</strong> ({user.role})
          </div>
        </div>
      </div>
      <main id="main-content" className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
        {renderMainContent()}
      </main>
      <Footer onNavigate={navigateTo} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};
