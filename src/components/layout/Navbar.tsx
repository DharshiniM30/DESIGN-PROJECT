import React, { useState } from 'react';
import { ShieldCheck, Menu, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  isDark,
  onToggleTheme,
}) => {
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNav = (tabId: string) => {
    onNavigate(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#0B1020]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-2 text-left text-white transition-opacity hover:opacity-90 cursor-pointer"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#111827] border border-slate-800 text-[#38BDF8]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white whitespace-nowrap">
            VerityChain <span className="text-[#38BDF8]">AI</span>
          </span>
        </button>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#94A3B8]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`transition-colors whitespace-nowrap cursor-pointer hover:text-white ${
                currentTab === item.id ? 'text-[#38BDF8] font-semibold' : 'text-[#94A3B8]'
              }`}
            >
              {item.label}
            </button>
          ))}
          {isAuthenticated && (
            <button
              onClick={() => handleNav('dashboard')}
              className={`transition-colors whitespace-nowrap cursor-pointer hover:text-white ${
                currentTab === 'dashboard' ? 'text-[#38BDF8] font-semibold' : 'text-[#94A3B8]'
              }`}
            >
              Dashboard
            </button>
          )}
        </nav>

        {/* Actions & Auth */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onToggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            {isDark ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-slate-300" />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNav('dashboard')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-[#38BDF8] hover:bg-sky-400 rounded-lg transition-colors whitespace-nowrap shadow-sm"
              >
                Dashboard
              </button>
              <button
                onClick={logout}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNav('login')}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNav('register')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-[#38BDF8] hover:bg-sky-400 rounded-lg transition-colors shadow-sm"
              >
                Create Account
              </button>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0B1020] px-4 pt-2 pb-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className="block w-full text-left py-1.5 text-xs text-[#94A3B8] hover:text-[#38BDF8] transition-colors"
            >
              {item.label}
            </button>
          ))}
          {isAuthenticated ? (
            <button
              onClick={() => handleNav('dashboard')}
              className="w-full text-center py-2 text-xs font-semibold text-slate-900 bg-[#38BDF8] rounded-lg mt-2"
            >
              Open Dashboard
            </button>
          ) : (
            <div className="pt-2 grid grid-cols-2 gap-2">
              <button
                onClick={() => handleNav('login')}
                className="w-full py-1.5 text-xs font-medium text-slate-300 border border-slate-800 rounded-lg"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNav('register')}
                className="w-full py-1.5 text-xs font-semibold text-slate-900 bg-[#38BDF8] rounded-lg"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
