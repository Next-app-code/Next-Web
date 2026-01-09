use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct Payment {
    /// Recipient of the payment
    pub recipient: Pubkey,
    
    /// Token mint address
    pub mint: Pubkey,
    
    /// Payment amount (in token units)
    pub amount: u64,
    
    /// Payer who made the payment
    pub payer: Pubkey,
    
    /// Timestamp of payment
    pub timestamp: i64,
    
    /// Payment status: 0 = pending, 1 = completed, 2 = refunded
    pub status: u8,
    
    /// Optional memo/description
    pub memo: [u8; 64],
}

impl Payment {
    pub const LEN: usize = 32 + 32 + 8 + 32 + 8 + 1 + 64;
    
    pub fn is_completed(&self) -> bool {
        self.status == 1
    }
    
    pub fn is_refunded(&self) -> bool {
        self.status == 2
    }
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct PaymentConfig {
    /// Authority who can manage payments
    pub authority: Pubkey,
    
    /// Accepted token mint
    pub accepted_mint: Pubkey,
    
    /// Fee percentage (basis points, e.g., 100 = 1%)
    pub fee_bps: u16,
    
    /// Fee recipient
    pub fee_recipient: Pubkey,
    
    /// Bump seed for PDA
    pub bump: u8,
}

impl PaymentConfig {
    pub const LEN: usize = 32 + 32 + 2 + 32 + 1;
}

