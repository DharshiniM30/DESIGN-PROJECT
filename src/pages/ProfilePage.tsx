import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  KeyRound,
  Building,
  Mail,
  Fingerprint,
  Calendar,
  Save,
  Check,
  Copy,
  Lock,
  History,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { copyToClipboard, truncateHash } from '../utils/crypto';

export const ProfilePage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();

  const [name, setName] = useState(user?.name || 'Dr. Sarah Chen');
  const [organization, setOrganization] = useState(user?.organization || 'Federal Cyber Forensics Division');
  const [role, setRole] = useState(user?.role || 'investigator');
  const [copiedKey, setCopiedKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, organization, role });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCopyKey = async () => {
    if (!user?.publicKey) return;
    await copyToClipboard(user.publicKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-white/10">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <span>INVESTIGATOR IDENTITY & CERTIFICATION</span>
          <span>·</span>
          <span>PUBLIC KEY ENCLAVE</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
          Forensics Profile & Signing Credentials
        </h2>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          Manage your investigator credential attestation, agency assignment, and cryptographic signing keys for tamper-proof evidentiary custody logs.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 animate-in fade-in">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>Investigator credentials updated successfully.</span>
        </div>
      )}

      {/* Main Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Profile Card */}
        <div className="md:col-span-5 rounded-xl border border-white/10 bg-[#0E1528] p-6 space-y-5 text-center">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-cyan-500/10 border-2 border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
            <User className="h-10 w-10" />
          </div>

          <div>
            <h3 className="text-base font-bold text-white">{name}</h3>
            <div className="text-xs text-cyan-400 font-mono uppercase mt-0.5">
              Certified Digital Forensics {role}
            </div>
            <div className="text-xs text-slate-400 mt-1">{organization}</div>
          </div>

          {/* Cryptographic Public Key Card */}
          <div className="p-3 rounded-lg bg-slate-950 border border-white/10 text-left space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                <KeyRound className="h-3 w-3" />
                ECDSA PUBLIC KEY
              </span>
              <button
                onClick={handleCopyKey}
                className="text-slate-400 hover:text-white"
                title="Copy public key"
              >
                {copiedKey ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
            <div className="text-cyan-300 break-all select-all text-[11px]">
              {user?.publicKey || '0x71C8A33b28b7e704B14988F804368140D80E4540'}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20 text-left text-xs space-y-1">
            <div className="text-cyan-300 font-mono text-[11px] font-semibold">SECURITY CLEARANCE:</div>
            <div className="text-slate-300 text-[11px]">
              Authorized for chain-of-custody attestations and smart contract anchoring.
            </div>
          </div>
        </div>

        {/* Right: Edit Form */}
        <div className="md:col-span-7 rounded-xl border border-white/10 bg-[#0E1528] p-6 space-y-5">
          <div className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
            Edit Profile & Credentials
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Full Examiner Name & Credentials
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Official Email (Read-Only)
              </label>
              <input
                type="email"
                value={user?.email || 'analyst@veritychain.gov'}
                disabled
                className="w-full rounded-lg border border-white/5 bg-slate-900/50 px-3 py-2 text-xs text-slate-400 font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Enrolled Agency / Laboratory
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Evidentiary Role Assignment
              </label>
              <select
                value={role}
                onChange={(e: any) => setRole(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-slate-100 font-mono focus:border-cyan-400 focus:outline-none"
              >
                <option value="analyst">Forensic Analyst (Level I)</option>
                <option value="investigator">Lead Cyber Investigator (Level II)</option>
                <option value="auditor">Chain-of-Custody Auditor</option>
                <option value="admin">Forensic Enclave Administrator</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-semibold transition-colors shadow-sm cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>Save Credentials</span>
              </button>
            </div>
          </form>

          {/* Activity Log */}
          <div className="pt-4 border-t border-white/10 space-y-2 text-xs font-mono">
            <span className="text-slate-400 text-[11px] font-semibold uppercase">
              Recent Session Security Events
            </span>
            <div className="space-y-1.5 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Console Session Initialized:</span>
                <span className="text-slate-300">Active (Secure Local Token)</span>
              </div>
              <div className="flex justify-between">
                <span>Cryptographic Digest Provider:</span>
                <span className="text-cyan-300">W3C WebCrypto Native</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
