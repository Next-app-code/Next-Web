'use client';

import { useState, useEffect } from 'react';
import { Connection } from '@solana/web3.js';
import { useWorkspaceStore } from '@/stores/workspaceStore';

interface ConnectionState {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  slot?: number;
  latency?: number;
  error?: string;
}

export function ConnectionStatus() {
  const { rpcEndpoint } = useWorkspaceStore();
  const [state, setState] = useState<ConnectionState>({ status: 'disconnected' });

  useEffect(() => {
    if (!rpcEndpoint) {
      setState({ status: 'disconnected' });
      return;
    }

    let cancelled = false;

    async function checkConnection() {
      setState({ status: 'connecting' });
      
      const startTime = Date.now();
      
      try {
        const connection = new Connection(rpcEndpoint, 'confirmed');
        const slot = await connection.getSlot();
        const latency = Date.now() - startTime;
        
        if (!cancelled) {
          setState({ status: 'connected', slot, latency });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: 'error',
            error: error instanceof Error ? error.message : 'Connection failed',
          });
        }
      }
    }

    checkConnection();

    // Refresh every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [rpcEndpoint]);

  const statusColors = {
    disconnected: 'bg-gray-500',
    connecting: 'bg-yellow-500 animate-pulse',
    connected: 'bg-green-500',
    error: 'bg-red-500',
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={`w-2 h-2 rounded-full ${statusColors[state.status]}`} />
      <span className="text-gray-400">
        {state.status === 'connected' && state.latency && (
          <>Slot: {state.slot?.toLocaleString()} ({state.latency}ms)</>
        )}
        {state.status === 'connecting' && 'Connecting...'}
        {state.status === 'disconnected' && 'Not connected'}
        {state.status === 'error' && (
          <span className="text-red-400" title={state.error}>
            Connection error
          </span>
        )}
      </span>
    </div>
  );
}




