#include <Arduino.h>
#include <WiFi.h>
#include "config.h"
#include "blockfrost.h"
#include "utxo_monitor.h"
#include "pump_controller.h"

UtxoMonitor monitor;
PumpController pump(PUMP_PIN);
unsigned long lastPollTime = 0;

void onNewUtxoDetected(const Utxo& utxo, double adaAmount) {
    Serial.printf(">>> Received %.2f ADA!\n", adaAmount);
    pump.notifyAda(adaAmount);
}

void setup() {
    Serial.begin(115200);
    delay(1000);

    Serial.println("\n\n=== XIAO ESP32C3 Starting ===");
    Serial.println("Cardano UTXO Monitor");
    Serial.println("==========================\n");

    pump.begin();

    Serial.println("Connecting WiFi...");
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED) {
        delay(250);
        digitalWrite(PUMP_PIN, HIGH);
        delay(250);
        digitalWrite(PUMP_PIN, LOW);
        Serial.print(".");
    }
    Serial.println("\nWiFi OK!");

    for (int i = 0; i < 2; i++) {
        digitalWrite(PUMP_PIN, HIGH);
        delay(100);
        digitalWrite(PUMP_PIN, LOW);
        delay(100);
    }

    initBlockfrost();

    monitor.onNewUtxo(onNewUtxoDetected);

    monitor.checkUtxos();
    lastPollTime = millis();
}

void loop() {
    pump.update();

    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi lost, reconnecting...");
        WiFi.reconnect();
        delay(5000);
        return;
    }

    if (millis() - lastPollTime >= POLL_INTERVAL_MS) {
        monitor.checkUtxos();
        lastPollTime = millis();

        if (pump.isActive()) {
            Serial.printf("PUMP remaining: %lums\n", pump.getRemainingMs());
        }
    }

    delay(10);
}
