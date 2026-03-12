# 🗺️ Witty Wallet — Build Plan

---

## Tech Stack

### Frontend (Mobile App)
| Layer | Choice | Why |
|---|---|---|
| Framework | **React Native** (Expo) | Single codebase → Android + iOS. Expo simplifies builds. |
| Language | **TypeScript** | Type safety, especially for financial data models |
| State Management | **Zustand** | Lightweight, simple, no boilerplate vs Redux |
| Navigation | **Expo Router** (file-based) | Clean routing, deep linking support |
| UI Components | **NativeWind** (Tailwind for RN) | Fast styling, consistent design system |
| Charts | **Victory Native** | Clean, performant chart library for React Native |
| Forms | **React Hook Form** | Minimal re-renders, validation |

### Backend / Data
| Layer | Choice | Why |
|---|---|---|
| Local Storage (MVP) | **AsyncStorage + MMKV** | MMKV is fast, AsyncStorage for larger data |
| Cloud Sync | **Firebase Firestore** | Real-time, free tier generous, easy auth |
| Auth | **Firebase Auth** (Phone/Google) | Indian users prefer phone OTP |
| Notifications | **Expo Notifications** | Local push for reminders, no server needed |

### Payment Integration
| Feature | Approach |
|---|---|
| QR Scanner | `expo-camera` + `expo-barcode-scanner` |
| UPI Deeplink | `Linking.openURL('upi://pay?pa=...')` |
| GPay specific | `tez://upi/pay?...` |
| PhonePe specific | `phonepe://pay?...` |
| Fallback | Standard UPI URI scheme (works on all apps) |

### AI Layer (Phase 4)
| | |
|---|---|
| API | Anthropic Claude API (claude-sonnet) |
| Context passing | Last 90 days transactions + bucket state as JSON in system prompt |
| Voice input | `expo-speech` for TTS, `expo-av` for STT |

### Dev Tools
- **Expo EAS Build** — cloud builds for Android APK / iOS IPA
- **Sentry** — crash reporting
- **Posthog** — analytics (free tier)
- **GitHub Actions** — CI/CD

---

## Milestones

---

### 🏁 Milestone 0 — Setup & Design (Week 1–2)

**Goal:** Project scaffolded. Design system defined.

- [ ] Init Expo project with TypeScript
- [ ] Configure NativeWind
- [ ] Set up Expo Router with tab navigation
- [ ] Define color system, typography, spacing tokens
- [ ] Wireframe all 10 screens (Figma or paper)
- [ ] Define all data models in TypeScript interfaces
- [ ] Set up Zustand stores (balance, transactions, buckets, parties)
- [ ] Set up AsyncStorage persistence layer

**Deliverable:** Blank app that navigates between all screens with correct layout shells.

---

### 🏁 Milestone 1 — Cashbook MVP (Week 3–4)

**Goal:** Core cashbook works fully with local storage.

- [ ] Home screen — balance display, quick actions (stubs)
- [ ] Add Entry screen — IN/OUT, label, amount, date
- [ ] Cashbook screen — date-grouped list, running balance
- [ ] Edit / Delete entry with balance recalculation
- [ ] Manual balance update (tap to edit on home)
- [ ] `useBalance` hook
- [ ] `useTransactions` hook (CRUD)
- [ ] Persist to AsyncStorage

**Deliverable:** Working cashbook. Log money in/out. See daily report.

---

### 🏁 Milestone 2 — Parties Ledger (Week 5–6)

**Goal:** Give/Get person ledger fully functional.

- [ ] Parties screen — tabs (Customers / Suppliers)
- [ ] Add party screen
- [ ] Party detail screen — timeline, balance
- [ ] Give / Get entry inside party
- [ ] Settlement flow
- [ ] Share statement (text format via share sheet)
- [ ] `useParties` hook (CRUD)
- [ ] Link transaction to party in cashbook

**Deliverable:** Full Khatabook-style parties ledger.

---

### 🏁 Milestone 3 — Bucket System (Week 7–8)

**Goal:** Envelope budgeting fully functional.

- [ ] Buckets screen — cards with progress bars
- [ ] Add / Edit / Delete bucket
- [ ] Overflow bucket (auto-created, non-deletable)
- [ ] Bucket allocation validation (cannot exceed total balance)
- [ ] Low bucket warning logic
- [ ] Monthly preset — save and auto-apply
- [ ] Month-end auto reset + leftover → Overflow
- [ ] `useBuckets` hook
- [ ] `useMonthReset` hook (scheduled trigger)

**Deliverable:** Working envelope budget system. Set it once, runs on autopilot.

---

### 🏁 Milestone 4 — Payment Flow + UPI Deeplink (Week 9–10)

**Goal:** Initiate real UPI payments from the app.

- [ ] QR Scanner screen (expo-barcode-scanner)
- [ ] Parse UPI QR → extract UPI ID, name, amount
- [ ] Pay to Number screen (manual UPI ID entry)
- [ ] Payment flow modal — multi-step: amount → bucket → confirm
- [ ] UPI deeplink builder (`useUPIDeeplink` hook)
- [ ] Open GPay / PhonePe / fallback UPI
- [ ] Return flow — "Did it go through?" confirmation
- [ ] Pending payment recovery (if app killed mid-flow)
- [ ] Auto-log on confirmation → cashbook + bucket deducted

**Deliverable:** Tap "Scan QR" on home → pay → entry logged. Full loop works.

---

### 🏁 Milestone 5 — Reminders + Reports (Week 11–12)

**Goal:** Self-reminders and reporting layer.

- [ ] Reminders screen — list, add, edit, delete
- [ ] Local push notifications (expo-notifications)
- [ ] One-time and recurring reminder logic
- [ ] Link reminder to party
- [ ] Reports screen — date picker, summary cards
- [ ] Pie chart (bucket-wise spending)
- [ ] Bar chart (daily trend)
- [ ] Top 5 expense labels
- [ ] PDF export (react-native-html-to-pdf)
- [ ] `useReminders` hook
- [ ] `useReports` aggregation hook

**Deliverable:** Complete self-reminders. Full visual reports. PDF export.

---

### 🏁 Milestone 6 — Firebase Sync + Auth (Week 13–14)

**Goal:** Cloud backup and multi-device support.

- [ ] Firebase project setup
- [ ] Firebase Auth — phone OTP login
- [ ] Firestore schema mirroring local data models
- [ ] `useBackup` hook — sync on/off toggle
- [ ] Conflict resolution (last-write-wins for MVP)
- [ ] Restore on new device login
- [ ] App PIN + biometric lock (expo-local-authentication)
- [ ] Settings screen — all toggles

**Deliverable:** Login → all data restored on new device. App lock working.

---

### 🏁 Milestone 7 — AI Assistant (Week 15–16)

**Goal:** Conversational finance assistant.

- [ ] AI Assistant screen — chat UI
- [ ] `useAI` hook — Anthropic API integration
- [ ] System prompt builder — inject last 90 days data as context
- [ ] Parse AI response → detect if it's a log command
- [ ] Execute log commands from AI response
- [ ] Query responses — spending summaries, party balances
- [ ] Rate limiting / token awareness
- [ ] (Optional) Voice input via expo-av

**Deliverable:** Ask "how much did I spend on food?" → get real answer.

---

### 🏁 Milestone 8 — Polish + Launch Prep (Week 17–18)

**Goal:** Production-ready app.

- [ ] Onboarding flow (first launch)
- [ ] Empty states for all screens (no data yet)
- [ ] Error states + retry flows
- [ ] Performance audit (heavy list virtualization)
- [ ] Sentry integration
- [ ] Posthog analytics (optional, privacy-respecting)
- [ ] App icon + splash screen
- [ ] Android APK via EAS Build
- [ ] Beta testing (10–20 real users)
- [ ] Fix bugs from beta
- [ ] Play Store submission

---

## Development Approach

**Solo Dev / Small Team:**
- Milestones 1–4 = core value. Ship these first.
- Milestones 5–6 = makes it sticky. Add before launch.
- Milestones 7–8 = differentiator. Can be post-launch.

**Recommended MVP Scope:**
Milestones 0 → 1 → 2 → 3 → 4 = **functional product** in ~10 weeks.

---

## Folder Structure

```
witty-wallet/
├── app/                    # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx       # Home
│   │   ├── cashbook.tsx
│   │   ├── parties.tsx
│   │   ├── buckets.tsx
│   │   └── more.tsx
│   ├── payment/
│   │   ├── scan.tsx
│   │   ├── manual.tsx
│   │   └── confirm.tsx
│   ├── party/[id].tsx
│   ├── reports.tsx
│   ├── reminders.tsx
│   └── ai.tsx
├── components/             # Shared UI components
├── hooks/                  # All custom hooks
├── store/                  # Zustand stores
├── lib/                    # Utilities (UPI builder, formatters)
├── types/                  # TypeScript interfaces
└── constants/              # Colors, icons, config
```

---

## Risk Register

| Risk | Likelihood | Mitigation |
|---|---|---|
| UPI app not installed on device | Low | Detect installed apps, show only available options |
| User forgets to confirm payment | Medium | Persistent reminder card on home screen |
| Firebase sync conflict | Low | Last-write-wins + manual conflict notice |
| AI API cost at scale | Medium | Cache common queries, rate-limit per user |
| Play Store rejection | Low | No payment processing in-app, just deeplinks — compliant |

---

## Estimated Timeline

| Phase | Duration |
|---|---|
| Design + Setup | 2 weeks |
| Core features (M1–M4) | 8 weeks |
| Polish + reports + reminders (M5–M6) | 4 weeks |
| AI + launch prep (M7–M8) | 4 weeks |
| **Total** | **~18 weeks (4.5 months)** |

Solo dev, part-time: ~7–8 months.
