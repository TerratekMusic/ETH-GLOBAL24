#![no_std]

use gstd::{ msg, prelude::*};

use io::{Bond, BondAction, InitBond};

static mut BOND: Option<Bond> = None;

#[no_mangle]
extern fn init() {
    let config: InitBond = msg::load().expect("Unable to decode InitConfig");

    let bond = Bond {
        owner: msg::source(),
        stablecoin_address: config.stablecoin_address,
        bond_address: config.bond_address,
        price: config.price,
        ..Default::default()
    };

    unsafe {
        BOND = Some(bond);
    };
}

#[gstd::async_main]
async fn main() {
    let bond = unsafe { BOND.as_mut().expect("Bond not initialized") };
    let action: BondAction = msg::load().expect("Unable to decode BondAction");
    let msg_source = msg::source();

    match action {
        BondAction::BuyBond(amount) => {
            bond.buy_bond(msg_source, amount).await.expect("Unable to execute buy_bond function");
        }
    }
}

#[no_mangle]
extern fn state() {
    let bond = unsafe { BOND.take().expect("Unexpected error in taking state") };

    msg::reply::<Bond>(bond.clone(), 0)
        .expect("Failed to encode or reply with LiquidityPool from state()");
    unsafe { BOND = Some(bond) };
}