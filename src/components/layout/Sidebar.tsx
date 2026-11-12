import React from 'react';
import {
  LayoutDashboard,
  ScanEye,
  Database,
  Link2,
  FolderGit2,
  FileText,
  UserCheck,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { truncateHash } from '../../utils/crypto';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'detection', name: 'Deepfake Detection', icon: ScanEye },
    { id: 'vault', name: 'Evidence Vault', icon: Database },
    { id: 'verification', name: 'Blockchain Verification', icon: Link2 },
    { id: 'investigations', name: 'Investigations', icon: FolderGit2 },
    { id: 'reports', name: 'Forensic Reports', icon: FileText },
    { id: 'profile', name: 'Profile & Keys', icon: UserCheck },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const handleSelect = (tabId: string) => {
    onNavigate(tabId);
    onCloseMobile();
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-60 border-r border-slate-800/80 bg-[#0B1020] transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div>
          {/* Header */}
          <div className="flex h-14 items-center px-5 border-b border-slate-800/80">
            <button
              onClick={() => handleSelect('home')}
              className="flex items-center gap-2.5 text-left text-white cursor-pointer"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#111827] border border-slate-800 text-[#38BDF8]">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold tracking-tight text-white">
                VerityChain <span className="text-[#38BDF8]">AI</span>
              </span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Navigation
            </div>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#111827] text-[#38BDF8] border border-slate-800 font-semibold'
                      : 'text-[#94A3B8] hover:text-white hover:bg-[#111827]/50'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#38BDF8]' : 'text-slate-400'}`} />
                  <span className="truncate">{item.name}</span>
                  {isActive && <ChevronRight className="ml-auto h-3 w-3 text-[#38BDF8]" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Security Anchor Badge */}
        <div className="p-3 border-t border-slate-800/80 space-y-2 bg-[#090D1A]/50">
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#111827] border border-slate-800">
            <div className="min-w-0 flex-1 pr-2">
              <div className="text-xs font-semibold text-white truncate">{user?.name || 'Forensics User'}</div>
              <div className="text-[10px] text-[#94A3B8] truncate font-mono">
                {user?.publicKey ? truncateHash(user.publicKey, 6, 6) : '0x71C8...E4540'}
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign out of console"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-[#0B1020] rounded-md transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
