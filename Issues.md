# 🐛 FINZO — Issues

> Log every bug, blocker, and design question here.
> Format: [ISSUE-XXX] with status tracking.

---

## 🔴 Open Issues

### [ISSUE-001] — Node version slightly below RN 0.83 requirement
- **Type:** Warning (non-blocking)
- **Found:** M0 Setup
- **Details:** Node v20.19.3 installed, RN 0.83 / Metro 0.83 packages want >= 20.19.4. Causes npm warnings but no functional issues.
- **Status:** Open (monitoring)
- **Proposed Fix:** Update Node to >= 20.19.4 when convenient

### [ISSUE-002] — React peer dependency conflict with expo-router
- **Type:** Warning (non-blocking)
- **Found:** M0 Setup
- **Details:** expo-router pulls react-dom which requires react@^19.2.4 but Expo SDK 55 pins react@19.2.0. Required --legacy-peer-deps for installs.
- **Status:** Open (monitoring)
- **Proposed Fix:** Will resolve when Expo SDK updates react version

---

## ✅ Resolved Issues

_None yet._

---

## 📌 Known Risks (Pre-emptive)

### [RISK-001] UPI Deeplink Compatibility
- **Details:** `tez://` (GPay) and `phonepe://` may not work on all devices
- **Mitigation:** Always fallback to generic `upi://pay` scheme
- **Status:** Pre-emptive — handle during M4

### [RISK-002] Payment Confirmation Gap
- **Details:** User pays on external app, kills Witty Wallet, payment never confirmed
- **Mitigation:** AppState listener + pending payment stored in MMKV, shown on next open
- **Status:** Pre-emptive — handle during M4

### [RISK-003] Float Precision on Money Amounts
- **Details:** JS floats cause rounding errors (e.g., 0.1 + 0.2 ≠ 0.3)
- **Mitigation:** Store all amounts in paise (integer). ₹10.50 = 1050 paise internally
- **Status:** Pre-emptive — enforce from M1 onwards

### [RISK-004] Month Reset Timing
- **Details:** If app is not opened on 1st of month, reset doesn't trigger
- **Mitigation:** Check last reset date on every app launch, trigger if overdue
- **Status:** Pre-emptive — handle during M3
