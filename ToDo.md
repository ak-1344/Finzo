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

## ✅ Completed Milestone: M3 — Bucket System

- [x] Zustand bucketStore with persistence — bucket CRUD, spend/refund, allocation, overflow, month preset, month reset
- [x] useBuckets hook — derived data (activeBuckets, userBuckets, overflow, totals, health colors, low-bucket warnings, allocation validation)
- [x] useMonthReset hook — AppState listener, auto-reset on month change when preset has autoApply
- [x] Buckets screen — balance summary card, allocation overview, bucket cards with progress bars, health coloring, low-budget warnings, preset save/reset buttons, auto-apply toggle
- [x] Add Bucket screen — name, icon picker (16 emojis), color picker (8 colors), allocation amount, live preview, validation against total balance
- [x] Edit Bucket screen — update name/icon/color/allocation, current usage display, delete with overflow transfer, overflow info card
- [x] Overflow bucket — auto-created on first bucket add, cannot be deleted, collects leftover on month reset + deleted bucket allocations
- [x] Bucket allocation validation — cannot exceed total balance, max allocatable displayed
- [x] Low bucket warnings — critical badge on >80% usage, color-coded progress bars (green/amber/red)
- [x] Monthly preset — save current allocation, toggle auto-apply, auto-reset zeros spending and moves leftover to overflow
- [x] Bucket picker in Add Entry — modal with all buckets, remaining balance, mini progress bars, low-budget warning
- [x] Bucket tag in Cashbook — colored dot + bucket name on transactions
- [x] Bucket refund on delete — edit-entry and cashbook delete both refund bucket on expense deletion
- [x] Month reset wired in root layout (_layout.tsx) via useMonthReset
- [x] Bucket type updated with isDeleted + createdAt fields
- [x] Android bundle export verified (no errors)

## 🟡 Backlog — M4: Payment Flow + UPI

- [x] QR Scanner screen (expo-camera barcode scanning)
- [x] Pay to Number screen (manual UPI ID entry — merged into pay.tsx Step 1)
- [x] Payment flow modal — multi-step (Details → Bucket → Confirm → Result)
- [x] UPI deeplink builder (lib/upi.ts — parse QR, validate, build deeplinks, open UPI apps)
- [x] Return flow — "Did it go through?" confirmation with Yes/No/Retry
- [x] Pending payment recovery (paymentStore persisted, AppState listener on return)
- [x] Auto-log on confirmation → cashbook + bucket deducted
- [x] Home screen quick actions wired (Scan QR → /payment/scan, Pay → /payment/pay)

## ✅ Completed Milestone: M5 — Reminders + Reports

- [x] Zustand reminderStore with persistence — reminder CRUD, toggle, soft-delete
- [x] useReminders hook — scheduling via expo-notifications, add/update/delete with notification management, recurring support
- [x] Reminders screen — list with toggle switches, add/edit modal (message, date, time, recurring type, party linking), party picker, delete
- [x] Local push notifications — one-time + weekly (native) + monthly (date-based), permission request, cancel on delete/toggle
- [x] useReports aggregation hook — date range filtering, totals, bucket-wise spending, daily trend, top 5 labels, HTML generation for PDF
- [x] Reports screen — date range presets (Today/Week/Month/30d/90d), summary cards, SVG donut pie chart, SVG bar chart, top 5 labels, PDF export via expo-print + expo-sharing
- [x] More tab wired — Reminders and Reports now navigable (replaced "Coming Soon" stubs)
- [x] Android bundle export verified (1625 modules, no errors)

---
## Current Milestone: TM0 — Account Sheet Rework (Temporary Blocking)

### Completed (TM0)
- [x] Redesign data flow so the app behaves like a single account sheet (cashbook entries are the source of truth; no redundant money state)
- [x] Buckets: replace the current "Overflow" bucket with a "Unallocated" bucket
- [x] Buckets: for each bucket, allow manual add/remove money while keeping the monthly allocation budget rules intact
- [x] Buckets month-end logic: leftover and deleted bucket allocations move to "Unallocated" (not Overflow)
- [x] Home screen: remove the ability to edit "total balance" (balance can only be updated in Cashbook or Payment)
- [x] Cashbook: party transactions are isolated (only QR/Pay payments create cashbook entries)
- [x] Payment: ensure payment confirmations are logged as cashbook entries and update bucket balances accordingly
- [x] Fix: delete transaction works correctly across all scopes (Cashbook, Edit Entry, Party)
- [x] Remove emojis from UI (keep minimal ones only where needed)
- [x] UI polish: improve aesthetics across Buckets / Cashbook / Home so it looks cleaner and more premium

## Backlog — M6–M8

- [ ] M6: Firebase Sync + Auth
- [ ] M7: AI Assistant
- [ ] M8: Polish + Launch
