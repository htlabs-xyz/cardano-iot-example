// Bech32 encoding for Cardano addresses
// Ported from sipa/bech32 reference implementation (BIP-173)

#include "bech32.h"

static const char* CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";

// Bech32 polymod checksum calculation
static uint32_t bech32_polymod(const uint8_t* values, size_t len) {
    uint32_t chk = 1;
    static const uint32_t GEN[] = {
        0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3
    };
    for (size_t i = 0; i < len; i++) {
        uint8_t top = chk >> 25;
        chk = ((chk & 0x1ffffff) << 5) ^ values[i];
        for (int j = 0; j < 5; j++) {
            if ((top >> j) & 1) chk ^= GEN[j];
        }
    }
    return chk;
}

// Convert 8-bit data to 5-bit groups for bech32
static bool convert_bits(
    uint8_t* out, size_t* outlen,
    const uint8_t* in, size_t inlen,
    int frombits, int tobits, bool pad
) {
    uint32_t acc = 0;
    int bits = 0;
    size_t maxv = (1 << tobits) - 1;
    *outlen = 0;

    for (size_t i = 0; i < inlen; i++) {
        acc = (acc << frombits) | in[i];
        bits += frombits;
        while (bits >= tobits) {
            bits -= tobits;
            out[(*outlen)++] = (acc >> bits) & maxv;
        }
    }

    if (pad && bits > 0) {
        out[(*outlen)++] = (acc << (tobits - bits)) & maxv;
    }
    return true;
}

String encodeCardanoAddress(
    const uint8_t* pubKeyHash,
    const uint8_t* stakeCredHash,
    uint8_t network
) {
    // Build address payload: type_byte | pubKeyHash | stakeCredHash
    // Type byte format: (address_type << 4) | network_id
    // Type 0 = base address with both keyhash credentials
    // Network: 0 = testnet, 1 = mainnet
    uint8_t payload[57];
    payload[0] = (0x00 << 4) | (network & 0x0F);
    memcpy(payload + 1, pubKeyHash, 28);
    memcpy(payload + 29, stakeCredHash, 28);

    // HRP: "addr" for mainnet, "addr_test" for testnet
    const char* hrp = (network == 1) ? "addr" : "addr_test";
    size_t hrplen = strlen(hrp);

    // Convert 8-bit payload to 5-bit groups
    uint8_t data5bit[92]; // 57 * 8 / 5 + 1 = ~92
    size_t data5len;
    convert_bits(data5bit, &data5len, payload, 57, 8, 5, true);

    // Build checksum input: hrp_expand + data + 6 zeros
    // hrp_expand = [high bits of each char] + [0] + [low bits of each char]
    size_t chkInputLen = hrplen + 1 + hrplen + data5len + 6;
    uint8_t* chkInput = new uint8_t[chkInputLen];
    size_t pos = 0;

    // HRP expansion: high bits (>> 5)
    for (size_t i = 0; i < hrplen; i++) {
        chkInput[pos++] = hrp[i] >> 5;
    }
    // Separator
    chkInput[pos++] = 0;
    // HRP expansion: low bits (& 31)
    for (size_t i = 0; i < hrplen; i++) {
        chkInput[pos++] = hrp[i] & 31;
    }

    // Append 5-bit data
    memcpy(chkInput + pos, data5bit, data5len);
    pos += data5len;

    // Append 6 zeros for checksum calculation
    memset(chkInput + pos, 0, 6);

    // Calculate checksum (XOR with 1 for bech32)
    uint32_t polymod = bech32_polymod(chkInput, pos + 6) ^ 1;
    delete[] chkInput;

    uint8_t checksum[6];
    for (int i = 0; i < 6; i++) {
        checksum[i] = (polymod >> (5 * (5 - i))) & 31;
    }

    // Build result string: hrp + "1" + data + checksum
    String result = String(hrp) + "1";
    for (size_t i = 0; i < data5len; i++) {
        result += CHARSET[data5bit[i]];
    }
    for (int i = 0; i < 6; i++) {
        result += CHARSET[checksum[i]];
    }

    return result;
}
