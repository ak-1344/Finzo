# 🔄 Witty Wallet — User Flow

All possible user journeys mapped from entry point to completion.

---

## 1. First Launch / Onboarding

```
App opens
→ Welcome screen (app name + tagline)
→ "What's your current balance?" → user enters ₹XXXX
→ "Want to split it into buckets?" → Yes / Skip
  → Yes → Bucket Setup screen (add 1–5 buckets, amounts auto-sum)
  → Skip → goes to Home
→ "Set a PIN for app lock?" → Yes / Skip
→ Home screen
```

---

## 2. Pay Someone via QR Code

```
Home → Tap "Scan QR"
→ Camera opens
→ Scan QR (UPI QR from any app / shop)
→ UPI ID auto-filled
→ Enter amount
→ Add note/label (optional)
→ "Which bucket?" → list of buckets with balances shown
  → Select bucket
    → If bucket balance < amount → Warning: "Food bucket only has ₹150. Proceed?"
      → Proceed / Cancel
  → Or select "No Category"
→ Confirm screen: "Pay ₹200 to merchant@upi from Food bucket"
→ Tap "Pay Now"
→ GPay/PhonePe opens with amount pre-filled
→ User pays on that app
→ Returns to Witty Wallet
→ "Did payment go through?"
  → Yes → Entry logged. Bucket deducted. Cashbook updated. ✅
  → No → Nothing logged. Returns to home.
```

---

## 3. Pay to UPI ID / Mobile Number

```
Home → Tap "Pay to Number"
→ Enter mobile number or UPI ID
→ Enter amount
→ Add label
→ Which bucket? → same flow as above
→ Confirm → deeplink to UPI app
→ Return → confirm → logged
```

---

## 4. Log a Manual Entry (No Payment)

```
Home → Tap "Add Entry"  OR  Cashbook → "Add Entry to [Date]"
→ Toggle: IN / OUT
→ Enter amount
→ Enter label (e.g., "chips", "train", "salary")
→ Date & time (pre-filled, editable)
→ Bucket (optional)
→ Party (optional)
→ Save → entry appears in Cashbook
```

---

## 5. Log Income

```
Home → "Add Entry"
→ Toggle → IN
→ Amount: ₹3200
→ Label: "train" (or "salary", "freelance payment")
→ Bucket: None (income doesn't come from a bucket)
→ Party: optional (who paid you)
→ Save → Balance updates ✅
```

---

## 6. Update Balance Manually

```
Home → Tap balance amount (or Settings → Update Balance)
→ Edit field opens
→ Enter new balance (e.g., after checking bank app)
→ Confirm → app recalculates bucket overflows/allocations
```

---

## 7. Set Up Buckets

```
Buckets tab → "Add Bucket"
→ Name (e.g., Food)
→ Icon (from preset list)
→ Color
→ Allocated amount
→ Save
→ Repeat for each bucket
→ Overflow bucket auto-exists with remaining balance
```

---

## 8. Edit / Refill Buckets Monthly

```
Buckets tab → "Monthly Preset"
→ Adjust amounts per bucket
→ "Save as Preset"
→ Toggle: "Auto-apply on 1st of each month" → ON
→ On 1st: buckets reset, previous leftover → Overflow ✅
```

---

## 9. Add a Party (Give / Get)

```
Parties tab → "Add Customer" (or Add Supplier)
→ Name (e.g., Rachit)
→ Save
→ Inside Rachit's ledger:
  → "You gave" or "You received"
  → Amount + note
  → Save → running balance updates
```

---

## 10. Log a Give/Get Transaction Inside Party

```
Parties → Tap Rachit
→ Tap "Given" → Enter ₹173 → note "dinner" → Save
  → Rachit's balance: he owes you ₹173
→ Later: Tap "Received" → ₹173 → Save
  → Balance: ₹0 (Settled)
```

---

## 11. Settle a Party

```
Parties → Tap person
→ Tap "Mark as Settled"
→ Confirm → balance zeroed → grayed out in list
```

---

## 12. Set a Reminder (Self)

```
More → Reminders → Add Reminder
→ Message: "Collect ₹500 from Armaan"
→ Link to party: Armaan (optional)
→ Date & time
→ Recurring? One-time / Weekly / Monthly
→ Save → push notification scheduled ✅
```

---

## 13. View Reports

```
More → Reports
→ Select date range
→ View: Total IN / OUT
→ Pie chart: bucket-wise spending
→ Bar chart: daily spending trend
→ Top 5 labels this month
→ Export PDF → share via WhatsApp/Drive
```

---

## 14. Use AI Assistant

```
More → AI Assistant
→ Chat input: "How much did I spend on food this month?"
→ AI reads your transaction data → responds: "₹1,840 on food this month across 12 entries."

→ "Log ₹150 auto, transport bucket"
→ AI creates entry: OUT ₹150, label "auto", bucket: Transport ✅

→ "Who owes me money?"
→ AI: "Armaan owes ₹1,942. Laksh owes ₹500."
```

---

## 15. Low Bucket Warning Flow

```
User tries to pay ₹500 from Food bucket
→ Food bucket has ₹300
→ Warning: "⚠️ Food bucket only has ₹300. You're short by ₹200."
→ Options:
  a) Switch bucket → pick another
  b) Proceed anyway → deducts, bucket goes negative (shown in red)
  c) Cancel
```

---

## 16. Month-End Auto Reset

```
[Triggered automatically on 1st of month]
→ Each bucket: leftover amount moved to Overflow
→ Buckets refilled from preset template
→ Notification: "New month, buckets refilled! Overflow: ₹843 from last month."
```

---

## 17. App Lock / Unlock

```
App opens
→ PIN / fingerprint prompt
→ Authenticated → Home screen

Wrong PIN 3x → "Try again in 30 seconds"
Forgot PIN → verify via device biometric → reset
```

---

## 18. Backup & Restore (Firebase)

```
Settings → Backup
→ Toggle ON → connects to Firebase
→ All data syncs to cloud (transactions, buckets, parties)
→ Restore: log in on new device → data fetched automatically
```

---

## 19. Share Party Statement

```
Parties → Tap person → "Share Statement"
→ Generates formatted text / PDF
→ Opens share sheet → WhatsApp / SMS / Email
```

---

## 20. Delete / Edit Entry

```
Cashbook → Swipe left on entry
→ Options: Edit | Delete
→ Edit: reopen add entry form pre-filled
→ Delete: confirm → entry removed, balance and bucket re-calculated
```

---

## Edge Cases Handled

| Scenario | Behavior |
|---|---|
| User pays but app crashes before confirmation | Entry NOT logged. Next open shows: "You had a pending payment. Log it?" |
| User forgets to confirm after returning from UPI app | Persistent card on home: "Did your ₹200 payment go through?" |
| Bucket allocated > total balance | Warning at setup: "Allocated more than balance" |
| All buckets at 0, user tries to pay | App lets them proceed with "No Category" warning |
| No internet | All features work offline. Firebase syncs when back online |
| Manual balance update mid-month | Overflow bucket adjusts. Other buckets unchanged |
| Party balance goes negative (they overpaid) | Shows "They have credit of ₹X" |
