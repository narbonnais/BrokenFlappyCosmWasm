use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use crate::state::Player;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
    /// The admin address
    pub admin: String,
    /// The flappy token contract
    pub cw20_address: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    /// After a game is played, the winner can claim their reward
    MintToUser {
        recipient: String,
        amount: u64,
    },
    /// Update the config
    UpdateConfig {
        admin: Option<String>,
        cw20_address: Option<String>,
    },
    /// Update the best player
    SetBestPlayer {
        address: String,
        score: u64,
    },
}


#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    Config {},
    BestPlayer {},
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct ConfigResponse {
    pub admin: String,
    pub cw20_address: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct BestPlayerResponse {
    pub best_player: Option<Player>
}