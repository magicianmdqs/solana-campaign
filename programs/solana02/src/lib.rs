use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;

declare_id!("6zZeL7zABHPj2H3RsfAm8mqTPqjRMKdsZbBMg5NxnSof");


#[program]
pub mod solana02 {
    use super::*;
    pub fn store_obj(
        ctx: Context<JSON>,
        name: String,
        desc: String,
        symbol: String,
        image: String,
    ) -> ProgramResult {
        let obj = &mut ctx.accounts.stored_data;
        obj.name = name;
        obj.desc = desc;
        obj.image = image;
        obj.symbol = symbol;
        obj.boss = *ctx.accounts.user.key;
        Ok(())
    }
    pub fn update_obj(
        ctx: Context<UpdateJSON>,
        name: Option<String>,
        desc: Option<String>,
        symbol: Option<String>,
        image: Option<String>,
    ) -> ProgramResult {
        let obj = &mut ctx.accounts.stored_data;

        // Update only the fields provided
        if let Some(n) = name { obj.name = n; }
        if let Some(d) = desc { obj.desc = d; }
        if let Some(s) = symbol { obj.symbol = s; }
        if let Some(i) = image { obj.image = i; }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct JSON<'info> {
    #[account(init, payer=user, space=800)]
    pub stored_data: Account<'info, JsonObj>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct JsonObj {
    pub name: String,
    pub desc: String,
    pub image: String,
    pub symbol: String,
    boss: Pubkey,
}

#[derive(Accounts)]
pub struct UpdateJSON<'info> {
    #[account(mut, constraint = stored_data.boss == *user.key @ ErrorCode::Unauthorized)]
    pub stored_data: Account<'info, JsonObj>,

    pub user: Signer<'info>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("You are not authorized to modify this object.")]
    Unauthorized,
}
