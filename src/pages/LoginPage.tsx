import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onNavigate: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanId = identifier.trim();
    if (!cleanId) {
      setError('Please enter your username or email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await login(cleanId, password);
      // Redirect authenticated user to Dashboard
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-[420px] space-y-6">
        {/* Brand Lockup & Tagline */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-[#111827] border border-slate-800 text-[#38BDF8] shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            VerityChain <span className="text-[#38BDF8]">AI</span>
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Enterprise Digital Evidence & Integrity Verification
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#111827] border border-slate-800/80 rounded-xl p-6 sm:p-8 shadow-xl space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-white">Welcome Back</h2>
            <p className="text-xs text-[#94A3B8] mt-1">
              Sign in to access your digital evidence workspace.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Username or Email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="analyst@veritychain.gov or username"
                autoComplete="username"
                className="w-full rounded-lg border border-slate-800 bg-[#0B1020] px-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#38BDF8] focus:outline-none focus:ring-1 focus:ring-[#38BDF8] transition-colors"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => onNavigate('forgot-password')}
                  className="text-[11px] text-[#38BDF8] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-slate-800 bg-[#0B1020] px-3.5 py-2.5 pr-10 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#38BDF8] focus:outline-none focus:ring-1 focus:ring-[#38BDF8] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-[#38BDF8] hover:bg-sky-400 text-slate-900 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>



          {/* Create Account Link */}
          <div className="pt-2 text-center text-xs text-[#94A3B8]">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="text-[#38BDF8] hover:underline font-medium"
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Security Footnote */}
        <div className="text-center text-[11px] text-slate-500 font-mono">
          SHA-256 Authenticated Enclave · ISO/IEC 27037 Standard
        </div>
      </div>
    </div>
  );
};
