'use client';

import { useState } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { v4 as uuidv4 } from 'uuid';
import { CustomNode } from '@/types/nodes';
import { nodeDefinitions } from '@/data/nodeDefinitions';

export function AIBuilder() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { setNodes, setEdges, nodes, edges } = useWorkspaceStore();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/generate-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate workflow');
      }
      
      const data = await response.json();
      const { workflow } = data;
      
      // Convert AI response to actual nodes
      const newNodes: CustomNode[] = workflow.nodes.map((aiNode: any) => {
        const definition = nodeDefinitions.find(d => d.type === aiNode.type);
        
        if (!definition) {
          console.warn(`Unknown node type: ${aiNode.type}`);
          return null;
        }
        
        return {
          id: uuidv4(),
          type: 'custom',
          position: aiNode.position || { x: Math.random() * 500, y: Math.random() * 500 },
          data: {
            label: definition.label,
            category: definition.category,
            type: definition.type,
            inputs: definition.inputs,
            outputs: definition.outputs,
            values: aiNode.values || {},
            color: definition.color,
          },
        };
      }).filter(Boolean);
      
      // Create edges with proper node IDs
      const newEdges = workflow.edges.map((aiEdge: any) => {
        const sourceNode = newNodes[aiEdge.sourceIndex];
        const targetNode = newNodes[aiEdge.targetIndex];
        
        if (!sourceNode || !targetNode) return null;
        
        return {
          id: uuidv4(),
          source: sourceNode.id,
          target: targetNode.id,
          sourceHandle: aiEdge.sourceHandle,
          targetHandle: aiEdge.targetHandle,
          type: 'default',
          animated: false,
          style: { stroke: '#e5e5e5', strokeWidth: 2.5 },
        };
      }).filter(Boolean);
      
      // Add to existing nodes or replace
      if (nodes.length === 0) {
        setNodes(newNodes);
        setEdges(newEdges);
      } else {
        // Add with offset
        const offsetNodes = newNodes.map(node => ({
          ...node,
          position: {
            x: node.position.x + 100,
            y: node.position.y + 100,
          },
        }));
        setNodes([...nodes, ...offsetNodes]);
        setEdges([...edges, ...newEdges]);
      }
      
      setIsOpen(false);
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate workflow');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* AI Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-200 transition-all shadow-lg z-50"
        title="AI Node Builder"
      >
        <span className="text-xl">✨</span>
      </button>

      {/* AI Panel */}
      {isOpen && (
        <div className="fixed bottom-36 right-4 w-96 bg-node-surface border border-node-border rounded-lg shadow-2xl z-50">
          <div className="p-4 border-b border-node-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <h3 className="text-white font-semibold tracking-tight">AI Node Builder</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4">
            <p className="text-sm text-gray-400 mb-3 tracking-tight">
              Describe what you want to build, and AI will create the workflow for you.
            </p>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Check my SOL balance and display it&#10;&#10;Example: Monitor Bags token bonding curve progress&#10;&#10;Example: Transfer 0.1 SOL to another wallet"
              className="w-full h-32 px-3 py-2 bg-node-bg border border-node-border rounded-md text-sm text-gray-300 placeholder-gray-600 focus:border-white transition-colors resize-none"
              disabled={isGenerating}
            />
            
            {error && (
              <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded-md">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}
            
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className={`
                mt-3 w-full px-4 py-2 rounded-md text-sm font-medium tracking-tight transition-all
                ${isGenerating 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-gray-200'
                }
                disabled:opacity-50
              `}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Generating...
                </span>
              ) : (
                '✨ Generate Workflow'
              )}
            </button>
            
            <div className="mt-3 pt-3 border-t border-node-border">
              <p className="text-xs text-gray-500 tracking-tight">
                💡 Powered by OpenAI GPT-4o
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

