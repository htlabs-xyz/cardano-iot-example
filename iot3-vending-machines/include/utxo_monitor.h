#ifndef UTXO_MONITOR_H
#define UTXO_MONITOR_H

#include <Arduino.h>
#include <set>
#include "blockfrost.h"

typedef void (*NewUtxoCallback)(const Utxo& utxo, double adaAmount);

class UtxoMonitor {
public:
    UtxoMonitor();

    void onNewUtxo(NewUtxoCallback callback);
    void checkUtxos();
    double getTotalBalanceAda();
    int getUtxoCount();

private:
    std::set<String> previousUtxoIds;
    double totalBalanceAda;
    int utxoCount;
    bool isFirstPoll;
    NewUtxoCallback newUtxoCallback;

    String getUtxoId(const Utxo& utxo);
    double lovelaceToAda(uint64_t lovelace);
};

#endif
