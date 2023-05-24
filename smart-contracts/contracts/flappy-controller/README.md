# Controller Contract

This contract features a gaming reward system, a configuration system, and the ability to set the best player. It's based on the CosmWasm standard, a smart contract module for the Cosmos SDK that uses the Wasm virtual machine.

## Overview

The contract is made up of three parts:

- A reward system for winners of the game.
- A configuration system for updating the contract settings.
- A system for setting the best player based on their game performance.

## Messages

### Mint To User

After a game is played, the winner can claim their reward. This is done by executing the "mint_to_user" message:

```json
{
  "mint_to_user": {
    "amount": <reward amount>,
    "recipient": "<user address>"
  }
}
```

This message requires the following fields:

- `amount`: The amount of reward to be claimed, a non-negative integer.
- `recipient`: The address of the user claiming the reward, a string representing a valid address.

### Update Config

The contract configuration can be updated with the "update_config" message:

```json
{
  "update_config": {
    "admin": "<new admin address>",
    "cw20_address": "<new cw20 address>"
  }
}
```
This message allows for the following fields:

- `admin`: The address of the new admin, a string representing a valid address. Can be set to null for no admin.
- `cw20_address`: The new cw20 address, a string representing a valid address. Can be set to null for no cw20 address.

### Set Best Player

The best player can be updated with the "set_best_player" message:

```json
{
  "set_best_player": {
    "address": "<player address>",
    "score": <player score>
  }
}
```

This message requires the following fields:

- `address`: The address of the player to set as the best player, a string representing a valid address.
- `score`: The score of the best player, a non-negative integer.

## Conclusion

This CosmWasm contract allows for rewarding game winners, updating the contract configuration, and setting the best player. The schema provided shows the JSON structure of the messages that this contract accepts and processes. If you have further questions or need more information, don't hesitate to reach out.