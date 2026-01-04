import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function formatSol(lamports: number): string {
  const sol = lamports / LAMPORTS_PER_SOL;
  return sol.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 9,
  });
}

export function formatPublicKey(publicKey: string, length: number = 8): string {
  if (publicKey.length <= length * 2) {
    return publicKey;
  }
  return `${publicKey.slice(0, length)}...${publicKey.slice(-length)}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatNumber(value: number): string {
  if (value >= 1e9) {
    return (value / 1e9).toFixed(2) + 'B';
  }
  if (value >= 1e6) {
    return (value / 1e6).toFixed(2) + 'M';
  }
  if (value >= 1e3) {
    return (value / 1e3).toFixed(2) + 'K';
  }
  return value.toLocaleString();
}

export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}m ${seconds}s`;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

