import React, { useState, useEffect } from 'react';
import {
  Link2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Search,
  UploadCloud,
  FileCheck2,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { EvidenceItem, VerificationResult } from '../types';
import { api } from '../services/api';
import { calculateFileSha256, formatBytes, truncateHash, copyToClipboard } from '../utils/crypto';

interface BlockchainVerificationPageProps {
  onNavigate: (tab: string, param?: string) => void;
  targetEvidenceId?: string | null;
}

export const BlockchainVerificationPage: React.FC<BlockchainVerificationPageProps> = ({
  onNavigate,
  targetEvidenceId,
}) => {
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>(targetEvidenceId || '');
  const [customHashInput, setCustomHashInput] = useState<string>('');
  const [draggedFile, setDraggedFile] = useState<File | null>(null);
  const [fileComputedHash, setFileComputedHash] = useState<string>('');
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [copiedTx, setCopiedTx] = useState<boolean>(false);
  const [web3Network, setWeb3Network] = useState<string>('Sepolia Testnet (Simulated Enclave)');

  useEffect(() => {
    const fetchEvidence = async () => {
      try {
        const list = await api.getEvidence();
        setEvidenceList(list);
        if (targetEvidenceId) {
          setSelectedId(targetEvidenceId);
          // auto-trigger check
          runVerification(targetEvidenceId, undefined);
        }
      } catch (err) {
        console.error('Failed to load evidence for verification:', err);
      }
    };
    fetchEvidence();
  }, [targetEvidenceId]);

  const handleFileDrop = async (file: File) => {
    setDraggedFile(file);
    setVerificationResult(null);
    setVerifying(true);
    try {
      const hash = await calculateFileSha256(file);
      setFileComputedHash(hash);
      setCustomHashInput(hash);
      await runVerification(selectedId || undefined, hash);
    } catch (err) {
      console.error('Hash calculation error:', err);
    } finally {
      setVerifying(false);
    }
  };

  const runVerification = async (evId?: string, hashVal?: string) => {
    setVerifying(true);
    try {
      const res = await api.verifyIntegrity({
        evidenceId: evId || (selectedId ? selectedId : undefined),
        sha256: hashVal || (customHashInput.trim() ? customHashInput.trim() : undefined),
      });
      setVerificationResult(res);
    } catch (err: any) {
      console.error('Integrity verification failed:', err);
    } finally {
      setVerifying(false);
    }
  };

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Blockchain-Powered Evidence Integrity
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1 max-w-2xl leading-relaxed">
            Secure digital evidence with cryptographic hashing, AI-assisted analysis, and verifiable audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-xs font-mono text-indigo-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            <span>{web3Network}</span>
          </div>
        </div>
      </div>

      {/* Verification Input Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Selection Form */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-xl border border-white/10 bg-[#0E1528] p-6 space-y-5">
            <div className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
              Verification Mode A: Compare Against Registered Vault Dossier
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Select Seized Evidence Record
              </label>
              <select
                value={selectedId}
                onChange={(e) => {
                  setSelectedId(e.target.value);
                  setVerificationResult(null);
                }}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:border-cyan-400 focus:outline-none"
              >
                <option value="">-- Choose an Evidence Record to Cross-Examine --</option>
                {evidenceList.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.id} · {item.fileName} ({item.blockchainStatus === 'committed' ? 'Anchored' : 'Local Only'})
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-3 text-[11px] font-mono text-slate-500">
                OR DROP SUSPECT RE-SEIZED MEDIA
              </span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* Drag & Drop File Verifier */}
            <div
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileDrop(e.dataTransfer.files[0]);
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              className="border border-dashed border-white/20 hover:border-cyan-400/50 bg-[#0A0E1C] rounded-xl p-5 text-center cursor-pointer transition-all"
            >
              <input
                type="file"
                id="file-verify"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileDrop(e.target.files[0]);
                  }
                }}
              />
              <label htmlFor="file-verify" className="cursor-pointer space-y-1 block">
                <UploadCloud className="h-6 w-6 text-cyan-400 mx-auto" />
                <div className="text-xs font-medium text-white">
                  Drop candidate file to re-calculate SHA-256 in real time
                </div>
                <div className="text-[10px] text-slate-400">
                  {draggedFile ? (
                    <span className="text-cyan-300 font-semibold">{draggedFile.name} ({formatBytes(draggedFile.size)})</span>
                  ) : (
                    'Supports all formats up to 50MB'
                  )}
                </div>
              </label>
            </div>

            {/* Custom Manual Hash Input */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Direct Candidate SHA-256 Digest (Hexadecimal)
              </label>
              <input
                type="text"
                value={customHashInput}
                onChange={(e) => {
                  setCustomHashInput(e.target.value);
                  setVerificationResult(null);
                }}
                placeholder="Paste 64-character SHA-256 hash string..."
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <button
              onClick={() => runVerification()}
              disabled={verifying || (!selectedId && !customHashInput)}
              className="w-full py-2.5 px-4 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-900 text-xs font-semibold transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {verifying ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Validating Ledger & Cryptographic Signatures...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Execute Cryptographic Integrity Verification</span>
                </>
              )}
            </button>
          </div>

          {/* Web3 & Smart Contract Info Card */}
          <div className="p-4 rounded-xl border border-white/10 bg-slate-900/60 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-cyan-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" />
                VERITYCHAIN SMART CONTRACT INTERFACE
              </span>
              <span className="text-emerald-400 text-[10px]">DEMO ENCLAVE</span>
            </div>
            <div className="text-[11px] text-slate-300">
              Contract ABI: <span className="text-slate-400">VerityProofRegistryV2.sol</span>
            </div>
            <div className="text-[11px] text-slate-300">
              Contract Address: <span className="text-cyan-300 select-all">0x71C8A33b28b7e704B14988F804368140D80E4540</span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans leading-relaxed pt-1">
              In production mode, verification requests invoke `verifyEvidenceDigest(bytes32 _digest)` against the Ethereum network. Simulated testnet mode is active for this session.
            </p>
          </div>
        </div>

        {/* Right: Verification Outcome Presentation */}
        <div className="lg:col-span-6 space-y-5">
          {verificationResult ? (
            <div className="rounded-xl border border-white/10 bg-[#0E1528] p-6 space-y-5 animate-in fade-in duration-300">
              {/* Verdict Banner */}
              {verificationResult.status === 'verified' && (
                <div className="p-4 rounded-xl bg-slate-800/90 border border-cyan-500/40 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold font-mono text-xs sm:text-sm">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0" />
                    <span>INTEGRITY VERIFIED: EXACT CRYPTOGRAPHIC MATCH</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    The submitted media checksum corresponds identically with the registered baseline in the evidence vault. This confirms bit-level file integrity (the file bits have not changed since registration).
                  </p>
                  <div className="p-2.5 rounded bg-[#0B1020] border border-cyan-500/20 text-[11px] text-cyan-200/90 leading-relaxed">
                    <span className="font-semibold text-cyan-300">Forensics Principle:</span> A verified SHA-256 hash confirms the file has not been altered or tampered with since initial intake. It does <span className="underline font-semibold">not</span> prove that the original media is authentic or non-manipulated (deepfakes also produce valid cryptographic checksums).
                  </div>
                </div>
              )}

              {verificationResult.status === 'mismatch' && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-rose-300 font-bold font-mono text-sm">
                    <AlertTriangle className="h-5 w-5 text-rose-400" />
                    <span>INTEGRITY MISMATCH: TAMPERING DETECTED</span>
                  </div>
                  <p className="text-xs text-rose-200/90 leading-relaxed font-sans">
                    {verificationResult.message}
                  </p>
                  <p className="text-[11px] text-rose-300/80 font-mono">
                    Candidate file bytes diverge from the baseline vault hash. One or more bytes have been modified, re-compressed, or substituted.
                  </p>
                </div>
              )}

              {verificationResult.status === 'not_found' && (
                <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                  <div className="flex items-center gap-2 text-slate-200 font-bold font-mono text-sm">
                    <HelpCircle className="h-5 w-5 text-slate-400" />
                    <span>UNABLE TO VERIFY: RECORD NOT FOUND</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    The provided hash does not match any registered evidentiary items in the current vault registry.
                  </p>
                </div>
              )}

              {/* Verified Details Matrix */}
              {verificationResult.matchedEvidence && (
                <div className="space-y-3 p-4 rounded-xl bg-[#0B1020] border border-white/10 text-xs font-mono">
                  <div className="text-slate-400 font-semibold uppercase text-[11px] pb-1 border-b border-white/5 flex items-center justify-between">
                    <span>Vault Evidence Matching Record</span>
                    <span className="text-[10px] text-cyan-400">LOCAL VAULT MATCH</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Evidence ID:</span>
                    <span className="text-cyan-400 font-bold">{verificationResult.matchedEvidence.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Original File Name:</span>
                    <span className="text-white truncate max-w-[200px]">{verificationResult.matchedEvidence.fileName}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-slate-400">Vault Baseline Hash:</span>
                    <span className="text-slate-300 break-all select-all">{verificationResult.matchedEvidence.sha256}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Intake Timestamp:</span>
                    <span className="text-slate-300">
                      {new Date(verificationResult.matchedEvidence.uploadTimestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Lead Custodian:</span>
                    <span className="text-slate-300 font-sans">{verificationResult.matchedEvidence.custodian}</span>
                  </div>

                  {/* Blockchain Anchor Verification */}
                  {verificationResult.matchedEvidence.blockchainRecord ? (
                    <div className="mt-3 pt-3 border-t border-white/10 space-y-2 text-indigo-300">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1.5">
                          <span>BLOCKCHAIN ANCHOR CONFIRMATION</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            DEMO / TESTNET
                          </span>
                        </span>
                        <span className="text-cyan-400 text-[10px]">ANCHOR RECORDED</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Network:</span>
                        <span>{verificationResult.matchedEvidence.blockchainRecord.network}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Block Number:</span>
                        <span className="font-bold">#{verificationResult.matchedEvidence.blockchainRecord.blockNumber}</span>
                      </div>
                      <div className="flex flex-col gap-1 text-[11px]">
                        <span className="text-slate-400">Transaction Hash:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-indigo-400 truncate select-all">
                            {verificationResult.matchedEvidence.blockchainRecord.transactionHash}
                          </span>
                          <button
                            onClick={() => handleCopy(verificationResult.matchedEvidence!.blockchainRecord!.transactionHash)}
                            className="text-slate-400 hover:text-white cursor-pointer"
                          >
                            {copiedTx ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-white/10 text-slate-400 text-[11px]">
                      Ledger Status: Local SHA-256 seal verified. Hash has not yet been committed to a public or testnet blockchain ledger.
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    if (verificationResult.matchedEvidence) {
                      onNavigate('reports', verificationResult.matchedEvidence.id);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
                >
                  <FileCheck2 className="h-4 w-4" />
                  <span>Generate Integrity Certificate</span>
                </button>

                <button
                  onClick={() => onNavigate('vault')}
                  className="text-xs text-slate-400 hover:text-white font-mono"
                >
                  Return to Evidence Vault
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-12 text-center text-slate-400 space-y-2">
              <Link2 className="h-10 w-10 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">Awaiting Verification Target</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select an evidence dossier or supply candidate media on the left to execute cryptographic comparison.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
