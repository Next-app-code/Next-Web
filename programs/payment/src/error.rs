use solana_program::program_error::ProgramError;
use thiserror::Error;

#[derive(Error, Debug, Copy, Clone)]
pub enum PaymentError {
    #[error("Invalid instruction")]
    InvalidInstruction,
    
    #[error("Not rent exempt")]
    NotRentExempt,
    
    #[error("Insufficient funds")]
    InsufficientFunds,
    
    #[error("Invalid token mint")]
    InvalidMint,
    
    #[error("Invalid payment amount")]
    InvalidAmount,
    
    #[error("Payment already processed")]
    AlreadyProcessed,
    
    #[error("Payment expired")]
    PaymentExpired,
    
    #[error("Unauthorized")]
    Unauthorized,
    
    #[error("Invalid recipient")]
    InvalidRecipient,
}

impl From<PaymentError> for ProgramError {
    fn from(e: PaymentError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

