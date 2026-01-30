#include <Arduino.h>
#include <WiFi.h>
#include "config.h"
#include "blockfrost.h"
#include "datum_parser.h"

unsigned long lastPollTime = 0;

// Check asset state following monitor.ts approach
void checkAssetState() {
    AssetStateResult state = fetchAssetState(ASSET_UNIT);

    if (!state.success) {
        Serial.printf("Asset state error: %s\n", state.error.c_str());
        return;
    }

    DatumResult datum = parseDatum(state.inlineDatum, 0); // 0=testnet

    if (datum.success) {
        Serial.printf("Authority: %s | Locked: %s\n",
            datum.authorityAddress.c_str(),
            datum.isLocked ? "true" : "false");
    } else {
        Serial.printf("Datum error: %s\n", datum.error.c_str());
    }
}

void setup() {
    Serial.begin(115200);
    delay(1000);

    Serial.println("\n\n=== ESP32 Cardano Asset Monitor ===");
    Serial.println("===================================\n");

    Serial.println("Connecting WiFi...");
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi OK!");

    initBlockfrost();
    checkAssetState();
    lastPollTime = millis();
}

void loop() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi lost, reconnecting...");
        WiFi.reconnect();
        delay(5000);
        return;
    }

    if (millis() - lastPollTime >= POLL_INTERVAL_MS) {
        checkAssetState();
        lastPollTime = millis();
    }

    delay(10);
}
