'use client';

import { NodeEditor } from '@/components/NodeEditor';
import { Sidebar } from '@/components/Sidebar';
import { Toolbar } from '@/components/Toolbar';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useNodeExecution } from '@/hooks/useNodeExecution';
import { useEffect } from 'react';

export default function Home() {
  const { isPropertiesPanelOpen, isExecuting } = useWorkspaceStore();
  const { executeWorkflow } = useNodeExecution();
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Execute workflow when execution starts
  useEffect(() => {
    if (isExecuting) {
      executeWorkflow();
    }
  }, [isExecuting, executeWorkflow]);

  return (
    <main className="h-screen w-screen flex flex-col bg-canvas-bg overflow-hidden">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 relative">
          <NodeEditor />
        </div>
        {isPropertiesPanelOpen && <PropertiesPanel />}
      </div>
      <KeyboardShortcutsHelp />
    </main>
  );
}

