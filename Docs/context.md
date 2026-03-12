# 📋 Witty Wallet — Full Context

## App Overview

Witty Wallet is a personal finance app for India. It combines daily cashbook, envelope budgeting, and a parties ledger with UPI payment initiation via deeplinks and manual balance input.

---

## Pages / Screens

### 1. 🏠 Home Screen
The command center. Accessible, action-first layout.

**Top Section:**
- Greeting + date
- Current total balance (manually updated, editable on tap)
- "Cash in Hand" figure prominently

**Quick Actions Row (horizontal icon buttons):**
- 📷 Scan QR → opens camera → fills UPI ID → initiates payment flow
- 📞 Pay to Number → enter UPI ID/mobile → initiates payment flow
- ➕ Add Entry → log transaction manually (no payment)
- 👤 Add Party → quick-add a give/get entry

**Recent Transactions (last 5):**
- Label, amount, time, bucket tag (colored dot)
- "View All" → goes to Cashbook

**Bottom Nav:**
- Home | Cashbook | Parties | Buckets | More

---

### 2. 📒 Cashbook Screen
Daily log of all in/out transactions.

**Header:**
- Total Balance | Today's Balance
- Cash in Hand | Online (always ₹0 unless user adds)

**Date-grouped entries:**
- Each entry: label, time, amount (red = out, green = in), bucket tag
- Swipe left → delete/edit
- Tap → entry detail

**Bottom Button:** `ADD ENTRY TO [TODAY'S DATE]`

**Filters:**
- By date range
- By category/bucket
- By type (in/out)

---

### 3. 👥 Parties Screen
Person-level give/get ledger (Khatabook style).

**Tabs:** Customers | Suppliers (or rename: People I Owe | People Who Owe Me)

**Header:**
- You will give: ₹X (green)
- You will get: ₹X (red)

**List:**
- Person name, last activity time, balance amount
- Color: green = they owe you | red = you owe them | grey = settled

**Actions:**
- Add Customer/Party
- Tap person → their individual ledger
  - Timeline of all transactions
  - "Give" / "Get" buttons
  - Remind Me (sets reminder to self)
  - Share statement (WhatsApp)

---

### 4. 🪣 Buckets Screen
Envelope budgeting system. Separate from cashbook logic.

**Balance Input Bar (top):**
- "Your current balance: ₹____" (editable)
- Unallocated: ₹X (grayed out)

**Bucket Cards:**
- Each bucket: Name | Allocated | Spent | Remaining
- Color-coded (green > 50%, yellow 20-50%, red < 20%)
- Progress bar per bucket

**Actions:**
- + Add Bucket
- Edit bucket (name, amount, color, icon)
- Delete bucket
- Reset (redistribute leftover to overflow)

**Month Preset:**
- Save current split as monthly template
- Auto-fill on 1st of every month
- Leftover from last month → Overflow bucket

**Overflow Bucket:**
- Always exists, cannot be deleted
- Catches: leftover from previous month + unallocated money

---

### 5. 💸 Payment Flow (Modal / Sheet)
Triggered from: Scan QR, Pay to Number, or Pay button inside party ledger.

**Step 1: Who / Where**
- UPI ID pre-filled (from QR or manual)
- Amount input
- Note/label

**Step 2: Which Bucket?**
- List of buckets with current balance shown
- Select one (or "No Category" for untagged)
- If selected bucket balance < amount → warning banner: "⚠️ Food bucket only has ₹150. You're paying ₹200."
- User can still proceed

**Step 3: Confirm**
- Summary: Pay ₹X to Y from [Bucket]
- Tap "Pay Now" → opens UPI app via deeplink (GPay/PhonePe/Paytm)
- On return → "Did your payment go through?" Yes / No
- Yes → entry logged, bucket deducted, cashbook updated
- No → entry discarded

---

### 6. ➕ Add Entry Screen (Manual Log)
Used when not paying through app.

- Amount (IN / OUT toggle)
- Label/description
- Date & time (defaults to now)
- Bucket (optional)
- Party (optional — links to a person)
- Save

---

### 7. 🔔 Reminders Screen (under More)
Self-reminders only. Not sent to other people.

- List of active reminders
- Add reminder: message + date/time + linked party (optional)
- On trigger: local push notification
- Types: One-time | Recurring (weekly/monthly)

---

### 8. 📊 Reports Screen (under More)
- Date range picker
- Total IN / OUT summary
- Category/bucket-wise pie chart
- Day-wise bar chart (spending trend)
- Top 5 expense labels
- Export as PDF

---

### 9. ⚙️ Settings / More Screen
- Update balance (manual sync)
- Manage buckets (shortcut)
- Monthly preset manager
- Currency (default INR)
- Language (Hindi / English to start)
- App lock (PIN / fingerprint)
- Data backup (Firebase sync toggle)
- About / Feedback

---

### 10. 🤖 AI Assistant Screen (Layer 4 — Pro)
Chat interface.

- Input: text or voice
- Can: log entries, fetch summaries, answer questions about spending
- Context: has access to your cashbook + bucket data (passed as context to API)
- Examples:
  - "What did I spend on food this month?"
  - "Log ₹300 auto to transport bucket"
  - "How much does Rachit owe me?"

---

## Features — Full List

### Core
- [x] Manual balance input (editable anytime)
- [x] Cash in hand tracker
- [x] IN / OUT transaction logging
- [x] Label + timestamp per entry
- [x] Date-grouped cashbook view
- [x] Daily, weekly, monthly balance reports

### Payments
- [x] QR code scanner → payment initiation
- [x] Pay to UPI ID / mobile number
- [x] UPI deeplink to GPay / PhonePe / Paytm
- [x] Payment confirmation flow (did it go through?)
- [x] Entry auto-logged on confirmation

### Buckets
- [x] Create named buckets with custom amount
- [x] Remaining balance per bucket
- [x] Warning on low bucket before payment
- [x] Auto-refill on 1st of month from preset
- [x] Leftover → Overflow bucket
- [x] Untagged transactions → No Category

### Parties
- [x] Add person (customer / supplier)
- [x] Log give / get per person
- [x] Balance per person (what they owe / you owe)
- [x] Personal transaction timeline
- [x] Settlement marking

### Reminders
- [x] Self-only reminders
- [x] Link reminder to a party
- [x] One-time and recurring options
- [x] Local push notifications

### Reports
- [x] Category-wise breakdown
- [x] Person-wise breakdown
- [x] Spending trend chart
- [x] Export PDF

### AI (Layer 4)
- [x] Natural language entry logging
- [x] Spending queries
- [x] Data summarization

---

## UX Principles

- **One-thumb reachable** — all primary actions within bottom 60% of screen
- **Minimal taps** — pay in 3 taps from home screen
- **Color language** — green = in/positive, red = out/warning, blue = neutral/info
- **No jargon** — "You will give" not "Payable", "You will get" not "Receivable"
- **Confirmation before destructive actions** — delete, settle, clear
- **Offline first** — all core features work without internet; Firebase syncs when online

---

## React Hooks to Build

| Hook | Purpose |
|---|---|
| `useBalance` | Get/set current manual balance |
| `useTransactions` | CRUD for cashbook entries |
| `useBuckets` | CRUD + allocation logic for buckets |
| `useParties` | Person ledger CRUD |
| `usePaymentFlow` | Multi-step payment state machine |
| `useUPIDeeplink` | Construct and open UPI URIs |
| `useReminders` | Schedule and manage local notifications |
| `useReports` | Aggregate transaction data for charts |
| `useMonthReset` | Auto-refill buckets, move leftover on month start |
| `useAI` | Send context + query to AI API, parse response |
| `useBackup` | Firebase read/write sync |
| `useAuth` | PIN / biometric app lock |

---

## Data Models

### Transaction
```ts
{
  id: string,
  type: 'in' | 'out',
  amount: number,
  label: string,
  bucketId: string | null,
  partyId: string | null,
  timestamp: Date,
  paymentMethod: 'cash' | 'upi' | 'manual',
  confirmed: boolean
}
```

### Bucket
```ts
{
  id: string,
  name: string,
  icon: string,
  color: string,
  allocatedAmount: number,
  spentAmount: number,
  isOverflow: boolean
}
```

### Party
```ts
{
  id: string,
  name: string,
  type: 'customer' | 'supplier',
  transactions: Transaction[],
  balance: number  // positive = they owe you, negative = you owe them
}
```

### MonthPreset
```ts
{
  id: string,
  buckets: { bucketId: string, amount: number }[],
  totalAllocated: number,
  autoApply: boolean
}
```

### Reminder
```ts
{
  id: string,
  message: string,
  linkedPartyId: string | null,
  triggerAt: Date,
  recurring: 'none' | 'weekly' | 'monthly',
  isActive: boolean
}
```
