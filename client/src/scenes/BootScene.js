import * as Phaser from 'phaser';
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    async init () {
        console.log("BootScene init");
    }

    async preload() {
        console.log("BootScene preload");
        this.load.json('contracts', 'http://localhost:3001/contracts');
    }
    
    async create() {
        console.log("BootScene create");


        const chainId = "localnet";

        if (!window.getOfflineSigner || !window.keplr) {
            alert("Please install keplr extension");
        } else {
            if (window.keplr.experimentalSuggestChain) {
                try {
                    await window.keplr.experimentalSuggestChain({
                        // Your chain configuration here...
                        chainId: chainId,
                        chainName: "Wasm",
                        rpc: "http://0.0.0.0:26657",
                        rest: "http://0.0.0.0:1317",
                        stakeCurrency: {
                            coinDenom: "STAKE",
                            coinMinimalDenom: "stake",
                            coinDecimals: 6,
                        },
                    });
                    await window.keplr.enable("localnet");
                } catch {
                    alert("Failed to suggest the chain");
                }
            } else {
                alert("Please use the recent version of keplr extension");
            }
        }

        const offlineSigner = window.getOfflineSigner(chainId);
        const accounts = await offlineSigner.getAccounts();
        const client = await SigningCosmWasmClient.connectWithSigner(
            "http://0.0.0.0:26657",
            offlineSigner,
            { gasPrice: "0.1stake"}
        );

        this.registry.set('accounts', accounts);
        this.registry.set('offlineSigner', offlineSigner);
        this.registry.set('client', client);
        console.log(accounts);

        const contracts = this.cache.json.get('contracts');
        console.log(contracts);
        this.registry.set('contracts', contracts);

        this.scene.start('MenuScene');
    }
}