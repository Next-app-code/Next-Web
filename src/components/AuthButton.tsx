'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

export function AuthButton() {
  const { connected, publicKey } = useWallet();
  const { isAuthenticated, isAuthenticating, login, logout, error, user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  // Auto-login when wallet connects
  useEffect(() => {
    if (connected && !isAuthenticated && !isAuthenticating) {
      login();
    }
  }, [connected, isAuthenticated, isAuthenticating, login]);

  if (!connected) {
    return (
      <WalletMultiButton className="!bg-node-bg !border !border-node-border !rounded-md !h-9 !text-sm !font-medium !tracking-tight hover:!border-gray-500" />
    );
  }

  if (isAuthenticating) {
    return (
      <div className="px-4 py-2 bg-node-bg border border-node-border rounded-md">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-node-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-400 tracking-tight">Authenticating...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={login}
          className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-md text-sm text-red-400 hover:bg-red-500/30 transition-colors tracking-tight"
        >
          Retry Auth
        </button>
        <WalletMultiButton className="!bg-node-bg !border !border-node-border !rounded-md !h-9 !text-sm !font-medium !tracking-tight hover:!border-gray-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <button
        onClick={login}
        className="px-4 py-2 bg-node-accent text-node-bg rounded-md text-sm font-medium hover:bg-[#00e6b8] transition-colors tracking-tight"
      >
        Sign In
      </button>
    );
  }

  // Authenticated state
  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-2 bg-node-bg border border-node-border rounded-md hover:border-gray-500 transition-colors"
      >
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        <span className="text-sm text-gray-300 tracking-tight">
          {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
        </span>
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showMenu && (
        <div className="absolute top-full right-0 mt-1 w-56 bg-node-surface border border-node-border rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-3 border-b border-node-border">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Wallet</p>
            <p className="text-sm text-gray-300 font-mono tracking-tight break-all">
              {publicKey?.toBase58()}
            </p>
          </div>
          
          {user && (
            <div className="p-3 border-b border-node-border">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">User ID</p>
              <p className="text-sm text-gray-300 tracking-tight truncate">
                {user.id}
              </p>
            </div>
          )}

          <div className="p-2">
            <button
              onClick={() => {
                logout();
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-node-border rounded-md transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


