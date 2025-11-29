use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::entrypoint::ProgramResult;
use ProgramError::{IncorrectProgramId, InsufficientFunds};

declare_id!("51yDLUXvtS8b3e9dsiDvgsQDRgyayCMqMnzY3JU6JDCF");
pub static OWNER:Pubkey=pubkey!("3hEoJtuKopiYuqVN49xpkfG7hrRgAUFUTf2spiiZbFnt");

#[program]
pub mod my_program {
    use super::*;
    pub fn create(ctx: Context<Create>, name: String, desc: String) -> ProgramResult {
        let campaign = &mut ctx.accounts.campaign;
        campaign.name = name;
        campaign.desc = desc;
        campaign.amount_donated = 0;
        campaign.admin = *ctx.accounts.user.key;
        campaign.rent_bal=Rent::get()?.minimum_balance(campaign.to_account_info().data_len());
        Ok(())
    }

    pub fn withdrawal(ctx: Context<Withdrawal>) -> ProgramResult {
        let campaign = &mut ctx.accounts.campaign;
        campaign.rent_bal=Rent::get()?.minimum_balance(campaign.to_account_info().data_len());
        let user = &mut ctx.accounts.user;
        if campaign.admin == *user.key || *user.key==OWNER {

            let rent_bal = Rent::get()?.minimum_balance(campaign.to_account_info().data_len());

            let mut amount:u64=**campaign.to_account_info().lamports.borrow();
            if rent_bal>=amount {
                return Err(ProgramError::from(Error::from(IncorrectProgramId)));
            }
            amount-=rent_bal;

            **campaign.to_account_info().try_borrow_mut_lamports()? -= amount;
            **user.to_account_info().try_borrow_mut_lamports()? += amount;

        } else {return Err(ProgramError::from(Error::from(IncorrectProgramId)));}
        Ok(())
    }

    pub fn donate(ctx: Context<Donate>, amount: u64) -> ProgramResult {
        let ix = system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.campaign.key(),
            amount,
        );
        invoke(
            &ix,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.campaign.to_account_info(),
            ]
        )?;
        (&mut ctx.accounts.campaign).amount_donated+=amount;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Withdrawal<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,

    #[account(mut)]
    pub user: Signer<'info>,
}
#[derive(Accounts)]
pub struct Donate<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct Create<'info> {
    #[account(init, payer=user, space=9000, seeds=[b"CAMPAIGN_DEMO".as_ref(), user.key().as_ref()], bump)]
    pub campaign: Account<'info, Campaign>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Campaign {
    pub admin: Pubkey,
    pub name: String,
    pub desc: String,
    pub amount_donated: u64,
    pub rent_bal:u64
}
