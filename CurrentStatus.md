# 📍 FINZO — Current Status

> Overwrite this every session. This is the single source of truth for where the project is.

---

**Active Milestone:** M3 — Bucket System ✅ COMPLETE
**Last Worked On:** Full M3 build — bucket store, hooks, all bucket screens, bucket linking in Add Entry, month reset
**Overall Progress:** ~45% (M0 + M1 + M2 + M3 of 8 milestones complete)

---

## What's Working
- App scaffolded with Expo SDK 55, TypeScript, Expo Router, NativeWind v4
- 5-tab navigation: Home, Cashbook, Parties, Buckets (stub), More (stub)
- **Home screen**: Greeting + date, balance card (tap to edit), today's in/out summary, quick actions (Add Entry, Add Party), recent 5 transactions
- **Add Entry screen**: IN/OUT toggle, amount, label, payment method, **optional party linking** (party picker modal), **optional bucket tagging** (bucket picker modal with remaining balance + health)
- **Cashbook screen**: Date-grouped SectionList, day totals, filter tabs (All/In/Out), long-press delete, floating Add button, **bucket tag** (colored dot + name) on transactions
- **Edit Entry screen**: Pre-fills existing data, save changes recalculates balance, delete with confirmation
- **Parties screen**: Summary card (You Will Give / You Will Get), filter tabs (All/Customers/Suppliers), party list with balances, floating add button
- **Add Party screen**: Customer/Supplier type toggle, name input, saves and navigates to party detail
- **Party Detail screen**: Balance card (colored), transaction timeline, Give/Get bottom sheet modal, settle party, share statement via Share API, delete party/transactions
- **Balance management**: Manual set/update via modal, paise-based storage, formatted display
- **Persistence**: All data persists across app restarts via AsyncStorage + Zustand persist middleware
- **Android bundle exports successfully** (verified after M2)

- **Buckets screen**: Balance summary card, bucket cards with progress bars (color-coded health), preset save/reset, auto-apply toggle, floating add button
- **Add Bucket screen**: Name, icon picker (16 emojis), color picker (8 colors), allocation with validation, live preview
- **Edit Bucket screen**: Update all fields, current usage display, delete with overflow transfer
- **Overflow bucket**: Auto-created, catches leftover on reset + deleted bucket allocations
- **Month reset**: useMonthReset hook in root layout, auto-triggers on month change with autoApply

## What's Not Yet Built
- UPI payment flow (M4)
- Reminders, Reports, Firebase, AI, Polish (M5–M8)

## Blockers
- Node v20.19.3 is one patch below what some RN 0.83 packages want (20.19.4) — no functional issues so far, just warnings
- Used --legacy-peer-deps for installs due to React 19.2.0 vs 19.2.4 peer conflict

---

## ▶️ Next Action (Start Here Next Session)

Start **Milestone 4 — Payment Flow + UPI Deeplink**:
1. QR Scanner screen (expo-barcode-scanner)
2. Parse UPI QR → extract UPI ID, name, amount
3. Pay to Number screen (manual UPI ID entry)
4. Payment flow modal — multi-step: amount → bucket → confirm
5. UPI deeplink builder (useUPIDeeplink hook)
6. Return flow — "Did it go through?" confirmation
7. Pending payment recovery (AppState listener)
8. Auto-log on confirmation → cashbook + bucket deducted
