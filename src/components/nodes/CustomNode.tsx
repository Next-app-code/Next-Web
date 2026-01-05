'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CustomNodeData } from '@/types/nodes';

interface CustomNodeProps extends NodeProps<CustomNodeData> {}

export const CustomNode = memo(function CustomNode({ data, selected }: CustomNodeProps) {
  const { label, inputs, outputs, color, isExecuting, hasError, result } = data;

  return (
    <div
      className={`
        min-w-[200px] rounded-lg overflow-hidden
        ${isExecuting ? 'node-executing' : ''}
        ${hasError ? 'ring-2 ring-red-500' : ''}
        ${selected ? 'ring-2 ring-white' : ''}
      `}
      style={{
        background: '#2a2a2a',
        border: `1px solid ${selected ? '#ffffff' : '#404040'}`,
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-2 text-sm font-semibold tracking-tight border-b border-node-border"
        style={{ 
          background: '#1a1a1a',
          color: '#ffffff',
        }}
      >
        {label}
      </div>

      {/* Body */}
      <div className="p-2 space-y-1">
        {/* Inputs */}
        {inputs.map((input) => (
          <div key={input.id} className="relative flex items-center py-1.5">
            <Handle
              type="target"
              position={Position.Left}
              id={input.id}
              className="!w-3 !h-3 !border-2 !left-[-13px]"
              style={{
                background: '#1a1a1a',
                borderColor: '#e5e5e5',
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
            <span className="text-xs text-gray-300 ml-1 tracking-tight">
              {input.name}
              {input.required && <span className="text-gray-500 ml-0.5">*</span>}
            </span>
          </div>
        ))}

        {/* Outputs */}
        {outputs.map((output) => (
          <div key={output.id} className="relative flex items-center justify-end py-1.5">
            <span className="text-xs text-gray-300 mr-1 tracking-tight">
              {output.name}
            </span>
            <Handle
              type="source"
              position={Position.Right}
              id={output.id}
              className="!w-3 !h-3 !border-2 !right-[-13px]"
              style={{
                background: '#1a1a1a',
                borderColor: '#e5e5e5',
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
          </div>
        ))}

        {/* Result Display */}
        {result !== undefined && (
          <div className="mt-2 pt-2 border-t border-node-border">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Result</div>
            <div className="p-2 rounded bg-black border border-node-border text-sm text-white font-mono overflow-auto max-h-32">
              {typeof result === 'object' 
                ? JSON.stringify(result, null, 2)
                : String(result)
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

function isLightColor(color: string): boolean {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
}

function getDataTypeColor(dataType: string): string {
  const colors: Record<string, string> = {
    string: '#06b6d4',
    number: '#ffe66d',
    boolean: '#ec4899',
    publickey: '#f97316',
    keypair: '#f97316',
    connection: '#a855f7',
    transaction: '#3b82f6',
    instruction: '#3b82f6',
    account: '#10b981',
    tokenAccount: '#10b981',
    array: '#6b7280',
    object: '#6b7280',
    any: '#9ca3af',
  };
  return colors[dataType] || '#9ca3af';
}


