# Phase 2: Next.js Kiosk UI

## Overview
- **Priority:** High
- **Status:** pending
- **Description:** Build full-screen kiosk verification display

## Key Insights
- Dark theme with high contrast (accessibility)
- Large text for visibility from distance
- Real-time WebSocket for instant feedback
- Three states: Idle, Verifying, Result (success/fail)

## Requirements

### Functional
- Display idle screen with "Tap your card" prompt
- Show verification result (name, ID, department, status)
- Auto-reset to idle after 5 seconds
- WebSocket connection with auto-reconnect

### Non-Functional
- Full-screen kiosk mode
- Touch-free operation
- Works on 1080p display
- Loads under 3 seconds

## Architecture
```
Next.js App (port 3000)
├── app/
│   ├── layout.tsx      → Root layout (dark theme)
│   ├── page.tsx        → Main kiosk page
│   └── globals.css     → Tailwind + custom styles
├── components/
│   ├── kiosk-idle-screen.tsx
│   ├── kiosk-verifying-screen.tsx
│   ├── kiosk-result-screen.tsx
│   └── connection-status.tsx
└── hooks/
    └── use-websocket-scanner.ts
```

## UI States

### 1. Idle State
- Dark navy background (#0F172A)
- NFC icon with subtle pulse animation
- "Tap your card to verify" text
- Clock display (optional)

### 2. Verifying State
- Loading spinner
- "Verifying..." text
- 400-600ms minimum display

### 3. Success State
- Green accent (#22C55E)
- Checkmark icon
- Student info:
  - Name (large)
  - Student ID
  - Department
  - "VERIFIED" badge
- Auto-reset in 5 seconds

### 4. Failure State
- Red accent (#EF4444)
- X icon
- Error message
- "VERIFICATION FAILED" badge
- Auto-reset in 3 seconds

## Related Code Files

### Create
- `web/` - Next.js project root
- `web/app/page.tsx` - Main kiosk page
- `web/app/layout.tsx` - Root layout
- `web/app/globals.css` - Styles
- `web/components/kiosk-idle-screen.tsx`
- `web/components/kiosk-verifying-screen.tsx`
- `web/components/kiosk-result-screen.tsx`
- `web/hooks/use-websocket-scanner.ts`

## Implementation Steps

1. **Initialize Next.js project**
   ```bash
   npx create-next-app@latest web --typescript --tailwind --app
   ```

2. **Create WebSocket hook**
   - Connect to `ws://localhost:5000/ws/scan`
   - Handle connection states
   - Parse scan events

3. **Build UI components**
   - Idle screen with NFC icon
   - Verifying screen with spinner
   - Result screen with student info

4. **Implement state machine**
   - idle → verifying → success/fail → idle
   - Timeout-based auto-reset

5. **Add animations**
   - Pulse on idle NFC icon
   - Fade transitions between states
   - Checkmark/X icon animations

## Todo List
- [ ] Initialize Next.js project
- [ ] Setup Tailwind with dark theme
- [ ] Create WebSocket hook
- [ ] Build idle screen component
- [ ] Build verifying screen component
- [ ] Build result screen component
- [ ] Implement state transitions
- [ ] Add animations
- [ ] Test with mock data

## Success Criteria
- [ ] Full-screen display works
- [ ] WebSocket connects to backend
- [ ] State transitions are smooth
- [ ] Text readable from 2 meters
- [ ] Auto-reset works correctly

## Risk Assessment
| Risk | Mitigation |
|------|------------|
| WebSocket disconnect | Show reconnecting indicator |
| Slow response | Show verifying state immediately |
| Display scaling | Use viewport units (vh/vw) |

## Security Considerations
- No sensitive data stored in frontend
- WebSocket localhost only

## Next Steps
- After Phase 2: Integration testing (Phase 3)
