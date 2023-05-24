use crate::error::ContractError;
use crate::helpers::{only_admin};
use crate::msg::ExecuteMsg;
use crate::state::{Player, BEST_PLAYER, CONFIG};
#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;
use cosmwasm_std::{to_binary, DepsMut, Env, MessageInfo, Response};

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::MintToUser { recipient, amount } => {
            execute_mint_to_user(deps, env, info, recipient, amount)
        }
        ExecuteMsg::UpdateConfig {
            admin,
            cw20_address,
        } => execute_update_config(deps, env, info, admin, cw20_address),
        ExecuteMsg::SetBestPlayer { address, score } => {
            execute_set_best_player(deps, env, info, address, score)
        }
    }
}

pub fn execute_mint_to_user(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    recipient: String,
    amount: u64,
) -> Result<Response, ContractError> {
    let config = CONFIG.load(deps.storage)?;
    only_admin(&info, &config)?;

    let recipient_addr = deps.api.addr_validate(&recipient)?;
    let cw20_addr = deps.api.addr_validate(&config.cw20_address.to_string())?;

    let mut messages: Vec<cosmwasm_std::CosmosMsg> = vec![];
    messages.push(cosmwasm_std::CosmosMsg::Wasm(
        cosmwasm_std::WasmMsg::Execute {
            contract_addr: cw20_addr.to_string(),
            msg: to_binary(&cw20_base::msg::ExecuteMsg::Mint {
                recipient: recipient_addr.to_string(),
                amount: amount.into(),
            })?,
            funds: vec![],
        },
    ));

    Ok(Response::new()
        .add_messages(messages)
        .add_attribute("action", "mint_to_user")
        .add_attribute("recipient", recipient)
        .add_attribute("amount", amount.to_string()))
}

pub fn execute_update_config(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    admin: Option<String>,
    cw20_address: Option<String>,
) -> Result<Response, ContractError> {
    let mut config = CONFIG.load(deps.storage)?;

    if let Some(_cw20_address) = cw20_address {
        config.cw20_address = deps.api.addr_validate(&_cw20_address)?;
    }
    if let Some(admin) = admin {
        config.admin = deps.api.addr_validate(&admin)?;
    }

    CONFIG.save(deps.storage, &config)?;
    Ok(Response::new()
        .add_attribute("action", "update_config")
        .add_attribute("admin", config.admin)
        .add_attribute("cw20_address", config.cw20_address))
}

pub fn execute_set_best_player(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    address: String,
    score: u64,
) -> Result<Response, ContractError> {
    let config = CONFIG.load(deps.storage)?;
    only_admin(&info, &config)?;

    let address = deps.api.addr_validate(&address)?;
    let best_player = Some(Player { address, score });

    BEST_PLAYER.save(deps.storage, &best_player)?;

    Ok(Response::new()
        .add_attribute("action", "set_best_player")
        .add_attribute("address", best_player.unwrap().address.to_string())
        .add_attribute("score", score.to_string()))
}
