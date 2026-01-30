# Verification Kiosk Architecture Research Report

**Date:** 2026-01-31 | **Scope:** Raspberry Pi 5, NFC Reader (PN532), Next.js UI, Python Backend

---

## Recommended Architecture: REST API + WebSocket Hybrid

**Primary Pattern:** Python FastAPI service on localhost with Next.js frontend consuming both REST (one-shot verification) and WebSocket (real-time NFC events).

### System Design

```
┌─────────────────────────────────────────────┐
│  Next.js Frontend (React UI)               │
│  Port: 3000 (production: PM2/systemd)      │
├─────────────────────────────────────────────┤
│  API Layer:                                 │
│  • REST: http://localhost:5000 (sync)      │
│  • WebSocket: ws://localhost:5000 (events) │
├─────────────────────────────────────────────┤
│  Python FastAPI Service (Port: 5000)       │
│  ├─ NFC Reader Control (PN532 via SPI)     │
│  ├─ Blockchain Query (Blockfrost API)      │
│  └─ Event Broadcasting (WebSocket/SSE)     │
└─────────────────────────────────────────────┘
```

---

## Communication Pattern Comparison

| Aspect | REST (Current) | WebSocket (Real-time) | Subprocess IPC |
|--------|---|---|---|
| **Setup Complexity** | Simple | Moderate | Complex |
| **Memory (RPi5)** | Low (~5MB) | Medium (~10MB) | High (~20MB+) |
| **Latency** | 50-200ms polling | <10ms push | <1ms (local) |
| **Polling Overhead** | High (3s cycle) | None | N/A |
| **Dev Experience** | Standard HTTP | Requires socket handling | OS-dependent |
| **Scalability** | Good | Better | Not scalable |

**Choice Rationale:** WebSocket reduces polling overhead on limited RPi5 hardware; REST remains for one-shot operations.

---

## Technology Stack

### Backend: Python FastAPI

**Advantages:**
- Built-in async support → efficient concurrent event handling
- Type hints + Pydantic validation → robust NFC/blockchain data
- Auto-generated OpenAPI docs (useful for debugging)
- ~3x faster than Flask under load
- Minimal overhead on RPi5

**Implementation:**
```python
# Main service (FastAPI)
from fastapi import FastAPI
from fastapi.websockets import WebSocket
from PN532_handling import NFCReader  # Existing code

app = FastAPI()
nfc_reader = NFCReader()

@app.post("/verify")
async def verify_student(policy: str, asset: str, student_id: str):
    return verify_on_blockchain(policy, asset, student_id)

@app.websocket("/ws/scan-events")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        scan_data = nfc_reader.read_with_timeout()
        await websocket.send_json(scan_data)
```

### Frontend: Next.js (App Router)

**API Integration:**
- fetch() for REST verification (one-shot)
- Native WebSocket API for real-time scan events (no socket.io bloat)
- React hooks (useEffect + useState) for event listeners

**Production on RPi5:**
- Use `npm run build` for optimized static export
- Serve via PM2 or systemd (not dev server)
- ~100MB disk; ~80MB runtime memory

---

## Real-Time Event Delivery: WebSocket vs Polling

### Current Approach (Polling)
```
UI polls /status every 3s → Server responds
• Wasted requests when no scan
• Adds 30+ requests/minute unnecessary load
• 50-200ms latency to see results
```

### Recommended (WebSocket)
```
Server pushes event → UI receives instantly
• Zero overhead at idle
• <10ms latency
• RPi5 CPU benefit
• Persistent connection (single TCP stream)
```

**Alternative: Server-Sent Events (SSE)**
- Simpler than WebSocket (HTTP-based)
- Unidirectional (server → client only)
- Good for notifications; use if polling proves acceptable

---

## Raspberry Pi 5 Production Considerations

### Memory Constraints
- **Available:** ~6-7GB (after OS)
- **Next.js:** ~80-100MB
- **Python FastAPI:** ~30-50MB
- **Buffer:** ~6GB safe margin

✓ **Status:** Comfortable (not tight)

### Startup & Runtime
- **Cold boot time:** ~2-3min (acceptable for kiosk)
- **PM2 auto-restart:** Critical for uptime
- **Systemd service:** Better for production persistence

### Deployment Strategy
```bash
# Backend (Python FastAPI)
sudo systemctl enable cardano-nfc-api
sudo systemctl start cardano-nfc-api

# Frontend (Next.js)
npm run build
pm2 start ecosystem.config.js --env production
pm2 save && pm2 startup
```

---

## Architecture Decision Matrix

| Criterion | REST Only | REST + WebSocket | Subprocess IPC |
|-----------|-----------|---|---|
| KISS Score | 9/10 | 8/10 | 3/10 |
| Latency | Medium | Low | Ultra-low |
| RPi5 Resource Use | Low | Low | High |
| Error Resilience | Good | Good | Fragile |
| **Recommended** | ❌ | ✅ | ❌ |

---

## Implementation Path (YAGNI-Compliant)

### Phase 1: REST Baseline (Minimal)
Wrap existing `verify_student.py` logic in FastAPI endpoint. Keep polling in UI temporarily.

### Phase 2: WebSocket Real-Time (Optional)
Add `/ws/scan-events` endpoint for push notifications only if UI polling becomes bottleneck.

### Phase 3: Production Hardening
Add systemd service files, PM2 config, health checks.

---

## Key Decisions

1. **FastAPI over Flask:** 3x performance under load, async I/O, auto-docs
2. **WebSocket over polling:** Reduce CPU spike on event, instant UI feedback
3. **Localhost-only:** No network exposure needed (kiosk is local device)
4. **No subprocess IPC:** Too complex for KISS; OS process management is simpler

---

## Unresolved Questions

- What is acceptable UI latency for student verification? (Impacts polling interval tuning)
- Will kiosk handle concurrent verifications or single-user flow?
- What fallback if blockchain API (Blockfrost) times out?
