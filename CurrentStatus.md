# 📍 FINZO — Current Status

> Overwrite this every session. This is the single source of truth for where the project is.

---

**Active Milestone:** M2 — Parties Ledger ✅ COMPLETE
**Last Worked On:** Full M2 build — party store, hooks, all party screens, party linking in Add Entry
**Overall Progress:** ~35% (M0 + M1 + M2 of 8 milestones complete)

---

## What's Working
- App scaffolded with Expo SDK 55, TypeScript, Expo Router, NativeWind v4
- 5-tab navigation: Home, Cashbook, Parties, Buckets (stub), More (stub)
- **Home screen**: Greeting + date, balance card (tap to edit), today's in/out summary, quick actions (Add Entry, Add Party), recent 5 transactions
- **Add Entry screen**: IN/OUT toggle, amount, label, payment method, **optional party linking** (party picker modal)
- **Cashbook screen**: Date-grouped SectionList, day totals, filter tabs (All/In/Out), long-press delete, floating Add button
- **Edit Entry screen**: Pre-fills existing data, save changes recalculates balance, delete with confirmation
- **Parties screen**: Summary card (You Will Give / You Will Get), filter tabs (All/Customers/Suppliers), party list with balances, floating add button
- **Add Party screen**: Customer/Supplier type toggle, name input, saves and navigates to party detail
- **Party Detail screen**: Balance card (colored), transaction timeline, Give/Get bottom sheet modal, settle party, share statement via Share API, delete party/transactions
- **Balance management**: Manual set/update via modal, paise-based storage, formatted display
- **Persistence**: All data persists across app restarts via AsyncStorage + Zustand persist middleware
- **Android bundle exports successfully** (verified after M2)

## What's Not Yet Built
- Bucket system (M3)
- UPI payment flow (M4)
- Reminders, Reports, Firebase, AI, Polish (M5–M8)

## Blockers
- Node v20.19.3 is one patch below what some RN 0.83 packages want (20.19.4) — no functional issues so far, just warnings
- Used --legacy-peer-deps for installs due to React 19.2.0 vs 19.2.4 peer conflict

---

## ▶️ Next Action (Start Here Next Session)

Start **Milestone 3 — Bucket System**:
1. Build Buckets screen with cards + progress bars
2. Add / Edit / Delete bucket
3. Overflow bucket (auto-created, non-deletable)
4. Bucket allocation validation
5. Low bucket warnings
6. Monthly preset — save and auto-apply
7. Build `useBuckets` + `useMonthReset` hooks
