import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Send,
  AlertCircle,
  Mail,
} from 'lucide-react';
import { api } from '../services/api';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFeedback(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage('Please fill in your name, email, and message.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.submitContact({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim() || 'General Inquiry',
        message: message.trim(),
      });
      setFeedback(res.message);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit inquiry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] flex flex-col justify-center py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-800 bg-[#111827] text-xs text-[#94A3B8]">
            <Mail className="h-3.5 w-3.5 text-[#38BDF8]" />
            <span>Support & Inquiries</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Contact Support
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-md mx-auto">
            Get in touch for forensic assistance, custom deployment questions, or feedback.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#111827] p-6 sm:p-8 space-y-4 shadow-xl">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {feedback && (
            <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>{feedback}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full rounded-lg border border-slate-800 bg-[#0B1020] px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:border-[#38BDF8] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@agency.gov"
                  className="w-full rounded-lg border border-slate-800 bg-[#0B1020] px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:border-[#38BDF8] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Inquiry Subject"
                className="w-full rounded-lg border border-slate-800 bg-[#0B1020] px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:border-[#38BDF8] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help?"
                rows={4}
                className="w-full rounded-lg border border-slate-800 bg-[#0B1020] p-3 text-xs text-white placeholder:text-slate-500 focus:border-[#38BDF8] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-[#38BDF8] hover:bg-sky-400 text-slate-900 font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              {loading ? (
                <span>Sending...</span>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Inquiry</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
