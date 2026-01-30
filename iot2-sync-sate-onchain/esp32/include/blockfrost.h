#ifndef BLOCKFROST_H
#define BLOCKFROST_H

#include <Arduino.h>
#include <ArduinoJson.h>

// Result for asset state query (follows monitor.ts approach)
struct AssetStateResult {
    bool success;
    String error;
    String txHash;
    String inlineDatum;
};

void initBlockfrost();
AssetStateResult fetchAssetState(const char* assetUnit);

#endif
