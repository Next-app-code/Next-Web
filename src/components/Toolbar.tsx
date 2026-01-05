'use client';

import { useState, useRef, useEffect } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { AuthButton } from './AuthButton';
import { useAuth } from '@/hooks/useAuth';
import { HowItWorksModal } from './HowItWorksModal';

export function Toolbar() {
  const { isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  
  const {
    workspaceName: currentWorkspaceName,
    rpcEndpoint,
    setRpcEndpoint,
    savedWorkspaces,
    saveWorkspace,
    loadWorkspace,
    deleteWorkspace,
    createWorkspace,
    loadAllWorkspaces,
    exportWorkspace,
    importWorkspace,
    toggleSidebar,
    togglePropertiesPanel,
    isExecuting,
    startExecution,
    stopExecution,
    clearResults,
  } = useWorkspaceStore();

  // Load workspaces when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAllWorkspaces();
    }
  }, [isAuthenticated, loadAllWorkspaces]);

  const handleExport = async () => {
    try {
      await exportWorkspace();
    } catch (error) {
      alert('Failed to export workspace. Please try again.');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const json = e.target?.result as string;
        try {
          const success = await importWorkspace(json);
          if (!success) {
            alert('Failed to import workspace. Invalid file format.');
          }
        } catch (error) {
          alert('Failed to import workspace. Please try again.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleNewWorkspace = async () => {
    if (workspaceName.trim()) {
      try {
        await createWorkspace(workspaceName.trim());
        setWorkspaceName('');
        setShowSaveDialog(false);
      } catch (error) {
        alert('Failed to create workspace. Please try again.');
      }
    }
  };

  const handleSaveWorkspace = async () => {
    setIsSaving(true);
    try {
      await saveWorkspace();
    } catch (error) {
      alert('Failed to save workspace. Please try again.');
    } finally {
      setIsSaving(false);
      setShowWorkspaceMenu(false);
    }
  };

  const handleLoadWorkspace = async (id: string) => {
    try {
      await loadWorkspace(id);
      setShowWorkspaceMenu(false);
    } catch (error) {
      alert('Failed to load workspace. Please try again.');
    }
  };

  const handleDeleteWorkspace = async (id: string) => {
    if (confirm('Are you sure you want to delete this workspace?')) {
      try {
        await deleteWorkspace(id);
      } catch (error) {
        alert('Failed to delete workspace. Please try again.');
      }
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
          <img src="/minilogo.png" alt="Next Logo" className="w-6 h-6" />
          <h1 className="text-lg font-bold text-white tracking-tighter">NEXT</h1>
        </div>

        <div className="h-6 w-px bg-node-border" />

        {/* How it works */}
        <button
          onClick={() => setShowHowItWorks(true)}
          className="px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors tracking-tight"
        >
          How it works
        </button>

        {/* $NEXT Token */}
        <a
          href="https://twitter.com/search?q=%24NEXT"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors tracking-tight font-mono"
        >
          $NEXT
        </a>

        {/* Twitter */}
        <a
          href="https://x.com/NextWorkspace"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-md hover:bg-node-border transition-colors"
          title="Twitter"
        >
          <svg className="w-5 h-5 text-gray-400 hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>
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
              : 'bg-white hover:bg-gray-200 text-black'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isExecuting ? 'Stop' : 'Run'}
        </button>

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
                  onClick={handleSaveWorkspace}
                  disabled={isSaving || !isAuthenticated}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-node-border rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Current'}
                  {!isAuthenticated && ' (Sign in required)'}
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
                        onClick={() => handleLoadWorkspace(workspace.id)}
                        className="text-sm text-gray-300 truncate flex-1 text-left"
                      >
                        {workspace.name}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWorkspace(workspace.id);
                        }}
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

        <div className="h-6 w-px bg-node-border" />

        <AuthButton />
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
                className="px-4 py-2 bg-white text-black rounded-md text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How It Works Modal */}
      <HowItWorksModal isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
    </header>
  );
}

