# Flappy server

This server provides an interface between the Flappy game and its corresponding smart contracts, handles database operations for high scores, and manages API endpoints for client interactions.

## Development environment

* node v19.4.0

## Setup

1. Run `npm install` to install all dependencies.
2. Use node `server.js` to start the server.

## Project Description

The game server utilizes several technologies:

* **CosmJS**: This library provides JavaScript tools for interacting with Cosmos SDK blockchains. In this project, CosmJS is used to interact with the smart contracts.
* **Express**: A minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
* **SQLite**: SQLite is a C library that provides a lightweight, disk-based database. It doesn't require a separate server process and allows accessing the database using a nonstandard variant of the SQL query language.

The server is responsible for various tasks including:

1. Creating an Express server.
2. Establishing a connection with the SQLite database.
3. Initializing the CosmJS client.
4. Uploading and instantiating smart contracts.
5. Managing high scores in the SQLite database.
6. Serving API endpoints to fetch contracts, get high scores and submit new scores.

## Endpoints

* `GET /contracts`: Returns the addresses of the cw20 and controller contracts.
* `GET /scores`: Returns the top 5 high scores.
* `POST /scores`: Submits a new score for a user.

## Notes

This application runs on port 3001 by default (http://localhost:3001). You can change the port in the server code if needed.

Please remember to never use the mnemonic from the code in any production environment. It's a secret phrase that can be used to recover an account, and should always be kept private. The mnemonic provided in this code is for demonstration purposes only.