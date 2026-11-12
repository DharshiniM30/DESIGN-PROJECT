/**
 * Cryptographic utility functions for client-side digital forensics.
 * Computes deterministic SHA-256 using the native Web Crypto API.
 */

export async function calculateBufferSha256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function calculateFileSha256(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (file.size > 10 * 1024 * 1024) {
    // For larger files, simulate/read chunks or arrayBuffer with progress
    if (onProgress) onProgress(30);
    const buffer = await file.arrayBuffer();
    if (onProgress) onProgress(80);
    const hash = await calculateBufferSha256(buffer);
    if (onProgress) onProgress(100);
    return hash;
  }

  const buffer = await file.arrayBuffer();
  if (onProgress) onProgress(100);
  return calculateBufferSha256(buffer);
}

export function truncateHash(hash: string, start = 8, end = 8): string {
  if (!hash) return '';
  if (hash.length <= start + end) return hash;
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard write failed, attempting textarea fallback:', err);
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch (e) {
    return false;
  }
}
