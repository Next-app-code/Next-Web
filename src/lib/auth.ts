import { sign } from 'tweetnacl';
import bs58 from 'bs58';
import { PublicKey } from '@solana/web3.js';

/**
 * Verify Solana wallet signature
 * @param message - The original message that was signed
 * @param signature - The signature in base58 format
 * @param publicKey - The wallet public key
 * @returns boolean indicating if signature is valid
 */
export function verifySignature(
  message: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);
    const publicKeyBytes = new PublicKey(publicKey).toBytes();

    return sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Generate a nonce for wallet authentication
 * @returns A random nonce string
 */
export function generateNonce(): string {
  return `Sign this message to authenticate with Next.\nNonce: ${Date.now()}-${Math.random().toString(36).substring(2)}`;
}

/**
 * Create a JWT payload for authenticated user
 * @param walletAddress - The Solana wallet address
 * @returns JWT payload object
 */
export function createJWTPayload(walletAddress: string) {
  return {
    walletAddress,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  };
}

