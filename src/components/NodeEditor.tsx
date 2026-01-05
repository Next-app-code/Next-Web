'use client';

import { useCallback, useRef, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  ConnectionMode,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useWorkspaceStore } from '@/stores/workspaceStore';
import { CustomNode } from '@/components/nodes/CustomNode';
import { nodeDefinitions } from '@/data/nodeDefinitions';
import { v4 as uuidv4 } from 'uuid';
import { CustomNode as CustomNodeType } from '@/types/nodes';

const nodeTypes = {
  custom: CustomNode,
};

function NodeEditorInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    selectNode,
  } = useWorkspaceStore();

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/reactflow');
      if (!nodeType) return;

      const definition = nodeDefinitions.find((n) => n.type === nodeType);
      if (!definition) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: CustomNodeType = {
        id: uuidv4(),
        type: 'custom',
        position,
        data: {
          label: definition.label,
          category: definition.category,
          type: definition.type,
          inputs: definition.inputs,
          outputs: definition.outputs,
          values: {},
          color: definition.color,
        },
      };

      addNode(newNode);
    },
    [screenToFlowPosition, addNode]
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: CustomNodeType) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  const handlePaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  const minimapNodeColor = useCallback((node: CustomNodeType) => {
    return node.data?.color || '#6b7280';
  }, []);

  const flowNodes = useMemo(() => nodes, [nodes]);
  const flowEdges = useMemo(() => edges, [edges]);

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        connectionLineStyle={{ stroke: '#ffffff', strokeWidth: 2 }}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        defaultEdgeOptions={{
          type: 'default',
          animated: false,
          style: { 
            stroke: '#e5e5e5', 
            strokeWidth: 2.5,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#e5e5e5',
            width: 20,
            height: 20,
          },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1a1a1a" gap={16} size={1} />
        <Controls 
          showZoom={true}
          showFitView={true}
          showInteractive={false}
        />
        <MiniMap 
          nodeColor={minimapNodeColor}
          maskColor="rgba(10, 10, 10, 0.8)"
          style={{
            backgroundColor: '#2a2a2a',
          }}
        />
      </ReactFlow>
    </div>
  );
}

export function NodeEditor() {
  return (
    <ReactFlowProvider>
      <NodeEditorInner />
    </ReactFlowProvider>
  );
}


