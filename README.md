# Drishti AI

**Accessible AI-Powered Indian Currency Recognition Assistant for Blind & Low-Vision Users**  
*Recognize Currency. Hear the Value. Gain Independence.*

---

## Overview

**Drishti AI** is an Android-first (Capacitor) and responsive web/PWA application designed for completely blind and low-vision users to identify Indian Rupee (INR) banknotes using a mobile camera and spoken audio feedback.

### Supported Denominations

- **₹10** — Chocolate Brown (Sun Temple Motif)
- **₹20** — Greenish-Yellow (Ellora Caves Motif)
- **₹50** — Fluorescent Blue / Cyan (Hampi with Chariot)
- **₹100** — Lavender / Violet (Rani Ki Vav Motif)
- **₹200** — Bright Orange-Yellow (Sanchi Stupa Motif)
- **₹500** — Stone Grey (Red Fort Motif)

> **Disclaimer:** Drishti AI identifies banknote denominations for accessibility purposes only. It does **not** authenticate genuine currency or detect counterfeit notes.

---

## Key Features

### 1. Blind-First Onboarding & TalkBack Support

- **Spoken Welcome:** Announces *"Welcome to Drishti AI. Your currency recognition assistant is ready."*
- **6-Step Accessible Setup:** Covers Voice/Visual mode selection, TalkBack setup & gestures, Camera & Microphone permission explanations, Home Screen / Google Assistant launch guidance, scanning posture, and voice commands.
- **TalkBack Ready:** Semantic HTML (`header`, `main`, `nav`, `section`), descriptive `aria-label`s, `aria-live="assertive"` result announcements, keyboard focus rings, and `>= 48px` touch targets.

### 2. Voice-First Experience (Voice Mode)

- **Native Android TTS** via `@capacitor-community/text-to-speech` (with Web Speech API fallback) and haptic feedback (`@capacitor/haptics`).
- **Push-to-Talk Voice Commands** (`@capacitor-community/speech-recognition`, no continuous background listening):
  - `"Scan Currency"`
  - `"Capture"`
  - `"Repeat Result"`
  - `"Scan Again"`
  - `"Stop Speaking"`
  - `"Open History"`
  - `"Help"`
- **Accessible Touch Alternative:** A **Commands** sheet lets users tap any of the 7 commands directly when microphone access or speech recognition is unavailable.

### 3. Low-Vision Experience (Visual Mode)

- **High-Contrast Interface** with Dark and Light themes.
- **Adjustable Text Scale:** Small (`0.85x`), Normal (`1.0x`), Large (`1.15x`), Extra Large (`1.3x`).
- **Large Result Display:** High-contrast `₹` numerals, denomination words, and spoken controls (**Listen**, **Repeat**, **Stop**).

### 4. Smart Currency Scanner & Privacy

- **Rear Camera Default** (`facingMode: 'environment'`) with spoken positioning guidance and lighting/glare checks.
- **Image Upload Fallback** (JPG, PNG, WEBP up to 10 MB) for devices without camera access.
- **Privacy by Default:** Recognition history stores only the denomination, timestamp, and mode (`demo` or `real`)—currency photographs are **not** saved to persistent storage.

### 5. Hybrid AI Recognition & Honest Demo Mode

- **Real AI Mode:** Combines **RapidOCR** (`rapidocr-onnxruntime`) to read printed denomination numbers/words (`10`–`500`) with a **TensorFlow/Keras MobileNetV2 CNN** (`ai_service/models/currency_cnn_model.keras`) and an **OpenCV HSV chromatic fallback**.
- **Demo Mode:** Clearly labeled **DEMO MODE** for testing all 6 denominations and spoken feedback without requiring a running backend. Never fabricates random predictions or disguises simulated results as real AI.
- **Uncertainty Handling:** Announces *"Unable to identify the currency clearly. Please try again."* when confidence is below threshold (`0.50`).

---

## Application Screens

| Screen | Description | Features |
| --- | --- | --- |
| **A. Onboarding** | Blind-first setup | 6-step spoken guide, TalkBack & permissions info, Voice/Visual mode selection |
| **B. Home Dashboard** | Main hub | Scan & Upload buttons, Demo/Real AI toggle, Demo grid (₹10–₹500), Recent scans |
| **C. Camera Scanner** | Live capture | Rear camera default, spoken posture guidance, lighting/glare checks, Capture/Retake |
| **D. Image Upload** | File picker | Drag-and-drop, JPG/PNG/WEBP validation, 10 MB limit, preview, Replace/Remove |
| **E. Recognition** | AI analysis | Sends image to backend, handles offline/unavailable/uncertain states honestly |
| **F. Result** | Banknote reveal | Large `₹` denomination, spoken result, Listen/Repeat/Stop controls, Scan Another |
| **G. History** | Scan log | Saved denominations, timestamps, Demo/AI badges, spoken readout, Clear All modal |
| **H. Settings** | Preferences | Voice/Visual mode, Dark/Light theme, text size, speech speed, language, haptics |
| **I. Help Guide** | Assistance | TalkBack gestures, voice commands, home screen setup, photography tips, disclaimer |

---

## Architecture

```text
┌────────────────────────────────────────────────────────────────┐
│                  Drishti AI Frontend / Android                 │
│   React 18 + TypeScript + Vite + Tailwind + Capacitor 8        │
│   Native TTS • Speech Recognition • Haptics • Camera / Upload  │
└───────────────┬────────────────────────────────┬───────────────┘
                │ Demo Mode                      │ Real AI Mode
                ▼                                ▼
  ┌───────────────────────────┐    ┌──────────────────────────────┐
  │    Built-in Demo Mode     │    │   Node.js Express Proxy      │
  │  - Sample 6 Denominations │    │   - Port 3001 (Multer/CORS)  │
  │  - Spoken & UI Testing    │    │   - /api/health, /model/status│
  └───────────────────────────┘    └──────────────┬───────────────┘
                                                  │ POST /api/predict
                                                  ▼
                                   ┌──────────────────────────────┐
                                   │ Python FastAPI AI Service    │
                                   │   - Port 8000                │
                                   │   - RapidOCR Number Reader   │
                                   │   - TensorFlow/Keras CNN     │
                                   │   - OpenCV Chromatic Engine  │
                                   └──────────────────────────────┘
```

### API Endpoints

- `GET /api/health` — Service health, Keras/OCR load status, and active engine name.
- `GET /api/model/status` — Model availability, active engine, and supported classes.
- `POST /api/predict` — Multipart `image` upload returning `{ denomination, confidence, status, engine }`.

---

## Running Locally (Website & Backends)

### Prerequisites

- **Node.js** 18+ (tested with v24)
- **Python** 3.10+ (tested with 3.11)

### 1. Install Dependencies

```powershell
# Root frontend + Capacitor dependencies
npm install

# Node.js Express proxy dependencies
cd server
npm install
cd ..

# Python AI service dependencies
python -m pip install -r ai_service/requirements.txt
python -m pip install Shapely pyclipper
python -m pip install --no-deps rapidocr-onnxruntime
```

### 2. Start All 3 Services

Open three terminals in the project root:

```powershell
# Terminal 1: Python FastAPI AI Service (port 8000)
python -m uvicorn ai_service.app:app --host 0.0.0.0 --port 8000
```

```powershell
# Terminal 2: Node.js Express Backend (port 3001)
npm run server
```

```powershell
# Terminal 3: React Frontend (port 5173)
npm run dev
```

Open **http://localhost:5173** in Google Chrome or Microsoft Edge.

### 3. Connecting Phones & Teammates to Your Local Server (Wi-Fi / LAN)

If you or a teammate want an Android phone (APK) to use **Real AI Mode** against a locally running PC server:

1. **Find the host PC's Wi-Fi IPv4 address:**
   - Windows: run `ipconfig` and copy the **IPv4 Address** under Wi-Fi (e.g., `192.168.1.15`).
   - macOS/Linux: run `ifconfig` or `ip addr`.

2. **Set the backend URL in `.env`** in the project root before building the APK:

   ```env
   VITE_API_BASE_URL=http://<HOST_PC_IP>:3001
   ```

   *(Vite bakes `VITE_API_BASE_URL` into the bundle at build time, so run `npm run build` and `npx cap sync android` whenever this IP changes.)*

3. **Allow port `3001` through Windows Firewall** (run PowerShell as **Administrator**):

   ```powershell
   New-NetFirewallRule -DisplayName "Drishti AI Backend 3001" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow
   ```

   If the phone still hangs when loading, check for and remove any explicit `Block` rules on `node.exe`:

   ```powershell
   Remove-NetFirewallRule -DisplayName "Node.js JavaScript Runtime"
   New-NetFirewallRule -DisplayName "Node.js Drishti Allow" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow
   ```

4. **Verify connectivity from the phone:**
   Connect the phone to the **same Wi-Fi** as the host PC and open `http://<HOST_PC_IP>:3001/api/health` in the phone's browser. It should return `{"status":"ok",...}`.

5. *(Optional, for remote teammates on different networks)* Expose port `3001` over HTTPS using an SSH tunnel and put that `https://` URL in `.env`:

   ```powershell
   ssh -R 80:localhost:3001 nokey@localhost.run
   ```

---

## Building the Android APK

Capacitor Android configuration lives in `capacitor.config.ts` (`appId: com.drishti.ai`) and `android/`.

### Option A: Cloud Build via GitHub Actions (No Android Studio Required)

This repository includes [.github/workflows/build-apk.yml](.github/workflows/build-apk.yml).

1. *(Optional, for Real AI on a physical phone over Wi-Fi)* Create `.env` in the project root with your PC's local IPv4 address:

   ```env
   VITE_API_BASE_URL=http://192.168.1.X:3001
   ```

2. Build and sync Capacitor assets:

   ```powershell
   npm run build
   npx cap sync android
   ```

3. Push to `main` or `master` on GitHub.
4. Go to **GitHub → Actions → Build Drishti AI Android APK**, open the completed run, and download the **`drishti-ai-debug-apk`** artifact (`app-debug.apk`).

### Option B: Local Build via Android Studio

Requires **Android Studio** (with Android SDK and JDK 17+).

```powershell
npm run build
npx cap sync android
npx cap open android
```

In Android Studio, select **Build → Build Bundle(s) / APK(s) → Build APK(s)**. The debug APK is output to `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## Training / Updating the Keras Model

1. Prepare a labeled dataset with folders `10/`, `20/`, `50/`, `100/`, `200/`, `500/` (sorted alphabetically by `image_dataset_from_directory`).
2. Run `ai_service/colab_training_pipeline.py` in Google Colab (T4 GPU).
3. Place the exported model at `ai_service/models/currency_cnn_model.keras`.

---

## Project Structure

```text
AI-CURRENCY--main/
├── .github/workflows/build-apk.yml   # Automated Android Debug APK build
├── ai_service/
│   ├── app.py                        # FastAPI service (RapidOCR + Keras CNN + OpenCV)
│   ├── colab_training_pipeline.py    # MobileNetV2 transfer-learning script
│   ├── models/                       # Trained currency_cnn_model.keras
│   └── requirements.txt              # Python dependencies
├── android/                          # Capacitor Android native project
├── public/                           # PWA manifest and icons
├── server/
│   └── index.js                      # Express API proxy (port 3001)
├── src/
│   ├── components/                   # Header, BottomNav, VoiceCommandBar, Layout, etc.
│   ├── contexts/                     # AppContext, SettingsContext, VoiceContext
│   ├── pages/                        # Onboarding, Home, Scan, Upload, Recognition, Result, History, Settings, Help
│   └── services/                     # recognitionService, voiceService, speechRecognitionService, cameraService, historyService
├── capacitor.config.ts               # Capacitor configuration
└── package.json                      # Frontend scripts and Capacitor plugins
```
