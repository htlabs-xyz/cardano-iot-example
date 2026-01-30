# Phase 1: FastAPI Backend

## Overview
- **Priority:** High
- **Status:** pending
- **Description:** Create FastAPI server wrapping existing Python NFC/Cardano code

## Key Insights
- Existing `verify_student.py` has all verification logic
- FastAPI provides async WebSocket support out-of-box
- Reuse `nfc.py` and `cardano.py` modules directly

## Requirements

### Functional
- REST endpoint: `POST /api/verify` - manual verification trigger
- WebSocket endpoint: `/ws/scan` - real-time NFC scan events
- Health check: `GET /api/health`

### Non-Functional
- Response time < 500ms for blockchain query
- WebSocket reconnect handling
- Graceful error responses

## Architecture
```
FastAPI Server (port 5000)
├── /api/verify      POST   → Trigger NFC scan + verify
├── /api/health      GET    → Server status
└── /ws/scan         WS     → Real-time scan events
         │
         ▼
    NFC Scanner Thread
         │
         ▼
    Cardano Verification
```

## Related Code Files

### Modify
- None (create new files)

### Create
- `api/main.py` - FastAPI app entry
- `api/routes.py` - API endpoints
- `api/websocket_manager.py` - WebSocket connection manager
- `api/nfc_scanner.py` - Background NFC scanning thread

### Reuse (import)
- `nfc.py` - NFC read/write functions
- `cardano.py` - Blockchain verification
- `config.py` - Environment config

## Implementation Steps

1. **Setup FastAPI project structure**
   ```
   api/
   ├── __init__.py
   ├── main.py
   ├── routes.py
   ├── websocket_manager.py
   └── nfc_scanner.py
   ```

2. **Create WebSocket manager**
   - Connection pool for multiple clients
   - Broadcast scan results to all connected clients

3. **Create NFC scanner service**
   - Background thread polling NFC reader
   - On card detect: read data, verify on blockchain, broadcast result
   - Debounce: ignore same card for 3 seconds

4. **Create REST endpoints**
   - Health check returns server status
   - Manual verify endpoint for testing

5. **Add requirements**
   - `fastapi`, `uvicorn[standard]`, `websockets`

## Todo List
- [ ] Create api/ directory structure
- [ ] Implement WebSocket manager
- [ ] Implement NFC scanner background service
- [ ] Create FastAPI routes
- [ ] Add to requirements.txt
- [ ] Test locally

## Success Criteria
- [ ] `GET /api/health` returns 200
- [ ] WebSocket connects and receives scan events
- [ ] NFC scan triggers broadcast to all clients
- [ ] Blockchain verification result included in response

## Risk Assessment
| Risk | Mitigation |
|------|------------|
| NFC reader busy | Single scanner thread with queue |
| WebSocket disconnect | Auto-reconnect in frontend |
| Blockfrost timeout | 10s timeout + retry once |

## Security Considerations
- CORS: localhost only (kiosk mode)
- No authentication needed (local network)
- Rate limit: 1 scan per 3 seconds (debounce)

## Next Steps
- After Phase 1: Build Next.js UI (Phase 2)
