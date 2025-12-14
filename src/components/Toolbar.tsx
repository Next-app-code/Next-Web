'use client';

import { useState, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export function Toolbar() {
  const { publicKey } = useWallet();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  
  const {
    workspaceName: currentWorkspaceName,
    rpcEndpoint,
    setRpcEndpoint,
    savedWorkspaces,
    saveWorkspace,
    loadWorkspace,
    deleteWorkspace,
    createWorkspace,
    renameWorkspace,
    exportWorkspace,
    importWorkspace,
    toggleSidebar,
    togglePropertiesPanel,
    isExecuting,
    startExecution,
    stopExecution,
    clearResults,
  } = useWorkspaceStore();

  const handleExport = () => {
    const json = exportWorkspace();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentWorkspaceName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const json = e.target?.result as string;
        const success = importWorkspace(json);
        if (!success) {
          alert('Failed to import workspace. Invalid file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleNewWorkspace = () => {
    if (workspaceName.trim()) {
      createWorkspace(workspaceName.trim());
      setWorkspaceName('');
      setShowSaveDialog(false);
    }
  };

  const handleRun = () => {
    if (isExecuting) {
      stopExecution();
    } else {
      startExecution();
    }
  };

  return (
    <header className="h-14 bg-node-surface border-b border-node-border flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-node-border transition-colors"
          title="Toggle Sidebar"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-white tracking-tighter">NEXT</h1>
          <span className="text-xs text-gray-500 tracking-tight">Solana Visual Builder</span>
        </div>

        <div className="h-6 w-px bg-node-border" />

        {/* Workspace Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-node-bg border border-node-border hover:border-gray-500 transition-colors"
          >
            <span className="text-sm text-gray-300 tracking-tight max-w-[150px] truncate">
              {currentWorkspaceName}
            </span>
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showWorkspaceMenu && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-node-surface border border-node-border rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="p-2 border-b border-node-border">
                <button
                  onClick={() => { setShowSaveDialog(true); setShowWorkspaceMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-node-border rounded-md transition-colors"
                >
                  New Workspace
                </button>
                <button
                  onClick={() => { saveWorkspace(); setShowWorkspaceMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-node-border rounded-md transition-colors"
                >
                  Save Current
                </button>
              </div>
              
              {savedWorkspaces.length > 0 && (
                <div className="p-2 max-h-48 overflow-y-auto">
                  <p className="px-3 py-1 text-xs text-gray-500 uppercase tracking-wider">Saved Workspaces</p>
                  {savedWorkspaces.map((workspace) => (
                    <div
                      key={workspace.id}
                      className="flex items-center justify-between px-3 py-2 hover:bg-node-border rounded-md group"
                    >
                      <button
                        onClick={() => { loadWorkspace(workspace.id); setShowWorkspaceMenu(false); }}
                        className="text-sm text-gray-300 truncate flex-1 text-left"
                      >
                        {workspace.name}
                      </button>
                      <button
                        onClick={() => deleteWorkspace(workspace.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="p-2 border-t border-node-border">
                <button
                  onClick={() => { handleExport(); setShowWorkspaceMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-node-border rounded-md transition-colors"
                >
                  Export as JSON
                </button>
                <button
                  onClick={() => { fileInputRef.current?.click(); setShowWorkspaceMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-node-border rounded-md transition-colors"
                >
                  Import from JSON
                </button>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      {/* Center Section - RPC Endpoint */}
      <div className="flex items-center gap-3">
        <label className="text-xs text-gray-500 tracking-tight">RPC</label>
        <input
          type="text"
          placeholder="Enter Solana RPC endpoint..."
          value={rpcEndpoint}
          onChange={(e) => setRpcEndpoint(e.target.value)}
          className="w-80 px-3 py-1.5 bg-node-bg border border-node-border rounded-md text-sm text-gray-300 placeholder-gray-600 focus:border-node-accent transition-colors tracking-tight"
        />
        <div className={`w-2 h-2 rounded-full ${rpcEndpoint ? 'bg-green-500' : 'bg-gray-600'}`} />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        <button
          onClick={clearResults}
          className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-300 transition-colors tracking-tight"
        >
          Clear
        </button>
        
        <button
          onClick={handleRun}
          disabled={!rpcEndpoint}
          className={`
            px-4 py-1.5 rounded-md text-sm font-medium tracking-tight transition-all
            ${isExecuting 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-node-accent hover:bg-[#00e6b8] text-node-bg'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isExecuting ? 'Stop' : 'Run'}
        </button>

        <div className="h-6 w-px bg-node-border" />

        <button
          onClick={togglePropertiesPanel}
          className="p-2 rounded-md hover:bg-node-border transition-colors"
          title="Toggle Properties"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>

        <WalletMultiButton className="!bg-node-bg !border !border-node-border !rounded-md !h-9 !text-sm !font-medium !tracking-tight hover:!border-gray-500" />
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-node-surface border border-node-border rounded-lg p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-semibold text-white tracking-tight mb-4">New Workspace</h3>
            <input
              type="text"
              placeholder="Workspace name..."
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full px-3 py-2 bg-node-bg border border-node-border rounded-md text-sm text-gray-300 placeholder-gray-600 focus:border-node-accent transition-colors mb-4"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNewWorkspace}
                disabled={!workspaceName.trim()}
                className="px-4 py-2 bg-node-accent text-node-bg rounded-md text-sm font-medium hover:bg-[#00e6b8] transition-colors disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

