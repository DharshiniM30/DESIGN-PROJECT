import { EvidenceItem, Investigation, VerificationResult, ForensicAnalysisResult, User } from '../types';

const API_BASE = '/api';

export const api = {
  // Authentication
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to authenticate');
    }
    return res.json();
  },

  async register(data: { name: string; email: string; password: string; organization?: string }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async getCurrentUser(token: string): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Session expired');
    }
    return res.json();
  },

  async logoutUser(token?: string | null): Promise<void> {
    if (!token) return;
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => {});
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Recovery request failed');
    }
    return res.json();
  },

  // Evidence Vault
  async getEvidence(): Promise<EvidenceItem[]> {
    const res = await fetch(`${API_BASE}/evidence`);
    if (!res.ok) throw new Error('Failed to fetch evidence records');
    const data = await res.json();
    return data.evidence;
  },

  async getEvidenceById(id: string): Promise<EvidenceItem> {
    const res = await fetch(`${API_BASE}/evidence/${id}`);
    if (!res.ok) throw new Error('Evidence record not found');
    const data = await res.json();
    return data.evidence;
  },

  async createEvidence(payload: {
    fileName: string;
    fileType: string;
    fileSize: number;
    sha256: string;
    custodian: string;
    investigationId?: string;
    previewUrl?: string;
    retentionPolicy?: string;
  }): Promise<EvidenceItem> {
    const res = await fetch(`${API_BASE}/evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create evidence record');
    }
    const data = await res.json();
    return data.evidence;
  },

  async anchorEvidence(id: string): Promise<{ success: boolean; evidence: EvidenceItem }> {
    const res = await fetch(`${API_BASE}/evidence/${id}/anchor`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Blockchain anchoring failed');
    }
    return res.json();
  },

  async verifyIntegrity(payload: { sha256?: string; evidenceId?: string }): Promise<VerificationResult> {
    const res = await fetch(`${API_BASE}/evidence/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Verification failed');
    }
    return res.json();
  },

  // AI Deepfake Analysis
  async analyzeMedia(payload: {
    fileName: string;
    fileType: string;
    fileData?: string;
    promptNotes?: string;
    isDemoMode?: boolean;
  }): Promise<ForensicAnalysisResult> {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Analysis service unreachable');
    }
    const data = await res.json();
    return data.result;
  },

  // Investigations
  async getInvestigations(): Promise<Investigation[]> {
    const res = await fetch(`${API_BASE}/investigations`);
    if (!res.ok) throw new Error('Failed to fetch investigations');
    const data = await res.json();
    return data.investigations;
  },

  async createInvestigation(payload: {
    title: string;
    caseNumber?: string;
    description: string;
    priority?: string;
    leadInvestigator?: string;
    evidenceIds?: string[];
  }): Promise<Investigation> {
    const res = await fetch(`${API_BASE}/investigations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create case');
    }
    const data = await res.json();
    return data.investigation;
  },

  async updateInvestigation(id: string, payload: Partial<Investigation>): Promise<Investigation> {
    const res = await fetch(`${API_BASE}/investigations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update investigation');
    }
    const data = await res.json();
    return data.investigation;
  },

  async addInvestigationNote(id: string, text: string, author: string): Promise<Investigation> {
    const res = await fetch(`${API_BASE}/investigations/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, author }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to add note');
    }
    const data = await res.json();
    return data.investigation;
  },

  // Contact
  async submitContact(payload: { name: string; email: string; subject: string; message: string }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Message dispatch failed');
    }
    return res.json();
  },
};
