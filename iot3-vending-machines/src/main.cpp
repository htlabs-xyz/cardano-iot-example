#include <Arduino.h>
#include <WiFi.h>
#include "config.h"
#include "blockfrost.h"
#include "datum_parser.h"

unsigned long lastPollTime = 0;
unsigned long pumpOnTime = 0;
bool pumpState = false;
bool isLocked = false;

#define PUMP_DURATION_MS 3000

void updatePump() {
    if (isLocked) {
        if (pumpState) {
            pumpState = false;
            digitalWrite(PUMP_PIN, LOW);
        }
    } else {
        if (pumpOnTime > 0 && millis() - pumpOnTime < PUMP_DURATION_MS) {
            if (!pumpState) {
                pumpState = true;
                digitalWrite(PUMP_PIN, HIGH);
            }
        } else {
            if (pumpState) {
                pumpState = false;
                digitalWrite(PUMP_PIN, LOW);
            }
        }
    }
}

// Check asset state following monitor.ts approach
void checkAssetState() {
    AssetStateResult state = fetchAssetState(ASSET_UNIT);

    if (!state.success) {
        Serial.printf("Asset state error: %s\n", state.error.c_str());
        return;
    }

    DatumResult datum = parseDatum(state.inlineDatum, 0); // 0=testnet

    if (datum.success) {
        if (isLocked != datum.isLocked) {
            isLocked = datum.isLocked;
            if (!isLocked) {
                pumpOnTime = millis();
            }
            Serial.printf(">>> State changed: %s\n", isLocked ? "LOCKED" : "UNLOCKED");
        }
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

    pinMode(PUMP_PIN, OUTPUT);
    digitalWrite(PUMP_PIN, LOW);

    Serial.println("\n\n=== ESP32 Cardano Pump Controller ===");
    Serial.println("=====================================\n");

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

    updatePump();

    static unsigned long lastHeapLog = 0;
    if (millis() - lastHeapLog >= 60000) {
        Serial.printf("[heap] %u bytes free\n", ESP.getFreeHeap());
        lastHeapLog = millis();
    }

    delay(10);
}
