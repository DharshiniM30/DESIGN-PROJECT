import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  FileText,
  Database,
  Link2,
  MessageSquare,
  Send,
  X,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Investigation, EvidenceItem } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface InvestigationsPageProps {
  onNavigate: (tab: string, param?: string) => void;
  selectedCaseId?: string | null;
}

export const InvestigationsPage: React.FC<InvestigationsPageProps> = ({
  onNavigate,
  selectedCaseId,
}) => {
  const { user } = useAuth();
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'closed'>('all');
  const [activeCase, setActiveCase] = useState<Investigation | null>(null);

  // New Case Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCaseNumber, setNewCaseNumber] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');

  // Case note state
  const [noteInput, setNoteInput] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [invs, evs] = await Promise.all([
        api.getInvestigations(),
        api.getEvidence(),
      ]);
      setInvestigations(invs);
      setEvidenceList(evs);
      if (selectedCaseId) {
        const found = invs.find((i) => i.id === selectedCaseId);
        if (found) setActiveCase(found);
      } else if (invs.length > 0 && !activeCase) {
        setActiveCase(invs[0]);
      }
    } catch (err) {
      console.error('Failed to load investigations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCaseId]);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const created = await api.createInvestigation({
        title: newTitle.trim(),
        caseNumber: newCaseNumber.trim() || undefined,
        description: newDescription.trim(),
        priority: newPriority,
        leadInvestigator: user ? `${user.name} (${user.role})` : 'Senior Cyber Investigator',
      });
      setInvestigations([created, ...investigations]);
      setActiveCase(created);
      setShowCreateModal(false);
      setNewTitle('');
      setNewCaseNumber('');
      setNewDescription('');
    } catch (err) {
      console.error('Error creating case:', err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase || !noteInput.trim()) return;

    try {
      const author = user ? user.name : 'Forensic Examiner';
      const updated = await api.addInvestigationNote(activeCase.id, noteInput.trim(), author);
      setActiveCase(updated);
      setInvestigations((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setNoteInput('');
    } catch (err) {
      console.error('Error adding case note:', err);
    }
  };

  const handleStatusChange = async (newStatus: 'open' | 'in_progress' | 'closed') => {
    if (!activeCase) return;
    try {
      const updated = await api.updateInvestigation(activeCase.id, { status: newStatus });
      setActiveCase(updated);
      setInvestigations((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err) {
      console.error('Failed to update case status:', err);
    }
  };

  const filtered = investigations.filter((inv) => {
    const matchesSearch =
      inv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' ? true : inv.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Investigations
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1 max-w-2xl leading-relaxed">
            Manage forensic cases, evidence linkages, and verified case history.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm shadow-cyan-500/20"
        >
          <Plus className="h-4 w-4" />
          <span>New Investigation Case</span>
        </button>
      </div>

      {/* Main 2-Column Split: Case List + Case Detail Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Case Directory */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search case, title, or ID..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-white/10 bg-[#0E1528] text-xs text-slate-200 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e: any) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-[#0E1528] text-xs font-mono text-slate-300 focus:border-cyan-400 focus:outline-none"
            >
              <option value="all">All States</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {filtered.map((inv) => {
              const isSelected = activeCase?.id === inv.id;
              return (
                <div
                  key={inv.id}
                  onClick={() => setActiveCase(inv)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 bg-[#0E1528] ${
                    isSelected
                      ? 'border-cyan-400/80 bg-[#111A33] shadow-md shadow-cyan-500/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-cyan-400">{inv.caseNumber}</span>
                    <span
                      className={`text-[10px] font-semibold uppercase ${
                        inv.priority === 'critical'
                          ? 'text-rose-400'
                          : inv.priority === 'high'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {inv.priority}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white truncate">{inv.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {inv.description}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-white/5">
                    <span>{inv.evidenceIds.length} Assets Linked</span>
                    <span className="capitalize">{inv.status.replace('_', ' ')}</span>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400 border border-white/10 rounded-xl bg-slate-900/40">
                No matching investigation cases found.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Case Dossier Detail */}
        <div className="lg:col-span-7">
          {activeCase ? (
            <div className="rounded-xl border border-white/10 bg-[#0E1528] p-6 space-y-6">
              {/* Case Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                    <span>{activeCase.id}</span>
                    <span>·</span>
                    <span>{activeCase.caseNumber}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">{activeCase.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 font-mono">
                    <span>Lead: {activeCase.leadInvestigator}</span>
                    <span>·</span>
                    <span>Updated: {new Date(activeCase.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Status Switcher Buttons */}
                <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-white/10 font-mono text-xs">
                  <button
                    onClick={() => handleStatusChange('open')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      activeCase.status === 'open' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleStatusChange('in_progress')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      activeCase.status === 'in_progress' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => handleStatusChange('closed')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      activeCase.status === 'closed' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    Closed
                  </button>
                </div>
              </div>

              {/* Case Overview Description */}
              <div className="space-y-1.5 text-xs">
                <span className="font-semibold text-slate-400 font-mono uppercase tracking-wider">
                  Case Scope & Allegations
                </span>
                <p className="text-slate-200 leading-relaxed bg-slate-950 p-3.5 rounded-lg border border-white/5">
                  {activeCase.description}
                </p>
              </div>

              {/* Linked Evidentiary Assets */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-white font-mono uppercase tracking-wider">
                  <span>Linked Seized Assets ({activeCase.evidenceIds.length})</span>
                  <button
                    onClick={() => onNavigate('vault')}
                    className="text-cyan-400 hover:underline text-[11px] normal-case"
                  >
                    Associate More from Vault
                  </button>
                </div>

                <div className="space-y-2">
                  {activeCase.evidenceIds.length === 0 ? (
                    <div className="p-4 rounded-lg bg-slate-950 border border-white/5 text-center text-xs text-slate-500">
                      No evidentiary media files attached yet.
                    </div>
                  ) : (
                    activeCase.evidenceIds.map((evId) => {
                      const matchedItem = evidenceList.find((e) => e.id === evId);
                      return (
                        <div
                          key={evId}
                          className="p-3 rounded-lg border border-white/5 bg-slate-950 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="font-mono font-semibold text-cyan-400">{evId}</div>
                            <div className="text-slate-200 font-medium">
                              {matchedItem ? matchedItem.fileName : 'Seized Media Asset'}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              SHA-256: {matchedItem ? matchedItem.sha256.substring(0, 24) + '...' : 'Available in Vault'}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onNavigate('verification', evId)}
                              className="px-2.5 py-1 text-xs text-cyan-300 hover:text-white border border-cyan-500/30 rounded"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => onNavigate('reports', evId)}
                              className="px-2.5 py-1 text-xs text-slate-300 hover:text-white border border-white/10 rounded"
                            >
                              Report
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Case Notes & Activity Stream */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="text-xs font-semibold text-white font-mono uppercase tracking-wider">
                  Investigator Activity & Chronological Notes
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {activeCase.notes.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 rounded-lg bg-slate-950 border border-white/5 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="font-semibold text-cyan-300">{n.author}</span>
                        <span className="text-slate-500">
                          {new Date(n.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{n.text}</p>
                    </div>
                  ))}
                </div>

                {/* Add Note Input */}
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Enter timestamped investigative note or forensic hypothesis..."
                    className="flex-1 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!noteInput.trim()}
                    className="px-3.5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-900 text-xs font-semibold disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Log</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 border border-white/10 rounded-xl bg-slate-900/40">
              Select an investigation case to view dossier details.
            </div>
          )}
        </div>
      </div>

      {/* Create Case Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#0E1528] p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <div className="text-xs font-mono text-cyan-400">INITIATE CASE DOSSIER</div>
              <h3 className="text-lg font-bold text-white mt-1">New Forensic Investigation</h3>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Investigation Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Synthetic CEO Voice Wire Fraud Incident"
                  className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Agency Case Reference Number
                  </label>
                  <input
                    type="text"
                    value={newCaseNumber}
                    onChange={(e) => setNewCaseNumber(e.target.value)}
                    placeholder="CASE-2026-X99"
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Priority Tier
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e: any) => setNewPriority(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none font-mono"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical Forensic Alert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Case Synopsis & Scope
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Detail the circumstances of media seizure, alleged victims, and initial inspection goals..."
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-slate-950 p-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-semibold"
                >
                  Create Case Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
