'use client';

import { NodeEditor } from '@/components/NodeEditor';
import { Sidebar } from '@/components/Sidebar';
import { Toolbar } from '@/components/Toolbar';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export default function Home() {
  const { isPropertiesPanelOpen } = useWorkspaceStore();

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
    </main>
  );
}

