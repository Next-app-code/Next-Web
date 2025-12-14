'use client';

import { useWorkspaceStore } from '@/stores/workspaceStore';
import { nodeDefinitions } from '@/data/nodeDefinitions';

export function PropertiesPanel() {
  const { nodes, selectedNodeId, updateNode, deleteNode, duplicateNode } = useWorkspaceStore();
  
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const nodeDefinition = selectedNode 
    ? nodeDefinitions.find((d) => d.type === selectedNode.data.type)
    : null;

  if (!selectedNode) {
    return (
      <div className="w-72 bg-node-surface border-l border-node-border flex flex-col">
        <div className="p-4 border-b border-node-border">
          <h2 className="text-sm font-semibold text-gray-300 tracking-tight">Properties</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-gray-500 text-center tracking-tight">
            Select a node to view its properties
          </p>
        </div>
      </div>
    );
  }

  const handleValueChange = (key: string, value: unknown) => {
    updateNode(selectedNode.id, {
      values: { ...selectedNode.data.values, [key]: value },
    });
  };

  return (
    <div className="w-72 bg-node-surface border-l border-node-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-node-border">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ background: selectedNode.data.color }}
          />
          <h2 className="text-sm font-semibold text-white tracking-tight">
            {selectedNode.data.label}
          </h2>
        </div>
        <p className="text-xs text-gray-500 tracking-tight">
          {nodeDefinition?.description}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Input Values */}
        {selectedNode.data.inputs.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
              Inputs
            </h3>
            <div className="space-y-3">
              {selectedNode.data.inputs.map((input) => (
                <div key={input.id}>
                  <label className="block text-xs text-gray-400 mb-1.5 tracking-tight">
                    {input.name}
                    {input.required && <span className="text-red-400 ml-0.5">*</span>}
                  </label>
                  {renderInputField(
                    input.dataType,
                    selectedNode.data.values[input.id],
                    (value) => handleValueChange(input.id, value)
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Output Preview */}
        {selectedNode.data.result !== undefined && (
          <div>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
              Output
            </h3>
            <div className="p-3 bg-node-bg rounded-md border border-node-border">
              <pre className="text-xs text-gray-300 font-mono overflow-auto max-h-40">
                {typeof selectedNode.data.result === 'object'
                  ? JSON.stringify(selectedNode.data.result, null, 2)
                  : String(selectedNode.data.result)}
              </pre>
            </div>
          </div>
        )}

        {/* Error Display */}
        {selectedNode.data.hasError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md">
            <p className="text-xs text-red-400 tracking-tight">
              {selectedNode.data.errorMessage || 'An error occurred'}
            </p>
          </div>
        )}

        {/* Node Info */}
        <div>
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            Node Info
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Type</span>
              <span className="text-gray-300 font-mono">{selectedNode.data.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Category</span>
              <span className="text-gray-300">{selectedNode.data.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">ID</span>
              <span className="text-gray-300 font-mono truncate max-w-[120px]" title={selectedNode.id}>
                {selectedNode.id.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-node-border space-y-2">
        <button
          onClick={() => duplicateNode(selectedNode.id)}
          className="w-full px-3 py-2 bg-node-bg border border-node-border rounded-md text-sm text-gray-300 hover:bg-node-border hover:border-gray-500 transition-colors tracking-tight"
        >
          Duplicate Node
        </button>
        <button
          onClick={() => deleteNode(selectedNode.id)}
          className="w-full px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-md text-sm text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-colors tracking-tight"
        >
          Delete Node
        </button>
      </div>
    </div>
  );
}

function renderInputField(
  dataType: string,
  value: unknown,
  onChange: (value: unknown) => void
) {
  switch (dataType) {
    case 'boolean':
      return (
        <button
          onClick={() => onChange(!value)}
          className={`
            w-full px-3 py-2 rounded-md text-sm text-left transition-colors
            ${value 
              ? 'bg-node-accent text-node-bg' 
              : 'bg-node-bg border border-node-border text-gray-300'
            }
          `}
        >
          {value ? 'True' : 'False'}
        </button>
      );
    
    case 'number':
      return (
        <input
          type="number"
          value={value as number ?? ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 bg-node-bg border border-node-border rounded-md text-sm text-gray-300 focus:border-node-accent transition-colors"
        />
      );
    
    case 'string':
    case 'publickey':
    default:
      return (
        <input
          type="text"
          value={value as string ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={dataType === 'publickey' ? 'Enter public key...' : 'Enter value...'}
          className="w-full px-3 py-2 bg-node-bg border border-node-border rounded-md text-sm text-gray-300 placeholder-gray-600 focus:border-node-accent transition-colors font-mono"
        />
      );
  }
}

