// Plutus datum CBOR parser using TinyCBOR
// Parses: Tag121[ Tag121[pubKeyHash, stakeCredHash], lockStatus ]

#include "datum_parser.h"
#include "bech32.h"
#include <cbor.h>

bool hexToBytes(const String& hex, uint8_t* out, size_t len) {
    if (hex.length() != len * 2) return false;

    for (size_t i = 0; i < len; i++) {
        char high = hex.charAt(i * 2);
        char low = hex.charAt(i * 2 + 1);

        uint8_t h = (high >= 'a') ? (high - 'a' + 10) :
                    (high >= 'A') ? (high - 'A' + 10) : (high - '0');
        uint8_t l = (low >= 'a') ? (low - 'a' + 10) :
                    (low >= 'A') ? (low - 'A' + 10) : (low - '0');

        out[i] = (h << 4) | l;
    }
    return true;
}

DatumResult parseDatum(const String& hexDatum, uint8_t network) {
    DatumResult result = {};
    result.success = false;
    memset(result.pubKeyHash, 0, 28);
    memset(result.stakeCredHash, 0, 28);

    if (hexDatum.length() == 0) {
        result.error = "Empty datum";
        return result;
    }

    // Convert hex to bytes
    size_t byteLen = hexDatum.length() / 2;
    uint8_t* bytes = new uint8_t[byteLen];

    if (!hexToBytes(hexDatum, bytes, byteLen)) {
        result.error = "Invalid hex";
        delete[] bytes;
        return result;
    }

    // Parse CBOR
    CborParser parser;
    CborValue value;
    CborError err;

    err = cbor_parser_init(bytes, byteLen, 0, &parser, &value);
    if (err != CborNoError) {
        result.error = "CBOR init failed";
        delete[] bytes;
        return result;
    }

    // Expect outer tag 121 (Constr 0)
    if (!cbor_value_is_tag(&value)) {
        result.error = "Expected tag";
        delete[] bytes;
        return result;
    }

    CborTag outerTag;
    cbor_value_get_tag(&value, &outerTag);
    if (outerTag != 121) {
        result.error = "Expected tag 121, got " + String((int)outerTag);
        delete[] bytes;
        return result;
    }
    cbor_value_skip_tag(&value);

    // Enter outer array
    if (!cbor_value_is_array(&value)) {
        result.error = "Expected array after tag";
        delete[] bytes;
        return result;
    }

    CborValue outerArray;
    err = cbor_value_enter_container(&value, &outerArray);
    if (err != CborNoError) {
        result.error = "Failed to enter outer array";
        delete[] bytes;
        return result;
    }

    // First element: credential (Tag 121 with array of 2 byte strings)
    if (!cbor_value_is_tag(&outerArray)) {
        result.error = "Expected credential tag";
        delete[] bytes;
        return result;
    }

    CborTag credTag;
    cbor_value_get_tag(&outerArray, &credTag);
    if (credTag != 121) {
        result.error = "Expected credential tag 121, got " + String((int)credTag);
        delete[] bytes;
        return result;
    }
    cbor_value_skip_tag(&outerArray);

    // Enter credential array
    if (!cbor_value_is_array(&outerArray)) {
        result.error = "Expected credential array";
        delete[] bytes;
        return result;
    }

    CborValue credArray;
    err = cbor_value_enter_container(&outerArray, &credArray);
    if (err != CborNoError) {
        result.error = "Failed to enter credential array";
        delete[] bytes;
        return result;
    }

    // Extract pubKeyHash (28 bytes)
    if (!cbor_value_is_byte_string(&credArray)) {
        result.error = "Expected pubKeyHash bytes";
        delete[] bytes;
        return result;
    }

    size_t pubKeyLen = 28;
    err = cbor_value_copy_byte_string(&credArray, result.pubKeyHash, &pubKeyLen, &credArray);
    if (err != CborNoError || pubKeyLen != 28) {
        result.error = "Failed to read pubKeyHash (len=" + String(pubKeyLen) + ")";
        delete[] bytes;
        return result;
    }

    // Extract stakeCredHash (28 bytes)
    if (!cbor_value_is_byte_string(&credArray)) {
        result.error = "Expected stakeCredHash bytes";
        delete[] bytes;
        return result;
    }

    size_t stakeLen = 28;
    err = cbor_value_copy_byte_string(&credArray, result.stakeCredHash, &stakeLen, &credArray);
    if (err != CborNoError || stakeLen != 28) {
        result.error = "Failed to read stakeCredHash (len=" + String(stakeLen) + ")";
        delete[] bytes;
        return result;
    }

    // Leave credential array
    err = cbor_value_leave_container(&outerArray, &credArray);
    if (err != CborNoError) {
        result.error = "Failed to leave credential array";
        delete[] bytes;
        return result;
    }

    // Second element: lockStatus (integer)
    if (!cbor_value_is_integer(&outerArray)) {
        result.error = "Expected lockStatus integer";
        delete[] bytes;
        return result;
    }

    int lockStatus;
    cbor_value_get_int(&outerArray, &lockStatus);
    result.isLocked = (lockStatus == 1);

    // Encode bech32 address
    result.authorityAddress = encodeCardanoAddress(
        result.pubKeyHash,
        result.stakeCredHash,
        network
    );

    result.success = true;
    delete[] bytes;
    return result;
}
