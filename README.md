# VerityChain AI – Blockchain and AI Deepfake Evidence Tracker

**VerityChain AI** is an enterprise-grade digital forensics platform engineered to analyze potentially manipulated or AI-generated media (deepfakes, face swaps, diffusion synthesis), preserve digital evidence in encrypted vaults, verify evidence integrity using cryptographic SHA-256 hashes, and maintain an immutable, tamper-evident chain-of-custody log backed by blockchain technology.

---

## Key Capabilities

1. **AI Deepfake Detection Engine**
   - Multi-spectral forensic artifact inspection:
     - Spatial domain: facial boundary warping, latent mask edge interpolation anomalies.
     - Frequency domain: Discrete Cosine Transform (DCT) high-frequency attenuation and noise floor discontinuities.
     - Optical & lighting: corneal glint symmetry, specular reflection angle alignment.
     - Metadata & EXIF: quantization table verification, firmware signature matching.
   - Server-side integration with **Google Gemini 3.8 Flash** multimodal analysis via `@google/genai`.
   - Dual-engine fallback: Transparently labeled heuristic forensic screening when running in demo/offline mode.
   - Clear distinction between probabilistic AI assessments and deterministic technical facts.

2. **Immutable Blockchain Evidence Vault**
   - Deterministic client-side NIST FIPS 180-4 SHA-256 checksum calculation using the W3C Web Crypto API.
   - Secure private media storage: Sensitive evidentiary media remains encrypted in private vault storage; only mathematical digests and custody attestations are committed to the blockchain.
   - Chain-of-custody audit logs tracking seizure, intake, AI inspections, and verification timestamps.

3. **Blockchain & Cryptographic Integrity Verification**
   - Real-time comparison between re-seized media and registered baseline digests.
   - Immediate integrity verdicts: `Integrity Verified` (exact match), `Integrity Mismatch` (tampering detected), or `Record Not Found`.
   - EVM / Sepolia testnet smart contract anchoring (`VerityProofRegistryV2.sol`), tracking transaction hash, block height, and Merkle root.

4. **Forensic Case Management (Investigations)**
   - Case dossier management with priority tiers (`Critical`, `High`, `Medium`, `Low`).
   - Timeline of analysis, investigator notes, and associated evidentiary assets.

5. **Courtroom-Ready Forensic Evidentiary Reports**
   - Standardized documentation compliant with ISO/IEC 27037 digital evidence standards.
   - Print-friendly layout (`window.print()`) for direct PDF export.
   - Complete technical proof matrices, AI anomaly findings, limitations disclaimers, and examiner signing blocks.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Design & Theme**: Dark Cybersecurity Navy (`#0B1020`), Electric Blue, Cyan, Subtle Purple accents, Glassmorphism, Tabular Numerals (`JetBrains Mono` & `Plus Jakarta Sans`)
- **Backend**: Node.js, Express, TSX, Vite Dev Middlewares
- **Cryptographic Hashing**: Web Crypto API (`crypto.subtle.digest`) & Node.js `node:crypto`
- **AI Multimodal Forensics**: `@google/genai` (Gemini 3.8 Flash)
- **Icons**: Lucide React

---

## Environment Configuration

Copy the template environment variables:

```bash
cp .env.example .env
```

Key environment variables:
```env
# GEMINI_API_KEY: Injected by AI Studio or set locally for live AI forensic analysis
GEMINI_API_KEY="your-gemini-api-key"

# PORT: Server listener port (defaults to 3000)
PORT=3000
```

---

## Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

3. **Production build**:
   ```bash
   npm run build
   npm start
   ```

---

## Legal & Evidentiary Disclaimer

VerityChain AI provides digital forensic guidance, mathematical checksum calculations, and machine learning pattern recognition. In accordance with digital evidence handling standards, machine learning predictions provide probabilistic investigative indicators and do not constitute absolute legal proof of authenticity without independent sensor, telematics, and forensic corroboration.
