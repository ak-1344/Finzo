# 🐛 FINZO — Issues

> Log every bug, blocker, and design question here.
> Format: [ISSUE-XXX] with status tracking.

---

## 🔴 Open Issues

_None yet. Project not started._

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
