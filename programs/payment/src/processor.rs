use borsh::BorshDeserialize;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    program_pack::Pack,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
    clock::Clock,
};
use spl_token::state::Account as TokenAccount;

use crate::{error::PaymentError, instruction::PaymentInstruction, state::{Payment, PaymentConfig}};

pub struct Processor;

impl Processor {
    pub fn process(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction = PaymentInstruction::unpack(instruction_data)?;
        
        match instruction {
            PaymentInstruction::InitializeConfig { fee_bps } => {
                msg!("Instruction: InitializeConfig");
                Self::process_initialize_config(program_id, accounts, fee_bps)
            }
            PaymentInstruction::ProcessPayment { amount, memo } => {
                msg!("Instruction: ProcessPayment");
                Self::process_payment(program_id, accounts, amount, memo)
            }
            PaymentInstruction::RefundPayment => {
                msg!("Instruction: RefundPayment");
                Self::process_refund(program_id, accounts)
            }
        }
    }
    
    fn process_initialize_config(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        fee_bps: u16,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let authority_info = next_account_info(account_info_iter)?;
        let config_info = next_account_info(account_info_iter)?;
        let mint_info = next_account_info(account_info_iter)?;
        let fee_recipient_info = next_account_info(account_info_iter)?;
        let system_program_info = next_account_info(account_info_iter)?;
        
        if !authority_info.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }
        
        // Derive PDA
        let (config_pda, bump) = Pubkey::find_program_address(
            &[b"config", authority_info.key.as_ref()],
            program_id,
        );
        
        if config_pda != *config_info.key {
            return Err(ProgramError::InvalidSeeds);
        }
        
        // Create config account
        let rent = Rent::get()?;
        let space = PaymentConfig::LEN;
        let lamports = rent.minimum_balance(space);
        
        invoke_signed(
            &system_instruction::create_account(
                authority_info.key,
                config_info.key,
                lamports,
                space as u64,
                program_id,
            ),
            &[authority_info.clone(), config_info.clone(), system_program_info.clone()],
            &[&[b"config", authority_info.key.as_ref(), &[bump]]],
        )?;
        
        // Initialize config data
        let config = PaymentConfig {
            authority: *authority_info.key,
            accepted_mint: *mint_info.key,
            fee_bps,
            fee_recipient: *fee_recipient_info.key,
            bump,
        };
        
        config.serialize(&mut &mut config_info.data.borrow_mut()[..])?;
        
        msg!("Payment config initialized");
        Ok(())
    }
    
    fn process_payment(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        amount: u64,
        memo: String,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let payer_info = next_account_info(account_info_iter)?;
        let payment_info = next_account_info(account_info_iter)?;
        let payer_token_info = next_account_info(account_info_iter)?;
        let recipient_token_info = next_account_info(account_info_iter)?;
        let fee_token_info = next_account_info(account_info_iter).ok();
        let recipient_info = next_account_info(account_info_iter)?;
        let mint_info = next_account_info(account_info_iter)?;
        let token_program_info = next_account_info(account_info_iter)?;
        let system_program_info = next_account_info(account_info_iter)?;
        let clock_info = next_account_info(account_info_iter)?;
        
        if !payer_info.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }
        
        if amount == 0 {
            return Err(PaymentError::InvalidAmount.into());
        }
        
        // Verify token accounts
        let payer_token_account = TokenAccount::unpack(&payer_token_info.data.borrow())?;
        let recipient_token_account = TokenAccount::unpack(&recipient_token_info.data.borrow())?;
        
        if payer_token_account.mint != *mint_info.key {
            return Err(PaymentError::InvalidMint.into());
        }
        if recipient_token_account.mint != *mint_info.key {
            return Err(PaymentError::InvalidMint.into());
        }
        
        // Check sufficient balance
        if payer_token_account.amount < amount {
            return Err(PaymentError::InsufficientFunds.into());
        }
        
        // Calculate fee (if fee account provided)
        let (payment_amount, fee_amount) = if fee_token_info.is_some() {
            let fee = (amount as u128 * 100 as u128) / 10000 as u128; // 1% default
            ((amount - fee as u64), fee as u64)
        } else {
            (amount, 0)
        };
        
        // Transfer main payment
        invoke(
            &spl_token::instruction::transfer(
                token_program_info.key,
                payer_token_info.key,
                recipient_token_info.key,
                payer_info.key,
                &[],
                payment_amount,
            )?,
            &[
                payer_token_info.clone(),
                recipient_token_info.clone(),
                payer_info.clone(),
                token_program_info.clone(),
            ],
        )?;
        
        // Transfer fee if applicable
        if let Some(fee_info) = fee_token_info {
            if fee_amount > 0 {
                invoke(
                    &spl_token::instruction::transfer(
                        token_program_info.key,
                        payer_token_info.key,
                        fee_info.key,
                        payer_info.key,
                        &[],
                        fee_amount,
                    )?,
                    &[
                        payer_token_info.clone(),
                        fee_info.clone(),
                        payer_info.clone(),
                        token_program_info.clone(),
                    ],
                )?;
            }
        }
        
        // Create payment record
        let (payment_pda, bump) = Pubkey::find_program_address(
            &[b"payment", payer_info.key.as_ref(), recipient_info.key.as_ref()],
            program_id,
        );
        
        if payment_pda != *payment_info.key {
            return Err(ProgramError::InvalidSeeds);
        }
        
        let rent = Rent::get()?;
        let space = Payment::LEN;
        let lamports = rent.minimum_balance(space);
        
        invoke_signed(
            &system_instruction::create_account(
                payer_info.key,
                payment_info.key,
                lamports,
                space as u64,
                program_id,
            ),
            &[payer_info.clone(), payment_info.clone(), system_program_info.clone()],
            &[&[b"payment", payer_info.key.as_ref(), recipient_info.key.as_ref(), &[bump]]],
        )?;
        
        // Save payment data
        let clock = Clock::from_account_info(clock_info)?;
        let mut memo_bytes = [0u8; 64];
        let memo_slice = memo.as_bytes();
        let copy_len = memo_slice.len().min(64);
        memo_bytes[..copy_len].copy_from_slice(&memo_slice[..copy_len]);
        
        let payment = Payment {
            recipient: *recipient_info.key,
            mint: *mint_info.key,
            amount,
            payer: *payer_info.key,
            timestamp: clock.unix_timestamp,
            status: 1, // completed
            memo: memo_bytes,
        };
        
        payment.serialize(&mut &mut payment_info.data.borrow_mut()[..])?;
        
        msg!("Payment processed: {} tokens", amount);
        Ok(())
    }
    
    fn process_refund(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let authority_info = next_account_info(account_info_iter)?;
        let payment_info = next_account_info(account_info_iter)?;
        let recipient_token_info = next_account_info(account_info_iter)?;
        let payer_token_info = next_account_info(account_info_iter)?;
        let token_program_info = next_account_info(account_info_iter)?;
        
        if !authority_info.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }
        
        // Load payment
        let mut payment = Payment::try_from_slice(&payment_info.data.borrow())?;
        
        if payment.is_refunded() {
            return Err(PaymentError::AlreadyProcessed.into());
        }
        
        // Transfer tokens back
        invoke(
            &spl_token::instruction::transfer(
                token_program_info.key,
                recipient_token_info.key,
                payer_token_info.key,
                authority_info.key,
                &[],
                payment.amount,
            )?,
            &[
                recipient_token_info.clone(),
                payer_token_info.clone(),
                authority_info.clone(),
                token_program_info.clone(),
            ],
        )?;
        
        // Update status
        payment.status = 2; // refunded
        payment.serialize(&mut &mut payment_info.data.borrow_mut()[..])?;
        
        msg!("Payment refunded: {} tokens", payment.amount);
        Ok(())
    }
}

