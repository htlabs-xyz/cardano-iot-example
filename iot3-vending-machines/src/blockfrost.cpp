#include "blockfrost.h"
#include "config.h"
#include <WiFiClientSecure.h>
#include <HTTPClient.h>

WiFiClientSecure secureClient;
HTTPClient http;

static int retryCount = 0;
static const int MAX_RETRIES = 3;
static const int BASE_DELAY_MS = 1000;

void initBlockfrost() {
    secureClient.setInsecure();
}

ApiResult fetchUtxos() {
    ApiResult result = {false, 0, "", {}};

    String url = "https://";
    url += BLOCKFROST_HOST;
    url += "/api/v0/addresses/";
    url += WALLET_ADDRESS;
    url += "/utxos?count=100&page=1&order=asc";

    http.begin(secureClient, url);
    http.addHeader("project_id", BLOCKFROST_API_KEY);
    http.setTimeout(15000);

    int httpCode = http.GET();
    result.httpCode = httpCode;

    if (httpCode == 200) {
        String payload = http.getString();

        JsonDocument doc;
        DeserializationError err = deserializeJson(doc, payload);

        if (err) {
            result.error = "JSON parse faipump: " + String(err.c_str());
            http.end();
            return result;
        }

        JsonArray utxoArray = doc.as<JsonArray>();
        for (JsonObject utxo : utxoArray) {
            Utxo u;
            u.txHash = utxo["tx_hash"].as<String>();
            u.outputIndex = utxo["output_index"].as<int>();

            JsonArray amounts = utxo["amount"].as<JsonArray>();
            for (JsonObject amt : amounts) {
                if (String(amt["unit"].as<const char*>()) == "lovelace") {
                    u.lovelace = strtoull(amt["quantity"].as<const char*>(), NULL, 10);
                    break;
                }
            }
            result.utxos.push_back(u);
        }

        result.success = true;
        retryCount = 0;

    } else if (httpCode == 404) {
        result.success = true;
        retryCount = 0;

    } else {
        result.error = "HTTP " + String(httpCode);

        if (retryCount < MAX_RETRIES) {
            int delayMs = BASE_DELAY_MS * (1 << retryCount);
            Serial.printf("Retry %d in %dms\n", retryCount + 1, delayMs);
            delay(delayMs);
            retryCount++;
        }
    }

    http.end();
    return result;
}
