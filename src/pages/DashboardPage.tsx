import React, { useState, useEffect } from 'react';
import {
  Database,
  ScanEye,
  Link2,
  FolderGit2,
  Search,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { EvidenceItem, Investigation } from '../types';
import { formatBytes, truncateHash, copyToClipboard } from '../utils/crypto';

interface DashboardPageProps {
  onNavigate: (tab: string, param?: string) => void;
  onSelectEvidence?: (id: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onSelectEvidence }) => {
  const { user } = useAuth();
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'analyzed' | 'pending'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [evs, invs] = await Promise.all([
        api.getEvidence(),
        api.getInvestigations(),
      ]);
      setEvidenceList(evs);
      setInvestigations(invs);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopy = async (text: string, id: string) => {
    await copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Metrics calculation
  const totalEvidence = evidenceList.length;
  const analysesCompleted = evidenceList.filter((e) => e.analysisStatus === 'analyzed').length;
  const verifiedRecords = evidenceList.filter((e) => e.blockchainStatus === 'committed').length;
  const pendingCases = investigations.filter((i) => i.status !== 'closed').length;

  // Filtered evidence list
  const filteredEvidence = evidenceList.filter((item) => {
    const matchesSearch =
      item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sha256.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      statusFilter === 'all' ? true : item.analysisStatus === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 text-[#F8FAFC]">
      {/* Clean Header Bar */}
      <div className="p-5 rounded-xl border border-slate-800 bg-[#111827] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Welcome, {user?.name || 'Investigator'}
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Manage evidence files, cryptographic verification, and deepfake detection workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('detection')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-[#38BDF8] hover:bg-sky-400 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Evidence</span>
          </button>
          <button
            onClick={() => onNavigate('verification')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 border border-slate-800 hover:bg-[#0B1020] rounded-lg transition-colors cursor-pointer"
          >
            <Link2 className="h-4 w-4 text-[#38BDF8]" />
            <span>Verify Hash</span>
          </button>
          <button
            onClick={loadData}
            title="Refresh Vault Data"
            className="p-2 text-slate-400 hover:text-white border border-slate-800 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-[#111827] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Total Evidence Files</span>
            <Database className="h-4 w-4 text-[#38BDF8]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {totalEvidence}
          </div>
          <div className="text-[11px] text-[#94A3B8]">
            Vault-registered assets
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#111827] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Analyses Completed</span>
            <ScanEye className="h-4 w-4 text-[#38BDF8]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {analysesCompleted}
          </div>
          <div className="text-[11px] text-[#94A3B8]">
            AI deepfake assessments
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#111827] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Verified Records</span>
            <Link2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {verifiedRecords}
          </div>
          <div className="text-[11px] text-[#94A3B8]">
            Anchored to blockchain ledger
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#111827] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Pending Investigations</span>
            <FolderGit2 className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {pendingCases}
          </div>
          <div className="text-[11px] text-[#94A3B8]">
            Open and in-progress cases
          </div>
        </div>
      </div>

      {/* Activity Timeline and Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Detection Volume Chart */}
        <div className="lg:col-span-8 p-5 rounded-xl border border-slate-800 bg-[#111827] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Detection & Analysis Activity</h3>
              <p className="text-xs text-[#94A3B8]">Recent evidentiary intake volume</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8]"></span>
                <span>Intake Volume</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span>Anomalies Flagged</span>
              </span>
            </div>
          </div>

          <div className="h-40 w-full pt-2">
            <svg viewBox="0 0 600 140" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartSkyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="120" x2="600" y2="120" stroke="#1e293b" />
              <line x1="0" y1="70" x2="600" y2="70" stroke="#1e293b" strokeDasharray="3 3" />
              <path
                d="M 20,110 Q 80,95 140,75 T 260,55 T 380,40 T 500,65 T 580,25 L 580,120 L 20,120 Z"
                fill="url(#chartSkyGrad)"
              />
              <path
                d="M 20,110 Q 80,95 140,75 T 260,55 T 380,40 T 500,65 T 580,25"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
              />
              <path
                d="M 20,118 Q 80,112 140,100 T 260,85 T 380,70 T 500,90 T 580,50"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <text x="20" y="135" fill="#64748b" fontSize="10" fontFamily="sans-serif">Day 1</text>
              <text x="140" y="135" fill="#64748b" fontSize="10" fontFamily="sans-serif">Day 2</text>
              <text x="260" y="135" fill="#64748b" fontSize="10" fontFamily="sans-serif">Day 3</text>
              <text x="380" y="135" fill="#64748b" fontSize="10" fontFamily="sans-serif">Day 4</text>
              <text x="500" y="135" fill="#64748b" fontSize="10" fontFamily="sans-serif">Day 5</text>
              <text x="560" y="135" fill="#64748b" fontSize="10" fontFamily="sans-serif">Today</text>
            </svg>
          </div>
        </div>

        {/* Recent Cases */}
        <div className="lg:col-span-4 p-5 rounded-xl border border-slate-800 bg-[#111827] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Recent Investigations</h3>
            <button
              onClick={() => onNavigate('investigations')}
              className="text-xs text-[#38BDF8] hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-2">
            {investigations.slice(0, 3).map((inv) => (
              <div
                key={inv.id}
                onClick={() => onNavigate('investigations', inv.id)}
                className="p-3 rounded-lg border border-slate-800 bg-[#0B1020] hover:border-slate-700 transition-colors cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white truncate">{inv.title}</span>
                  <span className="text-[10px] font-mono text-[#38BDF8] shrink-0 uppercase">{inv.priority}</span>
                </div>
                <div className="text-[11px] text-[#94A3B8] flex items-center justify-between">
                  <span>{inv.caseNumber}</span>
                  <span className="capitalize">{inv.status.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Evidence Table */}
      <div className="rounded-xl border border-slate-800 bg-[#111827] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Recent Evidence Records</h3>
            <p className="text-xs text-[#94A3B8]">Files registered in the immutable vault</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search file, ID, hash..."
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 bg-[#0B1020] text-xs text-white placeholder:text-slate-500 focus:border-[#38BDF8] focus:outline-none w-44 sm:w-56"
              />
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-[#0B1020] rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  statusFilter === 'all' ? 'bg-[#111827] text-white font-medium' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('analyzed')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  statusFilter === 'analyzed' ? 'bg-[#111827] text-[#38BDF8] font-medium' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Analyzed
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  statusFilter === 'pending' ? 'bg-[#111827] text-[#38BDF8] font-medium' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Pending
              </button>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[#94A3B8]">
                <th className="py-2.5 px-3">Evidence ID</th>
                <th className="py-2.5 px-3">File Name</th>
                <th className="py-2.5 px-3">SHA-256 Digest</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Analysis</th>
                <th className="py-2.5 px-3">Blockchain</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredEvidence.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-[#94A3B8] font-sans">
                    No evidence records found.
                  </td>
                </tr>
              ) : (
                filteredEvidence.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[#38BDF8]">
                      {item.id}
                    </td>
                    <td className="py-2.5 px-3 text-white font-sans max-w-[180px] truncate" title={item.fileName}>
                      {item.fileName}
                      <span className="block text-[10px] text-[#94A3B8] font-mono">
                        {formatBytes(item.fileSize)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span title={item.sha256}>{truncateHash(item.sha256, 6, 6)}</span>
                        <button
                          onClick={() => handleCopy(item.sha256, item.id)}
                          className="text-slate-500 hover:text-white p-0.5 cursor-pointer"
                          title="Copy hash"
                        >
                          {copiedId === item.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-[#94A3B8] text-[11px]">
                      {new Date(item.uploadTimestamp).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      {item.analysisResult ? (
                        item.analysisResult.classification === 'potentially_manipulated' ? (
                          <span className="text-rose-400 text-xs flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Manipulated ({item.analysisResult.confidenceScore}%)</span>
                          </span>
                        ) : item.analysisResult.classification === 'no_manipulation_detected' ? (
                          <span className="text-emerald-400 text-xs flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Authentic ({item.analysisResult.confidenceScore}%)</span>
                          </span>
                        ) : (
                          <span className="text-amber-400 text-xs">Inconclusive</span>
                        )
                      ) : (
                        <span className="text-slate-500 text-xs">Pending</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      {item.blockchainStatus === 'committed' ? (
                        <span className="text-[#38BDF8] flex items-center gap-1">
                          <Link2 className="h-3 w-3" />
                          <span>Block #{item.blockchainRecord?.blockNumber}</span>
                        </span>
                      ) : (
                        <span className="text-slate-500">Uncommitted</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-2 font-sans">
                      <button
                        onClick={() => {
                          if (onSelectEvidence) onSelectEvidence(item.id);
                          onNavigate('vault');
                        }}
                        className="text-xs text-[#38BDF8] hover:underline font-medium cursor-pointer"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => onNavigate('reports', item.id)}
                        className="text-xs text-slate-300 hover:text-white font-medium cursor-pointer"
                      >
                        Report
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
