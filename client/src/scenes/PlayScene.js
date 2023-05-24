import * as Phaser from 'phaser';
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";

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

export default class PlayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlayScene' });
    }

    preload() {
        this.load.image('sky', 'assets/sprites/background-day.png');
        this.load.image('bird', 'assets/sprites/yellowbird-upflap.png');
        this.load.image('pipe', 'assets/sprites/pipe-green.png');
        this.load.image('ground', 'assets/sprites/base.png');
    }

    create() {
        // Terrain
        for (let i = 0; i < 3; i++) {
            const bg = this.add.sprite(i * 288, 0, 'sky').setOrigin(0, 0);
        }

        // Create two ground sprites
        this.grounds = [];
        for (let i = 0; i < 4; i++) {
            const ground = this.physics.add.sprite(i * 288, this.sys.game.config.height - CONSTANTS.GROUND_HEIGHT, 'ground').setOrigin(0, 0);
            ground.body.allowGravity = false;
            ground.body.immovable = true;
            ground.setVelocityX(CONSTANTS.VELOCITY_X);
            ground.setDepth(1);
            this.grounds.push(ground);
        }

        // Bird
        const birdStartX = 100;
        const birdStartY = this.sys.game.config.height / 2;
        this.bird = this.physics.add.sprite(birdStartX, birdStartY, 'bird').setGravityY(CONSTANTS.GRAVITY);
        this.bird.setDepth(2);

        // Pipes
        this.pipes = this.physics.add.group();

        // Graps
        this.gaps = this.physics.add.group();

        // Score
        this.score = 0;

        // Colliders
        this.grounds.forEach(ground => {
            this.physics.add.collider(this.bird, ground, this.gameOver, null, this);
        });

        this.physics.add.collider(this.bird, this.pipes, this.gameOver, null, this);

        // Add a text field to display the coin count
        this.scoreCountText = this.add.text(16, 16, 'Score: ' + this.score, { fontSize: '32px', fill: '#000' });
        this.scoreCountText.setDepth(2);

        // Start the scene in a paused state
        this.physics.pause();
        this.bird.body.allowGravity = false;
        this.grounds.forEach(ground => {
            ground.setVelocityX(0);
        });
        this.pipes.setVelocityX(0, 0);

        this.input.once('pointerdown', this.startGame, this);  // listen for the first click

        // Display a message to click to start
        this.clickToStartText = this.add.text(0, 250, 'Click to start!', { fontSize: '20px', fill: '#000' });
        Phaser.Display.Align.In.Center(this.clickToStartText, this.add.zone(this.sys.game.config.width / 2, this.sys.game.config.height / 2, this.sys.game.config.width, this.sys.game.config.height));
        this.clickToStartText.setDepth(2);
        
    }

    startGame() {
        this.physics.resume();
        this.bird.body.allowGravity = true;
        this.grounds.forEach(ground => {
            ground.setVelocityX(CONSTANTS.VELOCITY_X);
        });
        this.pipes.setVelocityX(CONSTANTS.VELOCITY_X, 0);
        this.bird.setVelocityY(CONSTANTS.JUMP_VELOCITY_Y);

        this.input.on('pointerdown', () => {
            this.bird.setVelocityY(CONSTANTS.JUMP_VELOCITY_Y);
        });

        this.pipeSpawner = this.time.addEvent({
            delay: 1500,
            callback: this.addPipe,
            callbackScope: this,
            loop: true
        });

        this.clickToStartText.destroy();
    }

    createPipe(x, y, flipped) {
        const pipe = this.pipes.create(x, y, 'pipe').setOrigin(0, 0);
        pipe.body.allowGravity = false;
        pipe.setVelocityX(CONSTANTS.VELOCITY_X);
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
        pipe.body.onWorldBounds = true;

        if (flipped) {
            pipe.setFlipY(true);
        }

        return pipe;
    }

    addPipe() {
        // Randomly generate a pipe
        const pipeSpawnY = Phaser.Math.Between(-CONSTANTS.PIPE_HEIGHT + CONSTANTS.PIPE_MIN_HEIGHT, - CONSTANTS.PIPE_MIN_HEIGHT);
        const pipe1 = this.createPipe(this.sys.game.config.width, pipeSpawnY, true);
        const pipe2 = this.createPipe(this.sys.game.config.width, pipeSpawnY + CONSTANTS.PIPE_HEIGHT + CONSTANTS.SPACE_BETWEEN_PIPES, false);

        // Adding an invisible score zone
        const scoreZone = this.physics.add.sprite(pipe2.x + pipe2.width, pipeSpawnY + CONSTANTS.PIPE_HEIGHT + CONSTANTS.SPACE_BETWEEN_PIPES / 2, 'pipe').setOrigin(0, 0);
        scoreZone.setVisible(false); // make it invisible
        scoreZone.body.allowGravity = false;
        scoreZone.setVelocityX(CONSTANTS.VELOCITY_X);

        // Add an overlap with the bird
        this.physics.add.overlap(this.bird, scoreZone, this.increaseScore, null, this);

    }

    increaseScore(bird, scoreZone) {
        // Remove the score zone to avoid triggering the score increase more than once
        scoreZone.destroy();

        this.score++;
        this.scoreCountText.setText('Score: ' + this.score);
        console.log("Score: " + this.score);
    }


    async gameOver() {
        this.physics.pause();
        this.bird.setTint(0xff0000);

        this.scoreCountText.setText('Coins: ' + this.score);

        this.pipeSpawner.destroy();
        
        this.time.addEvent({
            delay: 5000,
            callback: () => {
                this.scene.start('MenuScene');
                // this.scene.restart();
            },
            callbackScope: this,
            loop: false
        });

        // Submit a new score when the game is over
        // player is designed by its address
        const user = this.registry.get('accounts')[0].address;
        const score = this.score;
        try {
            const response = await fetch('http://localhost:3001/scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user, score }),
            });
            const data = await response.json();
            console.log('Success:', data);
        } catch (error) {
            console.error('Error:', error);
        }
    
    }

    update() {
        if (!this.physics.world.isPaused) {
            if (this.bird.y > this.sys.game.config.height || this.bird.y < 0) {
                this.gameOver();
            }

            // Update ground position
            // if (this.ground1.x + this.ground1.width < 0) {
            //     this.ground1.x = this.ground2.x + this.ground2.width;
            // }
            // if (this.ground2.x + this.ground2.width < 0) {
            //     this.ground2.x = this.ground1.x + this.ground1.width;
            // }
            this.grounds.forEach(ground => {
                if (ground.x + ground.width < 0) {
                    const index = this.grounds.indexOf(ground);
                    ground.x = this.grounds[(this.grounds.indexOf(ground) - 1 + this.grounds.length) % this.grounds.length].x + ground.width;
                }
            });
        }
    }
}