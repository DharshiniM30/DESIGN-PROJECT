export type UserRole = 'analyst' | 'investigator' | 'auditor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  avatarUrl?: string;
  publicKey: string;
  createdAt: string;
}

export type ForensicClassification = 
  | 'potentially_manipulated'
  | 'no_manipulation_detected'
  | 'inconclusive'
  | 'analysis_unavailable';

export interface ForensicIndicator {
  category: 'spatial' | 'frequency' | 'lighting' | 'metadata' | 'compression' | 'biological';
  title: string;
  confidence: number;
  explanation: string;
  anomalyDetected: boolean;
}

export interface ForensicAnalysisResult {
  classification: ForensicClassification;
  confidenceScore: number | null;
  modelName: string;
  modelVersion: string;
  analysisTimestamp: string;
  forensicIndicators: ForensicIndicator[];
  manipulationType?: string;
  limitations: string[];
  warnings: string[];
  methodologyNotes: string;
  analyzedByModel: boolean;
  unavailabilityReason?: string;
  isDemoMode?: boolean;
  isFrameBased?: boolean;
}

export interface BlockchainRecord {
  network: string;
  contractAddress: string;
  transactionHash: string;
  blockNumber: number;
  blockTimestamp: string;
  gasUsed: string;
  merkleRoot: string;
  isSimulatedDemo: boolean;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  hashSnapshot?: string;
}

export interface EvidenceItem {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  sha256: string;
  md5?: string;
  uploadTimestamp: string;
  custodian: string;
  investigationId?: string;
  analysisStatus: 'pending' | 'analyzed' | 'inconclusive';
  analysisResult?: ForensicAnalysisResult;
  blockchainStatus: 'uncommitted' | 'pending' | 'committed';
  blockchainRecord?: BlockchainRecord;
  previewUrl?: string;
  auditTrail: AuditEvent[];
  retentionPolicy: string;
}

export interface Investigation {
  id: string;
  title: string;
  caseNumber: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  leadInvestigator: string;
  createdAt: string;
  updatedAt: string;
  evidenceIds: string[];
  notes: Array<{
    id: string;
    author: string;
    timestamp: string;
    text: string;
  }>;
}

export interface VerificationResult {
  status: 'verified' | 'mismatch' | 'not_found';
  message: string;
  queriedHash: string;
  matchedEvidence?: EvidenceItem;
  blockchainMatch?: boolean;
  computedAt: string;
}
