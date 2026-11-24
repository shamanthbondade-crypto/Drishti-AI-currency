# DRISHTI AI — Android-First Accessibility Upgrade

**AI Currency Recognition Assistant for Visually Impaired People**
*Recognize Currency. Hear the Value. Gain Independence.*

---

## What's New in This Upgrade

### Two Accessibility Modes
| Mode | For | Features |
|------|-----|---------|
| **Voice Mode** | Completely blind users | Push-to-talk commands, full audio announcements, TalkBack-compatible, haptic vibration |
| **Visual Mode** | Low-vision users | High contrast, large text, yellow/cyan design, enhanced borders |

Switch modes via the toggle badge in every screen header or in Settings. Preference persists across sessions.

### Voice Commands (Push-to-Talk)
Say any of these after tapping **Push to Talk**:
- **"Scan Currency"** → opens rear camera scanner
- **"Capture"** → takes the banknote photo
- **"Repeat Result"** → replays last spoken announcement
- **"Scan Again"** → returns to scanner
- **"Stop Speaking"** → silences audio immediately
- **"Open History"** → shows past scans
- **"Help"** → opens user guide
- **"Home"** → goes to home dashboard
- **"Settings"** → opens settings

An accessible **Commands Sheet** button (no mic needed) lets blind users tap any command directly.

### Capacitor Android Integration
- Package: `com.drishti.ai`
- Android project at: `android/`
- 4 native plugins installed:
  - `@capacitor-community/text-to-speech@8.0.2` — Android native TTS
  - `@capacitor-community/speech-recognition@7.0.1` — native speech recognition
  - `@capacitor/haptics@8.0.2` — haptic vibration feedback
  - `@capacitor/app@8.1.2` — Android app lifecycle
- AndroidManifest.xml includes: CAMERA, RECORD_AUDIO, VIBRATE permissions

### Enhanced Camera Experience
- Spoken guidance on camera ready: *"Rear camera ready. Hold phone 15cm above banknote."*
- Image quality check (brightness/glare detection) after capture
- Spoken feedback on quality issues
- Haptic confirmation on capture
- **Info button** to replay positioning instructions anytime
- Spoken error messages for all camera failures

### Android Native TTS + Web Speech Fallback
- On Android app: uses native `TextToSpeech` API via Capacitor plugin
- On web browser: falls back to Web Speech API
- Language support: English (India), English (US), Hindi, Tamil, Telugu
- Haptic vibration on currency recognition success

### PWA Support
- `public/manifest.json` added with app name, theme, icons
- `public/icon.svg` — Drishti AI app icon
- Proper `<link rel="manifest">` and Apple meta tags in `index.html`

### TalkBack / Accessibility Audit
Every interactive element now has:
- `aria-label` with meaningful descriptions
- `aria-live="assertive"` on recognition results
- `aria-expanded` on accordion sections
- `role="radiogroup"` / `role="radio"` on mode selectors
- `role="dialog"` / `aria-modal` on modals
- `role="region"` with `aria-label` on sections
- `aria-hidden="true"` on decorative icons
- Skip-to-main-content link for keyboard navigation
- Minimum 48dp/px touch targets on all buttons

---

## Running the Application

### Website (Browser)
```powershell
# Terminal 1: Start Python AI backend
python "C:\Users\ullas\.gemini\antigravity\scratch\drishti-ai\ai_service\app.py"

# Terminal 2: Start Node.js Express backend
node "C:\Users\ullas\.gemini\antigravity\scratch\drishti-ai\server\index.js"

# Terminal 3: Start React frontend (Vite dev server)
cd "C:\Users\ullas\.gemini\antigravity\scratch\drishti-ai"
npm run dev
```
Then open: **http://localhost:5173**

### Build Production Assets
```powershell
cd "C:\Users\ullas\.gemini\antigravity\scratch\drishti-ai"
npm run build
```

---

## Building the Android APK

### Prerequisites (Install on Your Machine)
1. **Java JDK 17+** — https://adoptium.net/
2. **Android Studio + Android SDK** — https://developer.android.com/studio
   - Minimum SDK: API 22 (Android 5.1)
   - Target SDK: API 34 (Android 14)
3. Set `ANDROID_HOME` environment variable to your SDK path

### Build & Install APK
```powershell
# 1. Build the React frontend
cd "C:\Users\ullas\.gemini\antigravity\scratch\drishti-ai"
npm run build

# 2. Sync to Android platform
npx cap sync android

# 3. Build debug APK (via Gradle)
cd android
./gradlew assembleDebug

# APK location:
# android\app\build\outputs\apk\debug\app-debug.apk

# 4. Install to connected Android device (USB debugging on)
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

### Open in Android Studio
```powershell
cd "C:\Users\ullas\.gemini\antigravity\scratch\drishti-ai"
npx cap open android
```
Then run from Android Studio with a device or emulator.

---

## Implemented Features ✅

| Feature | Status |
|---------|--------|
| Voice Mode for blind users | ✅ Implemented |
| Visual Mode for low-vision users | ✅ Implemented |
| Mode persistence across sessions | ✅ Via localStorage |
| Push-to-talk voice commands (8 commands) | ✅ Implemented |
| Accessible Commands Sheet (tap alternative) | ✅ Implemented |
| Capacitor Android project | ✅ Generated & synced |
| Native Android TTS integration | ✅ Via @capacitor-community/text-to-speech |
| Native speech recognition (Android) | ✅ Via @capacitor-community/speech-recognition |
| Web Speech API fallback | ✅ Implemented |
| Haptic vibration feedback | ✅ Via @capacitor/haptics |
| Camera permissions (CAMERA, RECORD_AUDIO) | ✅ In AndroidManifest.xml |
| Rear camera with spoken guidance | ✅ Implemented |
| Image quality detection (brightness/glare) | ✅ Implemented |
| Positioning instructions button | ✅ Implemented |
| TalkBack / ARIA accessibility audit | ✅ All screens updated |
| Skip-to-main navigation link | ✅ Implemented |
| Multi-language TTS (Hindi, Tamil, Telugu) | ✅ Settings dropdown |
| PWA manifest.json + icons | ✅ Implemented |
| Existing recognition (Demo + Real AI) | ✅ Preserved |
| All 9 screens functioning | ✅ Preserved |

## Not Implemented / Requires Real Device 🔶

| Feature | Reason |
|---------|--------|
| Android APK build | Java/Android SDK not installed on this machine |
| Android Studio verification | Android Studio not available |
| TalkBack navigation testing | Requires physical Android device |
| Native speech recognition test on Android | Requires physical device |
| Guided auto-capture on blur detection | Not added — edge detection requires trained model |

---

## Project Structure
```
drishti-ai/
├── android/                    ← Capacitor Android project
│   └── app/src/main/
│       ├── AndroidManifest.xml ← CAMERA, RECORD_AUDIO, VIBRATE permissions
│       └── assets/public/      ← Synced web assets
├── src/
│   ├── components/
│   │   ├── AccessibilityModeToggle.tsx  ← NEW: Voice/Visual mode switcher
│   │   ├── VoiceCommandBar.tsx          ← NEW: Push-to-talk + command sheet
│   │   ├── Header.tsx                   ← UPGRADED: mode badge + toggle
│   │   └── Layout.tsx                   ← UPGRADED: VoiceCommandBar + skip link
│   ├── contexts/
│   │   ├── VoiceContext.tsx             ← UPGRADED: haptic, listen, announceError
│   │   └── SettingsContext.tsx          ← UPGRADED: accessibilityMode + hapticFeedback
│   ├── pages/
│   │   ├── Onboarding.tsx              ← UPGRADED: mode selector on step 1
│   │   ├── Scan.tsx                    ← UPGRADED: spoken guidance, quality check
│   │   ├── Result.tsx                  ← UPGRADED: haptic on success, aria-live
│   │   ├── Settings.tsx                ← UPGRADED: mode toggle, language, haptic
│   │   └── Help.tsx                    ← UPGRADED: voice commands guide section
│   ├── services/
│   │   ├── voiceService.ts             ← UPGRADED: native TTS + haptics
│   │   └── speechRecognitionService.ts ← NEW: Android + Web Speech Recognition
│   └── types/index.ts                  ← UPGRADED: AccessibilityMode, hapticFeedback
├── capacitor.config.ts                 ← NEW: Capacitor configuration
├── public/
│   ├── manifest.json                   ← NEW: PWA manifest
│   └── icon.svg                        ← NEW: App icon
└── ai_service/app.py                   ← UNCHANGED: OpenCV classifier
```
