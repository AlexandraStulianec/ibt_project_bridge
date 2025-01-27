module ibt_token::ibt {
    use sui::tx_context::TxContext;
    use sui::object::{UID, new};
    use sui::transfer;
    use sui::coin;
    use std::option::{Option, none};


    public struct IBT has key, store {
        id: UID,
    }


    public fun create_ibt(ctx: &mut TxContext): IBT {
        IBT {
            id: new(ctx), // Create a new unique ID for the IBT object
        }
    }

    public fun initialize_ibt(ctx: &mut TxContext) {
        let ibt = create_ibt(ctx);
        transfer::public_share_object(ibt);
    }


    public fun mint_and_transfer(
        treasury_cap: &mut coin::TreasuryCap<IBT>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        coin::mint_and_transfer(treasury_cap, amount, recipient, ctx);
    }


    public fun burn(
        treasury_cap: &mut coin::TreasuryCap<IBT>,
        coin: coin::Coin<IBT>,
    ) {
        coin::burn(treasury_cap, coin);
    }


    fun init(ctx: &mut TxContext) {
        // Leave this empty or add module-level initialization logic, if needed
    }
}
