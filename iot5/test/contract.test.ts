/* eslint-disable @typescript-eslint/no-unused-vars */
import { blockfrostProvider } from "../contract/scripts/common";
import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import {  BrowserWallet, deserializeAddress, MeshWallet } from "@meshsdk/core";
import { SupplyChainManagementContract } from "contract/scripts";

describe("Mint, Burn, Update, Remove Assets (NFT/TOKEN) CIP68", function () {
  let wallet: MeshWallet;
  beforeEach(async function () {
    wallet = new MeshWallet({
      networkId: 0,
      fetcher: blockfrostProvider,
      submitter: blockfrostProvider,
      key: {
        type: "mnemonic",
        words: process.env.APP_WALLET?.split(" ") || [],
      },
    });
  });

    test("Mint", async function () {
    const supplyChainManagementContract: SupplyChainManagementContract = new SupplyChainManagementContract({
      wallet: wallet,
    });
    const unsignedTx: string = await supplyChainManagementContract.mint([
      {
        assetName: "CIP68 Generators",
        metadata: {
          name: "CIP68 Generators",
          image: "ipfs://QmRzicpReutwCkM6aotuKjErFCUD213DpwPq6ByuzMJaua",
          mediaType: "image/jpg",
          description: "Open source dynamic assets (Token/NFT) generator (CIP68)",
          _pk: deserializeAddress(await wallet.getChangeAddress()).pubKeyHash,
        },
        quantity: "1",
        receiver: null!,
      },
    ]);
    const signedTx = await wallet.signTx(unsignedTx, true);
    const txHash = await wallet.submitTx(signedTx);
    console.log("https://preview.cexplorer.io/tx/" + txHash);
    blockfrostProvider.onTxConfirmed(txHash, () => {
      expect(txHash.length).toBe(64);
    });
  });

  test("Burn", async function () {
    const supplyChainManagementContract: SupplyChainManagementContract = new SupplyChainManagementContract({
      wallet: wallet,
    });
    const unsignedTx: string = await supplyChainManagementContract.burn([
      {
        assetName: "CIP68 Generators",
        quantity: "-1",
      },
    ]);
    const signedTx = await wallet.signTx(unsignedTx, true);
    const txHash = await wallet.submitTx(signedTx);
    console.log("https://preview.cexplorer.io/tx/" + txHash);
    jest.setTimeout(20000);
    expect(txHash.length).toBe(64);
  });

  test("Update", async function () {
    const supplyChainManagementContract: SupplyChainManagementContract = new SupplyChainManagementContract({
      wallet: wallet,
    });
    const unsignedTx: string = await supplyChainManagementContract.update([
      {
        assetName: "CIP68 Generators",
        metadata: {
          name: "2",
          image: "ipfs://QmRzicpReutwCkM6aotuKjErFCUD213DpwPq6ByuzMJaua",
          mediaType: "image/jpg",
          description: "Open source dynamic assets (Token/NFT) generator (CIP68)",
          owner: await wallet.getChangeAddress(),
          website: "https://cip68.cardano2vn.io",
          _pk: deserializeAddress(await wallet.getChangeAddress()).pubKeyHash,
        },
      },
    ]);
    const signedTx =await wallet.signTx(unsignedTx, true);
    const txHash = await wallet.submitTx(signedTx);
    console.log("https://preview.cexplorer.io/tx/" + txHash);
    expect(txHash.length).toBe(64);
  })
});