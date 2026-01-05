import { NodeDefinition } from '@/types/nodes';

export const nodeDefinitions: NodeDefinition[] = [
  // RPC Nodes
  {
    type: 'rpc-connection',
    category: 'rpc',
    label: 'RPC Connection',
    description: 'Connect to a Solana RPC endpoint',
    color: '#a855f7',
    inputs: [
      { id: 'endpoint', name: 'Endpoint', type: 'input', dataType: 'string', required: true },
    ],
    outputs: [
      { id: 'connection', name: 'Connection', type: 'output', dataType: 'connection' },
    ],
  },
  {
    type: 'get-balance',
    category: 'rpc',
    label: 'Get Balance',
    description: 'Get SOL balance of an account',
    color: '#a855f7',
    inputs: [
      { id: 'connection', name: 'Connection', type: 'input', dataType: 'connection', required: true },
      { id: 'publicKey', name: 'Public Key', type: 'input', dataType: 'publickey', required: true },
    ],
    outputs: [
      { id: 'balance', name: 'Balance (SOL)', type: 'output', dataType: 'number' },
      { id: 'lamports', name: 'Lamports', type: 'output', dataType: 'number' },
    ],
  },
  {
    type: 'get-account-info',
    category: 'rpc',
    label: 'Get Account Info',
    description: 'Fetch account information',
    color: '#a855f7',
    inputs: [
      { id: 'connection', name: 'Connection', type: 'input', dataType: 'connection', required: true },
      { id: 'publicKey', name: 'Public Key', type: 'input', dataType: 'publickey', required: true },
    ],
    outputs: [
      { id: 'accountInfo', name: 'Account Info', type: 'output', dataType: 'account' },
      { id: 'owner', name: 'Owner', type: 'output', dataType: 'publickey' },
      { id: 'lamports', name: 'Lamports', type: 'output', dataType: 'number' },
    ],
  },
  {
    type: 'get-slot',
    category: 'rpc',
    label: 'Get Slot',
    description: 'Get current slot number',
    color: '#a855f7',
    inputs: [
      { id: 'connection', name: 'Connection', type: 'input', dataType: 'connection', required: true },
    ],
    outputs: [
      { id: 'slot', name: 'Slot', type: 'output', dataType: 'number' },
    ],
  },
  {
    type: 'get-block-height',
    category: 'rpc',
    label: 'Get Block Height',
    description: 'Get current block height',
    color: '#a855f7',
    inputs: [
      { id: 'connection', name: 'Connection', type: 'input', dataType: 'connection', required: true },
    ],
    outputs: [
      { id: 'blockHeight', name: 'Block Height', type: 'output', dataType: 'number' },
    ],
  },
  {
    type: 'get-recent-blockhash',
    category: 'rpc',
    label: 'Get Recent Blockhash',
    description: 'Get recent blockhash for transactions',
    color: '#a855f7',
    inputs: [
      { id: 'connection', name: 'Connection', type: 'input', dataType: 'connection', required: true },
    ],
    outputs: [
      { id: 'blockhash', name: 'Blockhash', type: 'output', dataType: 'string' },
      { id: 'lastValidBlockHeight', name: 'Last Valid Block Height', type: 'output', dataType: 'number' },
    ],
  },

  // Wallet Nodes
  {
    type: 'wallet-connect',
    category: 'wallet',
    label: 'Connected Wallet',
    description: 'Get the connected wallet public key',
    color: '#f97316',
    inputs: [],
    outputs: [
      { id: 'publicKey', name: 'Public Key', type: 'output', dataType: 'publickey' },
      { id: 'connected', name: 'Is Connected', type: 'output', dataType: 'boolean' },
    ],
  },
  {
    type: 'wallet-sign',
    category: 'wallet',
    label: 'Sign Transaction',
    description: 'Sign a transaction with connected wallet',
    color: '#f97316',
    inputs: [
      { id: 'transaction', name: 'Transaction', type: 'input', dataType: 'transaction', required: true },
    ],
    outputs: [
      { id: 'signedTransaction', name: 'Signed Transaction', type: 'output', dataType: 'transaction' },
    ],
  },
  {
    type: 'wallet-sign-message',
    category: 'wallet',
    label: 'Sign Message',
    description: 'Sign a message with connected wallet',
    color: '#f97316',
    inputs: [
      { id: 'message', name: 'Message', type: 'input', dataType: 'string', required: true },
    ],
    outputs: [
      { id: 'signature', name: 'Signature', type: 'output', dataType: 'string' },
    ],
  },

  // Transaction Nodes
  {
    type: 'create-transaction',
    category: 'transaction',
    label: 'Create Transaction',
    description: 'Create a new transaction',
    color: '#3b82f6',
    inputs: [
      { id: 'feePayer', name: 'Fee Payer', type: 'input', dataType: 'publickey', required: true },
      { id: 'blockhash', name: 'Blockhash', type: 'input', dataType: 'string', required: true },
    ],
    outputs: [
      { id: 'transaction', name: 'Transaction', type: 'output', dataType: 'transaction' },
    ],
  },
  {
    type: 'add-instruction',
    category: 'transaction',
    label: 'Add Instruction',
    description: 'Add an instruction to a transaction',
    color: '#3b82f6',
    inputs: [
      { id: 'transaction', name: 'Transaction', type: 'input', dataType: 'transaction', required: true },
      { id: 'instruction', name: 'Instruction', type: 'input', dataType: 'instruction', required: true },
    ],
    outputs: [
      { id: 'transaction', name: 'Transaction', type: 'output', dataType: 'transaction' },
    ],
  },
  {
    type: 'send-transaction',
    category: 'transaction',
    label: 'Send Transaction',
    description: 'Send and confirm a transaction',
    color: '#3b82f6',
    inputs: [
      { id: 'connection', name: 'Connection', type: 'input', dataType: 'connection', required: true },
      { id: 'transaction', name: 'Transaction', type: 'input', dataType: 'transaction', required: true },
    ],
    outputs: [
      { id: 'signature', name: 'Signature', type: 'output', dataType: 'string' },
      { id: 'confirmed', name: 'Confirmed', type: 'output', dataType: 'boolean' },
    ],
  },
  {
    type: 'transfer-sol',
    category: 'transaction',
    label: 'Transfer SOL',
    description: 'Create a SOL transfer instruction',
    color: '#3b82f6',
    inputs: [
      { id: 'from', name: 'From', type: 'input', dataType: 'publickey', required: true },
      { id: 'to', name: 'To', type: 'input', dataType: 'publickey', required: true },
      { id: 'amount', name: 'Amount (SOL)', type: 'input', dataType: 'number', required: true },
    ],
    outputs: [
      { id: 'instruction', name: 'Instruction', type: 'output', dataType: 'instruction' },
    ],
  },

  // Token Nodes
  {
    type: 'get-token-accounts',
    category: 'token',
    label: 'Get Token Accounts',
    description: 'Get all token accounts for an owner',
    color: '#10b981',
    inputs: [
      { id: 'connection', name: 'Connection', type: 'input', dataType: 'connection', required: true },
      { id: 'owner', name: 'Owner', type: 'input', dataType: 'publickey', required: true },
    ],
    outputs: [
      { id: 'accounts', name: 'Token Accounts', type: 'output', dataType: 'array' },
    ],
  },
  {
    type: 'get-token-balance',
    category: 'token',
    label: 'Get Token Balance',
    description: 'Get balance of a token account',
    color: '#10b981',
    inputs: [
      { id: 'connection', name: 'Connection', type: 'input', dataType: 'connection', required: true },
      { id: 'tokenAccount', name: 'Token Account', type: 'input', dataType: 'publickey', required: true },
    ],
    outputs: [
      { id: 'balance', name: 'Balance', type: 'output', dataType: 'number' },
      { id: 'decimals', name: 'Decimals', type: 'output', dataType: 'number' },
    ],
  },
  {
    type: 'transfer-token',
    category: 'token',
    label: 'Transfer Token',
    description: 'Create a token transfer instruction',
    color: '#10b981',
    inputs: [
      { id: 'source', name: 'Source', type: 'input', dataType: 'publickey', required: true },
      { id: 'destination', name: 'Destination', type: 'input', dataType: 'publickey', required: true },
      { id: 'owner', name: 'Owner', type: 'input', dataType: 'publickey', required: true },
      { id: 'amount', name: 'Amount', type: 'input', dataType: 'number', required: true },
    ],
    outputs: [
      { id: 'instruction', name: 'Instruction', type: 'output', dataType: 'instruction' },
    ],
  },

  // Math Nodes
  {
    type: 'math-add',
    category: 'math',
    label: 'Add',
    description: 'Add two numbers',
    color: '#ffe66d',
    inputs: [
      { id: 'a', name: 'A', type: 'input', dataType: 'number', required: true },
      { id: 'b', name: 'B', type: 'input', dataType: 'number', required: true },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'output', dataType: 'number' },
    ],
  },
  {
    type: 'math-subtract',
    category: 'math',
    label: 'Subtract',
    description: 'Subtract two numbers',
    color: '#ffe66d',
    inputs: [
      { id: 'a', name: 'A', type: 'input', dataType: 'number', required: true },
      { id: 'b', name: 'B', type: 'input', dataType: 'number', required: true },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'output', dataType: 'number' },
    ],
  },
  {
    type: 'math-multiply',
    category: 'math',
    label: 'Multiply',
    description: 'Multiply two numbers',
    color: '#ffe66d',
    inputs: [
      { id: 'a', name: 'A', type: 'input', dataType: 'number', required: true },
      { id: 'b', name: 'B', type: 'input', dataType: 'number', required: true },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'output', dataType: 'number' },
    ],
  },
  {
    type: 'math-divide',
    category: 'math',
    label: 'Divide',
    description: 'Divide two numbers',
    color: '#ffe66d',
    inputs: [
      { id: 'a', name: 'A', type: 'input', dataType: 'number', required: true },
      { id: 'b', name: 'B', type: 'input', dataType: 'number', required: true },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'output', dataType: 'number' },
    ],
  },
  {
    type: 'lamports-to-sol',
    category: 'math',
    label: 'Lamports to SOL',
    description: 'Convert lamports to SOL',
    color: '#ffe66d',
    inputs: [
      { id: 'lamports', name: 'Lamports', type: 'input', dataType: 'number', required: true },
    ],
    outputs: [
      { id: 'sol', name: 'SOL', type: 'output', dataType: 'number' },
    ],
  },
  {
    type: 'sol-to-lamports',
    category: 'math',
    label: 'SOL to Lamports',
    description: 'Convert SOL to lamports',
    color: '#ffe66d',
    inputs: [
      { id: 'sol', name: 'SOL', type: 'input', dataType: 'number', required: true },
    ],
    outputs: [
      { id: 'lamports', name: 'Lamports', type: 'output', dataType: 'number' },
    ],
  },

  // Logic Nodes
  {
    type: 'logic-compare',
    category: 'logic',
    label: 'Compare',
    description: 'Compare two values',
    color: '#ec4899',
    inputs: [
      { id: 'a', name: 'A', type: 'input', dataType: 'any', required: true },
      { id: 'b', name: 'B', type: 'input', dataType: 'any', required: true },
    ],
    outputs: [
      { id: 'equal', name: 'Equal', type: 'output', dataType: 'boolean' },
      { id: 'greater', name: 'A > B', type: 'output', dataType: 'boolean' },
      { id: 'less', name: 'A < B', type: 'output', dataType: 'boolean' },
    ],
  },
  {
    type: 'logic-and',
    category: 'logic',
    label: 'AND',
    description: 'Logical AND operation',
    color: '#ec4899',
    inputs: [
      { id: 'a', name: 'A', type: 'input', dataType: 'boolean', required: true },
      { id: 'b', name: 'B', type: 'input', dataType: 'boolean', required: true },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'output', dataType: 'boolean' },
    ],
  },
  {
    type: 'logic-or',
    category: 'logic',
    label: 'OR',
    description: 'Logical OR operation',
    color: '#ec4899',
    inputs: [
      { id: 'a', name: 'A', type: 'input', dataType: 'boolean', required: true },
      { id: 'b', name: 'B', type: 'input', dataType: 'boolean', required: true },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'output', dataType: 'boolean' },
    ],
  },
  {
    type: 'logic-not',
    category: 'logic',
    label: 'NOT',
    description: 'Logical NOT operation',
    color: '#ec4899',
    inputs: [
      { id: 'a', name: 'Input', type: 'input', dataType: 'boolean', required: true },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'output', dataType: 'boolean' },
    ],
  },
  {
    type: 'logic-switch',
    category: 'logic',
    label: 'Switch',
    description: 'Switch between two values based on condition',
    color: '#ec4899',
    inputs: [
      { id: 'condition', name: 'Condition', type: 'input', dataType: 'boolean', required: true },
      { id: 'trueValue', name: 'If True', type: 'input', dataType: 'any', required: true },
      { id: 'falseValue', name: 'If False', type: 'input', dataType: 'any', required: true },
    ],
    outputs: [
      { id: 'result', name: 'Result', type: 'output', dataType: 'any' },
    ],
  },

  // Input Nodes
  {
    type: 'input-string',
    category: 'input',
    label: 'String Input',
    description: 'Input a string value',
    color: '#06b6d4',
    inputs: [],
    outputs: [
      { id: 'value', name: 'Value', type: 'output', dataType: 'string' },
    ],
  },
  {
    type: 'input-number',
    category: 'input',
    label: 'Number Input',
    description: 'Input a number value',
    color: '#06b6d4',
    inputs: [],
    outputs: [
      { id: 'value', name: 'Value', type: 'output', dataType: 'number' },
    ],
  },
  {
    type: 'input-publickey',
    category: 'input',
    label: 'Public Key Input',
    description: 'Input a Solana public key',
    color: '#06b6d4',
    inputs: [],
    outputs: [
      { id: 'publicKey', name: 'Public Key', type: 'output', dataType: 'publickey' },
    ],
  },
  {
    type: 'input-boolean',
    category: 'input',
    label: 'Boolean Input',
    description: 'Input a boolean value',
    color: '#06b6d4',
    inputs: [],
    outputs: [
      { id: 'value', name: 'Value', type: 'output', dataType: 'boolean' },
    ],
  },

  // Output Nodes
  {
    type: 'output-display',
    category: 'output',
    label: 'Display',
    description: 'Display a value',
    color: '#8b5cf6',
    inputs: [
      { id: 'value', name: 'Value', type: 'input', dataType: 'any', required: true },
    ],
    outputs: [],
  },
  {
    type: 'output-log',
    category: 'output',
    label: 'Console Log',
    description: 'Log value to console',
    color: '#8b5cf6',
    inputs: [
      { id: 'value', name: 'Value', type: 'input', dataType: 'any', required: true },
      { id: 'label', name: 'Label', type: 'input', dataType: 'string' },
    ],
    outputs: [],
  },

  // Loop Nodes
  {
    type: 'loop-for-each',
    category: 'utility',
    label: 'For Each',
    description: 'Iterate over each item in an array',
    color: '#6b7280',
    inputs: [
      { id: 'array', name: 'Array', type: 'input', dataType: 'array', required: true },
    ],
    outputs: [
      { id: 'item', name: 'Current Item', type: 'output', dataType: 'any' },
      { id: 'index', name: 'Index', type: 'output', dataType: 'number' },
      { id: 'result', name: 'All Results', type: 'output', dataType: 'array' },
    ],
  },
  {
    type: 'loop-repeat',
    category: 'utility',
    label: 'Repeat',
    description: 'Repeat execution N times',
    color: '#6b7280',
    inputs: [
      { id: 'times', name: 'Times', type: 'input', dataType: 'number', required: true },
      { id: 'value', name: 'Value', type: 'input', dataType: 'any' },
    ],
    outputs: [
      { id: 'index', name: 'Current Index', type: 'output', dataType: 'number' },
      { id: 'results', name: 'All Results', type: 'output', dataType: 'array' },
    ],
  },
  {
    type: 'loop-range',
    category: 'utility',
    label: 'Range',
    description: 'Generate array of numbers from start to end',
    color: '#6b7280',
    inputs: [
      { id: 'start', name: 'Start', type: 'input', dataType: 'number', required: true },
      { id: 'end', name: 'End', type: 'input', dataType: 'number', required: true },
      { id: 'step', name: 'Step', type: 'input', dataType: 'number', defaultValue: 1 },
    ],
    outputs: [
      { id: 'array', name: 'Array', type: 'output', dataType: 'array' },
    ],
  },
  {
    type: 'array-length',
    category: 'utility',
    label: 'Array Length',
    description: 'Get length of an array',
    color: '#6b7280',
    inputs: [
      { id: 'array', name: 'Array', type: 'input', dataType: 'array', required: true },
    ],
    outputs: [
      { id: 'length', name: 'Length', type: 'output', dataType: 'number' },
    ],
  },
  {
    type: 'array-get-item',
    category: 'utility',
    label: 'Get Array Item',
    description: 'Get item at specific index',
    color: '#6b7280',
    inputs: [
      { id: 'array', name: 'Array', type: 'input', dataType: 'array', required: true },
      { id: 'index', name: 'Index', type: 'input', dataType: 'number', required: true },
    ],
    outputs: [
      { id: 'item', name: 'Item', type: 'output', dataType: 'any' },
    ],
  },

  // Utility Nodes
  {
    type: 'utility-delay',
    category: 'utility',
    label: 'Delay',
    description: 'Delay execution by specified milliseconds',
    color: '#6b7280',
    inputs: [
      { id: 'input', name: 'Input', type: 'input', dataType: 'any', required: true },
      { id: 'ms', name: 'Milliseconds', type: 'input', dataType: 'number', required: true, defaultValue: 1000 },
    ],
    outputs: [
      { id: 'output', name: 'Output', type: 'output', dataType: 'any' },
    ],
  },
  {
    type: 'utility-json-parse',
    category: 'utility',
    label: 'Parse JSON',
    description: 'Parse a JSON string',
    color: '#6b7280',
    inputs: [
      { id: 'json', name: 'JSON String', type: 'input', dataType: 'string', required: true },
    ],
    outputs: [
      { id: 'object', name: 'Object', type: 'output', dataType: 'object' },
    ],
  },
  {
    type: 'utility-json-stringify',
    category: 'utility',
    label: 'Stringify JSON',
    description: 'Convert object to JSON string',
    color: '#6b7280',
    inputs: [
      { id: 'object', name: 'Object', type: 'input', dataType: 'object', required: true },
    ],
    outputs: [
      { id: 'json', name: 'JSON String', type: 'output', dataType: 'string' },
    ],
  },
  {
    type: 'utility-get-property',
    category: 'utility',
    label: 'Get Property',
    description: 'Get a property from an object',
    color: '#6b7280',
    inputs: [
      { id: 'object', name: 'Object', type: 'input', dataType: 'object', required: true },
      { id: 'key', name: 'Key', type: 'input', dataType: 'string', required: true },
    ],
    outputs: [
      { id: 'value', name: 'Value', type: 'output', dataType: 'any' },
    ],
  },
];

export const categoryInfo: Record<string, { label: string; color: string; description: string }> = {
  rpc: { label: 'RPC', color: '#b3b3b3', description: 'Solana RPC methods' },
  wallet: { label: 'Wallet', color: '#999999', description: 'Wallet operations' },
  transaction: { label: 'Transaction', color: '#888888', description: 'Transaction building' },
  token: { label: 'Token', color: '#c2c2c2', description: 'SPL Token operations' },
  math: { label: 'Math', color: '#d4d4d4', description: 'Mathematical operations' },
  logic: { label: 'Logic', color: '#a0a0a0', description: 'Logical operations' },
  input: { label: 'Input', color: '#e5e5e5', description: 'Value inputs' },
  output: { label: 'Output', color: '#cccccc', description: 'Display results' },
  utility: { label: 'Utility', color: '#777777', description: 'Utility functions' },
};


