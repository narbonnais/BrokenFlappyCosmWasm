// CosmJS:
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { readFileSync, writeFileSync } from "fs";

// Express:
import express from 'express';
import Database from 'better-sqlite3';
// import sqlite3 from 'sqlite3';
import cors from 'cors';

const createServer = async () => {
    console.log("[1.] Creating server");

    // Create a new express application instance
    const app = express();
    app.use(cors());

    // Set the app to use JSON parsing for incoming requests
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    return app;
}

const createDatabase = async () => {
    console.log("[2.] Creating database");

    // Create a new SQLite database instance
    // let db = new sqlite3.Database('./data/highscores.db', (err) => {
    //     if (err) {
    //         console.error(err.message);
    //     }
    //     db.run('CREATE TABLE IF NOT EXISTS scores(user TEXT, score INTEGER)');
    // });
    let db = new Database('./data/two_highscores.db');
    db.exec('CREATE TABLE IF NOT EXISTS scores(user TEXT, score INTEGER)');

    return db;
}

const createCosmJSClient = async () => {
    console.log("[3.] Creating CosmJS client");

    const mnemonic = "quality vacuum heart guard buzz spike sight swarm shove special gym robust assume sudden deposit grid alcohol choice devote leader tilt noodle tide penalty";
    const rpcEndpoint = "http://127.0.0.1:26657/";
    const prefix = "wasm";


    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix });
    const [deployer] = await wallet.getAccounts();

    const client = await SigningCosmWasmClient.connectWithSigner(rpcEndpoint, wallet, {
        gasPrice: "0.1stake", // this is needed because we use "auto" gas estimation in the transactions
    });

    const account = await client.getAccount(deployer.address);
    console.log("Account:", account);

    const balance = await client.getBalance(deployer.address, "stake");
    console.log("Balance:", balance);

    return { client, deployer };
}

const uploadContracts = async (client, deployer, isArm) => {
    console.log("[4.] Uploading contracts");

    // CosmJS to deploy the contract and grants the demo user some coins
    const artifactsPath = process.cwd() + "/../smart-contracts/artifacts/";


    let cw20Path = artifactsPath + "flappy_cw20.wasm";
    let controllerPath = artifactsPath + "flappy_controller.wasm";

    if (isArm) {
        console.log("Using ARM artifacts");
        cw20Path = artifactsPath + "flappy_cw20-aarch64.wasm";
        controllerPath = artifactsPath + "flappy_controller-aarch64.wasm";
    } else {
        console.log("Using x86 artifacts");
    }

    const uploadCW20Result = await client.upload(deployer.address, readFileSync(cw20Path), "auto");
    console.log("Upload CW20 result:", uploadCW20Result);

    const uploadControllerResult = await client.upload(deployer.address, readFileSync(controllerPath), "auto");
    console.log("Upload Controller result:", uploadControllerResult);

    return { uploadCW20Result, uploadControllerResult };
}

const instantiateContracts = async (client, deployer, uploadCW20Result, uploadControllerResult) => {
    console.log("[5.] Instantiating contracts");

    const instantiateCW20Result = await client.instantiate(deployer.address, uploadCW20Result.codeId, {
        name: "Flappy Coin",
        symbol: "FLAP",
        decimals: 6,
        initial_balances: [
            {
                address: "wasm1cyyzpxplxdzkeea7kwsydadg87357qna465cff",
                amount: "100000000"
            }
        ],
        mint: {
            minter: deployer.address,
            cap: null
        }
    }, "Flappy Coin", "auto");
    console.log("Instantiate CW20 result:", instantiateCW20Result);

    const instantiateControllerResult = await client.instantiate(deployer.address, uploadControllerResult.codeId, {
        admin: deployer.address,
        cw20_address: instantiateCW20Result.contractAddress,
    }, "Flappy Controller", "auto");
    console.log("Instantiate Controller result:", instantiateControllerResult);

    // Set minter to be the controller
    const setMinterResult = await client.execute(deployer.address, instantiateCW20Result.contractAddress, { update_minter: { new_minter: instantiateControllerResult.contractAddress } }, "auto", "flappy reward");
    console.log("Set minter result:", setMinterResult);

    return { instantiateCW20Result, instantiateControllerResult };
}

const storeReceipts = async (instantiateCW20Result, instantiateControllerResult, uploadCW20Result, uploadControllerResult) => {
    console.log("[6.] Storing receipts for debugging");

    const receipts = {
        controller: {
            address: instantiateControllerResult.contractAddress,
            codeId: uploadControllerResult.codeId,
        },
        cw20: {
            address: instantiateCW20Result.contractAddress,
            codeId: uploadCW20Result.codeId,
        },
    };

    // Write the contract addresses to a file
    const receiptsPath = process.cwd() + "/data/receipts.json";
    writeFileSync(receiptsPath, JSON.stringify(receipts, null, 2));
    console.log("Receipts:", receipts);
}

// --------------------------------------------------
// Initialize the server
// --------------------------------------------------

const skipUploadInit = process.argv.includes('--skipUploadInit');
const isArm = process.argv.includes('--arm');

const app = await createServer();
const db = await createDatabase();
const { client, deployer } = await createCosmJSClient();

if (!skipUploadInit) {
    const { uploadCW20Result, uploadControllerResult } = await uploadContracts(client, deployer, isArm);
    const { instantiateCW20Result, instantiateControllerResult } = await instantiateContracts(client, deployer, uploadCW20Result, uploadControllerResult);
    await storeReceipts(instantiateCW20Result, instantiateControllerResult, uploadCW20Result, uploadControllerResult);
}

// --------------------------------------------------
// CosmWasm functions
// --------------------------------------------------

const cosmJSControllerMintCoins = (user, amount) => {
    const receiptsPath = process.cwd() + "/data/receipts.json";
    const receipts = JSON.parse(readFileSync(receiptsPath));

    // Mint coins to a user
    const msg = {
        mint_to_user: { recipient: user, amount: amount }
    };

    return client.execute(deployer.address, receipts.controller.address, msg, "auto", "flappy reward");
}

const cosmJSControllerSetBestPlayer = (user, score) => {
    const receiptsPath = process.cwd() + "/data/receipts.json";
    const receipts = JSON.parse(readFileSync(receiptsPath));

    // Set the best player
    const msg = {
        set_best_player: { address: user, score: score }
    };

    return client.execute(deployer.address, receipts.controller.address, msg, "auto", "flappy reward");
}


// --------------------------------------------------
// DB functions
// --------------------------------------------------

const dbGetBestPlayer = () => {
    const sql = `SELECT user, score FROM scores ORDER BY score DESC LIMIT 1`;
    const row = db.prepare(sql).get();
    return row || { user: null, score: 0 };
};

const dbGetHighScores = (count) => {
    const sql = `SELECT user, score FROM scores ORDER BY score DESC LIMIT ${count}`;
    const rows = db.prepare(sql).all();
    return rows;
};

const dbGetUserScore = (user) => {
    const sql = `SELECT score FROM scores WHERE user = '${user}'`;
    const row = db.prepare(sql).get();
    return row ? row.score : 0;
};

const dbUpdateUserScore = (user, score) => {
    const sql = `UPDATE scores SET score = ${score} WHERE user = '${user}'`;
    db.prepare(sql).run();
};

const dbCreateUserScore = (user, score) => {
    const sql = `INSERT INTO scores(user, score) VALUES('${user}', '${score}')`;
    db.prepare(sql).run();
};


// --------------------------------------------------
// API endpoints
// --------------------------------------------------

// Returns address of the cw20 contract and the controller contract
app.get('/contracts', (req, res) => {
    console.log('[>] GET /contracts');
    console.log(req.body);

    const receiptsPath = process.cwd() + "/data/receipts.json";
    const receipts = JSON.parse(readFileSync(receiptsPath));

    res.send({
        cw20: receipts.cw20.address,
        controller: receipts.controller.address,
    });
});

// Define an endpoint to get the top 5 scores
app.get('/scores', (req, res) => {
    console.log('[>] GET /scores');
    console.log(req.body);

    const highScores = dbGetHighScores(5);
    if (!highScores) {
        res.send({});
        return;
    }
    res.send(highScores);
});

// Define an endpoint to submit a new score for a user
app.post('/scores', async (req, res) => {
    console.log('[>] POST /scores');
    console.log(req.body);

    const user = req.body.user;
    const score = req.body.score;

    const coinPrecision = 1000000;
    const highestScoreMultiplier = 1.5;
    let coinsToMint = score * coinPrecision;

    // If score is zero then don't submit it
    if (score === 0) {
        res.send({ message: "Zero" });
        return;
    }

    // Query highest score to add reward to user
    const bestPlayer = await dbGetBestPlayer();
    const highestScore = bestPlayer.score;
    const highestScoreUser = bestPlayer.user;

    // Apply multiplier to score
    if (score > highestScore) {
        coinsToMint = coinsToMint * highestScoreMultiplier;

        // Set the best player
        cosmJSControllerSetBestPlayer(user, score).then((result) => {
            console.log('Transaction Result: ', result);
        }).catch((error) => {
            console.error('Failed to set best player: ', error);
            res.status(500).send({ message: "Failed to set best player" });
            return;
        });
    }

    // Send coins to user
    cosmJSControllerMintCoins(user, coinsToMint).then((result) => {
        console.log('Transaction Result: ', result);
    }).catch((error) => {
        console.error('Failed to send coins: ', error);
        res.status(500).send({ message: "Failed to send coins" });
        return;
    });

    // Does the user exist in the database?
    const userScore = await dbGetUserScore(user);
    console.log("User score:", userScore);

    // If the user exists then update their score
    if (userScore) {
        dbUpdateUserScore(user, score);
    } else {
        dbCreateUserScore(user, score);
    }

    res.send({ message: "Success" });
});

// Start the server on port 3000
app.listen(3001, () => {
    console.log('[7.] Server is running on port 3001, listening for requests...');
});
