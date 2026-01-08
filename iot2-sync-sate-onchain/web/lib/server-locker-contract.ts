import {
  deserializeAddress,
  mConStr0,
  mConStr1,
  stringToHex,
} from '@meshsdk/core';
import { ServerMeshAdapter } from './server-mesh-adapter';

const LOCK_TITLE = process.env.NEXT_PUBLIC_LOCK_TITLE || '17112003';

/**
 * ServerLockerContract
 *
 * Builds unsigned transactions for IoT lock operations.
 * Server fetches UTXOs and collateral from Blockfrost.
 */
export class ServerLockerContract extends ServerMeshAdapter {
  private readonly lockTitle: string;

  constructor({
    ownerAddress,
    lockTitle = LOCK_TITLE,
  }: {
    ownerAddress: string;
    lockTitle?: string;
  }) {
    super({ ownerAddress });
    this.lockTitle = lockTitle;
  }

  /**
   * Build init transaction - mint new lock token
   */
  async buildInit(walletAddress: string): Promise<string> {
    const assetUnit = this.policyId + stringToHex(this.lockTitle);

    // Check if already initialized
    const existingUtxo = await this.getAddressUTXOAsset(
      this.lockerAddress,
      assetUnit
    );
    if (existingUtxo) {
      throw new Error('Lock has already been initialized');
    }

    // Fetch wallet UTXOs from Blockfrost
    const utxos = await this.fetchWalletUtxos(walletAddress);
    const collateral = this.findCollateral(utxos);

    const pubKeyHash = deserializeAddress(walletAddress).pubKeyHash;
    const stakeCredHash = deserializeAddress(walletAddress).stakeCredentialHash;

    const unsignedTx = this.meshTxBuilder
      .mintPlutusScriptV3()
      .mint('1', this.policyId, stringToHex(this.lockTitle))
      .mintingScript(this.mintScriptCbor)
      .mintRedeemerValue(mConStr0([]))
      .txOut(this.lockerAddress, [{ unit: assetUnit, quantity: '1' }])
      .txOutInlineDatumValue(
        mConStr0([
          mConStr0([pubKeyHash, stakeCredHash]),
          1, // Initial state: locked
        ])
      )
      .changeAddress(walletAddress)
      .requiredSignerHash(pubKeyHash)
      .selectUtxosFrom(utxos)
      .txInCollateral(
        collateral.input.txHash,
        collateral.input.outputIndex,
        collateral.output.amount,
        collateral.output.address
      )
      .setNetwork('preprod');

    return await unsignedTx.complete();
  }

  /**
   * Build lock transaction - set lock state to 1
   */
  async buildLock(walletAddress: string): Promise<string> {
    const assetUnit = this.policyId + stringToHex(this.lockTitle);
    const utxo = await this.getAddressUTXOAsset(this.lockerAddress, assetUnit);

    // Fetch wallet UTXOs from Blockfrost
    const utxos = await this.fetchWalletUtxos(walletAddress);
    const collateral = this.findCollateral(utxos);

    const pubKeyHash = deserializeAddress(walletAddress).pubKeyHash;
    const unsignedTx = this.meshTxBuilder;

    if (!utxo) {
      // Mint new token if doesn't exist
      const stakeCredHash =
        deserializeAddress(walletAddress).stakeCredentialHash;

      unsignedTx
        .mintPlutusScriptV3()
        .mint('1', this.policyId, stringToHex(this.lockTitle))
        .mintingScript(this.mintScriptCbor)
        .mintRedeemerValue(mConStr0([]))
        .txOut(this.lockerAddress, [{ unit: assetUnit, quantity: '1' }])
        .txOutInlineDatumValue(
          mConStr0([mConStr0([pubKeyHash, stakeCredHash]), 1])
        );
    } else {
      // Update existing token
      const datum = this.convertDatum(utxo.output.plutusData as string);
      const authPubKeyHash = deserializeAddress(datum.authorized).pubKeyHash;
      const authStakeCredHash =
        deserializeAddress(datum.authorized).stakeCredentialHash;

      unsignedTx
        .spendingPlutusScriptV3()
        .txIn(utxo.input.txHash, utxo.input.outputIndex)
        .txInInlineDatumPresent()
        .txInRedeemerValue(mConStr0([]))
        .txInScript(this.lockerScriptCbor)
        .txOut(this.lockerAddress, [{ unit: assetUnit, quantity: '1' }])
        .txOutInlineDatumValue(
          mConStr0([
            mConStr0([authPubKeyHash, authStakeCredHash]),
            1, // Lock
          ])
        );
    }

    unsignedTx
      .changeAddress(walletAddress)
      .requiredSignerHash(pubKeyHash)
      .selectUtxosFrom(utxos)
      .txInCollateral(
        collateral.input.txHash,
        collateral.input.outputIndex,
        collateral.output.amount,
        collateral.output.address
      )
      .setNetwork('preprod');

    return await unsignedTx.complete();
  }

  /**
   * Build unlock transaction - set lock state to 0
   */
  async buildUnlock(walletAddress: string): Promise<string> {
    const assetUnit = this.policyId + stringToHex(this.lockTitle);
    const utxo = await this.getAddressUTXOAsset(this.lockerAddress, assetUnit);

    if (!utxo) {
      throw new Error('Lock token not found. Initialize first.');
    }

    // Fetch wallet UTXOs from Blockfrost
    const utxos = await this.fetchWalletUtxos(walletAddress);
    const collateral = this.findCollateral(utxos);

    const datum = this.convertDatum(utxo.output.plutusData as string);
    const authPubKeyHash = deserializeAddress(datum.authorized).pubKeyHash;
    const authStakeCredHash =
      deserializeAddress(datum.authorized).stakeCredentialHash;
    const pubKeyHash = deserializeAddress(walletAddress).pubKeyHash;

    const unsignedTx = this.meshTxBuilder
      .spendingPlutusScriptV3()
      .txIn(utxo.input.txHash, utxo.input.outputIndex)
      .txInInlineDatumPresent()
      .txInRedeemerValue(mConStr0([]))
      .txInScript(this.lockerScriptCbor)
      .txOut(this.lockerAddress, [{ unit: assetUnit, quantity: '1' }])
      .txOutInlineDatumValue(
        mConStr0([
          mConStr0([authPubKeyHash, authStakeCredHash]),
          0, // Unlock
        ])
      )
      .changeAddress(walletAddress)
      .requiredSignerHash(pubKeyHash)
      .selectUtxosFrom(utxos)
      .txInCollateral(
        collateral.input.txHash,
        collateral.input.outputIndex,
        collateral.output.amount,
        collateral.output.address
      )
      .setNetwork('preprod');

    return await unsignedTx.complete();
  }

  /**
   * Build authority transfer transaction
   */
  async buildAuthority(
    walletAddress: string,
    newAuthority: string
  ): Promise<string> {
    const assetUnit = this.policyId + stringToHex(this.lockTitle);
    const utxo = await this.getAddressUTXOAsset(this.lockerAddress, assetUnit);

    if (!utxo) {
      throw new Error('Lock token not found. Initialize first.');
    }

    // Fetch wallet UTXOs from Blockfrost
    const utxos = await this.fetchWalletUtxos(walletAddress);
    const collateral = this.findCollateral(utxos);

    const datum = this.convertDatum(utxo.output.plutusData as string);
    const newAuthPubKeyHash = deserializeAddress(newAuthority).pubKeyHash;
    const newAuthStakeCredHash =
      deserializeAddress(newAuthority).stakeCredentialHash;
    const pubKeyHash = deserializeAddress(walletAddress).pubKeyHash;

    const unsignedTx = this.meshTxBuilder
      .spendingPlutusScriptV3()
      .txIn(utxo.input.txHash, utxo.input.outputIndex)
      .txInInlineDatumPresent()
      .txInRedeemerValue(mConStr1([])) // Authority redeemer
      .txInScript(this.lockerScriptCbor)
      .txOut(this.lockerAddress, [{ unit: assetUnit, quantity: '1' }])
      .txOutInlineDatumValue(
        mConStr0([
          mConStr0([newAuthPubKeyHash, newAuthStakeCredHash]),
          datum.isLock, // Preserve lock state
        ])
      )
      .changeAddress(walletAddress)
      .requiredSignerHash(pubKeyHash)
      .selectUtxosFrom(utxos)
      .txInCollateral(
        collateral.input.txHash,
        collateral.input.outputIndex,
        collateral.output.amount,
        collateral.output.address
      )
      .setNetwork('preprod');

    return await unsignedTx.complete();
  }

  /**
   * Get current lock status
   */
  async getStatus(): Promise<{
    isLocked: boolean;
    authority: string;
    exists: boolean;
  }> {
    const assetUnit = this.policyId + stringToHex(this.lockTitle);
    const utxo = await this.getAddressUTXOAsset(this.lockerAddress, assetUnit);

    if (!utxo) {
      return { isLocked: false, authority: '', exists: false };
    }

    const datum = this.convertDatum(utxo.output.plutusData as string);
    return {
      isLocked: datum.isLock === 1,
      authority: datum.authorized,
      exists: true,
    };
  }
}
