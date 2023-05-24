# Flappy client

## Description

This project serves as a starter project for building blockchain-integrated games using Phaser and CosmWasm. It demonstrates a simple Flappy Bird-inspired game, where the game player interacts with the blockchain to earn and spend coins while playing.

The blockchain interactions are managed using Keplr as the wallet for the Cosmos Stargate blockchain, with the contract interactions handled through CosmWasm's SigningCosmWasmClient.

In this project, the players are rewarded with coins for playing the game and they also spend coins to start the game.

## Development environment

* node v19.4.0
* Keplr Wallet extension installed on your browser

## Setup

Make sure you have the Keplr wallet extension installed. You will be prompted to connect to the local blockchain so when you try to start the game.

1. Run `npm install` to install all dependencies.
2. Run `npm run build` to build the project (this takes ~30sec to complete)
3. Use node `server.js` to start the front-end server.
4. Open your browser and go to http://localhost:3000 to start playing!

The server will run on port 3000 unless a different port is specified in your environment variables.

## How to play

- Go to http://localhost:3000
- The account is prefunded with 100 tokens
- Click to start and pay 5 tokens
- Click to jump, the goal is to avoid the pipes and earn 1 token per pipe
- Repeat

## Phaser Scenes

This project consists of a simple Express server serving static files and three Phaser scenes: BootScene, MenuScene, and PlayScene.

### BootScene

This is the initial Phaser scene where Keplr is setup and the blockchain connection is established. It also loads the contracts that are needed for the game.

### MenuScene

In this scene, the player's balance is fetched from the blockchain and displayed. If the player has enough coins, they can start the game.

### PlayScene

This is the main game scene. The player is rewarded with coins for playing the game. The coins are transferred to a treasury address when the player starts the game. If the player runs out of coins, they will not be able to start the game.