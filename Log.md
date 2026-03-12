# 📓 FINZO — Development Log

> Append-only. Never delete entries. Most recent at top.

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
