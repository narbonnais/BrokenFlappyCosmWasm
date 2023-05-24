use cosmwasm_std::{Addr};
use cw_storage_plus::{Item};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Config {
    /// The flappy token contract
    pub cw20_address: Addr,
    /// The addresses with admin permissions
    pub admin: Addr,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Player {
    /// The player's address
    pub address: Addr,
    /// The player's score
    pub score: u64,
}

pub const CONFIG: Item<Config> = Item::new("config");
pub const BEST_PLAYER: Item<Option<Player>> = Item::new("best_player");