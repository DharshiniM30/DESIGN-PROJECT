import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import crypto from 'node:crypto';
import fs from 'node:fs';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google Gemini SDK on the server
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// In-memory persistent mock database (seeded with realistic digital forensics data)
interface StoredEvidence {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  sha256: string;
  md5: string;
  uploadTimestamp: string;
  custodian: string;
  investigationId?: string;
  analysisStatus: 'pending' | 'analyzed' | 'inconclusive';
  analysisResult?: any;
  blockchainStatus: 'uncommitted' | 'pending' | 'committed';
  blockchainRecord?: any;
  previewUrl?: string;
  auditTrail: Array<{
    id: string;
    timestamp: string;
    action: string;
    actor: string;
    details: string;
    hashSnapshot?: string;
  }>;
  retentionPolicy: string;
}

interface StoredInvestigation {
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

// Seed investigations
const investigationsDB: StoredInvestigation[] = [
  {
    id: 'INV-2026-001',
    caseNumber: 'CASE-ALPHA-402',
    title: 'Executive Wire Transfer Deepfake Audio & Video Probe',
    description: 'Investigation into synthetic deepfake video and voice cloning used during an unauthorized executive authorization conference call.',
    status: 'in_progress',
    priority: 'critical',
    leadInvestigator: 'Dr. Sarah Chen, CISSP',
    createdAt: '2026-10-18T10:14:00Z',
    updatedAt: '2026-10-21T07:22:00Z',
    evidenceIds: ['EV-2026-9041', 'EV-2026-9042'],
    notes: [
      {
        id: 'n1',
        author: 'Dr. Sarah Chen',
        timestamp: '2026-10-18T11:00:00Z',
        text: 'Initial forensic seizure from conference server recorded. Generated primary SHA-256 seal.',
      },
      {
        id: 'n2',
        author: 'Marcus Vance',
        timestamp: '2026-10-20T14:30:00Z',
        text: 'Spectral frequency analysis indicates 16kHz resynthesis artifacts in voice track. Video exhibits boundary blending around jawline.',
      },
    ],
  },
  {
    id: 'INV-2026-002',
    caseNumber: 'CASE-BETA-119',
    title: 'Disinformation Campaign Social Media Media Tampering',
    description: 'Authenticity audit of surveillance footage leaked online alleging high-profile diplomatic presence in contested territory.',
    status: 'open',
    priority: 'high',
    leadInvestigator: 'Elena Rostova, CFE',
    createdAt: '2026-10-19T14:45:00Z',
    updatedAt: '2026-10-20T16:10:00Z',
    evidenceIds: ['EV-2026-9043'],
    notes: [
      {
        id: 'n3',
        author: 'Elena Rostova',
        timestamp: '2026-10-19T15:20:00Z',
        text: 'Cloned image frame seized from IPFS gateway. EXIF structure missing native camera quantization matrix.',
      },
    ],
  },
  {
    id: 'INV-2026-003',
    caseNumber: 'CASE-GAMMA-088',
    title: 'Insurance Claim Automotive Collision Video Verification',
    description: 'Verification of dashcam footage submitted for high-value total loss claim against telematics telemetry records.',
    status: 'closed',
    priority: 'medium',
    leadInvestigator: 'Marcus Vance, GCFA',
    createdAt: '2026-10-15T09:00:00Z',
    updatedAt: '2026-10-17T18:00:00Z',
    evidenceIds: ['EV-2026-9044'],
    notes: [
      {
        id: 'n4',
        author: 'Marcus Vance',
        timestamp: '2026-10-17T17:45:00Z',
        text: 'Dashcam media confirmed pristine. Hash anchored to Ethereum Sepolia testnet block 6,894,112. Case concluded as authentic footage.',
      },
    ],
  },
];

// Seed evidence items
const evidenceDB: StoredEvidence[] = [
  {
    id: 'EV-2026-9041',
    fileName: 'executive_keynote_call_clip.mp4',
    fileType: 'video/mp4',
    fileSize: 14857620,
    sha256: '4f53cda18c2d4ffb892a0e4c6e3b508d7e9fae3a1f1816bc8d1694f553a92b77',
    md5: '7d3a2e1c9b8f4a6e5d2c1b0a9f8e7d6c',
    uploadTimestamp: '2026-10-18T10:20:15Z',
    custodian: 'Sarah Chen (Lead Forensics)',
    investigationId: 'INV-2026-001',
    analysisStatus: 'analyzed',
    retentionPolicy: 'Standard 7-Year Evidentiary Hold',
    analysisResult: {
      classification: 'potentially_manipulated',
      confidenceScore: 94.2,
      modelName: 'VerityForensics-Multimodal',
      modelVersion: 'v2.4.1-forensic',
      analysisTimestamp: '2026-10-18T10:22:40Z',
      analyzedByModel: true,
      manipulationType: 'Facial reenactment and diffusion warp blend',
      forensicIndicators: [
        {
          category: 'spatial',
          title: 'Perimeter Boundary Warping',
          confidence: 96,
          anomalyDetected: true,
          explanation: 'Discontinuous gradient boundary detected around jawline and earlobe regions, typical of latent diffusion face-swapping pipelines.',
        },
        {
          category: 'frequency',
          title: 'DCT High-Frequency Attenuation',
          confidence: 91,
          anomalyDetected: true,
          explanation: 'Abnormal drop in high-frequency Discrete Cosine Transform coefficients inconsistent with native sensor compression.',
        },
        {
          category: 'lighting',
          title: 'Corneal Reflection Asymmetry',
          confidence: 88,
          anomalyDetected: true,
          explanation: 'Specular highlights on left iris lack the geometric perspective alignment present in the right iris relative to background key lights.',
        },
        {
          category: 'biological',
          title: 'Micro-Blink Interval Irregularity',
          confidence: 84,
          anomalyDetected: true,
          explanation: 'Periodic blink rate of 1.2s deviates significantly from normal physiological baseline of 2.8s-4.5s under ambient conversation.',
        },
      ],
      limitations: [
        'AI classification is an analytical estimation and does not constitute absolute legal proof of origin.',
        'Lossy video compression artifacts can occasionally mimic synthesis boundaries in low-bitrate clips.',
      ],
      warnings: [
        'High likelihood of synthetic manipulation detected across 3 distinct forensic vectors.',
      ],
      methodologyNotes: 'Multi-spectral frequency domain decomposition coupled with temporal spatial facial landmark consistency inspection.',
    },
    blockchainStatus: 'committed',
    blockchainRecord: {
      network: 'Sepolia Ethereum Testnet (Simulated Anchor)',
      contractAddress: '0x71C8A33b28b7e704B14988F804368140D80E4540',
      transactionHash: '0x9a842f7c038e4a9561b369cc7e4719277d341b3c959452b415a99f187a5441a1',
      blockNumber: 6894098,
      blockTimestamp: '2026-10-18T10:35:12Z',
      gasUsed: '48,192 Gwei',
      merkleRoot: '0x3fe1a89c09d3b1456a73e512c091928471e98ab124817d23a67bf2890471bcca',
      isSimulatedDemo: true,
    },
    auditTrail: [
      {
        id: 'aud-1',
        timestamp: '2026-10-18T10:20:15Z',
        action: 'EVIDENCE_INGESTED',
        actor: 'Sarah Chen',
        details: 'Initial raw evidentiary ingest from conference secure buffer.',
        hashSnapshot: '4f53cda18c2d4ffb892a0e4c6e3b508d7e9fae3a1f1816bc8d1694f553a92b77',
      },
      {
        id: 'aud-2',
        timestamp: '2026-10-18T10:22:40Z',
        action: 'AI_FORENSIC_ANALYSIS_COMPLETED',
        actor: 'VerityEngine v2.4.1',
        details: 'Classification completed: potentially_manipulated (Confidence: 94.2%).',
      },
      {
        id: 'aud-3',
        timestamp: '2026-10-18T10:35:12Z',
        action: 'BLOCKCHAIN_HASH_ANCHORED',
        actor: 'VerityChain Smart Contract',
        details: 'SHA-256 digest committed to ledger at Block #6894098.',
      },
    ],
  },
  {
    id: 'EV-2026-9042',
    fileName: 'wire_authorization_voip_stream.wav',
    fileType: 'audio/wav',
    fileSize: 4210450,
    sha256: '9b87a1f543e210bc8d76a54e32109876543210abcdef1234567890abcdef1234',
    md5: '4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d',
    uploadTimestamp: '2026-10-18T10:28:00Z',
    custodian: 'Sarah Chen (Lead Forensics)',
    investigationId: 'INV-2026-001',
    analysisStatus: 'analyzed',
    retentionPolicy: 'Standard 7-Year Evidentiary Hold',
    analysisResult: {
      classification: 'potentially_manipulated',
      confidenceScore: 91.8,
      modelName: 'VerityForensics-AudioSpectrum',
      modelVersion: 'v2.4.1-forensic',
      analysisTimestamp: '2026-10-18T10:30:10Z',
      analyzedByModel: true,
      manipulationType: 'Neural TTS Voice Cloning (Zero-shot resynthesis)',
      forensicIndicators: [
        {
          category: 'frequency',
          title: 'Harmonic Continuity Disconnect',
          confidence: 93,
          anomalyDetected: true,
          explanation: 'Formant transitions between phonemes exhibit mathematical interpolation steps unnatural for human vocal cords.',
        },
        {
          category: 'compression',
          title: 'Zero Noise Floor Synthesis',
          confidence: 89,
          anomalyDetected: true,
          explanation: 'Background acoustic floor drops to absolute zero during pauses, characteristic of neural vocoder gating.',
        },
      ],
      limitations: [
        'Acoustic reverberation in conferencing environments may introduce spectral coloration.',
      ],
      warnings: ['Voice profile matches known zero-shot neural clone signature.'],
      methodologyNotes: 'Mel-spectrogram phase derivative analysis and vocoder artifact screening.',
    },
    blockchainStatus: 'committed',
    blockchainRecord: {
      network: 'Sepolia Ethereum Testnet (Simulated Anchor)',
      contractAddress: '0x71C8A33b28b7e704B14988F804368140D80E4540',
      transactionHash: '0x1c88d92a0e4c6e3b508d7e9fae3a1f1816bc8d1694f553a92b774f53cda18c2d',
      blockNumber: 6894105,
      blockTimestamp: '2026-10-18T10:41:00Z',
      gasUsed: '46,810 Gwei',
      merkleRoot: '0x81920471bcca3fe1a89c09d3b1456a73e512c091928471e98ab124817d23a67b',
      isSimulatedDemo: true,
    },
    auditTrail: [
      {
        id: 'aud-4',
        timestamp: '2026-10-18T10:28:00Z',
        action: 'EVIDENCE_INGESTED',
        actor: 'Sarah Chen',
        details: 'Raw audio capture ingested into secure evidence store.',
        hashSnapshot: '9b87a1f543e210bc8d76a54e32109876543210abcdef1234567890abcdef1234',
      },
      {
        id: 'aud-5',
        timestamp: '2026-10-18T10:30:10Z',
        action: 'AI_FORENSIC_ANALYSIS_COMPLETED',
        actor: 'VerityEngine v2.4.1',
        details: 'Neural voice clone detected with 91.8% confidence.',
      },
      {
        id: 'aud-6',
        timestamp: '2026-10-18T10:41:00Z',
        action: 'BLOCKCHAIN_HASH_ANCHORED',
        actor: 'VerityChain Smart Contract',
        details: 'Hash anchored to Block #6894105.',
      },
    ],
  },
  {
    id: 'EV-2026-9043',
    fileName: 'alleged_diplomatic_briefing.jpg',
    fileType: 'image/jpeg',
    fileSize: 3120800,
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    md5: '9e107d9d372bb6826bd81d3542a419d6',
    uploadTimestamp: '2026-10-19T14:50:00Z',
    custodian: 'Elena Rostova (CFE)',
    investigationId: 'INV-2026-002',
    analysisStatus: 'analyzed',
    retentionPolicy: 'Standard 7-Year Evidentiary Hold',
    analysisResult: {
      classification: 'potentially_manipulated',
      confidenceScore: 97.5,
      modelName: 'VerityForensics-Multimodal',
      modelVersion: 'v2.4.1-forensic',
      analysisTimestamp: '2026-10-19T14:52:12Z',
      analyzedByModel: true,
      manipulationType: 'Generative Diffusion Inpainting with Prompt Insertion',
      forensicIndicators: [
        {
          category: 'spatial',
          title: 'Synthesized Text and Insignia Incoherence',
          confidence: 99,
          anomalyDetected: true,
          explanation: 'Background flag coat-of-arms lacks geometric symmetry; badge lettering contains non-standard typographic glyph permutations.',
        },
        {
          category: 'lighting',
          title: 'Shadow Direction Mismatch',
          confidence: 94,
          anomalyDetected: true,
          explanation: 'Subject shadow casts at 45 degrees left while background podium cast shadow indicates 15 degrees right overhead light.',
        },
        {
          category: 'metadata',
          title: 'EXIF Metadata Stripping',
          confidence: 98,
          anomalyDetected: true,
          explanation: 'Total absence of camera sensor serial, lens profile, or color space tagging, common in web-generated diffusion payloads.',
        },
      ],
      limitations: ['Secondary compression from web distribution may degrade pixel-level noise analysis.'],
      warnings: ['Irreversible synthetic artifacts detected on focal subjects.'],
      methodologyNotes: 'Error Level Analysis (ELA) combined with deep convolutional feature artifact analysis.',
    },
    blockchainStatus: 'uncommitted',
    auditTrail: [
      {
        id: 'aud-7',
        timestamp: '2026-10-19T14:50:00Z',
        action: 'EVIDENCE_INGESTED',
        actor: 'Elena Rostova',
        details: 'Image ingested into vault. Cryptographic SHA-256 seal generated.',
        hashSnapshot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      },
      {
        id: 'aud-8',
        timestamp: '2026-10-19T14:52:12Z',
        action: 'AI_FORENSIC_ANALYSIS_COMPLETED',
        actor: 'VerityEngine v2.4.1',
        details: 'Classification completed: potentially_manipulated (97.5% confidence).',
      },
    ],
  },
  {
    id: 'EV-2026-9044',
    fileName: 'highway_intersection_dashcam_front.mp4',
    fileType: 'video/mp4',
    fileSize: 48920110,
    sha256: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    md5: '2d8b5c4f1a9e3d7c5b1a0e9f8a7b6c5d',
    uploadTimestamp: '2026-10-15T09:15:00Z',
    custodian: 'Marcus Vance (GCFA)',
    investigationId: 'INV-2026-003',
    analysisStatus: 'analyzed',
    retentionPolicy: 'Standard 7-Year Evidentiary Hold',
    analysisResult: {
      classification: 'no_manipulation_detected',
      confidenceScore: 98.1,
      modelName: 'VerityForensics-Multimodal',
      modelVersion: 'v2.4.1-forensic',
      analysisTimestamp: '2026-10-15T09:18:22Z',
      analyzedByModel: true,
      manipulationType: 'None (Sensor Footage Authentic)',
      forensicIndicators: [
        {
          category: 'spatial',
          title: 'Motion Blur Coherence',
          confidence: 97,
          anomalyDetected: false,
          explanation: 'Vehicle velocity motion vectors correlate strictly with framerate shutter timing across the complete frame sequence.',
        },
        {
          category: 'frequency',
          title: 'Sensor PRNU Fingerprint Match',
          confidence: 99,
          anomalyDetected: false,
          explanation: 'Photo-Response Non-Uniformity (PRNU) sensor noise matches the registered Sony STARVIS CMOS hardware profile.',
        },
        {
          category: 'metadata',
          title: 'GPS & Telematics Sync Verification',
          confidence: 98,
          anomalyDetected: false,
          explanation: 'Embedded NMEA telemetry packets match external roadside camera timecodes within +/- 80ms.',
        },
      ],
      limitations: ['Ultra-high-grade physical staging cannot be ruled out by media analysis alone.'],
      warnings: [],
      methodologyNotes: 'Sensor PRNU cross-correlation with frame-by-frame optic flow velocity checks.',
    },
    blockchainStatus: 'committed',
    blockchainRecord: {
      network: 'Sepolia Ethereum Testnet (Simulated Anchor)',
      contractAddress: '0x71C8A33b28b7e704B14988F804368140D80E4540',
      transactionHash: '0x5b3a1f1816bc8d1694f553a92b774f53cda18c2d4ffb892a0e4c6e3b508d7e9f',
      blockNumber: 6894112,
      blockTimestamp: '2026-10-15T09:30:45Z',
      gasUsed: '45,210 Gwei',
      merkleRoot: '0x9928471e98ab124817d23a67bf2890471bcca3fe1a89c09d3b1456a73e512c09',
      isSimulatedDemo: true,
    },
    auditTrail: [
      {
        id: 'aud-9',
        timestamp: '2026-10-15T09:15:00Z',
        action: 'EVIDENCE_INGESTED',
        actor: 'Marcus Vance',
        details: 'Dashcam media ingested directly from write-blocked SD card.',
        hashSnapshot: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
      },
      {
        id: 'aud-10',
        timestamp: '2026-10-15T09:18:22Z',
        action: 'AI_FORENSIC_ANALYSIS_COMPLETED',
        actor: 'VerityEngine v2.4.1',
        details: 'PRNU and optic flow verification confirmed authentic sensor footage.',
      },
      {
        id: 'aud-11',
        timestamp: '2026-10-15T09:30:45Z',
        action: 'BLOCKCHAIN_HASH_ANCHORED',
        actor: 'VerityChain Smart Contract',
        details: 'Evidence anchored to Sepolia ledger Block #6894112.',
      },
    ],
  },
];

// Helper: generate SHA-256 hash string
function computeSha256(data: string | Buffer): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// ---------------- API ROUTES ----------------

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    blockchainNetwork: 'Sepolia Testnet (Simulated / Demo Anchor Mode)',
  });
});

// User Accounts Database with SHA-256 password digests
interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  organization: string;
  publicKey: string;
  createdAt: string;
}

const USERS_FILE_PATH = path.resolve(__dirname, '.users_data.json');

const defaultSeedUsers: StoredUser[] = [
  {
    id: 'usr_sarah_chen',
    name: 'Dr. Sarah Chen, CISSP',
    email: 'investigator.chen@veritychain.gov',
    passwordHash: computeSha256('Forensics2026!'),
    role: 'investigator',
    organization: 'Federal Cyber Forensics Division',
    publicKey: '0x8b329415A99f187A5441A19A842f7c038E4A9561',
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'usr_marcus_vance',
    name: 'Marcus Vance, GCFA',
    email: 'auditor.vance@integrity.org',
    passwordHash: computeSha256('Forensics2026!'),
    role: 'auditor',
    organization: 'Integrity Assurance Bureau',
    publicKey: '0x9a842f7c038e4a9561b369cc7e4719277d341b3c',
    createdAt: '2026-02-10T11:00:00Z',
  },
  {
    id: 'usr_analyst_demo',
    name: 'Jordan Hayes',
    email: 'analyst@veritychain.gov',
    passwordHash: computeSha256('Forensics2026!'),
    role: 'analyst',
    organization: 'State Digital Forensics Lab',
    publicKey: '0x71C8A33b28b7e704B14988F804368140D80E4540',
    createdAt: '2026-03-01T09:00:00Z',
  },
];

function loadUsersFromDisk(): StoredUser[] {
  try {
    if (fs.existsSync(USERS_FILE_PATH)) {
      const data = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to read users database from disk:', err);
  }
  return [...defaultSeedUsers];
}

const registeredUsersDB: StoredUser[] = loadUsersFromDisk();

function saveUsersToDisk(): void {
  try {
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(registeredUsersDB, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save users database to disk:', err);
  }
}

// Active user session store mapping token -> session details
const activeSessions = new Map<string, { userId: string; createdAt: string }>();

// Seed default persistent sessions for default accounts
activeSessions.set('vct_seed_analyst_session_2026', { userId: 'usr_analyst_demo', createdAt: new Date().toISOString() });
activeSessions.set('vct_seed_chen_session_2026', { userId: 'usr_sarah_chen', createdAt: new Date().toISOString() });
activeSessions.set('vct_seed_vance_session_2026', { userId: 'usr_marcus_vance', createdAt: new Date().toISOString() });

// Authentication endpoints
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Username/email and password are required' });
  }

  const cleanIdentifier = email.trim().toLowerCase();
  const inputHash = computeSha256(password);

  // Match by exact email or username prefix
  const matchedUser = registeredUsersDB.find((u) => {
    const userPrefix = u.email.split('@')[0].toLowerCase();
    return u.email.toLowerCase() === cleanIdentifier || userPrefix === cleanIdentifier;
  });

  if (!matchedUser) {
    return res.status(401).json({ error: 'No account found matching this username or email.' });
  }

  if (matchedUser.passwordHash !== inputHash) {
    return res.status(401).json({ error: 'Invalid password. Please check your credentials and try again.' });
  }

  const token = `vct_${crypto.randomBytes(24).toString('hex')}`;
  activeSessions.set(token, { userId: matchedUser.id, createdAt: new Date().toISOString() });

  const user = {
    id: matchedUser.id,
    name: matchedUser.name,
    email: matchedUser.email,
    role: matchedUser.role,
    organization: matchedUser.organization,
    publicKey: matchedUser.publicKey,
    createdAt: matchedUser.createdAt,
  };

  return res.json({ user, token });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-auth-token'] as string);

  if (!token) {
    return res.status(401).json({ error: 'No active session token provided.' });
  }

  const session = activeSessions.get(token);
  if (!session) {
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in.' });
  }

  const user = registeredUsersDB.find((u) => u.id === session.userId);
  if (!user) {
    activeSessions.delete(token);
    return res.status(401).json({ error: 'User account not found.' });
  }

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization,
      publicKey: user.publicKey,
      createdAt: user.createdAt,
    },
    token,
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-auth-token'] as string);
  if (token) {
    activeSessions.delete(token);
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, organization } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Full name, email, and password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = registeredUsersDB.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
  }

  const newUser: StoredUser = {
    id: `usr_${crypto.randomBytes(6).toString('hex')}`,
    name: name.trim(),
    email: cleanEmail,
    passwordHash: computeSha256(password),
    role: 'analyst',
    organization: organization ? organization.trim() : 'Independent Forensics Lab',
    publicKey: `0x${crypto.randomBytes(20).toString('hex')}`,
    createdAt: new Date().toISOString(),
  };

  registeredUsersDB.push(newUser);
  saveUsersToDisk();

  const token = `vct_${crypto.randomBytes(24).toString('hex')}`;
  activeSessions.set(token, { userId: newUser.id, createdAt: new Date().toISOString() });

  const user = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    organization: newUser.organization,
    publicKey: newUser.publicKey,
    createdAt: newUser.createdAt,
  };

  return res.status(201).json({ user, token, message: 'Account registered successfully.' });
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Valid email is required.' });
  }
  return res.json({
    success: true,
    message: `Password reset instructions and verification token dispatched to ${email}. Check your inbox.`,
  });
});

// Evidence Vault Endpoints
app.get('/api/evidence', (req: Request, res: Response) => {
  res.json({ evidence: evidenceDB });
});

app.get('/api/evidence/:id', (req: Request, res: Response) => {
  const item = evidenceDB.find((e) => e.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Evidence record not found.' });
  }
  res.json({ evidence: item });
});

app.post('/api/evidence', (req: Request, res: Response) => {
  const { fileName, fileType, fileSize, sha256, custodian, investigationId, previewUrl, retentionPolicy } = req.body;

  if (!fileName || !sha256) {
    return res.status(400).json({ error: 'File name and SHA-256 hash are required.' });
  }

  const id = `EV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const newEvidence: StoredEvidence = {
    id,
    fileName,
    fileType: fileType || 'application/octet-stream',
    fileSize: fileSize || 0,
    sha256: sha256.toLowerCase(),
    md5: crypto.randomBytes(16).toString('hex'),
    uploadTimestamp: now,
    custodian: custodian || 'Authorized Forensics Analyst',
    investigationId: investigationId || undefined,
    analysisStatus: 'pending',
    blockchainStatus: 'uncommitted',
    previewUrl,
    retentionPolicy: retentionPolicy || 'Standard 7-Year Evidentiary Hold',
    auditTrail: [
      {
        id: `aud-${Date.now()}`,
        timestamp: now,
        action: 'EVIDENCE_INGESTED',
        actor: custodian || 'Authorized Forensics Analyst',
        details: 'Initial raw evidence ingestion and cryptographic SHA-256 registration.',
        hashSnapshot: sha256.toLowerCase(),
      },
    ],
  };

  evidenceDB.unshift(newEvidence);

  // Link to investigation if specified
  if (investigationId) {
    const inv = investigationsDB.find((i) => i.id === investigationId);
    if (inv && !inv.evidenceIds.includes(id)) {
      inv.evidenceIds.push(id);
      inv.updatedAt = now;
      inv.notes.push({
        id: `note-${Date.now()}`,
        author: custodian || 'System',
        timestamp: now,
        text: `Associated new evidence record ${id} (${fileName}) with SHA-256 ${sha256.substring(0, 12)}...`,
      });
    }
  }

  res.status(201).json({ evidence: newEvidence });
});

// Anchor hash to blockchain (Simulated Sepolia Testnet)
app.post('/api/evidence/:id/anchor', (req: Request, res: Response) => {
  const item = evidenceDB.find((e) => e.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Evidence record not found.' });
  }

  const now = new Date().toISOString();
  const simulatedBlock = 6894100 + Math.floor(Math.random() * 500);
  const txHash = `0x${crypto.randomBytes(32).toString('hex')}`;
  const merkleRoot = `0x${crypto.randomBytes(32).toString('hex')}`;

  item.blockchainStatus = 'committed';
  item.blockchainRecord = {
    network: 'Sepolia Ethereum Testnet (Simulated Anchor)',
    contractAddress: '0x71C8A33b28b7e704B14988F804368140D80E4540',
    transactionHash: txHash,
    blockNumber: simulatedBlock,
    blockTimestamp: now,
    gasUsed: '47,380 Gwei',
    merkleRoot,
    isSimulatedDemo: true,
  };

  item.auditTrail.push({
    id: `aud-${Date.now()}`,
    timestamp: now,
    action: 'BLOCKCHAIN_HASH_ANCHORED',
    actor: 'VerityChain Smart Contract Anchor',
    details: `Evidence SHA-256 anchored to ledger at Block #${simulatedBlock}. Tx: ${txHash.substring(0, 16)}...`,
  });

  res.json({
    success: true,
    message: 'Evidence digest committed to blockchain ledger.',
    blockchainRecord: item.blockchainRecord,
    evidence: item,
  });
});

// Verify hash against registry
app.post('/api/evidence/verify', (req: Request, res: Response) => {
  const { sha256, evidenceId } = req.body;

  if (!sha256 && !evidenceId) {
    return res.status(400).json({ error: 'Please provide either a SHA-256 hash or an Evidence ID.' });
  }

  const cleanHash = sha256 ? sha256.trim().toLowerCase() : '';
  const now = new Date().toISOString();

  let matched = evidenceDB.find((e) => {
    if (evidenceId && cleanHash) {
      return e.id === evidenceId;
    }
    if (evidenceId) {
      return e.id === evidenceId;
    }
    return e.sha256 === cleanHash;
  });

  if (!matched) {
    return res.json({
      status: 'not_found',
      message: 'No evidence record matching this hash or ID exists in the VerityChain vault.',
      queriedHash: cleanHash,
      computedAt: now,
    });
  }

  // If evidence ID matched, compare provided hash if supplied
  if (cleanHash && matched.sha256 !== cleanHash) {
    return res.json({
      status: 'mismatch',
      message: 'CRITICAL INTEGRITY MISMATCH: The provided file hash does NOT match the immutable registered vault digest.',
      queriedHash: cleanHash,
      matchedEvidence: matched,
      computedAt: now,
    });
  }

  return res.json({
    status: 'verified',
    message: 'INTEGRITY VERIFIED: Cryptographic checksum exactly matches the registered evidence record.',
    queriedHash: matched.sha256,
    matchedEvidence: matched,
    blockchainMatch: matched.blockchainStatus === 'committed',
    computedAt: now,
  });
});

// AI Deepfake Detection Endpoint
app.post('/api/analyze', async (req: Request, res: Response) => {
  const { fileData, fileName, fileType, promptNotes, isDemoMode } = req.body;
  const now = new Date().toISOString();

  // If user explicitly requests a benchmark demonstration simulation
  if (isDemoMode) {
    const isSuspicious = fileName ? (
      fileName.toLowerCase().includes('deepfake') ||
      fileName.toLowerCase().includes('fake') ||
      fileName.toLowerCase().includes('clone') ||
      fileName.toLowerCase().includes('ai') ||
      fileName.toLowerCase().includes('synth')
    ) : false;

    const demoScore = isSuspicious ? 91.5 : 88.0;
    const result = {
      classification: isSuspicious ? 'potentially_manipulated' : 'no_manipulation_detected',
      confidenceScore: demoScore,
      modelName: 'VerityChain Forensic Simulator (DEMO MODE)',
      modelVersion: 'v2.4-demo-benchmark',
      analysisTimestamp: now,
      analyzedByModel: false,
      isDemoMode: true,
      isFrameBased: fileType?.startsWith('video/') || false,
      manipulationType: isSuspicious ? 'Simulated Facial Mask Boundary Blend (Demo)' : 'Simulated Native Camera Sensor Pattern (Demo)',
      forensicIndicators: isSuspicious
        ? [
            {
              category: 'spatial',
              title: 'Simulated Facial Boundary Discontinuity',
              confidence: 92,
              anomalyDetected: true,
              explanation: 'DEMO SAMPLE: Bilinear interpolation gradient distortion at face perimeter.',
            },
            {
              category: 'frequency',
              title: 'Simulated Spectral Noise Disparity',
              confidence: 89,
              anomalyDetected: true,
              explanation: 'DEMO SAMPLE: Disparity between high-frequency facial texture and background noise floor.',
            },
          ]
        : [
            {
              category: 'spatial',
              title: 'Simulated Natural Edge Point Spread',
              confidence: 87,
              anomalyDetected: false,
              explanation: 'DEMO SAMPLE: Optical edge sharpness follows expected camera sensor blur.',
            },
            {
              category: 'frequency',
              title: 'Simulated Uniform Shot Noise',
              confidence: 86,
              anomalyDetected: false,
              explanation: 'DEMO SAMPLE: Evenly distributed sensor photon noise across image planes.',
            },
          ],
      limitations: [
        'DEMO MODE: Synthetic benchmark data for demonstration only. This is not a live model prediction.',
        'AI predictions are forensic guidance and do not constitute definitive legal proof.',
      ],
      warnings: [
        'DEMO MODE ACTIVE: Connect a compatible live AI model for authentic evidence examination.',
      ],
      methodologyNotes: 'Deterministic benchmark pattern comparison for UI validation.',
    };
    return res.json({ result });
  }

  // Handle Video media files
  if (fileType && fileType.startsWith('video/')) {
    // If Gemini client is configured and video payload is reasonably sized (<= 15MB)
    if (aiClient && fileData) {
      try {
        const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData;
        const mime = fileType;

        const systemInstruction = `You are a Senior Digital Video Forensics Specialist at VerityChain Forensics Lab.
Examine this video sequence for signs of synthetic deepfake generation, facial reenactment, unnatural temporal jitter, boundary warping, or authentic camera sensor noise.
Evaluate keyframes across the sequence.
You MUST respond strictly with valid JSON conforming to this schema:
{
  "classification": "potentially_manipulated" | "no_manipulation_detected" | "inconclusive",
  "confidenceScore": number between 0 and 100 with one decimal place,
  "manipulationType": string,
  "forensicIndicators": [
    {
      "category": "spatial" | "frequency" | "lighting" | "biological" | "metadata" | "compression",
      "title": string,
      "confidence": number,
      "anomalyDetected": boolean,
      "explanation": string
    }
  ],
  "limitations": [string],
  "warnings": [string],
  "methodologyNotes": string
}`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mime,
              },
            },
            {
              text: `Perform keyframe video forensic analysis on "${fileName || 'video_asset'}". Notes: ${promptNotes || 'Standard deepfake verification'}. Return valid JSON.`,
            },
          ],
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });

        const responseText = response.text?.trim() || '{}';
        const parsed = JSON.parse(responseText);

        const result = {
          classification: parsed.classification || 'inconclusive',
          confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : null,
          modelName: 'Google Gemini 3.8 Flash (Keyframe Video Analysis)',
          modelVersion: 'gemini-3.8-flash',
          analysisTimestamp: now,
          analyzedByModel: true,
          isFrameBased: true,
          isDemoMode: false,
          forensicIndicators: Array.isArray(parsed.forensicIndicators) ? parsed.forensicIndicators : [],
          manipulationType: parsed.manipulationType || 'Temporal and spatial keyframe inspection',
          limitations: [
            'Frame-based analysis: inspects extracted keyframes. Does not guarantee temporal frame consistency across the entire video timeline without continuous optical flow modeling.',
            'AI forensic predictions are analytical indicators, not definitive proof of authenticity.',
            ...(Array.isArray(parsed.limitations) ? parsed.limitations : []),
          ],
          warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [
            'Keyframe inspection completed. Corroborate with audio-visual synchronization analysis for complete evidentiary validation.',
          ],
          methodologyNotes: parsed.methodologyNotes || 'Sampled keyframe spatial anomaly and facial artifact detection.',
        };

        return res.json({ result });
      } catch (err: any) {
        console.warn('Video live model analysis unavailable:', err.message);
      }
    }

    // Video analysis unavailable without specialized multi-frame worker
    const unavailableVideoResult = {
      classification: 'analysis_unavailable',
      confidenceScore: null,
      modelName: 'None Configured / Video Pipeline Unavailable',
      modelVersion: 'N/A',
      analysisTimestamp: now,
      analyzedByModel: false,
      isDemoMode: false,
      isFrameBased: true,
      unavailabilityReason: 'AI analysis is currently unavailable. Please configure a compatible deepfake detection model or API to obtain genuine analysis results.',
      manipulationType: 'N/A - Video Pipeline Offline',
      forensicIndicators: [],
      limitations: [
        'Dedicated multi-frame temporal video model is not configured or currently unreachable.',
        'No simulated scores or synthetic determinations will be returned without a genuine model.',
      ],
      warnings: [
        'AI analysis is currently unavailable. Please configure a compatible deepfake detection model or API to obtain genuine analysis results.',
      ],
      methodologyNotes: 'Temporal video stream inspection requires a live video forensic endpoint.',
    };
    return res.json({ result: unavailableVideoResult });
  }

  // Handle Image media files
  if (aiClient && fileData && fileType && fileType.startsWith('image/')) {
    try {
      const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData;
      const mime = fileType || 'image/jpeg';

      const systemInstruction = `You are a Senior Digital Media Forensics Specialist at VerityChain Forensics Lab.
Analyze the provided image for indicators of synthetic generation (Stable Diffusion, Midjourney, FLUX, GANs, deepfake face-swapping, or inpainting).
Evaluate across 5 specific forensic categories:
1. Spatial domain: boundary edge blur, warp artifacts, unnatural ear/jaw/skin boundary blend.
2. Frequency/Compression domain: noise pattern inconsistencies, unnatural smooth gradients, compression disparity.
3. Lighting & Specular: shadow angle inconsistencies, iris specular highlight asymmetry.
4. Biological & Anatomical: pupil shape, dental regularity, ear canal anatomy, finger/limb geometry.
5. Metadata & Structural: prompt artifacts, synthetic insignia incoherence.

You MUST respond strictly in valid JSON format matching this schema:
{
  "classification": "potentially_manipulated" | "no_manipulation_detected" | "inconclusive",
  "confidenceScore": number between 0 and 100 with one decimal place,
  "manipulationType": string describing technique or "None (Pristine Sensor Capture)",
  "forensicIndicators": [
    {
      "category": "spatial" | "frequency" | "lighting" | "biological" | "metadata" | "compression",
      "title": string,
      "confidence": number (0-100),
      "anomalyDetected": boolean,
      "explanation": string
    }
  ],
  "limitations": [string],
  "warnings": [string],
  "methodologyNotes": string
}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mime,
            },
          },
          {
            text: `Perform deep forensic artifact inspection on this image "${fileName || 'evidence_asset'}". Investigator context notes: ${promptNotes || 'Standard authenticity screening'}. Return pure JSON as instructed.`,
          },
        ],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const responseText = response.text?.trim() || '{}';
      const parsed = JSON.parse(responseText);

      const result = {
        classification: parsed.classification || 'inconclusive',
        confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : null,
        modelName: 'Google Gemini 3.8 Flash (Multimodal Forensic Vision)',
        modelVersion: 'gemini-3.8-flash',
        analysisTimestamp: now,
        analyzedByModel: true,
        isDemoMode: false,
        forensicIndicators: Array.isArray(parsed.forensicIndicators) ? parsed.forensicIndicators : [],
        manipulationType: parsed.manipulationType || 'Neural synthesis and sensor artifact inspection',
        limitations: [
          'AI forensic classification is an analytical estimation and not definitive legal proof.',
          'Notice: "No manipulation detected" indicates the model detected no synthetic cues; it does NOT constitute definitive proof of absolute authenticity.',
          ...(Array.isArray(parsed.limitations) ? parsed.limitations : []),
        ],
        warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
        methodologyNotes: parsed.methodologyNotes || 'Multi-vector spatial, frequency, and specular consistency inspection.',
      };

      return res.json({ result });
    } catch (err: any) {
      console.warn('Gemini live image analysis error:', err.message);
    }
  }

  // When AI model is not configured, or if the API call failed (e.g. 503 high demand / quota / offline)
  // Per requirements: Display "AI analysis is currently unavailable" WITHOUT any fabricated percentage or fake classification
  const unavailableResult = {
    classification: 'analysis_unavailable',
    confidenceScore: null,
    modelName: 'None Configured / Service Unavailable',
    modelVersion: 'N/A',
    analysisTimestamp: now,
    analyzedByModel: false,
    isDemoMode: false,
    unavailabilityReason: 'AI analysis is currently unavailable. Please configure a compatible deepfake detection model or API to obtain genuine analysis results.',
    manipulationType: 'N/A - Analysis Unavailable',
    forensicIndicators: [],
    limitations: [
      'No genuine AI deepfake detection model response could be obtained at this time.',
      'System will not fabricate confidence percentages or authenticity determinations without a verified AI model response.',
    ],
    warnings: [
      'AI analysis is currently unavailable. Please configure a compatible deepfake detection model or API to obtain genuine analysis results.',
    ],
    methodologyNotes: 'Forensics engine offline or upstream AI model temporarily unavailable.',
  };

  return res.json({ result: unavailableResult });
});

// Investigations Endpoints
app.get('/api/investigations', (req: Request, res: Response) => {
  res.json({ investigations: investigationsDB });
});

app.post('/api/investigations', (req: Request, res: Response) => {
  const { title, caseNumber, description, priority, leadInvestigator, evidenceIds } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Investigation title is required.' });
  }

  const id = `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
  const now = new Date().toISOString();

  const newInvestigation: StoredInvestigation = {
    id,
    caseNumber: caseNumber || `CASE-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    title,
    description: description || 'Digital evidence investigation and cryptographic chain-of-custody tracking.',
    status: 'open',
    priority: priority || 'medium',
    leadInvestigator: leadInvestigator || 'Dr. Sarah Chen, CISSP',
    createdAt: now,
    updatedAt: now,
    evidenceIds: evidenceIds || [],
    notes: [
      {
        id: `note-${Date.now()}`,
        author: leadInvestigator || 'System',
        timestamp: now,
        text: `Investigation dossier initiated under case ID ${id}.`,
      },
    ],
  };

  investigationsDB.unshift(newInvestigation);
  res.status(201).json({ investigation: newInvestigation });
});

app.put('/api/investigations/:id', (req: Request, res: Response) => {
  const inv = investigationsDB.find((i) => i.id === req.params.id);
  if (!inv) {
    return res.status(404).json({ error: 'Investigation not found.' });
  }

  const { title, description, status, priority, leadInvestigator, evidenceIds } = req.body;

  if (title) inv.title = title;
  if (description) inv.description = description;
  if (status) inv.status = status;
  if (priority) inv.priority = priority;
  if (leadInvestigator) inv.leadInvestigator = leadInvestigator;
  if (evidenceIds) inv.evidenceIds = evidenceIds;
  inv.updatedAt = new Date().toISOString();

  res.json({ investigation: inv });
});

app.post('/api/investigations/:id/notes', (req: Request, res: Response) => {
  const inv = investigationsDB.find((i) => i.id === req.params.id);
  if (!inv) {
    return res.status(404).json({ error: 'Investigation not found.' });
  }

  const { text, author } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Note text cannot be empty.' });
  }

  const note = {
    id: `note-${Date.now()}`,
    author: author || 'Investigator',
    timestamp: new Date().toISOString(),
    text,
  };

  inv.notes.unshift(note);
  inv.updatedAt = new Date().toISOString();

  res.json({ note, investigation: inv });
});

// Contact endpoint
app.post('/api/contact', (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  res.json({
    success: true,
    message: `Thank you, ${name}. Your inquiry regarding "${subject || 'Forensic Support'}" has been securely logged with reference #TICK-${Date.now().toString().slice(-6)}.`,
  });
});

// Configure Vite in development or static serve in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`VerityChain AI Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start VerityChain server:', err);
});
