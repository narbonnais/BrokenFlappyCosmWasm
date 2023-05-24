use crate::msg::{ConfigResponse, QueryMsg, BestPlayerResponse};
use crate::state::{CONFIG, BEST_PLAYER};
#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;
use cosmwasm_std::{to_binary, Binary, Deps, Env, StdResult};

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::Config {} => to_binary(&query_config(deps, env)?),
        QueryMsg::BestPlayer {} => to_binary(&query_best_player(deps, env)?),
    }
}

fn query_config(deps: Deps, _env: Env) -> StdResult<ConfigResponse> {
    let config = CONFIG.load(deps.storage)?;
    Ok(ConfigResponse {
        admin: config.admin.to_string(),
        cw20_address: config.cw20_address.to_string(),
    })
}

fn query_best_player(deps: Deps, _env: Env) -> StdResult<BestPlayerResponse> {
    let best_player = BEST_PLAYER.load(deps.storage)?;
    Ok(BestPlayerResponse {
        // Could be None
        best_player: best_player,
    })    
}