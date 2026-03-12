# 💡 Witty Wallet — The Idea

## What Is It?

Witty Wallet is a **personal finance app built for India** — combining Khatabook's simplicity with envelope budgeting, smart payment initiation, and an AI assistant layer.

It solves one problem clearly: **You know how much you earn. You don't know where it goes.**

---

## The Problem

Current apps are either:
- Too basic (just log income/expense)
- Too complex (full accounting software)
- Not built for UPI-first India
- Missing the "parties" ledger (who owes me, who I owe)

No app combines **all three** — daily cashbook + envelope budgeting + person-level ledger — in a clean, accessible UI.

---

## The Solution

A modular finance app with 4 layers:

### Layer 1 — Cashbook
> Record every rupee in and out. Clean daily report like Khatabook.

- Log income & expenses with labels
- Daily, weekly, monthly view
- Cash in hand tracker

### Layer 2 — Bucket System (Envelope Budgeting)
> Virtually divide your balance into purpose-specific buckets.

- You have ₹5000 → split: Food ₹2000 / Shopping ₹2000 / Misc ₹500 / Overflow ₹500
- Every payment is tagged to a bucket
- If a bucket runs low → app warns you before you pay
- Month-end leftover → auto-moves to Overflow bucket
- New month → auto-refill buckets as per your saved preset

### Layer 3 — Parties (Give / Get Ledger)
> Track money lent and borrowed. Person-level accounts.

- Add a person → log how much you gave or need to get
- Reminders to yourself (not to them)
- Settlement tracking

### Layer 4 — AI Assistant
> Talk to your wallet.

- "How much did I spend on food this week?"
- "Log ₹200 for auto, tag it to transport"
- "Who owes me money?"
- Powered by Claude / GPT API

---

## The UPI Intervention (Key Design Decision)

Instead of building a native UPI payment system (requires NPCI license), Witty Wallet uses a **UPI deeplink**:

1. You initiate payment inside the app (amount + UPI ID / QR scan)
2. App asks: **which bucket?**
3. App opens GPay/PhonePe with amount pre-filled
4. You pay there → return to app → confirm
5. App deducts from selected bucket and logs the entry

**Balance sync is manual** — you enter your account balance. App manages the virtual split from there.

This is not a limitation. It's the right MVP approach.

---

## Who Is This For?

| User | Why They Need It |
|---|---|
| College students | Track hostel money, split expenses, manage pocket money |
| Young professionals | Salary budgeting, rent/bills, social spending control |
| Freelancers | Track who paid, who hasn't, categorize project expenses |
| Small shop owners | Replace physical Khatabook, digital ledger |

---

## What Makes It Different

| Feature | Walnut | Money View | Khatabook | Witty Wallet |
|---|---|---|---|---|
| Cashbook / Daily log | ❌ | ❌ | ✅ | ✅ |
| Envelope Budgeting | ❌ | ❌ | ❌ | ✅ |
| Parties Ledger | ❌ | ❌ | ✅ | ✅ |
| UPI Payment Initiation | ❌ | ❌ | ❌ | ✅ (deeplink) |
| AI Assistant | ❌ | ❌ | ❌ | ✅ |
| India-first Design | ✅ | ✅ | ✅ | ✅ |

---

## Revenue Model

- **Free**: Layer 1 + Layer 3 (Cashbook + Parties)
- **Pro (₹99/month)**: Layer 2 (Buckets) + Reports + Reminders
- **AI Add-on (₹49/month)**: Layer 4 (AI assistant)
- **Enterprise**: Custom for small businesses

---

## Vision

> "Know where every rupee went — before it leaves your hand."
