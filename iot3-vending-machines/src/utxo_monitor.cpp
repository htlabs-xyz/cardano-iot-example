#include "utxo_monitor.h"

UtxoMonitor::UtxoMonitor()
    : totalBalanceAda(0)
    , utxoCount(0)
    , isFirstPoll(true)
    , newUtxoCallback(nullptr) {
}

void UtxoMonitor::onNewUtxo(NewUtxoCallback callback) {
    newUtxoCallback = callback;
}

String UtxoMonitor::getUtxoId(const Utxo& utxo) {
    return utxo.txHash + "#" + String(utxo.outputIndex);
}

double UtxoMonitor::lovelaceToAda(uint64_t lovelace) {
    return lovelace / 1000000.0;
}

void UtxoMonitor::checkUtxos() {
    ApiResult result = fetchUtxos();

    if (!result.success) {
        Serial.printf("API error: %s\n", result.error.c_str());
        return;
    }

    std::set<String> currentUtxoIds;
    std::vector<Utxo> newUtxos;
    uint64_t totalLovelace = 0;

    for (const auto& utxo : result.utxos) {
        String utxoId = getUtxoId(utxo);
        currentUtxoIds.insert(utxoId);
        totalLovelace += utxo.lovelace;

        if (!isFirstPoll) {
            if (previousUtxoIds.find(utxoId) == previousUtxoIds.end()) {
                newUtxos.push_back(utxo);
            }
        }
    }

    totalBalanceAda = lovelaceToAda(totalLovelace);
    utxoCount = result.utxos.size();

    if (isFirstPoll) {
        Serial.printf("Initial balance: %.6f ADA\n", totalBalanceAda);
        Serial.printf("UTXO count: %d\n", utxoCount);
        Serial.println("Monitoring started...");
        isFirstPoll = false;
    }

    if (!newUtxos.empty()) {
        Serial.printf("\n=== NEW UTXO DETECTED ===\n");
        Serial.printf("Count: %d\n", newUtxos.size());

        for (const auto& utxo : newUtxos) {
            double adaAmount = lovelaceToAda(utxo.lovelace);
            Serial.printf("TX: %s#%d\n", utxo.txHash.c_str(), utxo.outputIndex);
            Serial.printf("Amount: %.6f ADA\n", adaAmount);

            if (newUtxoCallback) {
                newUtxoCallback(utxo, adaAmount);
            }
        }
        Serial.println("=========================\n");
    }

    previousUtxoIds = currentUtxoIds;
}

double UtxoMonitor::getTotalBalanceAda() {
    return totalBalanceAda;
}

int UtxoMonitor::getUtxoCount() {
    return utxoCount;
}
