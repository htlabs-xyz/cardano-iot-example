#ifndef CONFIG_H
#define CONFIG_H

#define WIFI_SSID "VIETTEL"
#define WIFI_PASSWORD "00000001"

#define BLOCKFROST_HOST "cardano-preprod.blockfrost.io"
#define BLOCKFROST_API_KEY "preprod8nIuUOSOqMeYYUsVXtnMRSUtgm1NBKBu"

// Asset unit = policy_id + hex(asset_name)
// "locker_537" in hex = 6c6f636b65725f353337
// policyId from wallet-derived locker (iot2 init tx b77d733d... on 2026-05-22)
#define ASSET_UNIT "14f654abdb464eda741251bf79cf2b5735b5df571a55008875de56766c6f636b65725f353337"

#define POLL_INTERVAL_MS 1000

// Pump relay/control output
#define PUMP_PIN 2             // GPIO2 (D2)

#endif
