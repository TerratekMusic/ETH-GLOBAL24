#![no_std]

use gstd::{ActorId, collections::BTreeMap, debug, exec, msg, prelude::*};

use io::{BondEvent, BondAction, FTAction, FTEvent, Error, BondHolder, InitBond};

#[derive(Debug, Clone, Default, Encode)]
struct Bond {
    pub owner: ActorId,
    pub stablecoin_address: ActorId,
    pub bonds_emmited: u128,
    pub total_deposited: u128,
    pub bond_holders: BTreeMap<ActorId, BondHolder>,
    pub price: u128,
}

const DECIMALS_FACTOR: u128 = 10_u128.pow(6);

static mut BOND: Option<Bond> = None;


#[no_mangle]
extern fn init() {

let config: InitBond = msg::load().expect("Unable to decode InitConfig");

let bond = Bond {
    owner: msg::sender(),
    stablecoin_address: config.stablecoin_address,
    price: config.price,
    ..Default::default()
};

unsafe {BOND = Some(bond) };

}

#[gstd::async_main]
async fn main() {
    let mut bond = unsafe { BOND.as_mut().expect("Bond not initialized") };

    let action: BondAction = msg::load().expect("Unable to decode BondAction");

    let result = match action {
        BondAction::BuyBond(amount) => buy_bond(&mut bond, amount).await,
        BondAction::LiberatePtokens(amount) => liberate_ptokens(&mut bond, amount).await,
    };

    msg::send(event).expect("Unable to send BondEvent");

}

imp Bond {
    async fn buy_bond(&mut self, user: ActorId, amount_in_stablecoin: u128) -> Result<BondEvent, Error> {
        if amount_in_stablecoin == 0 {
            return BondEvent::Err(Error::ZeroAmount);
        }

        let bond_holder = self.bond_holder.entry(user).or_insert(BondHolder {
            pub p_balance:0 ,
            pub emmited: false,
        });

        

        let token_address = self.stablecoin_address;
        let result = self.transfer_tokens_to_contract(&token_address, amount_in_stablecoin).await?;
        msg::send(user, result, 0).expect("Msg failed");
        Ok(BondEvent::BondBought(amount_in_stablecoin));

    }

    async fn liberate_ptokens(&mut self, amount: u128) -> BondEvent {
        if amount == 0 {
            return BondEvent::Err(Error::ZeroAmount);
        }

        let sender = msg::sender();
        let holder = self.bonding_holders.get_mut(&sender).expect("User not found");

        if holder.p_balance < amount {
            return BondEvent::Err(Error::InvalidAmount);
        }

        let ft_action = FTAction::Transfer {
            recipient: sender,
            amount: amount,
        };

        let ft_event = exec::ft_transfer_call(ft_action).await.expect("FT transfer failed");

        if let FTEvent::Transfer { sender, recipient, amount } = ft_event {
            if sender != self.stablecoin_address || recipient != sender || amount != amount {
                return BondEvent::Err(Error::TransferFailed);
            }
        }

        holder.p_balance -= amount;
        holder.price = self.calculate_price(&holder);
        self.total_deposited -= amount;
        self.bonds_emmited -= amount;

        BondEvent::Ok
    }

   