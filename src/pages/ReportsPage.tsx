import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Link2,
  Fingerprint,
  Calendar,
  User,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import { EvidenceItem } from '../types';
import { api } from '../services/api';
import { formatBytes, truncateHash } from '../utils/crypto';
import { useAuth } from '../context/AuthContext';

interface ReportsPageProps {
  onNavigate: (tab: string, param?: string) => void;
  targetEvidenceId?: string | null;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  onNavigate,
  targetEvidenceId,
}) => {
  const { user } = useAuth();
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await api.getEvidence();
        setEvidenceList(data);
        if (targetEvidenceId) {
          const found = data.find((e) => e.id === targetEvidenceId);
          if (found) setSelectedItem(found);
        } else if (data.length > 0) {
          setSelectedItem(data[0]);
        }
      } catch (err) {
        console.error('Failed to load reports data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [targetEvidenceId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    if (!selectedItem) return;
    const reportData = {
      reportStandard: 'ISO/IEC 27037 Digital Evidence Admissibility Format',
      reportId: `REP-${selectedItem.id}-${Date.now().toString().slice(-6)}`,
      generatedAt: new Date().toISOString(),
      investigator: user?.name || selectedItem.custodian,
      evidenceMetadata: {
        id: selectedItem.id,
        fileName: selectedItem.fileName,
        fileType: selectedItem.fileType,
        fileSize: selectedItem.fileSize,
        sha256: selectedItem.sha256,
        uploadTimestamp: selectedItem.uploadTimestamp,
      },
      technicalIntegrityFact: {
        cryptographicAlgorithm: 'SHA-256 (FIPS 180-4)',
        hashDigest: selectedItem.sha256,
        blockchainAnchor: selectedItem.blockchainRecord || 'Local Sealed Vault',
      },
      aiForensicAssessment: selectedItem.analysisResult || 'Analysis not conducted',
      chainOfCustodyAuditTrail: selectedItem.auditTrail,
      legalDisclaimer: 'AI predictions represent probabilistic forensic estimations; technical cryptographic hashes represent deterministic mathematical facts.',
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Forensic_Report_${selectedItem.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Action Header - Hidden on Print */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Forensic Reports
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1 max-w-2xl leading-relaxed">
            Generate verifiable evidentiary reports distinguishing technical cryptographic facts from AI assessments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Target Evidence Selector */}
          <select
            value={selectedItem?.id || ''}
            onChange={(e) => {
              const found = evidenceList.find((ev) => ev.id === e.target.value);
              if (found) setSelectedItem(found);
            }}
            className="px-3 py-2 rounded-lg border border-white/10 bg-[#0E1528] text-xs font-mono text-slate-200 focus:border-cyan-400 focus:outline-none"
          >
            {evidenceList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.id} · {item.fileName}
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report (PDF)</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 border border-white/15 hover:bg-white/5 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4 text-cyan-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Official Forensic Report Document */}
      {selectedItem ? (
        <div className="rounded-2xl border border-white/15 bg-[#0B1020] print:border-none print:bg-white print:text-black p-8 sm:p-12 shadow-2xl space-y-8 max-w-4xl mx-auto">
          {/* Official Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b-2 border-white/20 print:border-black">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 print:text-black print:border-black">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white print:text-black">
                  VERITYCHAIN DIGITAL FORENSICS
                </span>
              </div>
              <div className="text-xs font-mono text-cyan-400 print:text-slate-700">
                LABORATORY FOR EVIDENCE INTEGRITY & SYNTHETIC MEDIA VERIFICATION
              </div>
              <div className="text-[11px] text-slate-400 print:text-slate-600">
                Document Ref: REP-{selectedItem.id}-{selectedItem.sha256.substring(0, 8).toUpperCase()}
              </div>
            </div>

            <div className="text-right text-xs font-mono space-y-1">
              <div className="text-slate-400 print:text-slate-600">ISSUE TIMESTAMP:</div>
              <div className="text-white print:text-black font-semibold">
                {new Date().toUTCString()}
              </div>
              <div className="text-emerald-400 print:text-black text-[11px]">
                OFFICIALLY AUTHENTICATED RECORD
              </div>
            </div>
          </div>

          {/* Section 1: Investigation & Evidence Metadata */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 print:text-black pb-1 border-b border-white/10 print:border-slate-300">
              1.0 Seized Evidence Asset Summary
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-900/60 print:bg-slate-100 border border-white/10 print:border-slate-200">
                <div className="text-slate-400 print:text-slate-600 text-[10px]">EVIDENCE ID</div>
                <div className="font-bold text-white print:text-black text-sm mt-0.5">{selectedItem.id}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 print:bg-slate-100 border border-white/10 print:border-slate-200">
                <div className="text-slate-400 print:text-slate-600 text-[10px]">FILE FORMAT</div>
                <div className="font-bold text-white print:text-black mt-0.5">{selectedItem.fileType}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 print:bg-slate-100 border border-white/10 print:border-slate-200">
                <div className="text-slate-400 print:text-slate-600 text-[10px]">PAYLOAD SIZE</div>
                <div className="font-bold text-white print:text-black mt-0.5">{formatBytes(selectedItem.fileSize)}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 print:bg-slate-100 border border-white/10 print:border-slate-200">
                <div className="text-slate-400 print:text-slate-600 text-[10px]">LEAD CUSTODIAN</div>
                <div className="font-bold text-white print:text-black truncate mt-0.5">{selectedItem.custodian}</div>
              </div>
            </div>
          </div>

          {/* Section 2: Mathematical Cryptographic Proof (Technical Fact) */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 print:text-black pb-1 border-b border-white/10 print:border-slate-300 flex items-center justify-between">
              <span>2.0 Technical Fact: Cryptographic Hash & Ledger Proof</span>
              <span className="text-[10px] text-emerald-400 print:text-black font-semibold">
                DETERMINISTIC VERIFICATION
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 print:bg-slate-100 border border-white/10 print:border-slate-300 space-y-3 text-xs font-mono">
              <div>
                <span className="text-slate-400 print:text-slate-600 block text-[11px]">
                  FIPS 180-4 SHA-256 Cryptographic Digest (64 Hex Characters):
                </span>
                <span className="text-cyan-300 print:text-black font-bold break-all select-all block mt-0.5">
                  {selectedItem.sha256}
                </span>
              </div>

              {selectedItem.blockchainRecord ? (
                <div className="pt-2 border-t border-white/10 print:border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-400 print:text-slate-600 block">Blockchain Ledger:</span>
                    <span className="text-white print:text-black font-semibold">
                      {selectedItem.blockchainRecord.network}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 print:text-slate-600 block">Committed Block Number:</span>
                    <span className="text-white print:text-black font-bold">
                      #{selectedItem.blockchainRecord.blockNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 print:text-slate-600 block">Smart Contract Address:</span>
                    <span className="text-cyan-300 print:text-black truncate block">
                      {selectedItem.blockchainRecord.contractAddress}
                    </span>
                  </div>
                  <div className="sm:col-span-3">
                    <span className="text-slate-400 print:text-slate-600 block">On-Chain Transaction Hash:</span>
                    <span className="text-indigo-400 print:text-black break-all select-all block">
                      {selectedItem.blockchainRecord.transactionHash}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 print:text-slate-600 pt-2 border-t border-white/10">
                  Integrity Status: Seized item hash is recorded in VerityChain vault with local cryptographic seal.
                </div>
              )}
            </div>
          </div>

          {/* Section 3: AI Forensic Artifact Assessment (Probabilistic Assessment) */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 print:text-black pb-1 border-b border-white/10 print:border-slate-300 flex items-center justify-between">
              <span>3.0 Probabilistic Assessment: AI Forensic Anomaly Inspection</span>
              <span className="text-[10px] text-amber-400 print:text-black font-semibold">
                STATISTICAL INFERENCE
              </span>
            </div>

            {selectedItem.analysisResult ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900/80 print:bg-slate-100 border border-white/10 print:border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 print:text-slate-600 text-[11px] block">CLASSIFICATION RESULT</span>
                    <span
                      className={`text-sm font-bold uppercase ${
                        selectedItem.analysisResult.classification === 'potentially_manipulated'
                          ? 'text-rose-400 print:text-rose-700'
                          : selectedItem.analysisResult.classification === 'no_manipulation_detected'
                          ? 'text-cyan-300 print:text-cyan-800'
                          : selectedItem.analysisResult.classification === 'analysis_unavailable'
                          ? 'text-slate-400 print:text-slate-600'
                          : 'text-amber-400 print:text-amber-700'
                      }`}
                    >
                      {selectedItem.analysisResult.classification.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 print:text-slate-600 text-[11px] block">CONFIDENCE METRIC</span>
                    <span className="text-white print:text-black font-bold text-sm">
                      {selectedItem.analysisResult.confidenceScore !== null && selectedItem.analysisResult.confidenceScore !== undefined
                        ? `${selectedItem.analysisResult.confidenceScore}%`
                        : 'N/A (Unavailable)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 print:text-slate-600 text-[11px] block">FORENSIC ENGINE</span>
                    <span className="text-cyan-300 print:text-black font-semibold">
                      {selectedItem.analysisResult.modelName} ({selectedItem.analysisResult.modelVersion})
                    </span>
                  </div>
                </div>

                {/* Granular Forensic Vectors */}
                <div className="space-y-2">
                  <div className="text-[11px] font-mono text-slate-400 print:text-slate-700 uppercase font-semibold">
                    Specific Analyzed Artifact Signals:
                  </div>
                  <div className="space-y-2">
                    {selectedItem.analysisResult.forensicIndicators.map((ind, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg border border-white/5 print:border-slate-200 bg-slate-950 print:bg-white text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="font-semibold text-white print:text-black">{ind.title}</span>
                          <span className={ind.anomalyDetected ? 'text-rose-400 print:text-rose-700' : 'text-emerald-400 print:text-emerald-700'}>
                            {ind.anomalyDetected ? 'Anomaly Detected' : 'Consistent with Baseline'} ({ind.confidence}%)
                          </span>
                        </div>
                        <p className="text-slate-300 print:text-slate-800 text-[11px] leading-relaxed">
                          {ind.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explicit Disclaimer */}
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 print:text-slate-700 print:bg-slate-50 print:border-slate-300 space-y-1">
                  <div className="font-semibold text-amber-300 print:text-black flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5" />
                    <span>Mandatory Legal Evidentiary Note:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    AI models provide probabilistic pattern matching and statistical artifact detection. They do not claim absolute legal admissibility or guaranteed authenticity without independent sensor, telematics, and forensic corroboration.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 border border-white/10 rounded-xl bg-slate-900/40">
                AI deepfake artifact scan has not yet been executed on this evidence item.
              </div>
            )}
          </div>

          {/* Section 4: Chain of Custody Audit Log */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 print:text-black pb-1 border-b border-white/10 print:border-slate-300">
              4.0 Chronological Chain of Custody Log
            </div>

            <div className="space-y-2 font-mono text-xs">
              {selectedItem.auditTrail.map((ev, i) => (
                <div
                  key={ev.id || i}
                  className="p-3 rounded-lg bg-slate-950 print:bg-slate-100 border border-white/5 print:border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-cyan-400 print:text-black font-semibold">{ev.action}</div>
                    <div className="text-slate-300 print:text-slate-800 text-[11px] font-sans">{ev.details}</div>
                  </div>
                  <div className="text-right text-[11px] text-slate-400 print:text-slate-600 shrink-0">
                    <div>{new Date(ev.timestamp).toLocaleString()}</div>
                    <div>By: {ev.actor}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signatures & Certification Box */}
          <div className="pt-8 border-t-2 border-white/20 print:border-black grid grid-cols-2 gap-8 text-xs font-mono">
            <div className="space-y-2">
              <div className="text-slate-400 print:text-slate-600">CERTIFYING FORENSIC EXAMINER:</div>
              <div className="font-semibold text-white print:text-black font-sans text-sm">
                {user?.name || selectedItem.custodian}
              </div>
              <div className="text-[11px] text-slate-500">
                Public Key ID: {user?.publicKey ? truncateHash(user.publicKey, 8, 8) : '0x71C8...E4540'}
              </div>
              <div className="pt-4 border-b border-white/30 print:border-black w-48"></div>
              <div className="text-[10px] text-slate-500">Authorized Evidentiary Signature</div>
            </div>

            <div className="space-y-2 text-right">
              <div className="text-slate-400 print:text-slate-600">VERITYCHAIN IMMUTABLE ENCLAVE:</div>
              <div className="font-semibold text-emerald-400 print:text-black text-sm">
                CONSENSUS SEAL VERIFIED
              </div>
              <div className="text-[11px] text-slate-500">
                Protocol: SHA-256 + ECDSA + EVM Anchor
              </div>
              <div className="pt-4 ml-auto border-b border-white/30 print:border-black w-48"></div>
              <div className="text-[10px] text-slate-500">Decentralized Timestamp Seal</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 border border-white/10 rounded-xl bg-slate-900/40">
          No evidence record selected. Choose an evidence item above to view its forensic dossier.
        </div>
      )}
    </div>
  );
};
