# Flappy contracts

The contracts used in the demo CosmWasm Flappy Bird game. DO NOT USE THESE IN PRODUCTION AS THEY HAVE ON PURPOSE VULNERABILITIES.

## Development environment

* rustc 1.66.0 (69f9c33d7 2022-12-12)
* stable-aarch64-apple-darwin (default)

## Build

The following will build the contracts and put the optimized WASM files in the `artifacts` directory.

```bash
./scripts/optimize.sh # or `./scripts/optimize-arm.sh` if you are on an ARM machine
```

## Contracts

### Flappy Token

This contract is a simple CW20 contract that allows to mint and burn tokens. It is used to reward the players of the game, and is controlled by the Flappy Controller contract.

### Flappy Controller

This contract features a gaming reward system, a configuration system, and the ability to set the best player. The server process will ask the contract to mint tokens for the players.

## Deploy

The contracts are deployed by the server. After initialization, the `server/receipt.json` file will contain the code ID and addresses of the contracts.