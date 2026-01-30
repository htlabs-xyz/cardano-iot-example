# Phase 3: Integration & Testing

## Overview
- **Priority:** Medium
- **Status:** pending
- **Description:** End-to-end testing and deployment setup

## Key Insights
- Test on actual Raspberry Pi hardware
- Ensure NFC reader works with new API layer
- Setup systemd services for auto-start

## Requirements

### Functional
- Full flow: NFC tap → API → Blockchain → UI display
- Services auto-start on boot
- Graceful error handling

### Non-Functional
- Boot to kiosk in under 60 seconds
- Stable for 24/7 operation
- Memory usage under 500MB total

## Architecture (Production)
```
systemd
├── nfc-api.service      → FastAPI (port 5000)
└── nfc-kiosk.service    → Next.js (port 3000)
         │
         ▼
    Chromium Kiosk Mode
    (full-screen browser)
```

## Implementation Steps

1. **Local integration test**
   - Start FastAPI server
   - Start Next.js dev server
   - Test NFC scan flow

2. **Deploy to Raspberry Pi**
   ```bash
   # Push to git
   git add . && git commit -m "feat: add verification kiosk" && git push

   # Pull on RPi
   ssh tid@192.168.1.16 'cd ~/cardano-iot-example && git pull'
   ```

3. **Install dependencies on RPi**
   ```bash
   # Python
   cd iot4-nfc-tag-identification
   pip install fastapi uvicorn[standard] websockets

   # Node.js
   cd web
   npm install
   npm run build
   ```

4. **Create systemd services**
   - `nfc-api.service` for FastAPI
   - `nfc-kiosk.service` for Next.js

5. **Setup Chromium kiosk**
   ```bash
   chromium-browser --kiosk --noerrdialogs http://localhost:3000
   ```

6. **Test full flow**
   - Reboot RPi
   - Wait for services
   - Scan NFC card
   - Verify display

## Todo List
- [ ] Test locally with mock NFC
- [ ] Deploy to Raspberry Pi
- [ ] Install dependencies
- [ ] Create systemd services
- [ ] Configure auto-start
- [ ] Test full hardware flow
- [ ] Document troubleshooting

## Success Criteria
- [ ] NFC scan shows result on UI within 2 seconds
- [ ] Services survive reboot
- [ ] No memory leaks after 1 hour
- [ ] Error states display correctly

## Risk Assessment
| Risk | Mitigation |
|------|------------|
| Service crash | systemd restart policy |
| Memory leak | Monitor with htop |
| Network timeout | Local-first, retry logic |

## Deployment Files

### Create
- `scripts/start-api.sh` - API startup script
- `scripts/start-kiosk.sh` - Kiosk startup script
- `systemd/nfc-api.service` - API service file
- `systemd/nfc-kiosk.service` - Kiosk service file

## Next Steps
- After Phase 3: Production hardening, monitoring
