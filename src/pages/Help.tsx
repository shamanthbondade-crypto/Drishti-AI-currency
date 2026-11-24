import React, { useState } from 'react';
import {
  HelpCircle,
  Camera,
  Volume2,
  ShieldAlert,
  Sun,
  Smartphone,
  ChevronDown,
  Info,
  Mic,
  Eye,
  Home,
  Cpu,
} from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { useVoice } from '../contexts/VoiceContext';

interface AccordionItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string[];
}

const FAQ_SECTIONS: AccordionItem[] = [
  {
    id: 'talkback-setup',
    title: 'TalkBack Setup & Navigation Guide',
    icon: <Smartphone className="w-5 h-5 text-teal-400" aria-hidden="true" />,
    content: [
      '• TalkBack is Android\'s official screen reader for blind and low-vision users.',
      '• To enable: Open Android Device Settings → Accessibility → TalkBack → toggle On.',
      '• Move to Next Item: Swipe right across the screen with one finger.',
      '• Move to Previous Item: Swipe left across the screen with one finger.',
      '• Activate Item: Double-tap anywhere on the screen while the item is focused.',
      '• Scroll Page: Drag up or down using two fingers simultaneously.',
      '• Important: Drishti AI cannot independently enable TalkBack; it must be turned on in Android device settings.',
    ],
  },
  {
    id: 'voice-commands',
    title: 'Spoken Voice Commands Guide',
    icon: <Mic className="w-5 h-5 text-cyan-400" aria-hidden="true" />,
    content: [
      '• Tap the "Push to Talk" button at the bottom of the screen to speak a command:',
      '• "Scan Currency" — Opens the rear camera scanner directly.',
      '• "Capture" — Takes a picture of the banknote in camera view.',
      '• "Repeat Result" — Replays the last identified currency denomination.',
      '• "Scan Again" — Returns to camera scanner to identify another note.',
      '• "Stop Speaking" — Instantly silences audio announcements.',
      '• "Open History" — Navigates to your past scans log.',
      '• "Help" — Opens this instructions screen.',
      '• Note: Drishti AI uses push-to-talk. It does not continuously listen to preserve battery and privacy.',
    ],
  },
  {
    id: 'home-and-assistant',
    title: 'Home Screen & Voice Assistant Launching',
    icon: <Home className="w-5 h-5 text-violet-400" aria-hidden="true" />,
    content: [
      '• Add to Home Screen (PWA): In Google Chrome, tap the menu (three dots) in top right → tap "Add to Home screen" or "Install App".',
      '• Android App: Once installed from APK, the Drishti AI icon appears on your home screen and in your app launcher.',
      '• Voice Assistant Opening: On Android devices with Google Assistant enabled and configured, say "Hey Google, open Drishti AI".',
      '• Note: Google Assistant must be configured on your device and voice match enabled.',
    ],
  },
  {
    id: 'accessibility-modes',
    title: 'Voice Mode vs. Visual Mode & Themes',
    icon: <Eye className="w-5 h-5 text-yellow-400" aria-hidden="true" />,
    content: [
      '• Voice Mode (For Completely Blind Users): Full spoken feedback, push-to-talk bar, TalkBack-compatible live announcements, and tactile haptic vibration confirmation.',
      '• Visual Mode (For Low Vision Users): Maximum high-contrast display with yellow and cyan accents, extra large typography, and thick focus borders.',
      '• Themes: Switch between Dark Theme (deep navy/black) and Light Theme (crisp light background with bold dark text) in Settings.',
      '• Switch modes anytime using the toggle badge at the top of every screen or in Settings.',
    ],
  },
  {
    id: 'how-to-use',
    title: 'How to Recognize Banknotes',
    icon: <Camera className="w-5 h-5 text-cyan-400" aria-hidden="true" />,
    content: [
      '1. Open Camera Scanner by tapping "SCAN CURRENCY NOTE" or saying "Scan Currency".',
      '2. Place the note flat on a table. Hold phone flat, parallel to table, about 15 to 20 cm above the note.',
      '3. Listen for "Rear camera ready" audio confirmation.',
      '4. Tap the large "CAPTURE NOTE" button or say "Capture".',
      '5. Tap "Identify Note" to receive spoken denomination announcement: "This is an Indian rupee note."',
    ],
  },
  {
    id: 'camera-permissions',
    title: 'Camera & Microphone Permissions',
    icon: <ShieldAlert className="w-5 h-5 text-amber-400" aria-hidden="true" />,
    content: [
      '• Camera Permission: Needed to scan banknotes using the rear camera.',
      '• Microphone Permission: Needed only when you tap Push to Talk to speak commands.',
      '• On Android App: Tap "Allow" when the Android system permission dialog appears.',
      '• In Browser: Tap the padlock or settings icon in address bar, find Camera and Microphone, and toggle to "Allow".',
      '• If camera is unavailable, you can upload a photo using "Upload Banknote Image" or test with Demo Mode.',
    ],
  },
  {
    id: 'demo-vs-real',
    title: 'Demo Mode vs. Real AI Recognition',
    icon: <Cpu className="w-5 h-5 text-cyan-400" aria-hidden="true" />,
    content: [
      '• Demo Mode: Allows blind and low-vision users to explore all 6 banknotes (₹10, ₹20, ₹50, ₹100, ₹200, ₹500) and hear spoken announcements without requiring an active AI backend.',
      '• Real AI Mode: Connects to the Drishti AI Python inference service (FastAPI) to perform actual computer vision classification.',
      '• If the AI service is not running, Drishti AI clearly indicates Demo Mode and never fakes AI predictions.',
    ],
  },
  {
    id: 'photography-tips',
    title: 'Lighting & Positioning Guidance',
    icon: <Sun className="w-5 h-5 text-yellow-400" aria-hidden="true" />,
    content: [
      '• Good Lighting: Bright indoor light or daylight gives the most accurate results.',
      '• Neutral Surface: Place note on a dark or contrasting table so edges are distinct.',
      '• Avoid Glare: Tilt phone slightly away from harsh direct overhead bulbs if glare is detected.',
      '• Keep Flat: Ensure the note is unfolded so color patterns and numbers are visible.',
    ],
  },
  {
    id: 'legal-disclaimer',
    title: 'Important Disclaimer & Safety Notice',
    icon: <Info className="w-5 h-5 text-blue-400" aria-hidden="true" />,
    content: [
      '• Drishti AI is strictly designed to help visually impaired individuals identify currency denominations (₹10, ₹20, ₹50, ₹100, ₹200, ₹500).',
      '• Drishti AI DOES NOT verify genuine currency or detect counterfeit banknotes.',
      '• Always verify high-value cash transactions with trusted bank personnel or tactile security marks.',
    ],
  },
];

export default function Help() {
  const { speak, triggerHaptic } = useVoice();
  const [openSection, setOpenSection] = useState<string | null>('talkback-setup');

  const toggleSection = (id: string, title: string) => {
    triggerHaptic('selection');
    if (openSection === id) {
      setOpenSection(null);
    } else {
      setOpenSection(id);
      speak(`${title} section expanded.`);
    }
  };

  const handleReadSection = (title: string, content: string[]) => {
    triggerHaptic('selection');
    const fullText = `${title}. ${content.join(' ')}`;
    speak(fullText);
  };

  return (
    <Layout title="Help & Instructions" showBack>
      <div className="space-y-6">
        {/* Intro Banner */}
        <section
          aria-label="Help Introduction"
          className="rounded-2xl bg-[#0c2452] border border-cyan-500/20 p-5 space-y-3"
        >
          <div className="flex items-center gap-2 text-cyan-300">
            <HelpCircle className="w-6 h-6 flex-shrink-0" aria-hidden="true" />
            <h1 className="font-extrabold text-lg text-white">
              Drishti AI Accessibility Guide
            </h1>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            Need guidance using voice commands, TalkBack gestures, camera scanning, or switching modes? Select any section below to read or hear spoken instructions.
          </p>

          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => {
              speak(
                'Drishti AI Help Guide. Available voice commands are: Scan Currency, Capture, Repeat Result, Scan Again, Stop Speaking, Open History, and Help. Tap Push to Talk to use them. For TalkBack navigation, swipe right to move to next item and double-tap to activate.'
              );
            }}
            iconLeft={<Volume2 className="w-4 h-4 text-cyan-400" aria-hidden="true" />}
            aria-label="Read quick help summary aloud"
          >
            Read Help Summary Aloud
          </Button>
        </section>

        {/* FAQ Accordions */}
        <section aria-label="Frequently Asked Questions" className="space-y-3">
          {FAQ_SECTIONS.map((section) => {
            const isOpen = openSection === section.id;
            return (
              <div
                key={section.id}
                className="overflow-hidden rounded-2xl bg-[#0f2347] border border-white/10 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleSection(section.id, section.title)}
                  className="w-full flex items-center justify-between p-4 text-left font-bold text-white hover:bg-white/5 active:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 min-h-[56px]"
                  aria-expanded={isOpen}
                  aria-controls={`faq-content-${section.id}`}
                >
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true">{section.icon}</span>
                    <span className="text-sm sm:text-base">{section.title}</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-cyan-400' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {isOpen && (
                  <div
                    id={`faq-content-${section.id}`}
                    role="region"
                    className="px-4 pb-4 pt-1 space-y-2 border-t border-white/5 text-xs sm:text-sm text-gray-300 leading-relaxed animate-[fadeIn_0.2s_ease-out]"
                  >
                    {section.content.map((item, idx) => (
                      <p key={idx}>{item}</p>
                    ))}

                    <div className="pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReadSection(section.title, section.content)}
                        iconLeft={<Volume2 className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />}
                        aria-label={`Read ${section.title} section aloud`}
                      >
                        Read this section aloud
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </Layout>
  );
}
