# 🚀 FINZO — QuickStart Guide

How to preview and run the FINZO app locally.

---

## Prerequisites

| Tool | Required Version | Check With |
|---|---|---|
| **Node.js** | >= 20.x | `node -v` |
| **npm** | >= 10.x | `npm -v` |
| **Expo Go** app | Latest | Install from Play Store / App Store |

> **Note:** The project uses Expo SDK 55 / RN 0.83 which ideally wants Node >= 20.19.4. Node 20.19.3 works fine — you'll see npm warnings but no functional issues.

---

## 1. Install Dependencies

```bash
cd finzo
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` is needed because expo-router has a peer dependency on react@^19.2.4 while Expo SDK 55 pins react@19.2.0. This is cosmetic — everything works.

---

## 2. Start the Dev Server

```bash
npx expo start
```

This opens the Expo CLI with a QR code and options.

---

## 3. Preview on a Device

### Option A: Expo Go (Easiest — Recommended)
1. Install **Expo Go** on your Android/iOS phone
2. Make sure phone and computer are on the **same Wi-Fi network**
3. Scan the QR code shown in the terminal
4. The app loads on your phone

### Option B: Android Emulator
1. Install Android Studio + set up an AVD (Android Virtual Device)
2. Start the emulator
3. Press `a` in the Expo CLI terminal to open on Android

### Option C: iOS Simulator (macOS only)
1. Install Xcode
2. Press `i` in the Expo CLI terminal to open on iOS Simulator

### Option D: Web Preview
```bash
npx expo start --web
```
> Web preview has limited support for some RN components but works for basic testing.

---

## 4. Useful Commands

| Command | What It Does |
|---|---|
| `npx expo start` | Start dev server |
| `npx expo start --clear` | Start with cleared Metro cache |
| `npx expo start --android` | Start and open on Android directly |
| `npx expo start --tunnel` | Use tunnel mode (if same Wi-Fi doesn't work) |
| `npx expo export --platform android` | Build a static bundle (verify compilation) |

---

## 5. Project Structure (Key Files)

```
finzo/
├── app/                    # Screens (Expo Router file-based routing)
│   ├── _layout.tsx         # Root layout
│   ├── add-entry.tsx       # Add transaction screen
│   ├── edit-entry.tsx      # Edit transaction screen
│   └── (tabs)/             # Tab navigator
│       ├── _layout.tsx     # Tab config (5 tabs)
│       ├── index.tsx       # Home screen
│       ├── cashbook.tsx    # Cashbook screen
│       ├── parties.tsx     # Parties (M2)
│       ├── buckets.tsx     # Buckets (M3 placeholder)
│       └── more.tsx        # Settings/More
├── hooks/                  # Custom React hooks
├── store/                  # Zustand state stores
├── types/                  # TypeScript interfaces
├── lib/                    # Utilities (formatting, storage)
└── constants/              # Design tokens (colors)
```

---

## 6. Known Issues

- **npm warnings about Node version:** RN 0.83 wants Node >= 20.19.4, we have 20.19.3. No functional impact.
- **`--legacy-peer-deps` required:** React version pinned by Expo conflicts with expo-router's react-dom peer dep. Harmless.

---

## 7. Troubleshooting

**Metro bundler won't start:**
```bash
npx expo start --clear
```

**Dependencies broken:**
```bash
rm -rf node_modules && npm install --legacy-peer-deps
```

**Expo Go can't connect:**
- Try tunnel mode: `npx expo start --tunnel`
- Install `@expo/ngrok`: `npm install -g @expo/ngrok`
