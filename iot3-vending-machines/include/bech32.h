#ifndef BECH32_H
#define BECH32_H

#include <Arduino.h>

// Bech32 encoding for Cardano addresses
// Based on sipa/bech32 reference implementation (BIP-173)

// Encode Cardano base address (type 0x01) from pubKeyHash + stakeCredHash
// network: 0 = testnet, 1 = mainnet
String encodeCardanoAddress(
    const uint8_t* pubKeyHash,      // 28 bytes
    const uint8_t* stakeCredHash,   // 28 bytes
    uint8_t network                 // 0 or 1
);

#endif
