import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Link2,
  ArrowRight,
  Fingerprint,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (tab: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] flex flex-col">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        {/* Header */}
        <div className="space-y-3 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-800 bg-[#111827] text-xs text-[#94A3B8]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#38BDF8]" />
            <span>Digital Evidence Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            About VerityChain AI
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            VerityChain AI provides digital forensics examiners and investigators with tools to detect manipulated media, calculate SHA-256 evidence digests, and preserve verifiable audit trails.
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border border-slate-800 bg-[#111827] space-y-2">
            <div className="h-8 w-8 rounded-lg bg-[#0B1020] border border-slate-800 flex items-center justify-center text-[#38BDF8]">
              <Fingerprint className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Cryptographic Hashing</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Calculates deterministic SHA-256 checksums to identify any subsequent file modifications or corruption.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-[#111827] space-y-2">
            <div className="h-8 w-8 rounded-lg bg-[#0B1020] border border-slate-800 flex items-center justify-center text-[#38BDF8]">
              <Link2 className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Blockchain Anchoring</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Records evidence digests on smart contract ledgers to maintain an immutable, tamper-evident audit history.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-[#111827] space-y-2">
            <div className="h-8 w-8 rounded-lg bg-[#0B1020] border border-slate-800 flex items-center justify-center text-[#38BDF8]">
              <Cpu className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">AI Artifact Analysis</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Examines spatial boundary blending, frequency domain discontinuities, and lighting consistency.
            </p>
          </div>
        </div>

        {/* Technical Facts vs AI Predictions */}
        <div className="rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-white">Technical Facts vs. AI Assessments</h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              To support sound digital evidence standards, VerityChain explicitly distinguishes verified facts from probabilistic scores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-[#0B1020] border border-slate-800 space-y-1.5">
              <div className="text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Deterministic Technical Facts</span>
              </div>
              <p className="text-[#94A3B8] text-xs leading-relaxed">
                SHA-256 digests, exact file byte sizes, timestamps, and confirmed blockchain block height numbers. These are deterministic mathematical facts.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#0B1020] border border-slate-800 space-y-1.5">
              <div className="text-amber-400 font-medium flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                <span>Probabilistic AI Assessments</span>
              </div>
              <p className="text-[#94A3B8] text-xs leading-relaxed">
                Machine learning classification scores and artifact signals. These provide investigative guidance rather than definitive legal proof.
              </p>
            </div>
          </div>
        </div>

        {/* Minimal CTA Strip */}
        <div className="p-6 rounded-xl bg-[#111827] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-semibold text-white">Ready to examine digital evidence?</h4>
            <p className="text-xs text-[#94A3B8]">
              Open the deepfake detection interface or view existing evidence in the vault.
            </p>
          </div>
          <button
            onClick={() => onNavigate('detection')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#38BDF8] hover:bg-sky-400 text-slate-900 font-semibold text-xs transition-colors shrink-0 cursor-pointer shadow-sm"
          >
            <span>Start Analysis</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
