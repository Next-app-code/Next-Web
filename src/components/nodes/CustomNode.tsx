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
        min-w-[180px] rounded-lg overflow-hidden
        ${isExecuting ? 'node-executing' : ''}
        ${hasError ? 'ring-2 ring-red-500' : ''}
        ${selected ? 'ring-2 ring-node-accent' : ''}
      `}
      style={{
        background: '#232340',
        border: `1px solid ${selected ? color : '#3d3d5c'}`,
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-2 text-sm font-semibold tracking-tight"
        style={{ 
          background: color,
          color: isLightColor(color) ? '#0f0f1a' : '#ffffff',
        }}
      >
        {label}
      </div>

      {/* Body */}
      <div className="p-2 space-y-1">
        {/* Inputs */}
        {inputs.map((input, index) => (
          <div key={input.id} className="relative flex items-center py-1">
            <Handle
              type="target"
              position={Position.Left}
              id={input.id}
              className="!w-3 !h-3 !border-2"
              style={{
                background: getDataTypeColor(input.dataType),
                borderColor: '#3d3d5c',
                top: `${28 + (index * 28)}px`,
              }}
            />
            <span className="text-xs text-gray-400 ml-2 tracking-tight">
              {input.name}
              {input.required && <span className="text-red-400 ml-0.5">*</span>}
            </span>
          </div>
        ))}

        {/* Outputs */}
        {outputs.map((output, index) => (
          <div key={output.id} className="relative flex items-center justify-end py-1">
            <span className="text-xs text-gray-400 mr-2 tracking-tight">
              {output.name}
            </span>
            <Handle
              type="source"
              position={Position.Right}
              id={output.id}
              className="!w-3 !h-3 !border-2"
              style={{
                background: getDataTypeColor(output.dataType),
                borderColor: '#3d3d5c',
                top: `${28 + ((inputs.length + index) * 28)}px`,
              }}
            />
          </div>
        ))}

        {/* Result Preview */}
        {result !== undefined && (
          <div className="mt-2 p-2 rounded bg-node-bg text-xs text-gray-300 font-mono overflow-hidden">
            <div className="truncate">
              {typeof result === 'object' 
                ? JSON.stringify(result).slice(0, 50) + '...'
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

