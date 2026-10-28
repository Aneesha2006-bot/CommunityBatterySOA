import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { DashboardPage } from './pages/DashboardPage';
import { RequestsPage } from './pages/RequestsPage';
import { CoordinatorPage } from './pages/CoordinatorPage';
import { PrivacyRightsPage } from './pages/PrivacyRightsPage';
import { LegalPage } from './pages/LegalPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const path = window.location.pathname.replace('/', '') || 'home';
    return path;
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace('/', '') || 'home';
      setCurrentPage(path);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    window.history.pushState(null, '', `/${page === 'home' ? '' : page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
      case '':
        return <HomePage onNavigate={navigateTo} />;
      case 'how-it-works':
        return <HowItWorksPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'requests':
        return <RequestsPage />;
      case 'coordinator':
        return <CoordinatorPage />;
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
        return <NotFoundPage onNavigate={navigateTo} />;
    }
  };

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar currentPage={currentPage} onNavigate={navigateTo} />
        <main id="main-content" className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {renderContent()}
        </main>
        <Footer onNavigate={navigateTo} />
      </div>
    </AuthProvider>
  );
};
