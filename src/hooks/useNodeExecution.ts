import { useCallback, useRef } from 'react';
import { Connection } from '@solana/web3.js';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export function useNodeExecution() {
  const connectionRef = useRef<Connection | null>(null);
  
  const {
    nodes,
    edges,
    rpcEndpoint,
    startExecution,
    stopExecution,
    setExecutingNode,
    setNodeResult,
    updateNode,
  } = useWorkspaceStore();

  const getConnection = useCallback(() => {
    if (!rpcEndpoint) {
      throw new Error('No RPC endpoint configured');
    }
    
    if (!connectionRef.current) {
      connectionRef.current = new Connection(rpcEndpoint, 'confirmed');
    }
    
    return connectionRef.current;
  }, [rpcEndpoint]);

  const buildExecutionOrder = useCallback(() => {
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    
    for (const node of nodes) {
      graph.set(node.id, []);
      inDegree.set(node.id, 0);
    }
    
    for (const edge of edges) {
      const neighbors = graph.get(edge.source);
      if (neighbors) {
        neighbors.push(edge.target);
      }
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }
    
    const queue: string[] = [];
    const result: string[] = [];
    
    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }
    
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      result.push(nodeId);
      
      const neighbors = graph.get(nodeId) || [];
      for (const neighbor of neighbors) {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);
        
        if (newDegree === 0) {
          queue.push(neighbor);
        }
      }
    }
    
    if (result.length !== nodes.length) {
      throw new Error('Workflow contains cycles');
    }
    
    return result;
  }, [nodes, edges]);

  const executeWorkflow = useCallback(async () => {
    if (!rpcEndpoint) {
      alert('Please enter an RPC endpoint first');
      return;
    }

    try {
      startExecution();
      const executionOrder = buildExecutionOrder();
      const results = new Map<string, unknown>();

      for (const nodeId of executionOrder) {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) continue;

        setExecutingNode(nodeId);

        try {
          // Simulate node execution
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const result = { executed: true, nodeId };
          results.set(nodeId, result);
          setNodeResult(nodeId, result);
        } catch (error) {
          updateNode(nodeId, {
            hasError: true,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            isExecuting: false,
          });
          throw error;
        }
      }

      stopExecution();
    } catch (error) {
      stopExecution();
      console.error('Workflow execution failed:', error);
    }
  }, [
    rpcEndpoint,
    nodes,
    startExecution,
    stopExecution,
    setExecutingNode,
    setNodeResult,
    updateNode,
    buildExecutionOrder,
  ]);

  return {
    executeWorkflow,
    getConnection,
  };
}


