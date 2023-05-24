use crate::error::ContractError;
use crate::state::{Config};
use cosmwasm_std::{Addr, MessageInfo};

/// Checks to enforce only privileged administrator can call this function
pub fn only_admin(info: &MessageInfo, config: &Config) -> Result<Addr, ContractError> {
    if config.admin != info.sender{
        return Err(ContractError::Unauthorized(String::from("only an administrator can call this function")));
    }

    Ok(info.sender.clone())
}