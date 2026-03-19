# 📍 FINZO — Current Status

> Overwrite this every session. This is the single source of truth for where the project is.

---

**Active Milestone:** TM0 — Account Sheet Rework (Temporary Blocking)
**Last Worked On:** Web UI verification (Buckets screen) + identified doc/spec gaps vs new requirements
**Overall Progress:** ~62% (core M0–M5 complete, but TM0 requires blocking UI/data-flow rework before M6)

---

## What's Working
- App scaffolded with Expo SDK 55, TypeScript, Expo Router, NativeWind v4
- 5-tab navigation: Home, Cashbook, Parties, Buckets, More
- **Home screen**: Greeting + date, balance card (currently tap-to-edit in code; this will be removed in TM0), today's in/out summary, quick actions (Scan QR → QR scanner, Pay → UPI flow, Add Entry, Add Party), recent 5 transactions
- **Add Entry screen**: IN/OUT toggle, amount, label, payment method, optional party linking (party picker modal), optional bucket tagging (bucket picker modal with remaining balance + health)
- **Cashbook screen**: Date-grouped SectionList, day totals, filter tabs (All/In/Out), long-press delete, floating Add button, bucket tag on transactions
- **Edit Entry screen**: Pre-fills existing data, save changes recalculates balance, delete with confirmation
- **Parties screen**: Summary card (You Will Give / You Will Get), filter tabs (All/Customers/Suppliers), party list with balances, floating add button
- **Add Party screen**: Customer/Supplier type toggle, name input
- **Party Detail screen**: Balance card, transaction timeline, Give/Get bottom sheet, settle party, share statement, delete party/transactions
- **Buckets screen**: Balance summary card, bucket cards with progress bars (color-coded health), preset save/reset, auto-apply toggle, floating add button
- **Add/Edit Bucket screens**: Name, icon picker, color picker, allocation with validation, live preview
- **Overflow bucket**: Auto-created currently; will be replaced by **Unallocated** bucket in TM0
- **Month reset**: useMonthReset hook in root layout, auto-triggers on month change
- **QR Scanner** (NEW M4): Camera-based UPI QR scanning via expo-camera, parses UPI QR → auto-fills payment flow
- **Payment Flow** (NEW M4): Multi-step modal (Details → Bucket → Confirm → Result), UPI deeplink builder (GPay/PhonePe/Paytm/generic fallback), pending payment recovery via AppState, "Did it go through?" confirmation, auto-logs to cashbook + bucket on confirm
- **UPI Deeplink Library** (NEW M4): Parse UPI QR strings, validate UPI IDs, build deeplinks, open preferred UPI app with fallback
- **Reminders** (NEW M5): Full CRUD, one-time/weekly/monthly scheduling, link to party, local push notifications via expo-notifications, toggle active/inactive
- **Reports** (NEW M5): Date range presets (Today/Week/Month/30d/90d), summary cards (income/expense/net/count), SVG donut pie chart (bucket-wise spending), SVG bar chart (daily trend), top 5 expense labels, PDF export via expo-print + expo-sharing
- **More tab**: Reminders and Reports now navigable (replaced "Coming Soon" stubs)
- **Balance management**: Manual set/update via modal, paise-based storage, formatted display
- **Persistence**: All data persists across app restarts via AsyncStorage + Zustand persist middleware
- **Android bundle exports successfully** (verified after M4+M5, 1625 modules)

## What's Not Yet Built
- Firebase Sync + Auth (M6)
- AI Assistant (M7)
- Polish + Launch Prep (M8)

## Blockers
- Used --legacy-peer-deps for installs due to React 19.2.0 vs 19.2.4 peer conflict (non-blocking)

---

## ▶️ Next Action (Start Here Next Session)

Start **TM0 — Account Sheet Rework** before Milestone 6:
1. Firebase project setup
2. Firebase Auth — phone OTP login
3. Firestore schema mirroring local data models
4. `useBackup` hook — sync on/off toggle
5. Conflict resolution (last-write-wins for MVP)
6. Restore on new device login
7. App PIN + biometric lock (expo-local-authentication)
8. Settings screen — all toggles
