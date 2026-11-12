import React, { useState } from 'react';
import { ShieldCheck, Mail, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';

interface ForgotPasswordPageProps {
  onNavigate: (tab: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    if (!email.trim()) {
      setError('Please provide your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.forgotPassword(email.trim());
      setFeedback(res.message);
    } catch (err: any) {
      setError(err.message || 'Recovery request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-[420px] space-y-6">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-[#111827] border border-slate-800 text-[#38BDF8]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Reset Password
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Receive an account recovery token to your registered email
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#111827] border border-slate-800/80 rounded-xl p-6 sm:p-8 shadow-xl space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {feedback ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>{feedback}</div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Account Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@agency.gov"
                  className="w-full rounded-lg border border-slate-800 bg-[#0B1020] px-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#38BDF8] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-[#38BDF8] hover:bg-sky-400 text-slate-900 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                {loading ? (
                  <span>Dispatching...</span>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#38BDF8] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
