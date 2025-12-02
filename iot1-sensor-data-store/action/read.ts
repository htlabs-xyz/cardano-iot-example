import { BlockfrostProvider, deserializeDatum, ForgeScript, MeshWallet, resolveScriptHash, stringToHex } from "@meshsdk/core";
import * as dotenv from "dotenv";
import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
dotenv.config();

let provider: BlockfrostProvider = new BlockfrostProvider(process.env.BLOCKFROST_API_KEY || "");
let blockFrostAPI = new BlockFrostAPI({ projectId: process.env.BLOCKFROST_API_KEY || '', });
let wallet = new MeshWallet({
  networkId: 0,
  fetcher: provider,
  submitter: provider,
  key: {
    type: 'mnemonic',
    words: process.env.MNEMONIC?.split(' ') || [],
  },
});
export const readDataFromContract = async () => {
  const sensorName = 'dht22_01';
  const forgingScript = ForgeScript.withOneSignature(await wallet.getChangeAddress());
  const policyId = resolveScriptHash(forgingScript);
  const assetFeed = policyId + stringToHex(sensorName);
  const txs = await blockFrostAPI.assetsTransactions(assetFeed);
  const listTemperature = await Promise.all(txs.map(async tx => {
    const utxo = await blockFrostAPI.txsUtxos(tx.tx_hash);
    const datum_hash = utxo.outputs[0].inline_datum;
    const datum_deserialize = deserializeDatum(datum_hash || '');
    if (
      datum_deserialize &&
      datum_deserialize.fields &&
      datum_deserialize.fields[0].int &&
      datum_deserialize.fields[1].int
    ) {
      return {
        time: new Date(tx.block_time * 1000),
        temperature: datum_deserialize.fields[0].int,
        humidity: datum_deserialize.fields[1].int,
        tx_ref: 'https://preprod.cexplorer.io/tx/' + utxo.inputs[0].tx_hash,
      };
    }
  }));
  return listTemperature.filter(item => item !== undefined);
}