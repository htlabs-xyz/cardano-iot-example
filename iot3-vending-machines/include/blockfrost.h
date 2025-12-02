#ifndef BLOCKFROST_H
#define BLOCKFROST_H

#include <Arduino.h>
#include <ArduinoJson.h>
#include <vector>

struct Utxo {
    String txHash;
    int outputIndex;
    uint64_t lovelace;
};

struct ApiResult {
    bool success;
    int httpCode;
    String error;
    std::vector<Utxo> utxos;
};

void initBlockfrost();
ApiResult fetchUtxos();

#endif
