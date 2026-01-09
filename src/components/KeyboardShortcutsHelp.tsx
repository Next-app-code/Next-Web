'use client';

import { useState } from 'react';

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { key: 'Delete', description: 'Delete selected node' },
    { key: 'Ctrl/Cmd + C', description: 'Copy selected node' },
    { key: 'Ctrl/Cmd + V', description: 'Paste copied node' },
    { key: 'Ctrl/Cmd + D', description: 'Duplicate selected node' },
    { key: 'Ctrl/Cmd + A', description: 'Select all nodes' },
    { key: 'Escape', description: 'Deselect all' },
    { key: 'Ctrl/Cmd + Z', description: 'Undo (coming soon)' },
    { key: 'Ctrl/Cmd + Y', description: 'Redo (coming soon)' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 w-10 h-10 bg-node-surface border border-node-border rounded-full flex items-center justify-center hover:bg-node-bg transition-colors z-50"
        title="Keyboard Shortcuts"
      >
        <span className="text-gray-400 text-sm font-bold">?</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setIsOpen(false)}>
          <div className="bg-node-surface border border-node-border rounded-lg p-6 w-96 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white tracking-tight">Keyboard Shortcuts</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-2">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-node-border last:border-0">
                  <span className="text-sm text-gray-400 tracking-tight">{shortcut.description}</span>
                  <kbd className="px-2 py-1 bg-node-bg border border-node-border rounded text-xs text-gray-300 font-mono tracking-tight">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-node-border">
              <p className="text-xs text-gray-500 tracking-tight">
                Press <kbd className="px-1 py-0.5 bg-node-bg border border-node-border rounded text-xs">?</kbd> anytime to view shortcuts
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}






