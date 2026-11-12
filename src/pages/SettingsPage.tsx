import React, { useState } from 'react';
import {
  Settings,
  Link2,
  Cpu,
  Database,
  Lock,
  Bell,
  Sun,
  Moon,
  Save,
  Check,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  Info,
} from 'lucide-react';

interface SettingsPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ isDark, onToggleTheme }) => {
  const [network, setNetwork] = useState('Sepolia Testnet (Simulated Enclave)');
  const [contractAddress, setContractAddress] = useState('0x71C8A33b28b7e704B14988F804368140D80E4540');
  const [retentionPolicy, setRetentionPolicy] = useState('7-Year Evidentiary Hold');
  const [aiSensitivity, setAiSensitivity] = useState('85');
  const [autoHashOnUpload, setAutoHashOnUpload] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-white/10">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <span>SYSTEM CONFIGURATION</span>
          <span>·</span>
          <span>ENTERPRISE FORENSIC PARAMETERS</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
          Forensics & Security Settings
        </h2>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          Configure blockchain RPC endpoints, AI detection sensitivity, retention schedules, and notification preferences.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 animate-in fade-in">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>System parameters updated and synchronized with local enclave.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Blockchain Network Configuration */}
        <div className="rounded-xl border border-white/10 bg-[#0E1528] p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
            <Link2 className="h-4 w-4" />
            <span>Blockchain Ledger & Smart Contract Gateway</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Target Consensus Network
              </label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:border-cyan-400 focus:outline-none"
              >
                <option value="Sepolia Testnet (Simulated Enclave)">Sepolia Ethereum Testnet (Simulated Anchor)</option>
                <option value="Ethereum Mainnet (Read-Only)">Ethereum Mainnet (Audit Mode)</option>
                <option value="Polygon PoS Enterprise">Polygon PoS Enterprise Ledger</option>
                <option value="Private Hyperledger Besu">Private Enterprise Hyperledger Enclave</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Smart Contract Registry Address
              </label>
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-white/5 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Status: Connected to Sepolia Gateway</span>
            <span className="text-emerald-400">Sync: Block #6894112</span>
          </div>
        </div>

        {/* Section 2: AI Deepfake Detection Tuning */}
        <div className="rounded-xl border border-white/10 bg-[#0E1528] p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
            <Cpu className="h-4 w-4" />
            <span>AI Forensics & Detection Pipeline</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Forensic Classification Sensitivity ({aiSensitivity}%)
              </label>
              <input
                type="range"
                min="50"
                max="98"
                value={aiSensitivity}
                onChange={(e) => setAiSensitivity(e.target.value)}
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>Standard (50%)</span>
                <span>High Rigor (85%)</span>
                <span>Strict Courtroom (98%)</span>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Multimodal API Backend
              </label>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-white/10 text-xs font-mono flex items-center justify-between">
                <span className="text-white">Google Gemini 3.8 Flash</span>
                <span className="text-cyan-400 text-[10px]">Configured via Server Proxy</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20 text-xs text-slate-300 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              VerityChain uses server-side proxy routes for all AI evaluation calls. The system automatically inspects boundary warping, frequency artifacts, and specular iris reflections without exposing credentials to the browser.
            </div>
          </div>
        </div>

        {/* Section 3: Evidence Retention & Vault Custody */}
        <div className="rounded-xl border border-white/10 bg-[#0E1528] p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
            <Database className="h-4 w-4" />
            <span>Evidence Retention & Cryptographic Protocol</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Default Evidence Retention Schedule
              </label>
              <select
                value={retentionPolicy}
                onChange={(e) => setRetentionPolicy(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:border-cyan-400 focus:outline-none"
              >
                <option value="3-Year Standard Hold">3-Year Standard Hold</option>
                <option value="7-Year Evidentiary Hold">7-Year Evidentiary Hold (Standard)</option>
                <option value="10-Year Major Case Hold">10-Year Major Case Hold</option>
                <option value="Permanent Indefinite Hold">Permanent Indefinite Hold</option>
              </select>
            </div>

            <div className="flex flex-col justify-center">
              <label className="flex items-center text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoHashOnUpload}
                  onChange={(e) => setAutoHashOnUpload(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-white/15 bg-slate-950 text-cyan-500 focus:ring-cyan-400"
                />
                <span className="ml-2 font-medium">Automatic Client-Side SHA-256 Calculation</span>
              </label>
              <p className="text-[10px] text-slate-500 ml-5 mt-0.5">
                Calculates cryptographic digest locally before uploading to server
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Interface & Alert Preferences */}
        <div className="rounded-xl border border-white/10 bg-[#0E1528] p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
            <Bell className="h-4 w-4" />
            <span>Preferences & Theme</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <div className="font-medium text-white">Visual Appearance Mode</div>
              <div className="text-[11px] text-slate-400">
                Currently running in {isDark ? 'Dark Cybersecurity Navy (#0B1020)' : 'High Contrast Light Mode'}
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-white/15 bg-slate-950 text-xs font-medium text-slate-200 hover:text-white"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
              <span>{isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}</span>
            </button>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-semibold text-xs transition-colors shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save System Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
