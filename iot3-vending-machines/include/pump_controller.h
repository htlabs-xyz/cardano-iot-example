#ifndef PUMP_CONTROLLER_H
#define PUMP_CONTROLLER_H

#include <Arduino.h>
#include "config.h"

enum PumpState {
    PUMP_IDLE,
    PUMP_ON,
    PUMP_COOLDOWN
};

class PumpController {
public:
    PumpController(uint8_t pin);

    void begin();
    void notifyAda(double adaAmount);
    void update();
    bool isActive();
    unsigned long getRemainingMs();

private:
    uint8_t pumpPin;
    PumpState state;
    unsigned long pumpOnTime;
    unsigned long totalDuration;
    unsigned long accumulatedMs;

    unsigned long calculateDurationMs(double adaAmount);
};

#endif
