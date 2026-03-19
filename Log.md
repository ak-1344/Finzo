# 📓 FINZO — Development Log

> Append-only. Never delete entries. Most recent at top.

---

## Session 5 — TM0 Blocking Docs + Expo Web Fix

### Done
- Fixed Expo web blank-screen issue: browser `SyntaxError` from `import.meta` in the web bundle by updating `finzo/metro.config.js` to disable package-exports resolution and prefer `main` fields for web bundle deps
- Started/verified Expo web UI on a stable port for screenshot/UI inspection (kept DevTools crash out by using `EXPO_UNSTABLE_HEADLESS=1`)
- Seeded the new temporary blocking milestone `TM0 — Account Sheet Rework` into docs:
  - `ToDo.md`: added TM0 checklist (unallocated bucket, per-bucket manual add/remove while preserving monthly allocation rules, non-editable home balance, money only via Cashbook/Payment/party flows, minimal/no emojis, UI polish)
  - `CurrentStatus.md`: set active milestone to TM0
  - `TESTING.md`: added TM0 testing checklist + acceptance rules
- Updated reference specifications to match TM0:
  - `Docs/context.md`: Home balance becomes read-only; “Overflow” replaced by “Unallocated”; settings “Update balance” disabled in TM0; payment warning emoji removed
  - `Docs/user-flow.md`: replaced manual balance update flow; parties give/get now requires matching Cashbook IN/OUT visibility; “Overflow” replaced by “Unallocated”; month-end leftover moves to Unallocated
  - `Docs/plan.md` and `Docs/idea.md`: replaced Overflow with Unallocated
  - `Docs/AGENT.md`: updated “Rules That Cannot Be Broken” to reference Unallocated

### Decisions Made
- Web bundling approach: force Metro resolution away from ESM/package-exports for web to avoid `import.meta` parsing failures in the classic `<script>` bundle
- Product spec (TM0): treat app as a single account sheet; remove editable Home balance; unify money movement through Cashbook/Payment and ensure party flows reflect in Cashbook

### Files Created / Modified
- `finzo/metro.config.js` (MODIFIED — web resolver adjustments)
- `ToDo.md` (MODIFIED — TM0 added)
- `CurrentStatus.md` (MODIFIED — active milestone switched to TM0)
- `TESTING.md` (MODIFIED — TM0 checklist added)
- `Docs/context.md` (MODIFIED — Unallocated + balance rule updates)
- `Docs/user-flow.md` (MODIFIED — party money visibility + Unallocated updates)
- `Docs/plan.md` (MODIFIED — Unallocated references)
- `Docs/idea.md` (MODIFIED — Unallocated references)
- `Docs/AGENT.md` (MODIFIED — Unallocated rules)

## Session 4 — M4 + M5 Complete (Payment Flow + UPI Deeplink + Reminders + Reports)

### Done
- Resolved ISSUE-001: Upgraded Node from v20.19.3 to v20.19.4 via nvm
- Installed M4+M5 dependencies: expo-camera, expo-notifications, expo-print, expo-sharing, react-native-svg (all with --legacy-peer-deps)
- Created lib/upi.ts — UPI deeplink builder: parseUPIQR (URL parsing), isValidUPIId (regex), buildUPIDeeplink (URL construction), openUPIPayment (GPay/PhonePe/Paytm with fallback to generic upi:// scheme), getUPIApps (UI display list)
- Added PendingPayment type to types/index.ts — tracks mid-payment state for recovery
- Updated Reminder type — added isDeleted (soft-delete pattern), notificationId (expo-notifications), createdAt
- Created store/paymentStore.ts — Zustand + persist, startPayment/confirmPayment/cancelPayment/clearPending
- Created app/payment/scan.tsx — QR Scanner screen using expo-camera CameraView with barcode scanning, permission handling, parses UPI QR and routes to payment flow, fallback to manual entry
- Created app/payment/pay.tsx — Multi-step payment flow: Step 1 (UPI ID + name + amount + label) → Step 2 (bucket selection with remaining balance + low-balance warnings) → Step 3 (confirm with summary card + UPI app selection) → Step 4 ("Did it go through?" with Yes/No/Retry), AppState listener for return from UPI app, pending payment recovery on mount
- Wired Home screen quick actions: "Scan QR" → /payment/scan, "Pay" → /payment/pay (replaced "Coming Soon" alerts)
- Created store/reminderStore.ts — Zustand + persist, reminder CRUD, toggle active, soft-delete
- Created hooks/useReminders.ts — full notification scheduling via expo-notifications, permission handling, one-time/weekly (native trigger)/monthly (date-based) scheduling, cancel on delete/toggle, reschedule on update
- Created app/reminders.tsx — Reminders screen: list with toggle switches, add/edit modal with message/date(DD/MM/YYYY)/time(HH:MM)/recurring type/party linking, party picker sub-modal, long-press delete, summary count
- Created hooks/useReports.ts — aggregation hook: date range filtering, totalIn/totalOut/netFlow, bucket-wise spending with percentages, daily trend (fill all days), top 5 expense labels, HTML report generator for PDF export
- Created app/reports.tsx — Reports screen: horizontal scrollable date range presets (Today/This Week/This Month/Last 30d/Last 90d), 4 summary cards, SVG donut pie chart (bucket-wise with stroke-dasharray technique + center hole), SVG bar chart (daily in/out trend), top 5 expense labels ranking, PDF export via expo-print + expo-sharing
- Updated app/(tabs)/more.tsx — Reminders and Reports now navigable with useRouter (replaced all "Coming Soon" stubs for M5 items)
- Verified Android bundle export: 1625 modules, no errors, 0 TypeScript errors

### Decisions Made
- Used expo-camera CameraView (not deprecated expo-barcode-scanner) for QR scanning
- Payment flow is a single multi-step screen (pay.tsx) not separate screens — smoother UX, shared state
- QR scan → parse → replace navigate to pay.tsx with pre-filled params — no back navigation to scanner
- UPI deeplink uses try→canOpenURL→openURL with app-specific schemes first, then generic upi:// fallback
- Pending payment persisted to AsyncStorage so mid-flow app kill can recover
- Reminders use expo-notifications with SchedulableTriggerInputTypes — weekly uses native WEEKLY trigger, monthly uses DATE trigger (reschedule needed)
- Reports use SVG pie chart with stroke-dasharray circles (donut style) — simpler than arc paths, works well with react-native-svg
- Bar chart uses simple Rect elements with proportional heights — readable up to 30 bars
- PDF export generates HTML → expo-print.printToFileAsync → expo-sharing — clean styled report
- Date/time input for reminders uses plain TextInput (DD/MM/YYYY, HH:MM) — avoids date picker library dependency

### Files Created / Modified
- finzo/types/index.ts (MODIFIED — PendingPayment type, Reminder updated with isDeleted/notificationId/createdAt)
- finzo/lib/upi.ts (NEW — UPI parsing, validation, deeplink builder, app opener)
- finzo/store/paymentStore.ts (NEW — pending payment state with persistence)
- finzo/store/reminderStore.ts (NEW — reminder CRUD with persistence)
- finzo/hooks/useReminders.ts (NEW — notification scheduling, CRUD wrappers)
- finzo/hooks/useReports.ts (NEW — aggregation, date ranges, HTML generator)
- finzo/app/payment/scan.tsx (NEW — QR scanner screen)
- finzo/app/payment/pay.tsx (NEW — multi-step payment flow)
- finzo/app/reminders.tsx (NEW — reminders screen with add/edit modal)
- finzo/app/reports.tsx (NEW — reports screen with SVG charts + PDF export)
- finzo/app/(tabs)/index.tsx (MODIFIED — quick actions wired to payment routes)
- finzo/app/(tabs)/more.tsx (MODIFIED — Reminders + Reports navigation)
- finzo/package.json (MODIFIED — added expo-camera, expo-notifications, expo-print, expo-sharing, react-native-svg)

---

## Session 3 — M3 Complete (Bucket System) + Preview Fix

### Done
- Fixed tsconfig.json deprecation warning (added `ignoreDeprecations: "6.0"` for baseUrl)
- Downgraded packages to Expo-expected versions: async-storage@2.2.0, reanimated@4.2.1, worklets@0.7.2 (fixes compatibility warnings)
- Got Expo dev server running cleanly on port 8081 (no warnings)
- Updated Bucket type with `isDeleted` and `createdAt` fields (per AGENT.md soft-delete rule)
- Created bucketStore.ts — Zustand store with persistence, bucket CRUD, spend/refund, overflow bucket management, allocation/reallocation, month preset save/apply/toggle, month reset (zeros spending, leftover → overflow, auto-apply preset)
- Created useBuckets.ts hook — derived data (activeBuckets, userBuckets, overflow, totalAllocated, totalSpent, unallocated, maxAllocatable, lowBuckets), health helpers (getRemaining, getUsagePercent, getHealthColor, getHealthLabel), allocation validation (canAllocate)
- Created useMonthReset.ts hook — checks on mount + AppState foreground, auto-triggers resetMonth when month changes and preset has autoApply
- Replaced placeholder buckets.tsx with full Buckets screen — balance summary card (total balance, unallocated, allocated, spent), bucket cards with progress bars (color-coded green/amber/red), low-budget warning badges, preset save/reset month buttons, auto-apply toggle, floating add button, empty state
- Created add-bucket.tsx — name input, icon picker (16 emojis), color picker (8 colors), amount with max-allocatable display, allocation validation, live preview card
- Created edit-bucket.tsx — current usage stats, edit name/icon/color/allocation, max-for-bucket calculation, overflow info card, delete with overflow transfer
- Updated add-entry.tsx — added bucket picker modal (FlatList with all active buckets, remaining balance, mini progress bars, low-budget warning, bucket health colors), deducts from bucket on expense save
- Updated cashbook.tsx — shows bucket tag (colored dot + name) on transactions with buckets, refunds bucket on delete
- Updated edit-entry.tsx — shows linked bucket tag (read-only), refunds bucket on delete
- Wired useMonthReset into root _layout.tsx for app-level month change detection
- Verified Android bundle export passes with all M3 changes

### Decisions Made
- Overflow bucket has hardcoded ID 'overflow' for simplicity (per context.md decision)
- 16 preset icons (emojis) and 8 preset colors — keeps UI clean, avoids custom picker complexity
- Bucket picker only shows on Money Out (expenses) — income doesn't come from a bucket (per user-flow.md)
- Bucket deduct happens in the screen (add-entry.tsx) not in the hook — avoids coupling useTransactions to useBuckets
- Edit-entry shows bucket tag as read-only — changing bucket mid-edit would require complex refund/re-deduct logic, deferred for simplicity
- Month reset only auto-triggers when preset autoApply is ON — manual reset button always available

### Files Created / Modified
- finzo/tsconfig.json (MODIFIED — added ignoreDeprecations)
- finzo/types/index.ts (MODIFIED — Bucket type + isDeleted + createdAt)
- finzo/store/bucketStore.ts (NEW)
- finzo/hooks/useBuckets.ts (NEW)
- finzo/hooks/useMonthReset.ts (NEW)
- finzo/app/(tabs)/buckets.tsx (REPLACED — placeholder → full screen)
- finzo/app/add-bucket.tsx (NEW)
- finzo/app/edit-bucket.tsx (NEW)
- finzo/app/add-entry.tsx (MODIFIED — bucket picker + spend deduction)
- finzo/app/(tabs)/cashbook.tsx (MODIFIED — bucket tag + refund on delete)
- finzo/app/edit-entry.tsx (MODIFIED — bucket display + refund on delete)
- finzo/app/_layout.tsx (MODIFIED — useMonthReset wired)

---

## Session 2 — M2 Complete (Parties Ledger)

### Done
- Created partyStore.ts — Zustand store with persistence, party CRUD, partyTransaction CRUD, settlement logic with balance recalculation
- Created useParties.ts hook — derived data (activeParties, customers, suppliers, totalToGet, totalToGive, netBalance), getParty, getPartyTransactions, getLastActivity, generateStatement
- Replaced placeholder parties.tsx with full Parties screen — summary card (You Will Give / You Will Get), filter tabs (All/Customers/Suppliers), FlatList with avatars, balances, long-press delete, floating add button
- Created add-party.tsx — Customer/Supplier type toggle, name input, info card explaining type meaning, saves via partyStore.addParty, navigates to party detail
- Created party/[id].tsx — Party detail with balance card (colored by owe/settled), transaction timeline FlatList, Give/Get bottom action bar, bottom sheet modal (amount + note input), settlement button (zeros balance, creates settlement tx), share statement via Share API, delete party with confirmation, long-press delete on transactions
- Updated add-entry.tsx — Added optional party linking with party picker modal (FlatList inside Modal, shows all active parties, pre-select via partyId query param, remove selection), replaced M2 placeholder text
- Updated Home screen index.tsx — "Add Party" quick action now routes to /add-party (replaced "Coming Soon" alert)
- Created QuickStart.md with project setup, preview instructions, and troubleshooting
- Reviewed and documented existing issues (ISSUE-001, ISSUE-002 both non-blocking)
- Verified Android bundle export passes with all M2 changes

### Decisions Made
- Party balance stored on the Party object itself (recalculated on each transaction add/delete) for fast reads
- Settlement creates a special isSettlement=true transaction and zeros the balance
- Party picker in Add Entry is optional — users can add entries without linking to a party
- partyId query param supported on Add Entry for deep-linking from party detail
- Share statement generates plain text (not PDF) for simplicity — sufficient for WhatsApp/SMS sharing

### Files Created / Modified
- finzo/store/partyStore.ts (NEW)
- finzo/hooks/useParties.ts (NEW)
- finzo/app/(tabs)/parties.tsx (REPLACED — placeholder → full screen)
- finzo/app/add-party.tsx (NEW)
- finzo/app/party/[id].tsx (NEW)
- finzo/app/add-entry.tsx (MODIFIED — added party picker)
- finzo/app/(tabs)/index.tsx (MODIFIED — Add Party quick action wired)
- QuickStart.md (NEW)

---

## Session 1 — M0 + M1 Complete (March 12, 2026)

### Done
- Initialized Expo project with TypeScript template (Expo SDK 55)
- Installed all dependencies: expo-router, nativewind v4, zustand, async-storage, react-hook-form, react-native-reanimated, react-native-worklets, react-native-gesture-handler, react-native-screens, react-native-safe-area-context
- Configured NativeWind v4: metro.config.js, tailwind.config.js, global.css, babel.config.js, nativewind-env.d.ts
- Configured Expo Router with file-based routing (app/ directory)
- Created 5-tab navigation: Home, Cashbook, Parties, Buckets, More
- Built design tokens in constants/colors.ts
- Defined all data models in types/index.ts (Transaction, Bucket, Party, MonthPreset, Reminder)
- Built utility library in lib/utils.ts (formatRupees, paise conversion, date grouping, greeting)
- Built AsyncStorage adapter in lib/storage.ts for Zustand persistence
- Built Zustand stores: balanceStore (with persistence), transactionStore (with persistence, soft-delete)
- Built hooks: useBalance (balance CRUD + formatting), useTransactions (full CRUD with balance sync + date grouping)
- Built Home screen: greeting, balance card (tap to edit), today's in/out summary, quick actions row, recent 5 transactions, balance edit modal
- Built Add Entry screen: IN/OUT toggle, amount input, label input, payment method selector, save with validation
- Built Cashbook screen: summary card (total in/out), filter tabs (All/In/Out), date-grouped SectionList with day totals, long-press to delete, floating add button
- Built Edit Entry screen: pre-filled form from existing transaction, save changes with balance recalculation, delete with confirmation
- Built placeholder screens for Parties (M2), Buckets (M3), More (settings menu items)
- Verified successful Android bundle export (1420 modules, no errors)

### Decisions Made
- Using NativeWind v4 (CSS-based) instead of v2 (Babel-only) — more feature-complete
- All amounts stored in paise (integer) internally to prevent float errors — per AGENT.md rule
- Soft-delete for transactions (isDeleted flag) — supports future Firebase restore per rule #6
- Using SectionList for cashbook instead of FlatList — better date grouping UX
- Quick actions for Scan QR, Pay, Add Party show "Coming Soon" alert — stubs for M2-M4
- Filter tabs on cashbook (All/In/Out) added for usability even though not explicitly in M1 spec
- Used --legacy-peer-deps for npm installs due to React 19.2.0 vs 19.2.4 peer conflict in expo-router

### Files Created / Modified
- finzo/app.json (configured scheme, background, identifiers)
- finzo/index.ts (switched to expo-router entry)
- finzo/tsconfig.json (added paths, includes for NativeWind)
- finzo/babel.config.js (NativeWind + expo preset)
- finzo/metro.config.js (NativeWind CSS via metro)
- finzo/tailwind.config.js (custom colors, content paths)
- finzo/global.css (Tailwind directives)
- finzo/nativewind-env.d.ts (TypeScript reference)
- finzo/types/index.ts (all data models)
- finzo/constants/colors.ts (design tokens)
- finzo/lib/storage.ts (AsyncStorage adapter)
- finzo/lib/utils.ts (formatting, date, paise utilities)
- finzo/store/balanceStore.ts (Zustand + persist)
- finzo/store/transactionStore.ts (Zustand + persist + soft-delete)
- finzo/hooks/useBalance.ts
- finzo/hooks/useTransactions.ts
- finzo/app/_layout.tsx (root layout with StatusBar)
- finzo/app/(tabs)/_layout.tsx (5-tab navigation)
- finzo/app/(tabs)/index.tsx (Home screen)
- finzo/app/(tabs)/cashbook.tsx (Cashbook screen)
- finzo/app/(tabs)/parties.tsx (placeholder)
- finzo/app/(tabs)/buckets.tsx (placeholder)
- finzo/app/(tabs)/more.tsx (settings menu)
- finzo/app/add-entry.tsx (Add Entry screen)
- finzo/app/edit-entry.tsx (Edit Entry screen)

---

## Session 0 — Project Initialized

### Done
- Created idea.md, context.md, user-flow.md, plan.md, AGENT.md
- Created starter ToDo.md, Log.md, CurrentStatus.md, Issues.md
- App renamed from Witty Wallet → **FINZO**

### Decisions Made
- Tech stack confirmed: React Native (Expo) + TypeScript + Zustand + NativeWind + Firebase
- UPI integration: deeplink only (no NPCI license required)
- Balance input: manual (no bank API)
- MVP scope: Milestones 0–4

### Files Created
- idea.md
- context.md
- user-flow.md
- plan.md
- AGENT.md
- ToDo.md
- Log.md
- CurrentStatus.md
- Issues.md

---

_Next agent: read CurrentStatus.md first, then ToDo.md, then begin._
