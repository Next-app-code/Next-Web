/**
 * Token-Based Payment Client (Reference Implementation)
 * 
 * This file contains client-side code for interacting with the payment program.
 * NOT integrated into the main app - use as reference for building payment flows.
 */

import { 
  Connection, 
  PublicKey, 
  Transaction,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';

// Replace with your deployed program ID
const PAYMENT_PROGRAM_ID = new PublicKey('11111111111111111111111111111111');

/**
 * Derive config PDA
 */
export function getConfigPDA(
  authority: PublicKey,
  programId: PublicKey = PAYMENT_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('config'), authority.toBuffer()],
    programId
  );
}

/**
 * Derive payment PDA
 */
export function getPaymentPDA(
  payer: PublicKey,
  recipient: PublicKey,
  programId: PublicKey = PAYMENT_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('payment'), payer.toBuffer(), recipient.toBuffer()],
    programId
  );
}

/**
 * Create initialize config instruction
 */
export function createInitializeConfigInstruction(
  authority: PublicKey,
  acceptedMint: PublicKey,
  feeRecipient: PublicKey,
  feeBps: number
): TransactionInstruction {
  const [configPDA] = getConfigPDA(authority);
  
  const data = Buffer.alloc(3);
  data.writeUInt8(0, 0); // variant
  data.writeUInt16LE(feeBps, 1);
  
  return new TransactionInstruction({
    keys: [
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: configPDA, isSigner: false, isWritable: true },
      { pubkey: acceptedMint, isSigner: false, isWritable: false },
      { pubkey: feeRecipient, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PAYMENT_PROGRAM_ID,
    data,
  });
}

/**
 * Create process payment instruction
 */
export function createProcessPaymentInstruction(
  payer: PublicKey,
  recipient: PublicKey,
  payerTokenAccount: PublicKey,
  recipientTokenAccount: PublicKey,
  feeTokenAccount: PublicKey | null,
  mint: PublicKey,
  amount: number,
  memo: string = ''
): TransactionInstruction {
  const [paymentPDA] = getPaymentPDA(payer, recipient);
  
  // Serialize data
  const memoBuffer = Buffer.from(memo);
  const data = Buffer.alloc(1 + 8 + 4 + memoBuffer.length);
  let offset = 0;
  
  data.writeUInt8(1, offset); // variant
  offset += 1;
  
  data.writeBigUInt64LE(BigInt(amount), offset);
  offset += 8;
  
  data.writeUInt32LE(memoBuffer.length, offset);
  offset += 4;
  
  memoBuffer.copy(data, offset);
  
  const keys = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: paymentPDA, isSigner: false, isWritable: true },
    { pubkey: payerTokenAccount, isSigner: false, isWritable: true },
    { pubkey: recipientTokenAccount, isSigner: false, isWritable: true },
  ];
  
  if (feeTokenAccount) {
    keys.push({ pubkey: feeTokenAccount, isSigner: false, isWritable: true });
  }
  
  keys.push(
    { pubkey: recipient, isSigner: false, isWritable: false },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false }
  );
  
  return new TransactionInstruction({
    keys,
    programId: PAYMENT_PROGRAM_ID,
    data,
  });
}

/**
 * Execute payment
 */
export async function executePayment(
  connection: Connection,
  payer: PublicKey,
  recipient: PublicKey,
  mint: PublicKey,
  amount: number,
  memo?: string,
  signTransaction?: (tx: Transaction) => Promise<Transaction>
): Promise<string> {
  if (!signTransaction) {
    throw new Error('Wallet signing function required');
  }
  
  // Get token accounts
  const payerTokenAccount = await getAssociatedTokenAddress(mint, payer);
  const recipientTokenAccount = await getAssociatedTokenAddress(mint, recipient);
  
  // Create instruction
  const instruction = createProcessPaymentInstruction(
    payer,
    recipient,
    payerTokenAccount,
    recipientTokenAccount,
    null, // no fee account for now
    mint,
    amount,
    memo || ''
  );
  
  // Create transaction
  const transaction = new Transaction().add(instruction);
  transaction.feePayer = payer;
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  
  // Sign and send
  const signed = await signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize());
  
  // Confirm
  await connection.confirmTransaction(signature, 'confirmed');
  
  return signature;
}

/**
 * Fetch payment record from on-chain
 */
export async function getPaymentRecord(
  connection: Connection,
  payer: PublicKey,
  recipient: PublicKey
): Promise<any> {
  const [paymentPDA] = getPaymentPDA(payer, recipient);
  
  const accountInfo = await connection.getAccountInfo(paymentPDA);
  
  if (!accountInfo) {
    return null;
  }
  
  // Deserialize payment data (simplified)
  const data = accountInfo.data;
  
  return {
    recipient: new PublicKey(data.slice(0, 32)),
    mint: new PublicKey(data.slice(32, 64)),
    amount: Number(data.readBigUInt64LE(64)),
    payer: new PublicKey(data.slice(72, 104)),
    timestamp: Number(data.readBigInt64LE(104)),
    status: data.readUInt8(112),
  };
}

// Export all functions
export const PaymentClient = {
  getConfigPDA,
  getPaymentPDA,
  createInitializeConfigInstruction,
  createProcessPaymentInstruction,
  executePayment,
  getPaymentRecord,
};

