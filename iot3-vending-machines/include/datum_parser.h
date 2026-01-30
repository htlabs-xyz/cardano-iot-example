#ifndef DATUM_PARSER_H
#define DATUM_PARSER_H

#include <Arduino.h>

// Result struct for parsed Plutus datum
struct DatumResult {
    bool success;
    String error;
    uint8_t pubKeyHash[28];
    uint8_t stakeCredHash[28];
    String authorityAddress;  // bech32 encoded
    bool isLocked;
};

// Parse Plutus datum from hex string
// Expected structure: Tag121[ Tag121[pubKeyHash, stakeCredHash], lockStatus ]
// network: 0 = testnet, 1 = mainnet
DatumResult parseDatum(const String& hexDatum, uint8_t network = 1);

// Utility: convert hex string to bytes
bool hexToBytes(const String& hex, uint8_t* out, size_t len);

#endif
