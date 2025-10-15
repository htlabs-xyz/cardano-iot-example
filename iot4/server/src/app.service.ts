import { MeshWallet } from '@meshsdk/core';
import { Injectable } from '@nestjs/common';
import { SupplyChainManagementContract } from './contract/scripts';
import { blockfrostProvider } from './contract/scripts/common';
import {
  parseUserMetadata,
  UserInfoRequestModel,
  UserVerifyRequestModel,
} from './models/userinfo.model';

@Injectable()
/**
 * @description AppService — provides core business logic for user identity management on Cardano blockchain.
 *
 * Responsibilities:
 * - Manage blockchain wallet and contract interactions
 * - Write user identity data to the blockchain
 * - Verify user identity by reading blockchain metadata
 *
 * Notes:
 * - Depends on MeshWallet and SupplyChainManagementContract
 * - Uses Blockfrost as Cardano provider
 */
export class AppService {
  private wallet: MeshWallet;

  /**
   * @constructor
   * @description Initializes a new instance of AppService.
   *
   * Sets up the MeshWallet for Cardano blockchain operations using environment mnemonic and Blockfrost provider.
   *
   * @example
   * const service = new AppService();
   */
  constructor() {
    this.wallet = new MeshWallet({
      networkId: 0,
      fetcher: blockfrostProvider,
      submitter: blockfrostProvider,
      key: {
        type: 'mnemonic',
        words: process.env.APP_WALLET?.split(' ') || [],
      },
    });
  }

  /**
   * @description Writes user identity metadata to the Cardano blockchain.
   *
   * Details:
   * 1. Prepares contract and parses user metadata
   * 2. Constructs, signs, and submits transaction
   * 3. Returns transaction explorer URL for confirmation
   *
   * @param {UserInfoRequestModel} user - The user identity data to be written on-chain.
   * @returns {Promise<string>} Transaction explorer URL for the submitted identity transaction.
   *
   * @throws {Error} If transaction signing or submission fails.
   *
   * @example
   * const url = await service.writeUserIdentityData(userModel);
   */
  async writeUserIdentityData(user: UserInfoRequestModel) {
    const confirmStatusContract = new SupplyChainManagementContract({
      wallet: this.wallet,
    });
    console.log('metadata:', parseUserMetadata(user));
    const unsignedTx: string = await confirmStatusContract.write({
      assetName: user.user_id,
      metadata: parseUserMetadata(user),
    });

    const signedTx = this.wallet.signTx(unsignedTx, true);
    const txHash = await this.wallet.submitTx(signedTx);
    blockfrostProvider.onTxConfirmed(txHash, () => {
      expect(txHash.length).toBe(64);
    });
    console.log(
      'Transaction hash:',
      'https://preprod.cexplorer.io/tx/' + txHash,
    );
    return 'https://preprod.cexplorer.io/tx/' + txHash;
  }

  /**
   * @description Verifies user identity by reading metadata from the Cardano blockchain.
   *
   * Details:
   * 1. Reads metadata for the given user ID from the contract
   * 2. Throws error if user not found
   * 3. Returns user metadata if found
   *
   * @param {UserVerifyRequestModel} userVerifyModel - The user verification request containing user ID.
   * @returns {Promise<any>} User metadata if found; throws if not found.
   *
   * @throws {Error} If user metadata is not found on-chain.
   *
   * @example
   * const metadata = await service.verifyUserIdentity(verifyModel);
   */
  async verifyUserIdentity(userVerifyModel: UserVerifyRequestModel) {
    const confirmStatusContract: SupplyChainManagementContract =
      new SupplyChainManagementContract({
        wallet: this.wallet,
      });
    const metadata = await confirmStatusContract.read({
      assetName: userVerifyModel.user_id,
    });
    console.log('metadata:', metadata);
    if (!metadata) {
      throw new Error('User not found');
    }
    return metadata;
  }
}
