import fs from "node:fs";
import path from "node:path";
import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import { BlockfrostProvider, MeshWallet } from "@meshsdk/core";
import dotenv from "dotenv";
import { readDHT22 } from "../sensor";
import { SensorContract } from "./index";

dotenv.config();

type BatchRecord = {
  sample: number;
  sensorName: string;
  temperature: number;
  humidity: number;
  temperatureOnChain: number;
  humidityOnChain: number;
  txHash: string;
  explorer: string;
  confirmedAt: string;
};

const samples = Number(process.env.SAMPLES || 10);
const delayMs = Number(process.env.SAMPLE_DELAY_MS || 5000);
const runId = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
const outputDir = path.join(process.cwd(), "evidence");
const outputPath = path.join(outputDir, `iot1-batch-${runId}.json`);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForTx(api: BlockFrostAPI, txHash: string) {
  const started = Date.now();
  while (Date.now() - started < 240_000) {
    try {
      await api.txs(txHash);
      return new Date().toISOString();
    } catch {
      await sleep(10_000);
    }
  }
  throw new Error(`Timed out waiting for confirmation: ${txHash}`);
}

function summarize(records: BatchRecord[]) {
  const temperatures = records.map((record) => record.temperature);
  const humidities = records.map((record) => record.humidity);
  const average = (values: number[]) =>
    values.reduce((total, value) => total + value, 0) / values.length;

  return {
    count: records.length,
    temperature: {
      min: Math.min(...temperatures),
      max: Math.max(...temperatures),
      avg: Number(average(temperatures).toFixed(2)),
    },
    humidity: {
      min: Math.min(...humidities),
      max: Math.max(...humidities),
      avg: Number(average(humidities).toFixed(2)),
    },
  };
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });

  const provider = new BlockfrostProvider(process.env.BLOCKFROST_API_KEY || "");
  const api = new BlockFrostAPI({
    projectId: process.env.BLOCKFROST_API_KEY || "",
  });
  const wallet = new MeshWallet({
    networkId: 0,
    fetcher: provider,
    submitter: provider,
    key: {
      type: "mnemonic",
      words: process.env.MNEMONIC?.split(" ") || [],
    },
  });
  const records: BatchRecord[] = [];

  for (let sample = 1; sample <= samples; sample += 1) {
    const reading = await readDHT22();
    if (!reading?.temperature || !reading?.humidity) {
      throw new Error(`No valid sensor data for sample ${sample}`);
    }

    const sensorName = `dht22_${runId}_${String(sample).padStart(2, "0")}`;
    const temperatureOnChain = Math.round(reading.temperature * 1000);
    const humidityOnChain = Math.round(reading.humidity * 1000);

    console.log(
      `sample ${sample}/${samples}: ${sensorName} ${reading.temperature.toFixed(
        1,
      )}C ${reading.humidity.toFixed(1)}%`,
    );

    const contract = new SensorContract({ wallet, provider });
    const unsignedTx = await contract.write({
      sensorName,
      temperature: temperatureOnChain,
      humidity: humidityOnChain,
    });
    const signedTx = await wallet.signTx(unsignedTx, true);
    const txHash = await wallet.submitTx(signedTx);
    console.log(`submitted: ${txHash}`);

    const confirmedAt = await waitForTx(api, txHash);
    console.log(`confirmed: ${txHash}`);

    records.push({
      sample,
      sensorName,
      temperature: reading.temperature,
      humidity: reading.humidity,
      temperatureOnChain,
      humidityOnChain,
      txHash,
      explorer: `https://preprod.cexplorer.io/tx/${txHash}`,
      confirmedAt,
    });

    fs.writeFileSync(
      outputPath,
      JSON.stringify({ runId, records, summary: summarize(records) }, null, 2),
    );

    if (sample < samples) {
      await sleep(delayMs);
    }
  }

  console.log(`summary: ${JSON.stringify(summarize(records))}`);
  console.log(`evidence: ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
