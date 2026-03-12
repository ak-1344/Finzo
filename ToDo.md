# 📋 FINZO — ToDo

> Maintained by agent. Updated after every task.
> Pull milestone details from plan.md

---

## ✅ Completed Milestone: M0 — Setup & Design

- [x] Init Expo project with TypeScript template
- [x] Install all dependencies (expo-router, nativewind, zustand, async-storage, react-hook-form, reanimated, worklets)
- [x] Configure NativeWind v4 + babel + metro + tailwind
- [x] Set up Expo Router with 5-tab navigation
- [x] Create constants/colors.ts with design tokens
- [x] Create all TypeScript interfaces in types/index.ts
- [x] Create screen shell files for all tabs (Home, Cashbook, Parties, Buckets, More)
- [x] Set up Zustand stores (balance, transactions) with AsyncStorage persistence
- [x] Verify app bundles successfully (Android export passed)

---

## ✅ Completed Milestone: M1 — Cashbook MVP

- [x] Home screen — balance display, greeting, today's summary, quick actions
- [x] Home screen — manual balance update modal (tap to edit)
- [x] Add Entry screen — IN/OUT toggle, amount, label, payment method
- [x] Cashbook screen — date-grouped SectionList, running balance
- [x] Cashbook screen — filter tabs (All / In / Out)
- [x] Edit Entry screen — pre-filled form, save changes
- [x] Delete entry — confirmation dialog, balance reversal
- [x] `useBalance` hook — get/set/format balance in paise/rupees
- [x] `useTransactions` hook — CRUD with balance sync, date grouping
- [x] Persist to AsyncStorage via Zustand persist middleware
- [x] Utility functions — formatRupees, paise conversion, date grouping

---

## ✅ Completed Milestone: M2 — Parties Ledger

- [x] Zustand partyStore with persistence, party CRUD, party transaction CRUD, settlement, balance recalculation
- [x] useParties hook — derived data, filtering (customers/suppliers), totals, statement generation
- [x] Parties screen — summary card (You Will Give / You Will Get), filter tabs (All/Customers/Suppliers), FlatList, floating add button
- [x] Add Party screen — Customer/Supplier toggle, name input, save + navigate to detail
- [x] Party Detail screen — balance card, transaction timeline, Give/Get bottom sheet modal, settlement, share statement, delete
- [x] Share statement — generates plain-text statement via Share API
- [x] Link transaction to party — party picker in Add Entry screen (optional selection, modal with party list)
- [x] Home screen "Add Party" quick action wired to /add-party route
- [x] Android bundle export verified (no errors)

## 🟡 Backlog — M3: Bucket System

- [ ] Buckets screen — cards with progress bars
- [ ] Add / Edit / Delete bucket
- [ ] Overflow bucket (auto-created, non-deletable)
- [ ] Bucket allocation validation
- [ ] Low bucket warning logic
- [ ] Monthly preset — save and auto-apply
- [ ] `useBuckets` hook
- [ ] `useMonthReset` hook

## 🟡 Backlog — M4: Payment Flow + UPI

- [ ] QR Scanner screen
- [ ] Pay to Number screen
- [ ] Payment flow modal — multi-step
- [ ] UPI deeplink builder
- [ ] Return flow — confirmation
- [ ] Pending payment recovery

## 🟡 Backlog — M5–M8

- [ ] M5: Reminders + Reports
- [ ] M6: Firebase Sync + Auth
- [ ] M7: AI Assistant
- [ ] M8: Polish + Launch
