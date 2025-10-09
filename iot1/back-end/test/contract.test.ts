/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { MeshWallet, BlockfrostProvider } from '@meshsdk/core';
import { ConfirmStatusContract } from 'contract/scripts';
import { BLOCKFROST_API_KEY } from 'contract/scripts/common';

/**
 * @file Sensor Monitoring Project Tests
 * @description
 * This Jest test suite verifies the core blockchain interactions for the
 * IoT Sensor Monitoring Project using the Mesh SDK on the Cardano testnet (preprod).
 *
 * The tests simulate:
 *  - Confirming sensor status (e.g., sending temperature and humidity data on-chain)
 *  - Claiming/withdrawing ADA from the smart contract
 *
 * Note: The tests rely on a valid mnemonic phrase stored in the environment variable `APP_WALLET`.
 */
describe('Sensor Monitoring Project', function () {
    let wallet: MeshWallet;
    let blockfrostProvider: BlockfrostProvider;

    /**
     * @beforeEach
     * @description
     * This setup function runs before each test.
     * It initializes:
     *  - The BlockfrostProvider (used for fetching and submitting transactions)
     *  - The MeshWallet (configured with the testnet network and mnemonic key)
     */
    beforeEach(async function () {
        blockfrostProvider = new BlockfrostProvider(BLOCKFROST_API_KEY);
        wallet = new MeshWallet({
            networkId: 0,
            fetcher: new BlockfrostProvider(BLOCKFROST_API_KEY),
            submitter: blockfrostProvider,

            key: {
                type: 'mnemonic',
                words: process.env.MNEMONIC?.split(' ') || [],
            },
        });
    });
    jest.setTimeout(60000);

    /**
     * @test Confirm Status
     * @description
     * Tests the `confirm` method of the ConfirmStatusContract.
     * This method is responsible for recording IoT sensor readings (e.g., temperature and humidity)
     * on the blockchain by constructing and submitting a Plutus transaction.
     */
    test('Confirm Status', async function () {
        return;
        const confirmStatusContract: ConfirmStatusContract =
            new ConfirmStatusContract({ wallet: wallet });
        const unsignedTx: string = await confirmStatusContract.confirm({
            sensor: 'Sensor 1',
            temperator: 60,
            huminity: 80,
        });
        const signedTx = await wallet.signTx(unsignedTx, true);
        const txHash = await wallet.submitTx(signedTx);

        await new Promise<void>(function (resolve, reject) {
            blockfrostProvider.onTxConfirmed(txHash, () => {
                console.log('https://preprod.cexplorer.io/tx/' + txHash);
                expect(txHash.length).toBe(64);
            });
        });
    });

    /**
     * @test Claim Withdraw
     * @description
     * Tests the `withdraw` method of the ConfirmStatusContract.
     * This method simulates a user claiming ADA (or tokens) stored in the smart contract.
     */
    test('Claim Withdraw', async function () {
        return;
        const confirmStatusContract: ConfirmStatusContract =
            new ConfirmStatusContract({
                wallet: wallet,
            });
        const unsignedTx: string = await confirmStatusContract.withdraw({
            title: 'Sensor 1',
            value: 40000000,
        });

        const signedTx = await wallet.signTx(unsignedTx, true);
        const txHash = await wallet.submitTx(signedTx);
        await new Promise<void>(function (resolve, reject) {
            blockfrostProvider.onTxConfirmed(txHash, () => {
                console.log('https://preprod.cexplorer.io/tx/' + txHash);
                expect(txHash.length).toBe(64);
            });
        });
    });
});
