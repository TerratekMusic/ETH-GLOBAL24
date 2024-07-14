#![no_std]

use gmeta::{In, InOut, Metadata, Out};
use gstd::{ActorId, collections::BTreeMap, Decode, Encode, exec, msg, prelude::*, TypeInfo};

const DECIMALS_FACTOR: u128 = 10_u128.pow(6);

#[derive(Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct InitFT {
    pub stablecoin: ActorId,
}

#[derive(Debug, Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum FTAction {
    Mint(u128),
    Burn(u128),
    Transfer {
        from: ActorId,
        to: ActorId,
        amount: u128,
    },
    Approve {
        to: ActorId,
        amount: u128,
    },
    TotalSupply,
    BalanceOf(ActorId),
}

#[derive(Encode, Decode, TypeInfo)]
pub enum FTEvent {
    Ok,
    Err,
    Balance(u128),
    PermitId(u128),
}

#[derive(Debug, Clone, Encode, Decode, TypeInfo)]
pub struct InitBond {
    pub stablecoin_address: ActorId,
    pub bond_address: ActorId,
    pub price: u128,
}

#[derive(Debug, Clone, Encode, Decode, TypeInfo)]
pub enum BondAction {
    BuyBond(u128),
}

#[derive(Debug, Clone, Encode, Decode, TypeInfo)]
pub enum BondEvent {
    Ok,
    Err,
    BondBought(u128),
    Ptokens(u128),
    BondValue(u128),
    BondBalance(u128),
    PtokenBalance(u128),
}

#[derive(Debug, Clone, Encode, Decode, TypeInfo)]
pub enum Error {
    ZeroAmount,
    InvalidAmount,
    UserNotFound,
    TransferFailed,
    AlreadyEmitted,
}

#[derive(Debug, Clone, Encode, Decode, TypeInfo, Default)]
pub struct BondHolder {
    pub p_balance: u128,
    pub emitted: bool,
}

pub struct ContractMetadata;

impl Metadata for ContractMetadata {
    type Init = In<InitBond>;
    type Handle = InOut<BondAction, BondEvent>;
    type Reply = ();
    type Others = ();
    type Signal = ();
    type State = Out<Bond>;
}

#[derive(Default, Debug, Clone, Encode, Decode, TypeInfo)]
pub struct Bond {
    pub owner: ActorId,
    pub stablecoin_address: ActorId,
    pub bond_address: ActorId,
    pub p_token_address: ActorId,
    pub bonds_emitted: u128,
    pub price: u128,
    pub vesting_block: u32,
    pub total_deposited: u128,
    pub bond_holders: BTreeMap<ActorId, BondHolder>,
}

impl Bond {
    pub async fn buy_bond(&mut self, user: ActorId, amount_in_stablecoin: u128) -> Result<BondEvent, Error> {
        let bond_holder = self.bond_holders.entry(user).or_insert(BondHolder {
            p_balance: 0,
            emitted: false,
        });
        if amount_in_stablecoin == 0 {
            return Err(Error::ZeroAmount);
        }
        if bond_holder.emitted {
            return Err(Error::AlreadyEmitted);
        }

        let p_tokens_deal = amount_in_stablecoin / self.price;
        let token_address = self.stablecoin_address;
        let bond_address = self.bond_address;

        match Bond::transfer_tokens(&token_address, exec::program_id(), msg::source(), amount_in_stablecoin).await {
            Ok(()) => {
                bond_holder.p_balance = bond_holder.p_balance.saturating_add(p_tokens_deal * DECIMALS_FACTOR);

                let payload = FTAction::Transfer {
                    from: exec::program_id(),
                    to: msg::source(),
                    amount: p_tokens_deal,
                };

                msg::send_delayed(bond_address, payload, 0, 15)
                    .map_err(|_| Error::TransferFailed)?;

                Ok(BondEvent::BondBought(amount_in_stablecoin))
            },
            Err(e) => Err(e),
        }
    }

    async fn transfer_tokens(token_address: &ActorId, from: ActorId, to: ActorId, amount: u128) -> Result<(), Error> {
        let payload = FTAction::Transfer { from, to, amount };
        let result = msg::send_for_reply_as(*token_address, payload, 0, 0)
            .map_err(|_| Error::TransferFailed)?
            .await
            .map_err(|_| Error::TransferFailed)?;
        match result {
            FTEvent::Err => Err(Error::TransferFailed),
            _ => Ok(()),
        }
    }
}