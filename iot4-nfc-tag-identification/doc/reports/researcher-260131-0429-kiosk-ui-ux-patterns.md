# Kiosk UI/UX Patterns Research Report
## Student NFC Identity Verification System

**Date:** 2026-01-31 | **Project:** iot4-nfc-tag-identification

---

## Recommended UI Layout

**Full-screen kiosk design (1920x1080 minimum):**
- **Header (10%):** Branding/institution logo, title "Scan Your Card"
- **Main Zone (60%):** Centered large card reader icon with animated pulse
- **Display Zone (20%):** Student info (Name, ID, Department) in card/box format
- **Status Zone (10%):** Verification status with animation & timestamp

**Rationale:** Large touch-free interface, minimal text, clear visual hierarchy.

---

## Color Scheme

| Element | Color | Contrast | WCAG |
|---------|-------|----------|------|
| Background | Dark Navy (#0A1929) | - | ADA |
| Status Success | Bright Green (#22C55E) | 4.5:1 | AAA |
| Status Fail | Bright Red (#EF4444) | 4.5:1 | AAA |
| Text Primary | White (#FFFFFF) | 21:1 | AAA |
| Accent | Electric Blue (#3B82F6) | 8.6:1 | AAA |
| Card Background | Charcoal (#1F2937) | - | - |

**Guidelines:** Minimum 4.5:1 contrast ratio, avoid color-only status indicators, use icons + color.

---

## Animation & Feedback Patterns

**Idle State (2-2.5 min):**
- Subtle animated pulse on card reader icon
- Rotating institutional branding or welcome message
- "Scan card to begin" text with gentle fade in/out

**Scanning Process:**
- Loading spinner (400-600ms) with minimal animation
- Audio + visual feedback on successful read

**Success State (1.3-2 sec display):**
- Checkmark animation (✓) with green background
- Student details slide up from bottom (300ms ease-out)
- Fade out after 2 seconds, return to idle

**Failure State (2-3 sec display):**
- Error icon (✗) with red background + gentle shake (200ms)
- Error message: "Card not recognized. Please try again."
- Auto-reset to idle state

---

## Accessibility Considerations

✓ **Typography:** 48pt+ for headers, 36pt+ for status, sans-serif (Roboto/Open Sans)
✓ **Touch Targets:** Min 72x72px buttons (kiosk standard)
✓ **No Sound Dependency:** All feedback is visual + haptic (optional vibration)
✓ **High Contrast Mode:** Green/Red/White palette meets WCAG AAA
✓ **Screen Reader:** Fallback text for status indicators
✓ **Mounting Height:** Center display at 48-60" (wheelchair accessible)
✓ **No Time Pressure:** Auto-reset only after successful display

---

## Implementation Stack (Suggested)

- **Frontend:** React/Vue.js (full-screen SPA)
- **Animation:** Framer Motion or CSS3 (GPU-accelerated)
- **State Management:** Simple state machine for scan/verify/success/fail
- **Accessibility:** ARIA labels, semantic HTML, tested with axe-core

---

## Risk Assessment & Mitigation

| Risk | Mitigation |
|------|-----------|
| Network latency during verification | Placeholder animation (2-3 sec max) |
| Accidental double-scan | Debounce NFC reads (500ms) |
| Bright sunlight washout | Matte screen, high brightness (600+ nits) |
| Repeated failures discouraging users | Helpful error messages + clear retry path |

---

## References & Resources

- [Kiosk Industry UX Design Checklist](https://kioskindustry.org/kiosk-ux-ui-how-to-design-checklist/)
- [Digital Kiosk Accessibility Guide](https://userway.org/blog/kiosk-accessibility/)
- [WCAG Status Indicators](https://carbondesignsystem.com/patterns/status-indicator-pattern/)
- [Kiosk Screensaver Best Practices](https://news.dynatouch.com/get-the-most-out-of-your-kiosk-with-screensavers/)
- [ADA Accessibility Standards](https://www.levelaccess.com/blog/unlocking-kiosk-accessibility-tips-for-inclusive-compliant-self-service-experiences/)

---

## Unresolved Questions

1. Should kiosk support optional audio feedback (success beep) for noisy environments?
2. Preferred framework for Raspberry Pi deployment (Electron, Browser-based, Native)?
3. Is haptic feedback (vibration on success/fail) desired for faster user acknowledgment?
