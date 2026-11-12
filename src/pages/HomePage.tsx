import React from 'react';
import {
  ScanEye,
  Database,
  Link2,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const features = [
    {
      title: 'AI Deepfake Detection',
      description: 'Analyze images and videos for potential signs of manipulation.',
      icon: ScanEye,
      status: 'Live API (Gemini Multimodal)',
    },
    {
      title: 'Cryptographic Integrity',
      description: 'Generate SHA-256 hashes to identify changes to digital evidence.',
      icon: CheckCircle2,
      status: 'Client & Server SHA-256',
    },
    {
      title: 'Blockchain Verification',
      description: 'Verify evidence records against blockchain data when a network is configured.',
      icon: Link2,
      status: 'Sepolia Testnet / Demo Mode',
    },
    {
      title: 'Evidence Management',
      description: 'Organize files, investigation details, and verification history in one place.',
      icon: Database,
      status: 'Vault & Audit Logs',
    },
  ];

  const steps = [
    { number: '01', title: 'Upload Evidence', desc: 'Securely stage image or video files.' },
    { number: '02', title: 'Analyze Media', desc: 'Inspect spatial and frequency artifacts.' },
    { number: '03', title: 'Generate Evidence Hash', desc: 'Calculate deterministic SHA-256 checksum.' },
    { number: '04', title: 'Verify Integrity', desc: 'Anchor and compare against ledger records.' },
  ];

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] flex flex-col">
      {/* Compact Minimal Hero Section */}
      <section className="pt-16 pb-16 sm:pt-20 sm:pb-20 border-b border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-800 bg-[#111827] text-xs text-[#94A3B8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
            <span>Digital Forensics & Evidence Verification Platform</span>
          </div>

          {/* Primary Heading (30-36px desktop) */}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white max-w-2xl mx-auto leading-tight">
            Blockchain-Powered Evidence Integrity
          </h1>

          {/* Supporting Description */}
          <p className="text-sm sm:text-base text-[#94A3B8] max-w-xl mx-auto leading-relaxed">
            Secure digital evidence with cryptographic hashing, AI-assisted analysis, and verifiable audit trails.
          </p>

          {/* Single Primary CTA */}
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => onNavigate('detection')}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#38BDF8] hover:bg-sky-400 text-slate-900 text-xs font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <span>Start Investigation</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Clean Dashboard Preview Graphic */}
          <div className="pt-8 max-w-3xl mx-auto">
            <div className="rounded-xl border border-slate-800 bg-[#111827] p-2 shadow-2xl overflow-hidden">
              <img
                src="/src/assets/images/hero_forensics_security_1792596868388.jpg"
                alt="VerityChain Forensics Interface"
                referrerPolicy="no-referrer"
                className="w-full h-56 sm:h-72 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4 Clean Feature Cards */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full border-b border-slate-800/80">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Platform Features</h2>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Core tools designed for digital forensic analysts, legal investigators, and auditors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-5 rounded-xl border border-slate-800 bg-[#111827] flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-3">
                  <div className="h-9 w-9 rounded-lg bg-[#0B1020] border border-slate-800 flex items-center justify-center text-[#38BDF8]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">{feat.title}</h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{feat.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works (4 Linear Steps) */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full border-b border-slate-800/80">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white">How It Works</h2>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            A standard four-step digital evidence verification workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="p-4 rounded-xl border border-slate-800 bg-[#111827] space-y-1.5"
            >
              <div className="text-xs font-mono font-bold text-[#38BDF8]">{step.number}</div>
              <h4 className="text-xs font-semibold text-white">{step.title}</h4>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 bg-[#0B1020] mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#38BDF8]" />
            <span className="font-semibold text-white">VerityChain AI</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-5">
            <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
              About
            </button>
            <button onClick={() => onNavigate('features')} className="hover:text-white transition-colors">
              Features
            </button>
            <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
              Contact
            </button>
            <button onClick={() => onNavigate('dashboard')} className="hover:text-[#38BDF8] transition-colors">
              Console
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
