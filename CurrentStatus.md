# 📍 FINZO — Current Status

> Overwrite this every session. This is the single source of truth for where the project is.

---

**Active Milestone:** M0 → M1 — Setup & Cashbook MVP
**Last Worked On:** Starting fresh — reading docs, beginning M0+M1 build
**Overall Progress:** ~0% (beginning development)

---

## Understanding Summary

FINZO is a personal finance app for India with 4 layers:
1. **Cashbook** — daily in/out transaction logging with date-grouped views
2. **Bucket System** — envelope budgeting with auto-refill on month start
3. **Parties Ledger** — Khatabook-style give/get per person
4. **AI Assistant** — natural language queries on finance data

**Key design decisions understood:**
- All amounts stored in paise internally (×100), displayed in rupees
- UPI payments via deeplinks (not native), always user-confirmed
- Overflow bucket always exists, cannot be deleted
- Offline-first, Firebase sync is optional/later
- Green = money in, Red = money out

**Tech stack:** Expo + TypeScript + Expo Router + NativeWind + Zustand + AsyncStorage

---

## What's Working
- All 4 context docs written and ready
- AGENT.md established with full development protocol

## What's Not Started
- Expo project not initialized yet
- No code written yet
- No screens built

## Blockers
- None

---

## ▶️ Next Action (Start Here)

Building M0 (setup) and M1 (Cashbook MVP) in this session:
1. Init Expo project with TypeScript
2. Configure NativeWind, Expo Router, Zustand
3. Set up tab navigation + screen shells
4. Define TypeScript types + Zustand stores
5. Build Home screen (balance display, quick action stubs)
6. Build Add Entry screen (IN/OUT, label, amount, date)
7. Build Cashbook screen (date-grouped list, running balance)
8. Edit/Delete entries with balance recalculation
9. Manual balance update on Home
10. Wire up useBalance + useTransactions hooks with persistence
