#include "pump_controller.h"

PumpController::PumpController(uint8_t pin)
    : pumpPin(pin)
    , state(PUMP_IDLE)
    , pumpOnTime(0)
    , totalDuration(0)
    , accumulatedMs(0) {
}

void PumpController::begin() {
    pinMode(pumpPin, OUTPUT);
    digitalWrite(pumpPin, LOW);
}

unsigned long PumpController::calculateDurationMs(double adaAmount) {
    unsigned long durationMs = (unsigned long)(adaAmount * PUMP_MS_PER_ADA);

    if (durationMs < PUMP_MIN_DURATION_MS) {
        durationMs = PUMP_MIN_DURATION_MS;
    }
    if (durationMs > PUMP_MAX_DURATION_MS) {
        durationMs = PUMP_MAX_DURATION_MS;
    }

    return durationMs;
}

void PumpController::notifyAda(double adaAmount) {
    unsigned long durationMs = calculateDurationMs(adaAmount);

    Serial.printf("PUMP notify: %.2f ADA = %lums\n", adaAmount, durationMs);

    if (state == PUMP_IDLE) {
        state = PUMP_ON;
        pumpOnTime = millis();
        totalDuration = durationMs;
        digitalWrite(pumpPin, HIGH);
        Serial.println("PUMP ON");
    } else if (state == PUMP_ON) {
        unsigned long elapsed = millis() - pumpOnTime;
        unsigned long remaining = totalDuration > elapsed ? totalDuration - elapsed : 0;
        totalDuration = remaining + durationMs;

        if (totalDuration > PUMP_MAX_DURATION_MS) {
            totalDuration = PUMP_MAX_DURATION_MS;
        }

        Serial.printf("PUMP extended: total %lums\n", totalDuration);
    }
}

void PumpController::update() {
    if (state == PUMP_ON) {
        unsigned long elapsed = millis() - pumpOnTime;

        if (elapsed >= totalDuration) {
            state = PUMP_IDLE;
            digitalWrite(pumpPin, LOW);
            totalDuration = 0;
            Serial.println("PUMP OFF");
        }
    }
}

bool PumpController::isActive() {
    return state == PUMP_ON;
}

unsigned long PumpController::getRemainingMs() {
    if (state != PUMP_ON) return 0;
    unsigned long elapsed = millis() - pumpOnTime;
    return totalDuration > elapsed ? totalDuration - elapsed : 0;
}
