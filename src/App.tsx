import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { AppLayout } from './components/layout/AppLayout';

// Public & Auth Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';

// Authenticated Console Pages
import { DashboardPage } from './pages/DashboardPage';
import { DeepfakeDetectionPage } from './pages/DeepfakeDetectionPage';
import { EvidenceVaultPage } from './pages/EvidenceVaultPage';
import { BlockchainVerificationPage } from './pages/BlockchainVerificationPage';
import { InvestigationsPage } from './pages/InvestigationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  // By default, every visitor lands on the login page
  const [currentTab, setCurrentTab] = useState<string>('login');
  const [targetParam, setTargetParam] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(true);

  // When authentication state changes
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // If user logs out or is unauthenticated, redirect to login unless on register or forgot-password
      if (currentTab !== 'register' && currentTab !== 'forgot-password') {
        setCurrentTab('login');
      }
    } else {
      // When authenticated, transition from auth screens to the main dashboard
      if (currentTab === 'login' || currentTab === 'register' || currentTab === 'forgot-password') {
        setCurrentTab('dashboard');
      }
    }
  }, [isAuthenticated, isLoading]);

  // Sync theme with HTML class
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [isDark]);

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const navigateTo = (tab: string, param?: string) => {
    // If not authenticated and trying to access authenticated pages, route to login
    if (!isAuthenticated && tab !== 'login' && tab !== 'register' && tab !== 'forgot-password') {
      setCurrentTab('login');
      return;
    }
    setCurrentTab(tab);
    setTargetParam(param || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine if current tab belongs to the authenticated console layout
  const consoleTabs = [
    'dashboard',
    'detection',
    'vault',
    'verification',
    'investigations',
    'reports',
    'profile',
    'settings',
  ];
  const isConsoleTab = consoleTabs.includes(currentTab);

  // While verifying session from storage/backend, render minimal dark loader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] flex flex-col items-center justify-center space-y-4">
        <div className="h-9 w-9 border-2 border-[#38BDF8] border-t-transparent rounded-full animate-spin" />
        <div className="text-xs font-mono text-[#94A3B8] tracking-wider uppercase">
          Verifying Enclave Session...
        </div>
      </div>
    );
  }

  // If unauthenticated: only show login, register, or forgot password
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC]">
        {currentTab === 'register' && <RegisterPage onNavigate={navigateTo} />}
        {currentTab === 'forgot-password' && <ForgotPasswordPage onNavigate={navigateTo} />}
        {currentTab !== 'register' && currentTab !== 'forgot-password' && (
          <LoginPage onNavigate={navigateTo} />
        )}
      </div>
    );
  }

  // If authenticated:
  return (
    <div className="min-h-screen font-sans selection:bg-[#38BDF8]/30 selection:text-cyan-200 bg-[#0B1020]">
      {!isConsoleTab ? (
        <div className="flex flex-col min-h-screen">
          <Navbar
            currentTab={currentTab}
            onNavigate={navigateTo}
            isDark={isDark}
            onToggleTheme={handleToggleTheme}
          />

          <main className="flex-1">
            {currentTab === 'home' && <HomePage onNavigate={navigateTo} />}
            {currentTab === 'features' && <HomePage onNavigate={navigateTo} />}
            {currentTab === 'how-it-works' && <HomePage onNavigate={navigateTo} />}
            {currentTab === 'about' && <AboutPage onNavigate={navigateTo} />}
            {currentTab === 'contact' && <ContactPage />}
          </main>
        </div>
      ) : (
        <AppLayout
          currentTab={currentTab}
          onNavigate={navigateTo}
          onQuickUpload={() => navigateTo('detection')}
          onQuickVerify={() => navigateTo('verification')}
        >
          {currentTab === 'dashboard' && (
            <DashboardPage
              onNavigate={navigateTo}
              onSelectEvidence={(id) => navigateTo('vault', id)}
            />
          )}

          {currentTab === 'detection' && (
            <DeepfakeDetectionPage
              onNavigate={navigateTo}
              onEvidenceCreated={(ev) => navigateTo('vault', ev.id)}
            />
          )}

          {currentTab === 'vault' && (
            <EvidenceVaultPage
              onNavigate={navigateTo}
              selectedEvidenceId={targetParam}
            />
          )}

          {currentTab === 'verification' && (
            <BlockchainVerificationPage
              onNavigate={navigateTo}
              targetEvidenceId={targetParam}
            />
          )}

          {currentTab === 'investigations' && (
            <InvestigationsPage
              onNavigate={navigateTo}
              selectedCaseId={targetParam}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsPage
              onNavigate={navigateTo}
              targetEvidenceId={targetParam}
            />
          )}

          {currentTab === 'profile' && <ProfilePage />}

          {currentTab === 'settings' && (
            <SettingsPage isDark={isDark} onToggleTheme={handleToggleTheme} />
          )}
        </AppLayout>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
