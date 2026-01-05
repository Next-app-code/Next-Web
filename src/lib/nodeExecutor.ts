import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { CustomNode } from '@/types/nodes';

export interface ExecutionContext {
  connection: Connection | null;
  results: Map<string, any>;
  wallet: { publicKey: PublicKey | null; connected: boolean };
}

/**
 * Execute a single node and return its output values
 */
export async function executeNode(
  node: CustomNode,
  context: ExecutionContext,
  inputValues: Record<string, any>
): Promise<Record<string, any>> {
  const { type, values } = node.data;

  try {
    switch (type) {
      // ===== RPC Nodes =====
      case 'rpc-connection': {
        const endpoint = inputValues.endpoint || values?.endpoint || context.connection?.rpcEndpoint;
        if (!endpoint) throw new Error('RPC endpoint is required');
        
        const connection = new Connection(endpoint, 'confirmed');
        return { connection };
      }

      case 'get-balance': {
        const connection = inputValues.connection || context.connection;
        const publicKey = inputValues.publicKey;
        
        if (!connection) throw new Error('Connection is required');
        if (!publicKey) throw new Error('Public key is required');
        
        const pubkey = typeof publicKey === 'string' ? new PublicKey(publicKey) : publicKey;
        const lamports = await connection.getBalance(pubkey);
        
        return {
          balance: lamports / LAMPORTS_PER_SOL,
          lamports,
        };
      }

      case 'get-account-info': {
        const connection = inputValues.connection || context.connection;
        const publicKey = inputValues.publicKey;
        
        if (!connection) throw new Error('Connection is required');
        if (!publicKey) throw new Error('Public key is required');
        
        const pubkey = typeof publicKey === 'string' ? new PublicKey(publicKey) : publicKey;
        const accountInfo = await connection.getAccountInfo(pubkey);
        
        if (!accountInfo) {
          return {
            accountInfo: null,
            owner: null,
            lamports: 0,
          };
        }
        
        return {
          accountInfo,
          owner: accountInfo.owner.toBase58(),
          lamports: accountInfo.lamports,
        };
      }

      case 'get-slot': {
        const connection = inputValues.connection || context.connection;
        if (!connection) throw new Error('Connection is required');
        
        const slot = await connection.getSlot();
        return { slot };
      }

      case 'get-block-height': {
        const connection = inputValues.connection || context.connection;
        if (!connection) throw new Error('Connection is required');
        
        const blockHeight = await connection.getBlockHeight();
        return { blockHeight };
      }

      case 'get-recent-blockhash': {
        const connection = inputValues.connection || context.connection;
        if (!connection) throw new Error('Connection is required');
        
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        return { blockhash, lastValidBlockHeight };
      }

      // ===== Wallet Nodes =====
      case 'wallet-connect': {
        return {
          publicKey: context.wallet.publicKey?.toBase58() || null,
          connected: context.wallet.connected,
        };
      }

      // ===== Math Nodes =====
      case 'math-add': {
        const a = Number(inputValues.a || 0);
        const b = Number(inputValues.b || 0);
        return { result: a + b };
      }

      case 'math-subtract': {
        const a = Number(inputValues.a || 0);
        const b = Number(inputValues.b || 0);
        return { result: a - b };
      }

      case 'math-multiply': {
        const a = Number(inputValues.a || 0);
        const b = Number(inputValues.b || 0);
        return { result: a * b };
      }

      case 'math-divide': {
        const a = Number(inputValues.a || 0);
        const b = Number(inputValues.b || 0);
        if (b === 0) throw new Error('Division by zero');
        return { result: a / b };
      }

      case 'lamports-to-sol': {
        const lamports = Number(inputValues.lamports || 0);
        return { sol: lamports / LAMPORTS_PER_SOL };
      }

      case 'sol-to-lamports': {
        const sol = Number(inputValues.sol || 0);
        return { lamports: Math.floor(sol * LAMPORTS_PER_SOL) };
      }

      // ===== Logic Nodes =====
      case 'logic-compare': {
        const a = inputValues.a;
        const b = inputValues.b;
        return {
          equal: a === b,
          greater: a > b,
          less: a < b,
        };
      }

      case 'logic-and': {
        const a = Boolean(inputValues.a);
        const b = Boolean(inputValues.b);
        return { result: a && b };
      }

      case 'logic-or': {
        const a = Boolean(inputValues.a);
        const b = Boolean(inputValues.b);
        return { result: a || b };
      }

      case 'logic-not': {
        const a = Boolean(inputValues.a);
        return { result: !a };
      }

      case 'logic-switch': {
        const condition = Boolean(inputValues.condition);
        const trueValue = inputValues.trueValue;
        const falseValue = inputValues.falseValue;
        return { result: condition ? trueValue : falseValue };
      }

      // ===== Input Nodes =====
      case 'input-string': {
        return { value: values?.value || '' };
      }

      case 'input-number': {
        return { value: Number(values?.value || 0) };
      }

      case 'input-publickey': {
        return { publicKey: values?.publicKey || '' };
      }

      case 'input-boolean': {
        return { value: Boolean(values?.value) };
      }

      // ===== Output Nodes =====
      case 'output-display': {
        // Display node stores the input value as result
        const value = inputValues.value;
        return { displayValue: value };
      }

      case 'output-log': {
        const value = inputValues.value;
        const label = inputValues.label || 'Log';
        console.log(`[${label}]:`, value);
        return { logged: true, value };
      }

      // ===== Utility Nodes =====
      case 'utility-delay': {
        const input = inputValues.input;
        const ms = Number(inputValues.ms || values?.ms || 1000);
        await new Promise(resolve => setTimeout(resolve, ms));
        return { output: input };
      }

      case 'utility-json-parse': {
        const json = inputValues.json;
        const object = JSON.parse(json);
        return { object };
      }

      case 'utility-json-stringify': {
        const object = inputValues.object;
        const json = JSON.stringify(object);
        return { json };
      }

      case 'utility-get-property': {
        const object = inputValues.object;
        const key = inputValues.key;
        const value = object?.[key];
        return { value };
      }

      default:
        throw new Error(`Unknown node type: ${type}`);
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get input values for a node by resolving connected edges
 */
export function getNodeInputValues(
  node: CustomNode,
  edges: any[],
  results: Map<string, any>
): Record<string, any> {
  const inputValues: Record<string, any> = {};

  // Get values from connected edges
  for (const edge of edges) {
    if (edge.target === node.id) {
      const sourceResult = results.get(edge.source);
      if (sourceResult) {
        // Extract the specific output value from source node
        const outputId = edge.sourceHandle;
        if (outputId && sourceResult[outputId] !== undefined) {
          const inputId = edge.targetHandle;
          inputValues[inputId] = sourceResult[outputId];
        }
      }
    }
  }

  // Merge with node's own input values
  if (node.data.values) {
    Object.assign(inputValues, node.data.values);
  }

  return inputValues;
}

