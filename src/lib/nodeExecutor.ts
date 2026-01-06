import { 
  Connection, 
  PublicKey, 
  LAMPORTS_PER_SOL, 
  Transaction,
  SystemProgram,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { 
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { CustomNode } from '@/types/nodes';

export interface ExecutionContext {
  connection: Connection | null;
  results: Map<string, any>;
  wallet: { 
    publicKey: PublicKey | null; 
    connected: boolean;
    signTransaction?: (tx: Transaction) => Promise<Transaction>;
    signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
  };
  rpcEndpoint: string;
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
        const endpoint = inputValues.endpoint || values?.endpoint || context.rpcEndpoint;
        if (!endpoint) throw new Error('RPC endpoint is required. Please enter an RPC endpoint in the toolbar.');
        
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

      case 'wallet-sign': {
        const transaction = inputValues.transaction;
        if (!transaction) throw new Error('Transaction is required');
        
        if (!context.wallet.signTransaction) {
          throw new Error('Wallet does not support transaction signing');
        }
        
        const signedTransaction = await context.wallet.signTransaction(transaction);
        return { signedTransaction };
      }

      case 'wallet-sign-message': {
        const message = inputValues.message;
        if (!message) throw new Error('Message is required');
        
        if (!context.wallet.signMessage) {
          throw new Error('Wallet does not support message signing');
        }
        
        const messageBytes = new TextEncoder().encode(message);
        const signatureBytes = await context.wallet.signMessage(messageBytes);
        const signature = Buffer.from(signatureBytes).toString('base64');
        
        return { signature };
      }

      // ===== Transaction Nodes =====
      case 'create-transaction': {
        const feePayer = inputValues.feePayer;
        const blockhash = inputValues.blockhash;
        
        if (!feePayer) throw new Error('Fee payer is required');
        if (!blockhash) throw new Error('Blockhash is required');
        
        const transaction = new Transaction();
        transaction.feePayer = typeof feePayer === 'string' ? new PublicKey(feePayer) : feePayer;
        transaction.recentBlockhash = blockhash;
        
        return { transaction };
      }

      case 'add-instruction': {
        const transaction = inputValues.transaction;
        const instruction = inputValues.instruction;
        
        if (!transaction) throw new Error('Transaction is required');
        if (!instruction) throw new Error('Instruction is required');
        
        transaction.add(instruction);
        return { transaction };
      }

      case 'send-transaction': {
        const connection = inputValues.connection || context.connection;
        const transaction = inputValues.transaction;
        
        if (!connection) throw new Error('Connection is required');
        if (!transaction) throw new Error('Transaction is required');
        
        // Send transaction to blockchain
        const signature = await connection.sendRawTransaction(transaction.serialize());
        
        // Wait for confirmation
        const confirmation = await connection.confirmTransaction(signature, 'confirmed');
        
        return { 
          signature,
          confirmed: !confirmation.value.err,
          error: confirmation.value.err,
        };
      }

      case 'transfer-sol': {
        const from = inputValues.from;
        const to = inputValues.to;
        const amount = Number(inputValues.amount || 0);
        
        if (!from) throw new Error('From address is required');
        if (!to) throw new Error('To address is required');
        if (amount <= 0) throw new Error('Amount must be greater than 0');
        
        const fromPubkey = typeof from === 'string' ? new PublicKey(from) : from;
        const toPubkey = typeof to === 'string' ? new PublicKey(to) : to;
        const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
        
        const instruction = SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports,
        });
        
        return { instruction };
      }

      // ===== Token Nodes =====
      case 'get-token-accounts': {
        const connection = inputValues.connection || context.connection;
        const owner = inputValues.owner;
        
        if (!connection) throw new Error('Connection is required');
        if (!owner) throw new Error('Owner is required');
        
        const ownerPubkey = typeof owner === 'string' ? new PublicKey(owner) : owner;
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          ownerPubkey,
          { programId: TOKEN_PROGRAM_ID }
        );
        
        const accounts = tokenAccounts.value.map((account: any) => ({
          address: account.pubkey.toBase58(),
          mint: account.account.data.parsed?.info?.mint,
          amount: account.account.data.parsed?.info?.tokenAmount?.uiAmount,
          decimals: account.account.data.parsed?.info?.tokenAmount?.decimals,
        }));
        
        return { accounts };
      }

      case 'get-token-balance': {
        const connection = inputValues.connection || context.connection;
        const tokenAccount = inputValues.tokenAccount;
        
        if (!connection) throw new Error('Connection is required');
        if (!tokenAccount) throw new Error('Token account is required');
        
        const accountPubkey = typeof tokenAccount === 'string' ? new PublicKey(tokenAccount) : tokenAccount;
        const balance = await connection.getTokenAccountBalance(accountPubkey);
        
        return {
          balance: balance.value.uiAmount || 0,
          decimals: balance.value.decimals,
        };
      }

      case 'transfer-token': {
        const source = inputValues.source;
        const destination = inputValues.destination;
        const owner = inputValues.owner;
        const amount = Number(inputValues.amount || 0);
        
        if (!source) throw new Error('Source is required');
        if (!destination) throw new Error('Destination is required');
        if (!owner) throw new Error('Owner is required');
        if (amount <= 0) throw new Error('Amount must be greater than 0');
        
        const sourcePubkey = typeof source === 'string' ? new PublicKey(source) : source;
        const destPubkey = typeof destination === 'string' ? new PublicKey(destination) : destination;
        const ownerPubkey = typeof owner === 'string' ? new PublicKey(owner) : owner;
        
        const instruction = createTransferInstruction(
          sourcePubkey,
          destPubkey,
          ownerPubkey,
          amount
        );
        
        return { instruction };
      }

      case 'get-token-metadata': {
        const connection = inputValues.connection || context.connection;
        const mint = inputValues.mint;
        
        if (!connection) throw new Error('Connection is required');
        if (!mint) throw new Error('Mint address is required');
        
        const mintPubkey = typeof mint === 'string' ? new PublicKey(mint) : mint;
        
        try {
          // Get mint account info
          const mintInfo = await connection.getParsedAccountInfo(mintPubkey);
          const parsed = (mintInfo.value?.data as any)?.parsed;
          
          if (!parsed) {
            throw new Error('Not a valid token mint');
          }
          
          return {
            name: `Token ${mintPubkey.toBase58().slice(0, 8)}`,
            symbol: 'TOKEN',
            decimals: parsed.info?.decimals || 0,
            supply: parsed.info?.supply || 0,
          };
        } catch (error) {
          throw new Error('Failed to fetch token metadata');
        }
      }

      case 'get-token-info': {
        const connection = inputValues.connection || context.connection;
        const mint = inputValues.mint;
        
        if (!connection) throw new Error('Connection is required');
        if (!mint) throw new Error('Mint address is required');
        
        const mintPubkey = typeof mint === 'string' ? new PublicKey(mint) : mint;
        const accountInfo = await connection.getParsedAccountInfo(mintPubkey);
        const parsed = (accountInfo.value?.data as any)?.parsed;
        
        if (!parsed) {
          throw new Error('Not a valid token mint');
        }
        
        return {
          mintAuthority: parsed.info?.mintAuthority || null,
          freezeAuthority: parsed.info?.freezeAuthority || null,
          supply: parsed.info?.supply || 0,
          decimals: parsed.info?.decimals || 0,
        };
      }

      case 'check-token-holders': {
        const connection = inputValues.connection || context.connection;
        const mint = inputValues.mint;
        
        if (!connection) throw new Error('Connection is required');
        if (!mint) throw new Error('Mint address is required');
        
        const mintPubkey = typeof mint === 'string' ? new PublicKey(mint) : mint;
        
        // Get all token accounts for this mint
        const tokenAccounts = await connection.getParsedProgramAccounts(
          TOKEN_PROGRAM_ID,
          {
            filters: [
              { dataSize: 165 },
              {
                memcmp: {
                  offset: 0,
                  bytes: mintPubkey.toBase58(),
                },
              },
            ],
          }
        );
        
        const holders = tokenAccounts
          .map((acc: any) => ({
            owner: acc.account.data.parsed?.info?.owner,
            amount: acc.account.data.parsed?.info?.tokenAmount?.uiAmount,
          }))
          .filter((h: any) => h.amount > 0);
        
        return {
          holders,
          count: holders.length,
        };
      }

      case 'check-swap-routes': {
        const inputMint = inputValues.inputMint;
        const outputMint = inputValues.outputMint;
        const amount = Number(inputValues.amount || 0);
        
        if (!inputMint) throw new Error('Input mint is required');
        if (!outputMint) throw new Error('Output mint is required');
        if (amount <= 0) throw new Error('Amount must be greater than 0');
        
        // Call Jupiter API for real swap routes
        try {
          const response = await fetch(
            `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}`
          );
          
          if (!response.ok) {
            throw new Error('Jupiter API request failed');
          }
          
          const data = await response.json();
          
          return {
            routes: data.data || [],
            bestRoute: data.data?.[0] || null,
            priceImpact: data.data?.[0]?.priceImpactPct || 0,
          };
        } catch (error) {
          // Fallback to basic info if Jupiter API fails
          return {
            routes: [],
            bestRoute: null,
            error: 'Could not fetch routes. Jupiter API may be unavailable.',
          };
        }
      }

      case 'check-liquidity-pools': {
        const connection = inputValues.connection || context.connection;
        const mint = inputValues.mint;
        
        if (!connection) throw new Error('Connection is required');
        if (!mint) throw new Error('Mint address is required');
        
        const mintPubkey = typeof mint === 'string' ? new PublicKey(mint) : mint;
        
        // Query for token accounts that might be pool accounts
        // This is a basic implementation - full integration would use Raydium/Orca SDKs
        try {
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
            mintPubkey,
            { programId: TOKEN_PROGRAM_ID }
          );
          
          return {
            pools: tokenAccounts.value.map((acc: any) => ({
              address: acc.pubkey.toBase58(),
              mint: mintPubkey.toBase58(),
              balance: acc.account.data.parsed?.info?.tokenAmount?.uiAmount || 0,
            })),
            totalLiquidity: tokenAccounts.value.reduce((sum: number, acc: any) => {
              return sum + (acc.account.data.parsed?.info?.tokenAmount?.uiAmount || 0);
            }, 0),
            note: 'Basic pool detection. For full DEX integration, use Raydium/Orca SDK',
          };
        } catch (error) {
          return {
            pools: [],
            totalLiquidity: 0,
            error: 'Failed to query liquidity pools',
          };
        }
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

      // ===== Loop Nodes =====
      case 'loop-for-each': {
        const array = inputValues.array;
        if (!Array.isArray(array)) {
          throw new Error('Input must be an array');
        }
        
        // Return the last item and all results
        // Note: In a full implementation, this would trigger downstream nodes for each item
        const results = array.map((item, index) => ({ item, index }));
        return {
          item: array[array.length - 1],
          index: array.length - 1,
          result: results,
        };
      }

      case 'loop-repeat': {
        const times = Number(inputValues.times || values?.times || 1);
        const value = inputValues.value;
        
        const results = [];
        for (let i = 0; i < times; i++) {
          results.push(value);
        }
        
        return {
          index: times - 1,
          results,
        };
      }

      case 'loop-range': {
        const start = Number(inputValues.start || values?.start || 0);
        const end = Number(inputValues.end || values?.end || 10);
        const step = Number(inputValues.step || values?.step || 1);
        
        const array = [];
        for (let i = start; i < end; i += step) {
          array.push(i);
        }
        
        return { array };
      }

      case 'array-length': {
        const array = inputValues.array;
        if (!Array.isArray(array)) {
          throw new Error('Input must be an array');
        }
        return { length: array.length };
      }

      case 'array-get-item': {
        const array = inputValues.array;
        const index = Number(inputValues.index || values?.index || 0);
        
        if (!Array.isArray(array)) {
          throw new Error('Input must be an array');
        }
        if (index < 0 || index >= array.length) {
          throw new Error(`Index ${index} out of bounds (array length: ${array.length})`);
        }
        
        return { item: array[index] };
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
        const outputId = edge.sourceHandle;
        const inputId = edge.targetHandle;
        
        if (outputId && sourceResult[outputId] !== undefined) {
          inputValues[inputId] = sourceResult[outputId];
        } else {
          // Fallback: use first available value from source result
          const firstValue = Object.values(sourceResult)[0];
          if (firstValue !== undefined) {
            inputValues[inputId] = firstValue;
          }
        }
      }
    }
  }

  // Merge with node's own input values (from properties panel)
  if (node.data.values) {
    Object.assign(inputValues, node.data.values);
  }

  return inputValues;
}

