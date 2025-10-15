/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import {
    BlockfrostProvider,
    deserializeAddress,
    deserializeDatum,
} from '@meshsdk/core';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { StatusManagement } from '../contract/scripts';
import { BLOCKFROST_API_KEY } from '../contract/scripts/common';
import { AppGateway } from './app.gateway';
import { ContractHelper } from './common/contract-helper';
import {
    AccessRole,
    LoginRequestModel,
    LoginResponseModel,
    RegisterNewLockRequestModel,
} from './models/auth.model';
import { DatumModel } from './models/datum.model';
import {
    AuthorizeRequestModel,
    LockInfoRequestModel,
    LockRequestModel,
    LockStatus,
    LockStatusResponseModel,
    parseLockStatus,
    SubmitTxModel,
} from './models/lock.model';

/**
 * @description AppService — provides core business logic for IoT lock management, user authentication, and blockchain interactions.
 *
 * Responsibilities:
 * - Handles lock registration, status updates, and authorization flows
 * - Interfaces with Cardano blockchain via BlockFrost and Mesh SDK
 * - Manages user authentication and access control for IoT devices
 * - Emits real-time events to connected clients through WebSocket gateway
 *
 * Notes:
 * - Depends on AppGateway for WebSocket communication
 * - Utilizes BlockFrostAPI for blockchain queries and transaction monitoring
 */
@Injectable()
export class AppService {
    private blockFrostAPI: BlockFrostAPI;
    private blockfrostProvider: BlockfrostProvider;
    /**
     * @constructor
     * @description Initializes a new instance of AppService with WebSocket gateway and blockchain API.
     *
     * @param {AppGateway} appGateway - WebSocket gateway for real-time event broadcasting to clients.
     *
     * @example
     * const service = new AppService(appGateway);
     */
    constructor(private readonly appGateway: AppGateway) {
        this.blockfrostProvider = new BlockfrostProvider(BLOCKFROST_API_KEY);
        this.blockFrostAPI = new BlockFrostAPI({
            projectId: BLOCKFROST_API_KEY ?? '',
        });
    }

    /**
     * @description Authenticates a user for a specific lock and determines their access role.
     *
     * Details:
     * 1. Retrieves contract UTXOs for the specified lock
     * 2. Validates user permissions against lock ownership and authority
     * 3. Returns appropriate access role and current lock status
     *
     * @param {LoginRequestModel} loginModel - Contains user address, owner address, and lock name for authentication.
     * @returns {Promise<LoginResponseModel>} User's access role and current lock status if authorized.
     *
     * @throws {Error} When the lock is not found or not registered.
     *
     * @example
     * const response = await appService.login({ user_addr, owner_addr, lock_name });
     */
    async login(loginModel: LoginRequestModel) {
        const utxos = await ContractHelper.GetContractUTXO(
            loginModel.owner_addr,
            loginModel.lock_name,
        );
        if (!utxos || utxos.length === 0) {
            throw new Error('Lock not found, please register the lock first');
        }
        const datum = deserializeDatum<DatumModel>(
            utxos[utxos.length - 1].output.plutusData!,
        );
        if (loginModel.user_addr != loginModel.owner_addr) {
            // User is not the owner, check authority
            const authorityBytes = datum.fields[0].fields[0].bytes;
            const userBytes = deserializeAddress(
                loginModel.user_addr,
            ).pubKeyHash;
            if (authorityBytes !== userBytes) {
                return {
                    access_role: AccessRole.UNKNOWN,
                } satisfies LoginResponseModel;
            }
            return {
                access_role: AccessRole.AUTHORITY,
                lock_status: parseLockStatus(datum.fields[1].int),
            } satisfies LoginResponseModel;
        }
        return {
            access_role: AccessRole.OWNER,
            lock_status: parseLockStatus(datum.fields[1].int),
        } satisfies LoginResponseModel;
    }

    /**
     * @description Registers a new IoT lock on the blockchain if it doesn't already exist.
     *
     * Details:
     * 1. Checks for existing lock with the same name and owner
     * 2. Creates new lock contract instance with specified configuration
     * 3. Submits lock registration transaction to blockchain
     *
     * @param {RegisterNewLockRequestModel} registerModel - Contains owner address and lock name for registration.
     * @returns {Promise<any>} Transaction result from lock contract creation.
     *
     * @throws {Error} When a lock with the same name already exists for the owner.
     *
     * @example
     * const result = await appService.registerNewLock({ owner_addr, lock_name });
     */
    async registerNewLock(registerModel: RegisterNewLockRequestModel) {
        const utxos = await ContractHelper.GetContractUTXO(
            registerModel.owner_addr,
            registerModel.lock_name,
        );
        if (utxos && utxos.length > 0) {
            throw new Error(
                'The lock already exists, please choose another lock name',
            );
        }
        const contractService = new StatusManagement({
            meshWallet: ContractHelper.GetWalletClient(
                registerModel.owner_addr,
            ),
        });

        return await contractService.lock({
            title: registerModel.lock_name,
        });
    }

    /**
     * @description Updates the status of a lock device (open/close) by generating an unsigned transaction.
     *
     * Details:
     * 1. Validates unlocker address is provided
     * 2. Creates appropriate contract instance for the user
     * 3. Generates unsigned transaction for lock status change
     *
     * @param {LockRequestModel} lockRequestModel - Contains lock details, unlocker address, and desired status.
     * @returns {Promise<string>} Unsigned transaction for the status change operation.
     *
     * @throws {HttpException} When unlocker address is empty or invalid.
     *
     * @example
     * const unsignedTx = await appService.updateStatusDevice(lockRequest);
     */
    async updateStatusDevice(lockRequestModel: LockRequestModel) {
        if (lockRequestModel.unlocker_addr.trim() == '')
            throw new HttpException(
                'The address wallet of unlocker must be not null',
                HttpStatus.BAD_REQUEST,
            );
        let unsignedTx: string = '';

        const currentUserWallet = ContractHelper.GetWalletClient(
            lockRequestModel.unlocker_addr,
        );
        const confirmStatusContract = new StatusManagement({
            meshWallet: currentUserWallet,
            ownerAddress: lockRequestModel.owner_addr,
        });
        if (lockRequestModel.lock_status == LockStatus.OPEN) {
            unsignedTx = await confirmStatusContract.unLock({
                title: lockRequestModel.lock_name,
            });
        } else if (lockRequestModel.lock_status == LockStatus.CLOSE) {
            unsignedTx = await confirmStatusContract.lock({
                title: lockRequestModel.lock_name,
            });
        }
        return unsignedTx;
    }

    /**
     * @description Generates an unsigned transaction to authorize a new user for lock access.
     *
     * Details:
     * 1. Creates contract instance with owner's wallet
     * 2. Builds authorization transaction for the specified licensee
     * 3. Returns unsigned transaction for owner to sign
     *
     * @param {AuthorizeRequestModel} authorizeRequestModel - Contains owner address, lock name, and licensee address.
     * @returns {Promise<string>} Unsigned authorization transaction.
     *
     * @example
     * const unsignedTx = await appService.requestAuthorize(authorizeRequest);
     */
    async requestAuthorize(authorizeRequestModel: AuthorizeRequestModel) {
        const confirmStatusContract = new StatusManagement({
            meshWallet: ContractHelper.GetWalletClient(
                authorizeRequestModel.owner_addr,
            ),
            ownerAddress: authorizeRequestModel.owner_addr,
        });
        const unsignedTx: string = await confirmStatusContract.authorize({
            title: authorizeRequestModel.lock_name,
            authority: authorizeRequestModel.licensee_addr,
        });
        return unsignedTx;
    }

    /**
     * @description Submits a signed transaction to the blockchain and emits real-time status updates.
     *
     * Details:
     * 1. Submits the signed transaction to the blockchain
     * 2. Waits for transaction confirmation
     * 3. Emits lock status update event to connected clients
     *
     * @param {SubmitTxModel} submitModel - Contains user address, signed transaction, and status data.
     * @returns {Promise<{tx_hash: string, tx_ref: string}>} Transaction hash and reference URL.
     *
     * @throws {Error} When transaction submission fails or has invalid hash length.
     *
     * @example
     * const result = await appService.submitTransaction(submitModel);
     */
    async submitTransaction(submitModel: SubmitTxModel) {
        const currentUserWallet = ContractHelper.GetWalletClient(
            submitModel.user_addr,
        );
        const txHash = await currentUserWallet.submitTx(submitModel.signedTx);
        await new Promise<void>((resolve) => {
            this.blockfrostProvider.onTxConfirmed(txHash, () => {
                resolve();
            });
        });

        this.appGateway.server.emit('onUpdatedLockStatus', submitModel.data);
        return {
            tx_hash: txHash,
            tx_ref: 'https://preprod.cexplorer.io/tx/' + txHash,
        };
    }

    /**
     * @description Retrieves the current status of a specified lock device.
     *
     * Details:
     * 1. Fetches contract UTXOs for the lock
     * 2. Extracts and parses lock status from blockchain data
     * 3. Returns formatted status response with timestamp and transaction reference
     *
     * @param {LockInfoRequestModel} lockInfoModel - Contains owner address and lock name for status lookup.
     * @returns {Promise<LockStatusResponseModel>} Current lock status with timestamp and transaction reference.
     *
     * @throws {Error} When the lock is not found or not registered.
     *
     * @example
     * const status = await appService.getLockStatus(lockInfoModel);
     */
    async getLockStatus(lockInfoModel: LockInfoRequestModel) {
        const utxos = await ContractHelper.GetContractUTXO(
            lockInfoModel.owner_addr,
            lockInfoModel.lock_name,
        );
        if (!utxos || utxos.length === 0) {
            throw new Error('Lock not found, please register the lock first');
        }
        const datum = deserializeDatum<DatumModel>(
            utxos[utxos.length - 1].output.plutusData!,
        );
        const lockStatus: LockStatusResponseModel = {
            lock_status: parseLockStatus(datum.fields[1].int),
            time: new Date(),
            tx_ref:
                'https://preprod.cexplorer.io/tx/' +
                utxos[utxos.length - 1].input.txHash,
        };
        return lockStatus;
    }

    /**
     * @description Retrieves the complete history of status changes for a specified lock device.
     *
     * Details:
     * 1. Fetches all transactions associated with the lock's asset
     * 2. Processes each transaction to extract status and user data
     * 3. Returns chronologically sorted list of lock status changes
     *
     * @param {LockInfoRequestModel} lockInfoModel - Contains owner address and lock name for history lookup.
     * @returns {Promise<LockStatusResponseModel[]>} Array of lock status changes sorted by timestamp (most recent first).
     *
     * @example
     * const history = await appService.getAllLockHistory(lockInfoModel);
     */
    async getAllLockHistory(lockInfoModel: LockInfoRequestModel) {
        const encodedAssetName = ContractHelper.GetAssetName(
            lockInfoModel.owner_addr,
            lockInfoModel.lock_name,
        );

        const transactions =
            await this.blockFrostAPI.assetsTransactions(encodedAssetName);

        const results = await Promise.allSettled(
            transactions.map(async (tx) => {
                const utxo = await this.blockFrostAPI.txsUtxos(tx.tx_hash);

                const outWithDatum = utxo.outputs.find(
                    (o) => o.inline_datum != null,
                );
                if (!outWithDatum) return null;

                const datum = deserializeDatum<DatumModel>(
                    outWithDatum.inline_datum!,
                );
                const isValid =
                    datum?.fields && datum.fields[1]?.int !== undefined;
                if (!isValid) return null;

                const model = new LockStatusResponseModel();
                model.time = new Date(tx.block_time * 1000);
                model.lock_status = parseLockStatus(datum.fields[1].int);
                model.user_addr =
                    utxo.outputs[1]?.address ?? utxo.outputs[0]?.address ?? '';
                model.tx_ref =
                    'https://preprod.cexplorer.io/tx/' +
                    (utxo.inputs[0]?.tx_hash ?? tx.tx_hash);
                return model;
            }),
        );

        const listLockStatus = results
            .filter(
                (
                    r,
                ): r is PromiseFulfilledResult<LockStatusResponseModel | null> =>
                    r.status === 'fulfilled',
            )
            .map((r) => r.value)
            .filter((x): x is LockStatusResponseModel => x != null);

        listLockStatus.sort((a, b) => b.time.getTime() - a.time.getTime());
        return listLockStatus;
    }
}
