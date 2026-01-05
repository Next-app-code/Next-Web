import { useCallback, useRef } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useWallet } from '@solana/wallet-adapter-react';
import { executeNode, getNodeInputValues, ExecutionContext } from '@/lib/nodeExecutor';

/**
 * Filter out non-serializable objects from results
 */
function filterSerializableResult(result: any): any {
  if (!result || typeof result !== 'object') {
    return result;
  }

  const filtered: any = {};
  for (const [key, value] of Object.entries(result)) {
    // Skip Connection objects and other non-serializable types
    if (value instanceof Connection) {
      filtered[key] = '[Connection Object]';
    } else if (typeof value === 'function') {
      filtered[key] = '[Function]';
    } else if (value && typeof value === 'object' && value.constructor && value.constructor.name !== 'Object' && value.constructor.name !== 'Array') {
      // Complex objects - convert to string representation
      filtered[key] = `[${value.constructor.name}]`;
    } else {
      filtered[key] = value;
    }
  }
  return filtered;
}

export function useNodeExecution() {
  const connectionRef = useRef<Connection | null>(null);
  const { publicKey, connected } = useWallet();
  
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
    console.log('Building execution order...');
    console.log('Nodes:', nodes.map(n => ({ id: n.id, type: n.data.type })));
    console.log('Edges:', edges.map(e => ({ source: e.source, target: e.target })));
    
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    
    // Initialize graph
    for (const node of nodes) {
      graph.set(node.id, []);
      inDegree.set(node.id, 0);
    }
    
    // Build adjacency list
    for (const edge of edges) {
      const neighbors = graph.get(edge.source);
      if (neighbors) {
        neighbors.push(edge.target);
      }
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }
    
    console.log('In-degrees:', Array.from(inDegree.entries()));
    
    // Topological sort
    const queue: string[] = [];
    const result: string[] = [];
    
    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }
    
    console.log('Starting nodes (degree 0):', queue);
    
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
    
    console.log('Execution order:', result);
    console.log('Total nodes:', nodes.length, 'Ordered:', result.length);
    
    if (result.length !== nodes.length) {
      const missing = nodes.filter(n => !result.includes(n.id));
      console.error('Missing nodes from execution order:', missing.map(n => ({ id: n.id, type: n.data.type })));
      throw new Error(`Workflow contains cycles or disconnected nodes. ${missing.length} nodes could not be ordered.`);
    }
    
    return result;
  }, [nodes, edges]);

  const executeWorkflow = useCallback(async () => {
    if (!rpcEndpoint) {
      alert('Please enter an RPC endpoint first');
      return;
    }

    // Prevent multiple executions
    const currentState = useWorkspaceStore.getState();
    if (currentState.isExecuting) {
      console.log('Execution already in progress, skipping...');
      return;
    }

    try {
      startExecution();
      const executionOrder = buildExecutionOrder();
      const results = new Map<string, any>();
      
      const context: ExecutionContext = {
        connection: getConnection(),
        results,
        wallet: {
          publicKey: publicKey || null,
          connected: connected,
        },
        rpcEndpoint: rpcEndpoint,
      };

      for (const nodeId of executionOrder) {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) continue;

        setExecutingNode(nodeId);

        try {
          // Get input values from connected edges
          const inputValues = getNodeInputValues(node, edges, results);
          
          // Execute the node
          const output = await executeNode(node, context, inputValues);
          
          // Store results
          results.set(nodeId, output);
          
          // Update node with result for display
          // Filter out non-serializable objects like Connection
          const displayResult = filterSerializableResult(output);
          
          if (node.data.type === 'output-display') {
            setNodeResult(nodeId, inputValues.value);
          } else {
            setNodeResult(nodeId, displayResult);
          }
          
          // Clear executing state for this node
          updateNode(nodeId, { isExecuting: false });
        } catch (error) {
          updateNode(nodeId, {
            hasError: true,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            isExecuting: false,
          });
          stopExecution();
          throw error;
        }
      }

      // Clear executing node
      setExecutingNode(null);
      stopExecution();
    } catch (error) {
      setExecutingNode(null);
      stopExecution();
      console.error('Workflow execution failed:', error);
      alert(`Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [
    rpcEndpoint,
    nodes,
    edges,
    publicKey,
    connected,
    startExecution,
    stopExecution,
    setExecutingNode,
    setNodeResult,
    updateNode,
    buildExecutionOrder,
    getConnection,
  ]);

  return {
    executeWorkflow,
    getConnection,
  };
}


