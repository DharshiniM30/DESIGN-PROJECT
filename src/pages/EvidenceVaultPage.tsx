import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Filter,
  Link2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  X,
  History,
  Lock,
  FileVideo,
  FileImage,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { EvidenceItem } from '../types';
import { api } from '../services/api';
import { formatBytes, truncateHash, copyToClipboard } from '../utils/crypto';

interface EvidenceVaultPageProps {
  onNavigate: (tab: string, param?: string) => void;
  selectedEvidenceId?: string | null;
}

export const EvidenceVaultPage: React.FC<EvidenceVaultPageProps> = ({
  onNavigate,
  selectedEvidenceId,
}) => {
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'committed' | 'uncommitted'>('all');
  const [activeItem, setActiveItem] = useState<EvidenceItem | null>(null);
  const [anchoringId, setAnchoringId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getEvidence();
      setEvidenceList(data);
      if (selectedEvidenceId) {
        const found = data.find((e) => e.id === selectedEvidenceId);
        if (found) setActiveItem(found);
      }
    } catch (err) {
      console.error('Error fetching vault items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedEvidenceId]);

  const handleCopy = async (text: string, id: string) => {
    await copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAnchor = async (item: EvidenceItem) => {
    setAnchoringId(item.id);
    try {
      const res = await api.anchorEvidence(item.id);
      setNotification(`Evidence hash anchored to Sepolia ledger at Block #${res.evidence.blockchainRecord?.blockNumber}!`);
      // Update local state
      setEvidenceList((prev) => prev.map((e) => (e.id === item.id ? res.evidence : e)));
      if (activeItem && activeItem.id === item.id) {
        setActiveItem(res.evidence);
      }
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Blockchain anchoring failed');
    } finally {
      setAnchoringId(null);
    }
  };

  const filtered = evidenceList.filter((item) => {
    const matchesSearch =
      item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sha256.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ? true : item.blockchainStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Title Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Evidence Management
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1 max-w-2xl leading-relaxed">
            Organize files, investigation details, and verification history in one place.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('detection')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-[#38BDF8] hover:bg-sky-400 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Evidence</span>
          </button>
          <button
            onClick={loadData}
            className="p-2 text-slate-400 hover:text-white border border-slate-800 rounded-lg transition-colors"
            title="Refresh Vault"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by file name, Evidence ID (EV-...), or SHA-256..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-white/10 bg-[#0E1528] text-xs text-slate-200 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">LEDGER STATUS:</span>
          <div className="flex items-center gap-1 p-1 bg-[#0E1528] rounded-lg border border-white/10">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                filterStatus === 'all' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => setFilterStatus('committed')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                filterStatus === 'committed' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Anchored (On-Chain)
            </button>
            <button
              onClick={() => setFilterStatus('uncommitted')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                filterStatus === 'uncommitted' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Local Vault Only
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Evidence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => {
          const isAnchored = item.blockchainStatus === 'committed';
          return (
            <div
              key={item.id}
              className={`rounded-xl border transition-all p-5 space-y-4 bg-[#0E1528] flex flex-col justify-between ${
                activeItem?.id === item.id
                  ? 'border-cyan-400/80 shadow-lg shadow-cyan-500/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="space-y-3">
                {/* Header ID & Blockchain Badge */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    {item.id}
                  </span>
                  {isAnchored ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                      <Link2 className="h-3 w-3" />
                      <span>Block #{item.blockchainRecord?.blockNumber}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-400 border border-white/5">
                      <span>Local Hash Sealed</span>
                    </span>
                  )}
                </div>

                {/* File Title */}
                <div>
                  <h4 className="text-sm font-semibold text-white truncate" title={item.fileName}>
                    {item.fileName}
                  </h4>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {item.fileType} · {formatBytes(item.fileSize)}
                  </div>
                </div>

                {/* SHA-256 Box */}
                <div className="p-2.5 rounded bg-[#080C18] border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>SHA-256 DIGEST</span>
                    <button
                      onClick={() => handleCopy(item.sha256, item.id)}
                      className="text-cyan-400 hover:text-cyan-300 p-0.5"
                      title="Copy full hash"
                    >
                      {copiedId === item.id ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-[11px] text-slate-300 select-all truncate">
                    {item.sha256}
                  </div>
                </div>

                {/* Custodian & Case */}
                <div className="text-xs space-y-1 text-slate-300">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Custodian:</span>
                    <span className="truncate max-w-[170px] text-right font-medium">
                      {item.custodian}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Seizure Timestamp:</span>
                    <span className="font-mono text-slate-300">
                      {new Date(item.uploadTimestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Analysis Status:</span>
                    <span className="font-mono text-[11px]">
                      {item.analysisResult ? (
                        item.analysisResult.classification === 'potentially_manipulated' ? (
                          <span className="text-rose-400 font-semibold">Potentially Manipulated</span>
                        ) : item.analysisResult.classification === 'no_manipulation_detected' ? (
                          <span className="text-cyan-300 font-semibold">No Manipulation Detected</span>
                        ) : item.analysisResult.classification === 'analysis_unavailable' ? (
                          <span className="text-slate-400 font-semibold">Analysis Unavailable</span>
                        ) : (
                          <span className="text-amber-400 font-semibold">Inconclusive</span>
                        )
                      ) : (
                        <span className="text-slate-400">Pending Analysis</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveItem(item)}
                    className="w-full py-1.5 px-3 rounded text-xs font-medium text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    Audit Details
                  </button>
                  <button
                    onClick={() => onNavigate('verification', item.id)}
                    className="w-full py-1.5 px-3 rounded text-xs font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors"
                  >
                    Verify Hash
                  </button>
                </div>

                {!isAnchored ? (
                  <button
                    onClick={() => handleAnchor(item)}
                    disabled={anchoringId === item.id}
                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {anchoringId === item.id ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span>Committing to Ledger...</span>
                      </>
                    ) : (
                      <>
                        <Link2 className="h-3.5 w-3.5" />
                        <span>Anchor to Blockchain</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate('reports', item.id)}
                    className="w-full py-2 px-3 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-white/10 hover:border-white/20 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FileText className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Download Forensic Report</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 rounded-xl border border-white/10 bg-slate-900/40 text-center space-y-2">
          <Database className="h-10 w-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-semibold text-white">No evidence records found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search terms or upload an evidence asset to establish a new chain of custody.
          </p>
        </div>
      )}

      {/* Audit Detail Modal / Drawer */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-[#0E1528] p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <span>EVIDENCE DOSSIER AUDIT</span>
                <span>·</span>
                <span>{activeItem.id}</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">{activeItem.fileName}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Full chronological ledger and cryptographic provenance records.
              </p>
            </div>

            {/* Cryptographic Metadata Matrix */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-white/5">
                <span className="text-slate-400">SHA-256 Digest:</span>
                <span className="text-cyan-300 break-all select-all">{activeItem.sha256}</span>
              </div>
              {activeItem.md5 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-white/5">
                  <span className="text-slate-400">MD5 Legacy Digest:</span>
                  <span className="text-slate-300">{activeItem.md5}</span>
                </div>
              )}
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-slate-400">File Byte Size:</span>
                <span className="text-white">{formatBytes(activeItem.fileSize)} ({activeItem.fileSize} bytes)</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-slate-400">Assigned Custodian:</span>
                <span className="text-white font-sans">{activeItem.custodian}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-slate-400">Retention Schedule:</span>
                <span className="text-slate-300 font-sans">{activeItem.retentionPolicy}</span>
              </div>
              {activeItem.blockchainRecord && (
                <>
                  <div className="flex items-center justify-between pb-2 border-b border-white/5 text-indigo-300">
                    <span>Anchored Ledger:</span>
                    <span>{activeItem.blockchainRecord.network}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-white/5">
                    <span className="text-slate-400">Transaction Hash:</span>
                    <span className="text-indigo-400 break-all select-all">
                      {activeItem.blockchainRecord.transactionHash}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-indigo-300">
                    <span>Block Height / Merkle Root:</span>
                    <span>Block #{activeItem.blockchainRecord.blockNumber}</span>
                  </div>
                </>
              )}
            </div>

            {/* Chain of Custody Timeline */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-white font-mono uppercase tracking-wider">
                <History className="h-4 w-4 text-cyan-400" />
                <span>Chain of Custody Events ({activeItem.auditTrail.length})</span>
              </div>

              <div className="space-y-2.5">
                {activeItem.auditTrail.map((ev, idx) => (
                  <div
                    key={ev.id || idx}
                    className="p-3 rounded-lg border border-white/5 bg-slate-950 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-cyan-400 font-semibold">{ev.action}</span>
                      <span className="text-slate-400">
                        {new Date(ev.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs">{ev.details}</p>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Logged by: {ev.actor}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
              <button
                onClick={() => {
                  setActiveItem(null);
                  onNavigate('reports', activeItem.id);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>View Full Forensic Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
