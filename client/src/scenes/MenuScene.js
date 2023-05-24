import * as Phaser from 'phaser';

const CONSTANTS = {
    PIPE_HEIGHT: 320,
    PIPE_WIDTH: 52,
    SPACE_BETWEEN_PIPES: 100,
    PIPE_MIN_HEIGHT: 50,
    GROUND_HEIGHT: 112,
    GRAVITY: 1000,
    VELOCITY_X: -200,
    JUMP_VELOCITY_Y: -350,
    SPAWN_DELAY: 1500,
    INITIAL_COIN_COUNT: 20,
    TREASURY_ADDRESS: "wasm18s5lynnmx37hq4wlrw9gdn68sg2uxp5r23gln4",
    START_GAME_PRICE: 5,
};

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    async init() {
        console.log("MenuScene init");

        // Get the Keplr offline signer
        this.accounts = this.registry.get('accounts');
        this.client = this.registry.get('client');
        this.contracts = this.registry.get('contracts');
        this.cw20Address = this.contracts.cw20;
    }

    preload() {
        console.log("MenuScene preload");

        this.load.image('sky', '/assets/sprites/background-day.png');
        this.load.image('pipe', '/assets/sprites/pipe-green.png');
        this.load.image('ground', '/assets/sprites/base.png');

        // Fetch the high scores
        this.load.json('scores', 'http://localhost:3001/scores');
    }

    async create() {
        console.log("MenuScene create");

        // Terrain
        this.bg = this.add.sprite(0, 0, 'sky').setOrigin(0, 0);
        this.ground = this.add.sprite(0, this.sys.game.config.height - CONSTANTS.GROUND_HEIGHT, 'ground').setOrigin(0, 0);

        // Display a message to click to start
        const text = this.add.text(0, 250, 'Click to start!', { fontSize: '20px', fill: '#000' });
        Phaser.Display.Align.In.Center(text, this.add.zone(this.sys.game.config.width / 2, this.sys.game.config.height / 2, this.sys.game.config.width, this.sys.game.config.height));
        text.setDepth(2);

        // Fetch the balance of the player
        console.log(`Querying balance of ${this.accounts[0].address} on ${this.cw20Address}` )
        const balanceQueryResponse = await this.client.queryContractSmart(this.cw20Address, { balance: { address: this.accounts[0].address } });
        this.balance = balanceQueryResponse.balance;
        console.log(this.balance);

        
        // Display current coin count and cost to start the game
        let balanceStr = this.balance.toString();
        let balanceInt = parseInt(balanceStr) / 1000000;
        balanceInt = parseInt(balanceInt);
        const textPrice = this.add.text(0, 500, `Current coins: ${balanceInt}, Price: 5`, { fontSize: '16px', fill: '#000' });
        textPrice.setDepth(2);
        Phaser.Display.Align.In.Center(textPrice, this.add.zone(this.sys.game.config.width / 2, this.sys.game.config.height / 2 + 20, this.sys.game.config.width, this.sys.game.config.height));

        // Display the best score user and points
        const scores = this.cache.json.get('scores');
        console.log(scores);
        if (scores.length == 0) {
            const textBestScore = this.add.text(0, 0, `Best score: 0 by no one`, { fontSize: '16px', fill: '#000' }).setOrigin(0, 0);
            textBestScore.setDepth(2);
            // Phaser.Display.Align.In.Center(textBestScore, this.add.zone(0, 0, this.sys.game.config.width, this.sys.game.config.height));
        } else {
            const textBestScore = this.add.text(0, 0, `Best score: ${scores[0].score}\nby ${scores[0].user}`, { fontSize: '16px', fill: '#000' }).setOrigin(0, 0);
            textBestScore.setDepth(2);
            // Phaser.Display.Align.In.Center(textBestScore, this.add.zone(0, 0, this.sys.game.config.width, this.sys.game.config.height));
        }

        // Start the game on click, if the player has enough coins
        this.input.on('pointerdown', async () => {
            // Send a transaction to transfer 5 coins to the treasury address
            try {
                // Define the sender and recipient addresses
                const senderAddress = this.accounts[0].address;
                const recipientAddress = CONSTANTS.TREASURY_ADDRESS;

                // Send to treasury (or burn)
                const result = await this.client.execute(senderAddress, this.cw20Address, { transfer: { amount: "5000000", recipient: recipientAddress } }, "auto", "for dinner");
                console.log('Transaction Result: ', result);

                // Start the game
                this.scene.start('PlayScene');
            } catch (error) {
                console.error('Failed to send coins: ', error);
            }
        });

    }
}