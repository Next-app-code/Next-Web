'use client';

import { useState } from 'react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  if (!isOpen) return null;

  const steps = [
    {
      title: '1. Connect Your Wallet',
      description: 'Click the wallet button in the header and connect your Solana wallet (Phantom, etc.)',
      icon: '🔗',
    },
    {
      title: '2. Set RPC Endpoint',
      description: 'Enter your Solana RPC endpoint in the center input field (mainnet, devnet, or custom)',
      icon: '🌐',
    },
    {
      title: '3. Add Nodes',
      description: 'Drag nodes from the left sidebar onto the canvas. Choose from RPC, Wallet, Transaction, and more',
      icon: '📦',
    },
    {
      title: '4. Connect Nodes',
      description: 'Click and drag from output handles (right side) to input handles (left side) to create connections',
      icon: '🔌',
    },
    {
      title: '5. Configure Nodes',
      description: 'Click on a node to open the properties panel and configure its parameters',
      icon: '⚙️',
    },
    {
      title: '6. Run Workflow',
      description: 'Click the "Run" button in the header to execute your workflow',
      icon: '▶️',
    },
    {
      title: '7. Save & Share',
      description: 'Save your workspace or export as JSON to share with others',
      icon: '💾',
    },
  ];

  const shortcuts = [
    { key: 'Delete', action: 'Delete node' },
    { key: 'Ctrl+C/V', action: 'Copy/Paste' },
    { key: 'Ctrl+D', action: 'Duplicate' },
    { key: 'Esc', action: 'Deselect' },
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-node-surface border border-node-border rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-node-border">
          <h2 className="text-2xl font-bold text-white tracking-tight">How It Works</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Steps */}
          <div className="space-y-4 mb-8">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4 p-4 bg-node-bg rounded-lg border border-node-border hover:border-gray-500 transition-colors">
                <div className="text-3xl flex-shrink-0">{step.icon}</div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1 tracking-tight">{step.title}</h3>
                  <p className="text-gray-400 text-sm tracking-tight">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Keyboard Shortcuts */}
          <div className="border-t border-node-border pt-6">
            <h3 className="text-white font-semibold mb-4 tracking-tight">⌨️ Keyboard Shortcuts</h3>
            <div className="grid grid-cols-2 gap-3">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-node-bg rounded-lg border border-node-border">
                  <span className="text-sm text-gray-400 tracking-tight">{shortcut.action}</span>
                  <kbd className="px-2 py-1 bg-node-surface border border-node-border rounded text-xs text-gray-300 font-mono tracking-tight">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="border-t border-node-border pt-6 mt-6">
            <h3 className="text-white font-semibold mb-3 tracking-tight">💡 Tips</h3>
            <ul className="space-y-2 text-sm text-gray-400 tracking-tight">
              <li className="flex items-start gap-2">
                <span className="text-node-accent">•</span>
                <span>Sign in with your wallet to save workspaces to the cloud</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-node-accent">•</span>
                <span>Use the ? button (bottom right) to view all keyboard shortcuts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-node-accent">•</span>
                <span>Export your workspace as JSON to share with others</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-node-accent">•</span>
                <span>Double-click the canvas to quickly add nodes</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-node-border flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white text-black rounded-md text-sm font-medium hover:bg-gray-200 transition-colors tracking-tight"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

