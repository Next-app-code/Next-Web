import { Node, Edge } from 'reactflow';

export type NodeCategory = 
  | 'rpc'
  | 'wallet'
  | 'transaction'
  | 'account'
  | 'token'
  | 'math'
  | 'logic'
  | 'utility'
  | 'input'
  | 'output';

export interface NodePort {
  id: string;
  name: string;
  type: 'input' | 'output';
  dataType: DataType;
  required?: boolean;
  defaultValue?: unknown;
}

export type DataType = 
  | 'any'
  | 'string'
  | 'number'
  | 'boolean'
  | 'publickey'
  | 'keypair'
  | 'transaction'
  | 'instruction'
  | 'connection'
  | 'account'
  | 'tokenAccount'
  | 'array'
  | 'object';

export interface NodeDefinition {
  type: string;
  category: NodeCategory;
  label: string;
  description: string;
  inputs: NodePort[];
  outputs: NodePort[];
  color: string;
  icon?: string;
}

export interface CustomNodeData {
  label: string;
  category: NodeCategory;
  type: string;
  inputs: NodePort[];
  outputs: NodePort[];
  values: Record<string, unknown>;
  color: string;
  isExecuting?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  result?: unknown;
}

export type CustomNode = Node<CustomNodeData>;
export type CustomEdge = Edge;

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  nodes: CustomNode[];
  edges: CustomEdge[];
  rpcEndpoint: string;
  createdAt: string;
  updatedAt: string;
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
}

export interface ExecutionContext {
  rpcEndpoint: string;
  nodeResults: Map<string, unknown>;
  isRunning: boolean;
  currentNodeId: string | null;
}

export interface ExecutionResult {
  nodeId: string;
  success: boolean;
  result?: unknown;
  error?: string;
  duration: number;
}

