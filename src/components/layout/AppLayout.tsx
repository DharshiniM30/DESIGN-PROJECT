import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, Plus, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AppLayoutProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  children: React.ReactNode;
  onQuickUpload?: () => void;
  onQuickVerify?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentTab,
  onNavigate,
  children,
  onQuickUpload,
  onQuickVerify,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user } = useAuth();

  const tabTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    detection: 'AI Deepfake Detection',
    vault: 'Evidence Vault',
    verification: 'Blockchain Verification',
    investigations: 'Investigations',
    reports: 'Forensic Reports',
    profile: 'Profile & Keys',
    settings: 'Settings',
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onNavigate={onNavigate}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-60 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-14 border-b border-slate-800/80 bg-[#0B1020]/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg border border-slate-800"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                <span>Console</span>
                <span>/</span>
                <span className="text-white font-medium capitalize">{tabTitles[currentTab] || currentTab}</span>
              </div>
            </div>
          </div>

          {/* Action Zone */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => (onQuickUpload ? onQuickUpload() : onNavigate('detection'))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-[#38BDF8] hover:bg-sky-400 rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Ingest Media</span>
            </button>

            <button
              onClick={() => (onQuickVerify ? onQuickVerify() : onNavigate('verification'))}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 border border-slate-800 hover:bg-[#111827] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-[#38BDF8]" />
              <span>Verify Hash</span>
            </button>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
