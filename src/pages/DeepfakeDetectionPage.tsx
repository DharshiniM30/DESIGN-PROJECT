import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileVideo,
  FileImage,
  ScanEye,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Database,
  ArrowRight,
  ShieldAlert,
  Fingerprint,
  Info,
  Clock,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { calculateFileSha256, formatBytes, truncateHash, copyToClipboard } from '../utils/crypto';
import { api } from '../services/api';
import { ForensicAnalysisResult, EvidenceItem } from '../types';
import { useAuth } from '../context/AuthContext';

interface DeepfakeDetectionPageProps {
  onNavigate: (tab: string, param?: string) => void;
  onEvidenceCreated?: (item: EvidenceItem) => void;
}

export const DeepfakeDetectionPage: React.FC<DeepfakeDetectionPageProps> = ({
  onNavigate,
  onEvidenceCreated,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileSha256, setFileSha256] = useState<string>('');
  const [hashingProgress, setHashingProgress] = useState<number>(0);
  const [isHashing, setIsHashing] = useState<boolean>(false);

  const [promptNotes, setPromptNotes] = useState<string>('');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<ForensicAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedEvidence, setSavedEvidence] = useState<EvidenceItem | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // File size limit: 50MB
  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  const handleFileSelect = async (file: File) => {
    setErrorMessage(null);
    setAnalysisResult(null);
    setSavedEvidence(null);

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(`File exceeds 50MB limit (${formatBytes(file.size)}). Please choose a smaller evidentiary clip.`);
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage(`Unsupported format: ${file.type || 'Unknown'}. Please select a JPEG, PNG, WEBP, or MP4/WebM file.`);
      return;
    }

    setSelectedFile(file);

    // Create preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(URL.createObjectURL(file));
    }

    // Immediately compute real client-side SHA-256
    setIsHashing(true);
    setHashingProgress(20);
    try {
      const hash = await calculateFileSha256(file, (p) => setHashingProgress(p));
      setFileSha256(hash);
    } catch (err) {
      console.error('Hash calculation error:', err);
      setErrorMessage('Failed to calculate cryptographic SHA-256 hash.');
    } finally {
      setIsHashing(false);
      setHashingProgress(100);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const executeAnalysis = async (isDemo = false) => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setErrorMessage(null);

    try {
      let base64Payload = '';
      if (filePreview && filePreview.startsWith('data:')) {
        base64Payload = filePreview;
      }

      const result = await api.analyzeMedia({
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileData: base64Payload || undefined,
        promptNotes: promptNotes.trim() || undefined,
        isDemoMode: isDemo,
      });

      setAnalysisResult(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Forensic analysis pipeline encountered an error.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCreateEvidenceRecord = async () => {
    if (!selectedFile || !fileSha256) return;

    try {
      const newEv = await api.createEvidence({
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        sha256: fileSha256,
        custodian: user ? `${user.name} (${user.role})` : 'Authorized Analyst',
        previewUrl: filePreview || undefined,
        retentionPolicy: 'Standard 7-Year Evidentiary Hold',
      });

      // Attach analysis result if present
      if (analysisResult) {
        newEv.analysisStatus = analysisResult.classification === 'analysis_unavailable' ? 'pending' : 'analyzed';
        newEv.analysisResult = analysisResult;
      }

      setSavedEvidence(newEv);
      if (onEvidenceCreated) onEvidenceCreated(newEv);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to register record in evidence vault.');
    }
  };

  const handleCopyHash = async () => {
    if (!fileSha256) return;
    await copyToClipboard(fileSha256);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Media Analysis & AI Deepfake Detection
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1 max-w-2xl leading-relaxed">
            Multi-vector forensic inspection of digital images and video clips to evaluate synthetic generation, splicing artifacts, and sensor noise coherence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedFile(null);
              setFilePreview(null);
              setFileSha256('');
              setAnalysisResult(null);
              setSavedEvidence(null);
              setErrorMessage(null);
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white border border-white/10 rounded-lg transition-colors cursor-pointer"
          >
            Clear Staging
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300">
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-rose-200">Forensics Error:</span>
            <div>{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Main Upload and Staging Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Drag & Drop Ingestion Zone */}
        <div className="lg:col-span-5 space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/20 hover:border-cyan-400/50 bg-[#0E1528] rounded-2xl p-7 text-center cursor-pointer transition-all hover:bg-[#111A33] group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
              className="hidden"
            />
            <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:scale-105 transition-transform">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div className="mt-3.5 space-y-1">
              <div className="text-sm font-semibold text-white">
                Drop evidentiary media here, or <span className="text-cyan-400">browse files</span>
              </div>
              <p className="text-xs text-slate-400">
                Supports JPEG, PNG, WEBP, MP4, and WebM (Up to 50MB)
              </p>
            </div>
            <div className="mt-3 text-[10px] text-slate-500 font-mono">
              Deterministic client-side SHA-256 seal is computed on file selection
            </div>
          </div>

          {/* Quick Forensic Testing Samples */}
          <div className="p-4 rounded-xl border border-white/10 bg-[#111827] space-y-2.5">
            <div className="text-[11px] font-mono text-cyan-400 font-semibold flex items-center justify-between">
              <span>TEST FORENSIC SAMPLE ASSETS</span>
              <span className="text-slate-500">Quick-load</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const response = await fetch('/src/assets/images/hero_forensics_security_1792596868388.jpg');
                    const blob = await response.blob();
                    const sampleFile = new File([blob], 'suspected_deepfake_broadcast.jpg', { type: 'image/jpeg' });
                    handleFileSelect(sampleFile);
                  } catch (err) {
                    setErrorMessage('Failed to load sample image.');
                  }
                }}
                className="p-2.5 rounded-lg border border-white/10 bg-[#0B1020] hover:border-cyan-500/40 text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-white truncate">Sample Frame A</div>
                <div className="text-[10px] text-rose-400 font-mono">Suspected Blend</div>
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const response = await fetch('/src/assets/images/security_vault_auth_1792596868379.jpg');
                    const blob = await response.blob();
                    const sampleFile = new File([blob], 'surveillance_vault_camera_04.jpg', { type: 'image/jpeg' });
                    handleFileSelect(sampleFile);
                  } catch (err) {
                    setErrorMessage('Failed to load sample image.');
                  }
                }}
                className="p-2.5 rounded-lg border border-white/10 bg-[#0B1020] hover:border-cyan-500/40 text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-white truncate">Sample Frame B</div>
                <div className="text-[10px] text-cyan-400 font-mono">Original Capture</div>
              </button>
            </div>
          </div>

          {/* Context Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Investigator Context & Case Hypotheses (Optional)
            </label>
            <textarea
              value={promptNotes}
              onChange={(e) => setPromptNotes(e.target.value)}
              placeholder="e.g. Seized from suspect media drive; examine facial boundary continuity, lighting angles, and GAN noise floor."
              rows={2}
              className="w-full rounded-lg border border-white/10 bg-[#0B1020] p-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Right: Selected File Inspection & Execution Panel */}
        <div className="lg:col-span-7 space-y-5">
          {selectedFile ? (
            <div className="rounded-xl border border-white/10 bg-[#111827] p-5 space-y-4">
              {/* Media File Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    {selectedFile.type.startsWith('video/') ? (
                      <FileVideo className="h-5 w-5" />
                    ) : (
                      <FileImage className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                      {selectedFile.name}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {selectedFile.type} · {formatBytes(selectedFile.size)}
                    </div>
                  </div>
                </div>

                {/* Analysis Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => executeAnalysis(false)}
                    disabled={analyzing || isHashing}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-[#38BDF8] hover:bg-sky-400 rounded-lg transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap shadow-sm"
                  >
                    {analyzing ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Inspecting Artifacts...</span>
                      </>
                    ) : (
                      <>
                        <ScanEye className="h-4 w-4" />
                        <span>Analyze Media</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => executeAnalysis(true)}
                    disabled={analyzing || isHashing}
                    title="Run benchmark simulation for UI demonstration"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 border border-white/10 hover:border-white/30 rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Demo Run</span>
                  </button>
                </div>
              </div>

              {/* Status Separation Notice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[#0B1020] border border-white/5 flex items-center gap-2 text-slate-300">
                  <FileCheck className="h-4 w-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Upload Status</span>
                    <span className="text-white font-medium">Media Staged & SHA-256 Calculated</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0B1020] border border-white/5 flex items-center gap-2 text-slate-300">
                  <ScanEye className="h-4 w-4 text-sky-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Analysis Status</span>
                    <span className={analyzing ? 'text-sky-300 font-medium' : analysisResult ? 'text-white font-medium' : 'text-slate-400'}>
                      {analyzing ? 'Processing Live Forensics...' : analysisResult ? 'Analysis Complete' : 'Awaiting Analysis Trigger'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cryptographic Seal Strip */}
              <div className="p-3 rounded-lg bg-[#0B1020] border border-cyan-500/20 space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                    <Fingerprint className="h-3.5 w-3.5" />
                    CRYPTOGRAPHIC SHA-256 HASH
                  </span>
                  <span>{isHashing ? `Computing ${hashingProgress}%` : 'Client-Side Computed'}</span>
                </div>
                <div className="flex items-center justify-between gap-2 p-2 rounded bg-slate-950 border border-white/10 text-cyan-300 select-all text-[11px] break-all">
                  <span>{isHashing ? 'Computing hash buffer...' : fileSha256}</span>
                  <button
                    onClick={handleCopyHash}
                    className="p-1 text-slate-400 hover:text-white shrink-0 cursor-pointer"
                    title="Copy SHA-256 digest"
                  >
                    {copiedHash ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Media Preview Box */}
              {filePreview && (
                <div className="rounded-lg overflow-hidden border border-white/10 bg-black/60 max-h-72 flex items-center justify-center">
                  {selectedFile.type.startsWith('video/') ? (
                    <video src={filePreview} controls className="max-h-72 w-full object-contain" />
                  ) : (
                    <img
                      src={filePreview}
                      alt="Seized Evidence Preview"
                      className="max-h-72 w-full object-contain"
                    />
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-[#111827] p-12 text-center text-slate-400 space-y-2">
              <ScanEye className="h-10 w-10 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">No media staged for analysis</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select an evidence file on the left to initiate client-side cryptographic hashing and multi-vector AI forensics.
              </p>
            </div>
          )}

          {/* Analysis Results View */}
          {analysisResult && (
            <div className="rounded-xl border border-white/10 bg-[#111827] p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <div className="text-xs font-mono text-cyan-400">ANALYSIS OUTCOME DOSSIER</div>
                  <h3 className="text-lg font-bold text-white mt-0.5">Forensic Findings Breakdown</h3>
                </div>

                {/* Primary Classification Badge */}
                <div>
                  {analysisResult.classification === 'potentially_manipulated' && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold font-mono">
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                      <span>
                        POTENTIALLY AI-GENERATED OR MANIPULATED
                        {analysisResult.confidenceScore !== null ? ` (${analysisResult.confidenceScore}%)` : ''}
                      </span>
                    </div>
                  )}

                  {analysisResult.classification === 'no_manipulation_detected' && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 border border-cyan-500/40 text-cyan-200 text-xs font-bold font-mono">
                      <ShieldCheck className="h-4 w-4 text-cyan-400" />
                      <span>
                        NO MANIPULATION DETECTED BY CONFIGURED MODEL
                        {analysisResult.confidenceScore !== null ? ` (${analysisResult.confidenceScore}%)` : ''}
                      </span>
                    </div>
                  )}

                  {analysisResult.classification === 'inconclusive' && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono">
                      <HelpCircle className="h-4 w-4 text-amber-400" />
                      <span>
                        INCONCLUSIVE FORENSIC ARTIFACTS
                        {analysisResult.confidenceScore !== null ? ` (${analysisResult.confidenceScore}%)` : ''}
                      </span>
                    </div>
                  )}

                  {analysisResult.classification === 'analysis_unavailable' && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-300 text-xs font-bold font-mono">
                      <Info className="h-4 w-4 text-sky-400" />
                      <span>ANALYSIS UNAVAILABLE</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Special Notice for "No manipulation detected" */}
              {analysisResult.classification === 'no_manipulation_detected' && (
                <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/20 text-xs text-slate-300 space-y-1">
                  <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5" />
                    <span>Important Evidentiary Notice</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    "No manipulation detected" indicates that the configured AI model found no generative, face-swap, or inpainting cues in the inspected media. This does not constitute definitive proof that the media is authentic or unaltered.
                  </p>
                </div>
              )}

              {/* Special Card for "Analysis Unavailable" */}
              {analysisResult.classification === 'analysis_unavailable' && (
                <div className="p-4 rounded-lg bg-[#0B1020] border border-slate-700 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-200 font-semibold">
                    <AlertCircle className="h-4 w-4 text-sky-400" />
                    <span>AI Analysis Currently Unavailable</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    AI analysis is currently unavailable. Please configure a compatible deepfake detection model or API to obtain genuine analysis results.
                  </p>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Status: Upstream model offline or API capacity limit reached · No synthetic scores or fabricated classifications are returned.
                  </div>
                </div>
              )}

              {/* Engine Meta & Mode Transparency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-[#0B1020] border border-white/5">
                  <span className="text-slate-400 block text-[10px]">ANALYSIS ENGINE</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-white font-medium truncate">{analysisResult.modelName}</span>
                    {analysisResult.isDemoMode && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        DEMO
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#0B1020] border border-white/5">
                  <span className="text-slate-400 block text-[10px]">MODEL VERSION</span>
                  <span className="text-cyan-300 font-medium">{analysisResult.modelVersion}</span>
                </div>

                <div className="p-3 rounded-lg bg-[#0B1020] border border-white/5">
                  <span className="text-slate-400 block text-[10px]">ANALYSIS TIMESTAMP</span>
                  <span className="text-slate-300">
                    {new Date(analysisResult.analysisTimestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Video Frame-Based Notice */}
              {analysisResult.isFrameBased && (
                <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs text-sky-200">
                  <span className="font-semibold block mb-0.5">Frame-Based Video Inspection:</span>
                  <p className="text-[11px] text-sky-300/90 leading-relaxed">
                    This evaluation inspected sampled keyframes. Frame-based analysis does not guarantee temporal frame consistency across the entire video timeline without continuous optical flow modeling.
                  </p>
                </div>
              )}

              {/* Detected Technique Profile */}
              {analysisResult.manipulationType && analysisResult.classification !== 'analysis_unavailable' && (
                <div className="p-3 rounded-lg bg-[#0B1020] border border-white/10 text-xs">
                  <span className="text-cyan-400 font-mono font-semibold block mb-0.5">
                    MANIPULATION PROFILE:
                  </span>
                  <span className="text-slate-200">{analysisResult.manipulationType}</span>
                </div>
              )}

              {/* Forensic Indicators List */}
              {analysisResult.forensicIndicators.length > 0 && (
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold text-white font-mono uppercase tracking-wider">
                    Inspected Forensic Vectors ({analysisResult.forensicIndicators.length})
                  </div>
                  <div className="space-y-2">
                    {analysisResult.forensicIndicators.map((ind, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg border border-white/5 bg-[#0B1020] space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                ind.anomalyDetected ? 'bg-rose-400' : 'bg-cyan-400'
                              }`}
                            />
                            <span className="font-semibold text-white">{ind.title}</span>
                            <span className="text-[10px] text-slate-500 font-mono uppercase">
                              · {ind.category}
                            </span>
                          </div>
                          <span className="font-mono text-[11px] text-cyan-400">
                            {ind.confidence}% confidence
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed">{ind.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings and Limitations */}
              {analysisResult.limitations.length > 0 && (
                <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1.5">
                  <div className="font-semibold flex items-center gap-1.5 text-amber-300">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>Evidentiary Disclaimer & Model Limitations:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-200/90 leading-relaxed">
                    {analysisResult.limitations.map((lim, idx) => (
                      <li key={idx}>{lim}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons: Save to Vault & Reports */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {!savedEvidence ? (
                    <button
                      onClick={handleCreateEvidenceRecord}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-900 bg-[#38BDF8] hover:bg-sky-400 rounded-lg transition-colors shadow-sm cursor-pointer"
                    >
                      <Database className="h-3.5 w-3.5" />
                      <span>Preserve in Evidence Vault</span>
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
                      <Check className="h-4 w-4" />
                      <span>Preserved as {savedEvidence.id}</span>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (savedEvidence) {
                        onNavigate('reports', savedEvidence.id);
                      } else {
                        onNavigate('reports');
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 border border-white/15 hover:border-white/30 rounded-lg transition-colors cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Generate Forensic Report</span>
                  </button>
                </div>

                {savedEvidence && (
                  <button
                    onClick={() => onNavigate('verification', savedEvidence.id)}
                    className="text-xs text-cyan-400 hover:underline font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <span>Anchor to Blockchain</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
