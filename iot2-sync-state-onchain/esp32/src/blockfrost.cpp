#include "blockfrost.h"
#include "config.h"
#include <WiFiClientSecure.h>
#include <HTTPClient.h>

WiFiClientSecure secureClient;
HTTPClient http;

void initBlockfrost() {
    secureClient.setInsecure();
}

// Fetch asset state following monitor.ts approach:
// 1. GET /assets/{unit}/transactions -> get latest tx_hash
// 2. GET /txs/{hash}/utxos -> get inline_datum from outputs
AssetStateResult fetchAssetState(const char* assetUnit) {
    AssetStateResult result = {false, "", "", ""};

    // Step 1: Get asset transactions
    String url = "https://";
    url += BLOCKFROST_HOST;
    url += "/api/v0/assets/";
    url += assetUnit;
    url += "/transactions?order=desc&count=1";

    http.begin(secureClient, url);
    http.addHeader("project_id", BLOCKFROST_API_KEY);
    http.setTimeout(15000);

    int httpCode = http.GET();
    if (httpCode != 200) {
        result.error = "Asset txs HTTP " + String(httpCode);
        http.end();
        return result;
    }

    String payload = http.getString();
    http.end();

    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, payload);
    if (err) {
        result.error = "JSON parse error: " + String(err.c_str());
        return result;
    }

    JsonArray txArray = doc.as<JsonArray>();
    if (txArray.size() == 0) {
        result.error = "No transactions found";
        return result;
    }

    result.txHash = txArray[0]["tx_hash"].as<String>();

    // Step 2: Get transaction UTXOs
    url = "https://";
    url += BLOCKFROST_HOST;
    url += "/api/v0/txs/";
    url += result.txHash;
    url += "/utxos";

    http.begin(secureClient, url);
    http.addHeader("project_id", BLOCKFROST_API_KEY);
    http.setTimeout(15000);

    httpCode = http.GET();
    if (httpCode != 200) {
        result.error = "Tx utxos HTTP " + String(httpCode);
        http.end();
        return result;
    }

    payload = http.getString();
    http.end();

    err = deserializeJson(doc, payload);
    if (err) {
        result.error = "JSON parse error: " + String(err.c_str());
        return result;
    }

    // Find output with inline_datum (first output like monitor.ts)
    JsonArray outputs = doc["outputs"].as<JsonArray>();
    if (outputs.size() > 0) {
        JsonObject firstOutput = outputs[0];
        if (firstOutput["inline_datum"].is<const char*>()) {
            result.inlineDatum = firstOutput["inline_datum"].as<String>();
        }
    }

    if (result.inlineDatum.length() == 0) {
        result.error = "No inline_datum in outputs";
        return result;
    }

    result.success = true;
    return result;
}
