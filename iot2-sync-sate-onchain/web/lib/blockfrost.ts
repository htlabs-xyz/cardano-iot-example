import { BlockfrostProvider } from "@meshsdk/core";

const blockfrostProviderSingleton = () => {
  const projectId = process.env.BLOCKFROST_API_KEY;
  if (!projectId) {
    throw new Error("BLOCKFROST_PROJECT_ID is not defined");
  }
  return new BlockfrostProvider(projectId);
};

declare const globalThis: {
  blockfrostProviderGlobal: ReturnType<typeof blockfrostProviderSingleton>;
} & typeof global;

const blockfrostProvider = globalThis.blockfrostProviderGlobal ?? blockfrostProviderSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.blockfrostProviderGlobal = blockfrostProvider;
}

export { blockfrostProvider };