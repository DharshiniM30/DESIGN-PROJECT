import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, User, Building, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RegisterPageProps {
  onNavigate: (tab: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please provide full name, email, and password.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!agreeTerms) {
      setError('You must accept the digital evidence handling terms.');
      return;
    }

    setLoading(true);
    try {
      await register(fullName.trim(), email.trim(), password, organization.trim());
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-[460px] space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-[#111827] border border-slate-800 text-[#38BDF8]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Create Account
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Register as an authorized digital forensics examiner
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#111827] border border-slate-800/80 rounded-xl p-6 sm:p-8 shadow-xl space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. Sarah Chen"
                className="w-full rounded-lg border border-slate-800 bg-[#0B1020] px-3.5 py-2 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#38BDF8] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@agency.gov"
                className="w-full rounded-lg border border-slate-800 bg-[#0B1020] px-3.5 py-2 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#38BDF8] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Organization / Agency (Optional)
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Cyber Forensics Lab"
                className="w-full rounded-lg border border-slate-800 bg-[#0B1020] px-3.5 py-2 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#38BDF8] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 chars"
                    className="w-full rounded-lg border border-slate-800 bg-[#0B1020] px-3.5 py-2 pr-9 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#38BDF8] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter"
                  className="w-full rounded-lg border border-slate-800 bg-[#0B1020] px-3.5 py-2 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#38BDF8] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
                  required
                />
              </div>
            </div>

            <div className="flex items-start pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 rounded border-slate-800 bg-[#0B1020] text-[#38BDF8] focus:ring-[#38BDF8]"
              />
              <label htmlFor="terms" className="ml-2 block text-[11px] text-[#94A3B8]">
                I agree to the VerityChain digital evidence and custody protocol.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-[#38BDF8] hover:bg-sky-400 text-slate-900 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              {loading ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-[#94A3B8]">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-[#38BDF8] hover:underline font-medium"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
