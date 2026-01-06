import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { authAPI } from '@/lib/api';
import bs58 from 'bs58';

interface User {
  id: string;
  walletAddress: string;
}

export function useAuth() {
  const { publicKey, signMessage, connected, disconnect } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if already authenticated on mount
  useEffect(() => {
    const isAuth = authAPI.isAuthenticated();
    const storedUser = localStorage.getItem('next_user');
    
    if (isAuth && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // Invalid stored user, clear it
        localStorage.removeItem('next_user');
        authAPI.logout();
      }
    }
  }, []);

  // Clear auth state when wallet disconnects
  useEffect(() => {
    if (!connected && user) {
      handleLogout();
    }
  }, [connected]);

  /**
   * Authenticate with Solana wallet signature
   */
  const login = useCallback(async () => {
    if (!publicKey || !signMessage) {
      setError('Wallet not connected or does not support message signing');
      return false;
    }

    setIsAuthenticating(true);
    setError(null);

    try {
      // Get nonce from backend
      const { nonce } = await authAPI.getNonce();

      // Sign the nonce with wallet
      const message = new TextEncoder().encode(nonce);
      const signatureBytes = await signMessage(message);
      const signature = bs58.encode(signatureBytes);

      // Verify signature with backend
      const response = await authAPI.verify({
        message: nonce,
        signature,
        publicKey: publicKey.toBase58(),
      });

      // Store user data
      setUser(response.user);
      localStorage.setItem('next_user', JSON.stringify(response.user));

      setIsAuthenticating(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      setIsAuthenticating(false);
      return false;
    }
  }, [publicKey, signMessage]);

  /**
   * Logout and clear auth state
   */
  const handleLogout = useCallback(() => {
    authAPI.logout();
    setUser(null);
    localStorage.removeItem('next_user');
    if (connected) {
      disconnect();
    }
  }, [connected, disconnect]);

  return {
    user,
    isAuthenticated: !!user && authAPI.isAuthenticated(),
    isAuthenticating,
    error,
    login,
    logout: handleLogout,
  };
}




