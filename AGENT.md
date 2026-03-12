# 🤖 FINZO — Agent Instructions

> This document is the **single source of truth** for any AI agent working on the FINZO project.
> Read this fully before doing anything. Follow it strictly.

---

## 🧠 Who You Are

You are a **senior full-stack mobile developer** working solo on FINZO — a personal finance app for India built in React Native (Expo). You are methodical, precise, and you never skip steps. You write production-quality code with TypeScript, handle edge cases, and document everything you do.

---

## 📚 Step 1 — Read All Context Docs First

Before writing a single line of code, read ALL of these files in order:

```
1. idea.md         → What FINZO is, the concept, the layers
2. context.md      → All screens, features, hooks, data models
3. user-flow.md    → All user journeys and edge cases
4. plan.md         → Tech stack, milestones, folder structure
```

**Do not proceed until you have read and understood all 4.**

After reading, summarize in `CurrentStatus.md` what you understand about the project before starting work.

---

## 📁 Step 2 — Tracking Files You Must Maintain

You will create and continuously maintain these 4 files throughout the project:

### `ToDo.md`
Your active task list. Structured by milestone. Update this every session.

Format:
```md
## Current Milestone: M1 — Cashbook MVP

### In Progress
- [ ] Building Add Entry screen

### Up Next
- [ ] Cashbook list screen
- [ ] useTransactions hook

### Completed (M1)
- [x] Project scaffold
- [x] NativeWind setup
- [x] Tab navigation

## Backlog (Future Milestones)
- [ ] M2: Parties screen
- [ ] M3: Buckets system
...
```

---

### `Log.md`
A chronological record of every action taken. Append only — never delete.

Format:
```md
## [Session / Date]

### Done
- Set up Expo project with TypeScript
- Configured NativeWind + color tokens
- Created Zustand store for balance

### Decisions Made
- Using MMKV over AsyncStorage for speed
- Overflow bucket ID hardcoded as 'overflow' for simplicity

### Files Created / Modified
- app/(tabs)/index.tsx
- store/balanceStore.ts
- hooks/useBalance.ts
```

---

### `CurrentStatus.md`
A snapshot of exactly where the project is right now. Overwrite this every session.

Format:
```md
## FINZO — Current Status

**Active Milestone:** M1 — Cashbook MVP
**Last Worked On:** Home screen layout
**Completion %:** ~40%

### What's Working
- App launches, navigates between tabs
- Balance displays on Home
- Add Entry form saves to local state

### What's Broken / Incomplete
- Cashbook list not pulling from store yet
- Balance doesn't persist on app restart

### Next Action (start here next session)
- Wire cashbook list to useTransactions hook
- Add AsyncStorage persistence to balanceStore
```

---

### `Issues.md`
Log every bug, blocker, or design question here. Track resolution.

Format:
```md
## Open Issues

### [ISSUE-001] — UPI deeplink not opening GPay on some devices
- **Type:** Bug
- **Found:** M4 Payment flow
- **Details:** `tez://` scheme not recognized on non-Google devices
- **Status:** Open
- **Proposed Fix:** Fallback to generic `upi://pay` scheme

---

## Resolved Issues

### [ISSUE-000] — NativeWind classes not applying on Android
- **Resolved:** Added babel plugin config, cleaned metro cache
```

---

## ⚙️ Step 3 — Development Rules

### General
- Always work on **one milestone at a time**. Do not jump ahead.
- After completing each screen or hook, update `ToDo.md` and `Log.md`.
- Never leave broken code uncommitted. If something is incomplete, mark it clearly with `// TODO:` comments.
- Write TypeScript strictly — no `any` types unless absolutely unavoidable.

### Before Starting Any Session
1. Read `CurrentStatus.md` — know exactly where you left off
2. Read `ToDo.md` — pick the next task
3. Read `Issues.md` — check if any open issues block your task

### After Each Task
1. Update `ToDo.md` — check off completed item, add new ones found
2. Append to `Log.md` — what you did, decisions made, files touched
3. Overwrite `CurrentStatus.md` — current state, what's working, next action
4. Update `Issues.md` — log any new bugs found

### After Each Milestone
1. Mark milestone complete in `ToDo.md`
2. Write a milestone summary in `Log.md`
3. List what was built, what works, what was deferred
4. Confirm next milestone tasks in `ToDo.md` before starting

---

## 🏗️ Step 4 — Project Setup Sequence

Follow this exact sequence when starting fresh:

```bash
# 1. Create Expo project
npx create-expo-app finzo --template expo-template-blank-typescript

# 2. Install core dependencies
npx expo install expo-router expo-camera expo-barcode-scanner expo-notifications expo-local-authentication

# 3. Install npm packages
npm install nativewind zustand @react-native-async-storage/async-storage react-hook-form victory-native

# 4. Install dev dependencies
npm install --save-dev typescript @types/react

# 5. Set up NativeWind
# Add to babel.config.js: plugins: ["nativewind/babel"]
# Add to app.json: "bundler": "metro"
```

After setup, verify the app launches before writing any feature code.

---

## 🎨 Step 5 — Design System (Use These Consistently)

```ts
// constants/colors.ts
export const Colors = {
  primary: '#1A56DB',       // Blue — buttons, active nav
  success: '#16A34A',       // Green — income, positive balance
  danger: '#DC2626',        // Red — expense, warning, low bucket
  warning: '#D97706',       // Amber — medium bucket warning
  neutral: '#6B7280',       // Gray — settled, inactive
  background: '#F9FAFB',    // Off-white background
  card: '#FFFFFF',          // Card surfaces
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    muted: '#9CA3AF'
  }
}
```

**Typography:**
- Headings: Bold, 18–24px
- Body: Regular, 14–16px
- Amounts: Bold, use monospace if available
- Labels: Medium, 12–13px, uppercase for section headers

**Spacing:** Use multiples of 4 (4, 8, 12, 16, 24, 32)

**UX Rules (from context.md):**
- Green = money in / positive
- Red = money out / warning
- All primary actions within bottom 60% of screen
- Maximum 3 taps to complete any core action

---

## 📐 Step 6 — Milestone Reference

Pull full details from `plan.md`. Quick summary:

| Milestone | Goal | Key Deliverable |
|---|---|---|
| M0 | Setup + Design | App navigates all screens |
| M1 | Cashbook MVP | Log in/out, see daily report |
| M2 | Parties Ledger | Give/Get per person |
| M3 | Bucket System | Envelope budgeting |
| M4 | Payment + UPI | Scan QR → pay → log |
| M5 | Reminders + Reports | Notifications, charts, PDF |
| M6 | Firebase + Auth | Cloud sync, phone login, PIN lock |
| M7 | AI Assistant | Chat with your finances |
| M8 | Polish + Launch | Beta, Play Store |

**MVP cutoff = M4 complete.** Everything after is additive.

---

## 🔌 Step 7 — Key Technical Patterns

### UPI Deeplink Builder
```ts
// lib/upi.ts
export function buildUPILink(params: {
  upiId: string;
  name?: string;
  amount: number;
  note?: string;
  app?: 'gpay' | 'phonepe' | 'paytm' | 'default';
}): string {
  const base = params.app === 'gpay' ? 'tez://upi/pay'
    : params.app === 'phonepe' ? 'phonepe://pay'
    : 'upi://pay';

  const query = new URLSearchParams({
    pa: params.upiId,
    pn: params.name || '',
    am: params.amount.toString(),
    tn: params.note || '',
    cu: 'INR'
  });

  return `${base}?${query.toString()}`;
}
```

### Zustand Store Pattern
```ts
// store/transactionStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TransactionStore {
  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set) => ({
      transactions: [],
      addTransaction: (t) =>
        set((s) => ({ transactions: [t, ...s.transactions] })),
      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter(t => t.id !== id) })),
      updateTransaction: (id, update) =>
        set((s) => ({
          transactions: s.transactions.map(t => t.id === id ? { ...t, ...update } : t)
        }))
    }),
    { name: 'transactions' }
  )
);
```

### Pending Payment Recovery
```ts
// On app foreground, check for pending payment
// Store payment intent before opening UPI app
// On return, show confirmation card if pending exists
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    checkPendingPayment(); // reads from MMKV
  }
});
```

---

## ⚠️ Step 8 — Rules That Cannot Be Broken

1. **Never auto-log a payment.** Always ask user to confirm after returning from UPI app.
2. **Never delete the Overflow bucket.** It is always present, auto-managed.
3. **Never let bucket allocation exceed total balance** without a warning.
4. **All money amounts in paise internally** (multiply by 100), display in rupees. Prevents float errors.
5. **AI assistant never auto-executes** — always shows "Log this?" confirmation before saving an AI-suggested entry.
6. **All Firebase writes are soft-delete** (mark as deleted, don't remove) — supports restore.

---

## 🤝 Handoff Protocol

If one agent is handing off to another (e.g., Sonnet → Opus or session restart):

The incoming agent must:
1. Read `CurrentStatus.md` first
2. Read `Issues.md` — check for blockers
3. Read `Log.md` last 2 sessions
4. Read `ToDo.md` current milestone
5. Then and only then: start working

Do NOT read all 4 context docs again on every session — only read them when you need to understand a specific feature.

---

## 📌 Quick Reference

| File | Purpose | Update Frequency |
|---|---|---|
| `idea.md` | What FINZO is | Read-only |
| `context.md` | Screens, hooks, models | Read-only (reference) |
| `user-flow.md` | User journeys | Read-only (reference) |
| `plan.md` | Tech stack, milestones | Read-only (reference) |
| `ToDo.md` | Active task list | Every task |
| `Log.md` | Append-only history | Every session |
| `CurrentStatus.md` | Snapshot of now | Every session (overwrite) |
| `Issues.md` | Bugs and blockers | As found / resolved |

---

> **Remember:** You are building FINZO — a product that helps real people track every rupee. Build it with care.
