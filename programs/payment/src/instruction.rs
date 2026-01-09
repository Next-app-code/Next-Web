use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    instruction::{AccountMeta, Instruction},
    program_error::ProgramError,
    pubkey::Pubkey,
    system_program, sysvar,
};

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub enum PaymentInstruction {
    /// Initialize payment configuration
    ///
    /// Accounts expected:
    /// 0. `[writable, signer]` Authority account
    /// 1. `[writable]` Payment config account (PDA)
    /// 2. `[]` Accepted token mint
    /// 3. `[]` Fee recipient
    /// 4. `[]` System program
    InitializeConfig {
        fee_bps: u16,
    },
    
    /// Create a new payment
    ///
    /// Accounts expected:
    /// 0. `[writable, signer]` Payer account
    /// 1. `[writable]` Payment account (PDA)
    /// 2. `[writable]` Payer token account
    /// 3. `[writable]` Recipient token account
    /// 4. `[writable]` Fee recipient token account (optional)
    /// 5. `[]` Recipient
    /// 6. `[]` Token mint
    /// 7. `[]` Token program
    /// 8. `[]` System program
    /// 9. `[]` Clock sysvar
    ProcessPayment {
        amount: u64,
        memo: String,
    },
    
    /// Refund a payment
    ///
    /// Accounts expected:
    /// 0. `[writable, signer]` Authority account
    /// 1. `[writable]` Payment account
    /// 2. `[writable]` Recipient token account
    /// 3. `[writable]` Payer token account
    /// 4. `[]` Token program
    RefundPayment,
}

impl PaymentInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (&variant, rest) = input
            .split_first()
            .ok_or(ProgramError::InvalidInstructionData)?;
        
        Ok(match variant {
            0 => Self::InitializeConfig {
                fee_bps: u16::from_le_bytes(
                    rest.get(..2)
                        .and_then(|slice| slice.try_into().ok())
                        .ok_or(ProgramError::InvalidInstructionData)?,
                ),
            },
            1 => {
                let payload = PaymentPayload::try_from_slice(rest)
                    .map_err(|_| ProgramError::InvalidInstructionData)?;
                Self::ProcessPayment {
                    amount: payload.amount,
                    memo: payload.memo,
                }
            }
            2 => Self::RefundPayment,
            _ => return Err(ProgramError::InvalidInstructionData),
        })
    }
}

#[derive(BorshSerialize, BorshDeserialize)]
struct PaymentPayload {
    amount: u64,
    memo: String,
}

/// Helper to create initialize config instruction
pub fn initialize_config(
    program_id: &Pubkey,
    authority: &Pubkey,
    accepted_mint: &Pubkey,
    fee_recipient: &Pubkey,
    fee_bps: u16,
) -> Instruction {
    let (config_pda, _bump) = Pubkey::find_program_address(
        &[b"config", authority.as_ref()],
        program_id,
    );
    
    let mut data = vec![0u8]; // variant
    data.extend_from_slice(&fee_bps.to_le_bytes());
    
    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new(*authority, true),
            AccountMeta::new(config_pda, false),
            AccountMeta::new_readonly(*accepted_mint, false),
            AccountMeta::new_readonly(*fee_recipient, false),
            AccountMeta::new_readonly(system_program::id(), false),
        ],
        data,
    }
}

/// Helper to create process payment instruction
pub fn process_payment(
    program_id: &Pubkey,
    payer: &Pubkey,
    recipient: &Pubkey,
    payer_token_account: &Pubkey,
    recipient_token_account: &Pubkey,
    fee_token_account: Option<&Pubkey>,
    mint: &Pubkey,
    amount: u64,
    memo: String,
) -> Instruction {
    let (payment_pda, _bump) = Pubkey::find_program_address(
        &[b"payment", payer.as_ref(), recipient.as_ref()],
        program_id,
    );
    
    let payload = PaymentPayload { amount, memo };
    let mut data = vec![1u8]; // variant
    data.extend_from_slice(&payload.try_to_vec().unwrap());
    
    let mut accounts = vec![
        AccountMeta::new(*payer, true),
        AccountMeta::new(payment_pda, false),
        AccountMeta::new(*payer_token_account, false),
        AccountMeta::new(*recipient_token_account, false),
    ];
    
    if let Some(fee_acc) = fee_token_account {
        accounts.push(AccountMeta::new(*fee_acc, false));
    }
    
    accounts.extend_from_slice(&[
        AccountMeta::new_readonly(*recipient, false),
        AccountMeta::new_readonly(*mint, false),
        AccountMeta::new_readonly(spl_token::id(), false),
        AccountMeta::new_readonly(system_program::id(), false),
        AccountMeta::new_readonly(sysvar::clock::id(), false),
    ]);
    
    Instruction {
        program_id: *program_id,
        accounts,
        data,
    }
}

