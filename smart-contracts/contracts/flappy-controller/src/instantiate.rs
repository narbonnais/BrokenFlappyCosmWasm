use crate::error::ContractError;
use crate::msg::{InstantiateMsg};
use crate::state::{Config, CONFIG, BEST_PLAYER, Player};
#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;
use cosmwasm_std::{DepsMut, Env, MessageInfo, Response};
use cw2::set_contract_version;

// version info for migration info
const CONTRACT_NAME: &str = "crates.io:passage-nft-vault";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;

    // Save the config
    let config = Config {
        admin: deps.api.addr_validate(&msg.admin)?,
        cw20_address: deps.api.addr_validate(&msg.cw20_address)?,
    };
    CONFIG.save(deps.storage, &config)?;

    // Initialize the best player to None
    let best_player: Option<Player> = None;
    BEST_PLAYER.save(deps.storage, &best_player)?;

    Ok(Response::new()
        .add_attribute("action", "instantiate")
        .add_attribute("contract_name", CONTRACT_NAME)
        .add_attribute("contract_version", CONTRACT_VERSION)
        .add_attribute("admin", config.admin)
        .add_attribute("cw20_address", config.cw20_address)
    )
}