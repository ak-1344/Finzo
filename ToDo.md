# 📋 FINZO — ToDo

> Maintained by agent. Updated after every task.
> Pull milestone details from plan.md

---

## 🔴 Current Milestone: M0 — Setup & Design

### In Progress
- [ ] Nothing started yet

### Up Next
- [ ] Init Expo project with TypeScript template
- [ ] Install all dependencies (see AGENT.md Step 4)
- [ ] Configure NativeWind + babel
- [ ] Set up Expo Router with 5-tab navigation
- [ ] Create constants/colors.ts with design tokens
- [ ] Create all TypeScript interfaces in types/index.ts
- [ ] Create screen shell files (empty screens with correct titles)
- [ ] Set up Zustand stores (balance, transactions, buckets, parties)
- [ ] Verify app launches and navigates all tabs
- [ ] Write M0 summary to Log.md

### Completed (M0)
- Nothing yet

---

## 🟡 Backlog — M1: Cashbook MVP
- [ ] Home screen — balance display (editable), quick action buttons
- [ ] Add Entry screen — IN/OUT toggle, amount, label, date, bucket, party
- [ ] Cashbook screen — date-grouped list, running balance
- [ ] useBalance hook
- [ ] useTransactions hook (CRUD)
- [ ] AsyncStorage persistence
- [ ] Edit / delete entry with recalculation
- [ ] Empty state for cashbook (no entries yet)

## 🟡 Backlog — M2: Parties Ledger
- [ ] Parties screen with tabs
- [ ] Add party screen
- [ ] Party detail screen (timeline + balance)
- [ ] Give / Get entry flow
- [ ] Settlement marking
- [ ] Share statement
- [ ] useParties hook

## 🟡 Backlog — M3: Bucket System
- [ ] Buckets screen with cards + progress bars
- [ ] Add / Edit / Delete bucket
- [ ] Overflow bucket (auto, non-deletable)
- [ ] Allocation validation
- [ ] Monthly preset + auto-apply
- [ ] Month-end reset
- [ ] useBuckets hook
- [ ] useMonthReset hook

## 🟡 Backlog — M4: Payment + UPI Deeplink
- [ ] QR Scanner screen
- [ ] Pay to Number screen
- [ ] Payment flow modal (3 steps)
- [ ] UPI deeplink builder (lib/upi.ts)
- [ ] useUPIDeeplink hook
- [ ] Payment confirmation flow
- [ ] Pending payment recovery (AppState listener)
- [ ] Auto-log on confirm

## 🟡 Backlog — M5: Reminders + Reports
- [ ] Reminders screen
- [ ] Local push notifications
- [ ] useReminders hook
- [ ] Reports screen
- [ ] Pie + Bar charts (Victory Native)
- [ ] PDF export
- [ ] useReports hook

## 🟡 Backlog — M6: Firebase + Auth
- [ ] Firebase project setup
- [ ] Phone OTP auth
- [ ] Firestore schema + sync
- [ ] useBackup hook
- [ ] App PIN + biometric lock
- [ ] Settings screen

## 🟡 Backlog — M7: AI Assistant
- [ ] AI chat screen
- [ ] useAI hook (Claude API)
- [ ] System prompt builder
- [ ] Log command parser
- [ ] Confirmation before execution

## 🟡 Backlog — M8: Polish + Launch
- [ ] Onboarding flow
- [ ] All empty states
- [ ] Error states + retry
- [ ] Sentry setup
- [ ] App icon + splash
- [ ] EAS Build config
- [ ] Play Store submission
