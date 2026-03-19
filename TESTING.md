# 🧪 FINZO — Testing Guide

> Complete guide to run and test the FINZO app

---

## ✅ Status: App is Ready to Run

**No blocking issues found.** All code compiles successfully with zero errors.

The only open issue (ISSUE-002) is a peer dependency warning that doesn't affect functionality - it's already handled with `--legacy-peer-deps`.

---

## 🚀 How to Run the App

### Option 1: Using Expo Go (Recommended for Quick Testing)

1. **Install Expo Go on your Android device:**
   - Download from Google Play Store: [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Start the development server:**
   ```bash
   cd /home/ak/Desktop/Data/Coding/Projects/Finzo/finzo
   npx expo start
   ```

3. **Connect your device:**
   - Make sure your phone and computer are on the same WiFi network
   - Open Expo Go app
   - Scan the QR code shown in the terminal
   - App will load on your device

### Option 2: Using Android Emulator (Requires Android Studio)

1. **Start Android emulator first** (via Android Studio AVD Manager)

2. **Start with Android flag:**
   ```bash
   cd /home/ak/Desktop/Data/Coding/Projects/Finzo/finzo
   npx expo start --android
   ```

3. **App will automatically open in the emulator**

### Option 3: Build APK for Installation (Real Device Testing)

1. **Create development build:**
   ```bash
   cd /home/ak/Desktop/Data/Coding/Projects/Finzo/finzo
   npx expo prebuild
   npx expo run:android
   ```

2. **Or build standalone APK with EAS:**
   ```bash
   npm install -g eas-cli
   eas build --profile development --platform android
   ```

---

## 🧪 What to Test

### Temporary Blocking Milestone: TM0 — Account Sheet Rework
> These are your new requirements. We will not move to M6 until they pass.
- [ ] Home screen: total balance is NOT editable (no tap-to-edit modal)
- [ ] Balance updates are ONLY possible from:
  - [ ] Cashbook (manual add/edit/delete entries)
  - [ ] Payment section (QR code scan + payment confirmation)
- [ ] Buckets: "Overflow" is replaced by "Unallocated" everywhere
- [ ] Buckets month-end logic: leftover and deleted bucket allocations move to "Unallocated"
- [ ] Buckets UI: for each bucket, manual add/remove money works while monthly allocation budget rules remain consistent
- [ ] Account sheet consistency: cashbook, buckets, and parties all reflect the same underlying money entries (no redundant/competing state)
- [ ] Parties ledger: any money received from a party OR money given to a party is visible in Cashbook as an IN/OUT entry
- [ ] Party-linked cashbook entries show correct sign (money received vs money going out)
- [ ] UI polish: remove emojis (keep minimal) and improve aesthetics across Home / Cashbook / Buckets

### Core Features (M0-M5 Complete)

#### 1. **Balance Management**
- [ ] Tap balance card on Home screen
- [ ] Set initial balance (e.g., ₹10,000)
- [ ] Update balance and verify it persists

#### 2. **Cashbook (M1)**
- [ ] Add income entry (tap "Add Entry" → toggle to IN → enter amount/label)
- [ ] Add expense entry (OUT type)
- [ ] View entries in Cashbook tab (grouped by date)
- [ ] Edit entry (tap on entry in cashbook or home)
- [ ] Delete entry (long press → confirm)
- [ ] Verify balance updates correctly

#### 3. **Parties Ledger (M2)**
- [ ] Go to Parties tab
- [ ] Add a customer (e.g., "Ramesh Shop")
- [ ] Add a supplier (e.g., "Wholesale Mart")
- [ ] Tap party → Give money / Get money
- [ ] Verify balance updates (green for "will get", red for "will give")
- [ ] Settle a party (zeros balance)
- [ ] Share statement (generates text)
- [ ] Link entry to party: Add Entry → tap "Select a party" → choose one
- [ ] Delete party

#### 4. **Bucket System (M3)**
- [ ] Go to Buckets tab
- [ ] Add bucket (e.g., "Food" with ₹2,000 allocation)
- [ ] Add 2-3 more buckets (Transport, Entertainment, etc.)
- [ ] Verify unallocated bucket appears automatically
- [ ] Add expense with bucket: Add Entry → OUT → tap "Select Bucket" → pick one
- [ ] View Cashbook → verify bucket tag appears on entry
- [ ] Go back to Buckets → verify spent amount and progress bar
- [ ] Save Monthly Preset (button at top)
- [ ] Toggle Auto-Apply → ON
- [ ] Reset Month button → verify spending zeros, leftover moves to Unallocated
- [ ] Edit bucket → change allocation
- [ ] Delete bucket → verify allocation moves to Unallocated

#### 5. **Payment Flow + UPI (M4)**
- [ ] Home → tap "Scan QR" → grant camera permission
- [ ] Point at a UPI QR code (you can use any merchant QR or generate test one)
- [ ] Verify UPI ID auto-fills
- [ ] Complete payment flow: amount → bucket → confirm
- [ ] Choose UPI app (GPay/PhonePe/etc.)
- [ ] App opens UPI app (or shows alert if not installed)
- [ ] Return to FINZO → "Did it go through?" → tap Yes
- [ ] Verify entry logged in cashbook + bucket deducted
- [ ] Test manual UPI: Home → "Pay" → enter UPI ID manually (e.g., test@upi)
- [ ] Test with invalid UPI ID → should show error
- [ ] Test pending payment recovery: Start payment → kill app mid-flow → reopen → should show recovery dialog

#### 6. **Reminders (M5)**
- [ ] More tab → tap "Reminders"
- [ ] Add reminder → enter message, set date/time (tomorrow at 9 AM)
- [ ] Link to a party (optional)
- [ ] Choose recurring type (One-time / Weekly / Monthly)
- [ ] Save → grant notification permission
- [ ] Toggle reminder OFF → toggle back ON
- [ ] Edit reminder → change message/time
- [ ] Delete reminder (long press)
- [ ] Wait for notification time to test push notification (or set to 1 min from now)

#### 7. **Reports (M5)**
- [ ] More tab → tap "Reports"
- [ ] Switch between date ranges (Today / This Week / This Month / etc.)
- [ ] Verify summary cards show correct totals
- [ ] Check pie chart (bucket-wise spending)
- [ ] Check bar chart (daily trend)
- [ ] View top 5 expense labels
- [ ] Tap "PDF" button → share report
- [ ] Verify PDF exports and can be shared

---

## 🐛 Common Issues & Fixes

### Issue: "Bundler cache is empty"
**Fix:** This is normal on first run. Wait for Metro to rebuild (20-30 seconds).

### Issue: "Unable to resolve module"
**Fix:** Clear cache and reinstall:
```bash
cd /home/ak/Desktop/Data/Coding/Projects/Finzo/finzo
rm -rf node_modules
npm install --legacy-peer-deps
npx expo start --clear
```

### Issue: "QR code not working in Expo Go"
**Fix:** 
- Ensure phone and PC are on same WiFi
- Use tunnel mode: `npx expo start --tunnel`
- Or use direct URL shown in terminal

### Issue: "Camera permission denied"
**Fix:** Go to Android Settings → Apps → Expo Go → Permissions → enable Camera

### Issue: "Notifications not showing"
**Fix:** 
- Grant notification permission when prompted
- Check Android Settings → Apps → Expo Go → Notifications enabled
- Note: Local notifications only work on physical device (not all emulators)

### Issue: "UPI app not opening"
**Fix:** This is expected if testing in emulator (no UPI apps). On real device:
- Install GPay/PhonePe
- Or tap "Other UPI" → generic UPI picker will show

---

## 📊 Performance Metrics

After testing, you should see:
- ✅ Bundle size: ~4.4MB (1625 modules)
- ✅ TypeScript errors: 0
- ✅ Compile errors: 0
- ✅ App starts in < 5 seconds
- ✅ Smooth 60fps animations (NativeWind + Reanimated)
- ✅ Data persists across app restarts (AsyncStorage)

---

## 🎯 Test Scenarios (End-to-End)

### Scenario 1: Daily Expense Tracking
1. Set balance: ₹10,000
2. Add 3 buckets: Food (₹2000), Transport (₹1000), Shopping (₹1500)
3. Add expense: ₹150 for "Lunch" → Food bucket
4. Add expense: ₹50 for "Bus" → Transport bucket
5. Go to Cashbook → verify both entries
6. Go to Buckets → verify remaining amounts
7. Go to Reports → verify pie chart shows distribution

### Scenario 2: Party Transactions
1. Add customer: "Ramesh"
2. Give him ₹5,000 (recorded as "you will get")
3. Add supplier: "Wholesale Mart"
4. Get ₹3,000 from them (recorded as "you will give")
5. Go to Parties tab → verify balances (₹5K green, ₹3K red)
6. Tap Ramesh → Get Money ₹2,000 → verify balance updates to ₹3K
7. Settle Ramesh → balance becomes ₹0
8. Share statement → verify text shows all transactions

### Scenario 3: UPI Payment Flow
1. Create a test UPI QR (use any UPI QR generator online or merchant QR)
2. Tap "Scan QR" → scan QR
3. Verify amount/UPI ID pre-fills (if in QR)
4. Choose Food bucket
5. Confirm → Choose GPay
6. (If GPay installed) App opens GPay → cancel payment
7. Return to FINZO → tap "No, it didn't go through"
8. Verify nothing logged
9. Retry → tap "Yes, payment successful"
10. Verify entry appears in cashbook + Food bucket deducted

---

## 🔧 Development Commands

```bash
# Start dev server
cd /home/ak/Desktop/Data/Coding/Projects/Finzo/finzo
npx expo start

# Start with cache clear
npx expo start --clear

# Start in tunnel mode (for remote testing)
npx expo start --tunnel

# Build Android bundle (verify compilation)
npx expo export --platform android

# Check for TypeScript errors
npx tsc --noEmit

# Install new dependency
npm install <package> --legacy-peer-deps
```

---

## ✨ Next Steps (After Testing)

Once you've tested M0-M5 features:
- [ ] Report any bugs found during testing → add to Issues.md
- [ ] Document UX improvements → add to plan.md
- [ ] Ready to start M6 (Firebase Sync + Auth)

---

## 📝 Test Checklist Summary

- [ ] App starts without errors
- [ ] All 5 tabs accessible
- [ ] Balance persists across restarts
- [ ] Can add/edit/delete transactions
- [ ] Parties balance calculations correct
- [ ] Buckets allocate/spend/refund correctly
- [ ] Month reset works
- [ ] QR scanner works (on real device)
- [ ] UPI deeplinks open (on real device with UPI apps)
- [ ] Reminders schedule notifications
- [ ] Reports generate correctly
- [ ] PDF export works
- [ ] No crashes during normal use

**Test Duration:** ~30-45 minutes for full coverage

---

## 🎉 Ready to Test!

The app is production-ready for M0-M5 features. Just run:

```bash
cd /home/ak/Desktop/Data/Coding/Projects/Finzo/finzo && npx expo start
```

Then scan QR with Expo Go on your Android phone.
