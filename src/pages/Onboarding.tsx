import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Camera,
  Volume2,
  ArrowRight,
  Check,
  Smartphone,
  Shield,
  Home,
  Mic,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useVoice } from '../contexts/VoiceContext';
import { useSettings } from '../contexts/SettingsContext';
import Button from '../components/Button';
import AccessibilityModeToggle from '../components/AccessibilityModeToggle';

interface Step {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  spokenText: string;
  icon: React.FC<React.SVGProps<SVGSVGElement> & { size?: number | string }>;
  accentColor: string;
}

const steps: Step[] = [
  {
    id: 'welcome',
    title: 'Welcome to Drishti AI',
    subtitle: 'Indian Currency Recognition Assistant',
    description:
      'Recognize Indian Rupee banknotes instantly, hear their value clearly, and gain financial independence. Choose your preferred accessibility mode below.',
    spokenText:
      'Welcome to Drishti AI. Your currency recognition assistant is ready. Please choose your accessibility mode: Voice Mode for completely blind users with audio feedback, or Visual Mode for low-vision users with high-contrast display.',
    icon: Eye,
    accentColor: 'from-cyan-500 to-teal-500',
  },
  {
    id: 'talkback',
    title: 'TalkBack Setup Guidance',
    subtitle: 'Android Built-in Screen Reader',
    description:
      'To enable TalkBack on your Android device: open Device Settings → Accessibility → TalkBack → turn On. Swipe right to move to the next item, swipe left to move back, and double-tap to activate.',
    spokenText:
      'TalkBack setup guidance. TalkBack is Android\'s built-in screen reader. To turn it on, open Android Device Settings, select Accessibility, select TalkBack, and switch it on. When TalkBack is running, swipe right to move to the next item, swipe left to go back, and double-tap to activate. Drishti AI cannot independently enable TalkBack; it must be enabled in Android settings.',
    icon: Smartphone,
    accentColor: 'from-teal-500 to-emerald-500',
  },
  {
    id: 'permissions',
    title: 'Permission Explanations',
    subtitle: 'Camera & Microphone Access',
    description:
      'Camera access is required to capture and recognize currency notes. Microphone access is required when using Push to Talk for voice commands. Permissions are requested only when needed.',
    spokenText:
      'Permission explanations. Drishti AI requires Camera permission to view and identify currency notes. It requires Microphone access only when you tap Push to Talk to speak commands. Drishti AI cannot bypass Android permissions; please tap Allow when the Android system permission prompt appears.',
    icon: Shield,
    accentColor: 'from-blue-500 to-indigo-500',
  },
  {
    id: 'launching',
    title: 'Home Screen & Voice Assistant',
    subtitle: 'Quick Access Instructions',
    description:
      'Add Drishti AI to your home screen via browser menu "Add to Home screen" or "Install App". If supported and configured on your device, you can launch the app using Google Assistant: "Hey Google, open Drishti AI".',
    spokenText:
      'Home screen and voice assistant instructions. To add Drishti AI to your home screen in Chrome, open the browser menu and tap Add to Home screen. On Android devices with Google Assistant enabled and configured, you can launch the app by saying: Hey Google, open Drishti AI. Note that device configuration is required.',
    icon: Home,
    accentColor: 'from-violet-500 to-purple-500',
  },
  {
    id: 'scanning',
    title: 'Banknote Recognition',
    subtitle: 'Point Camera & Hear Value',
    description:
      'Hold any Indian Rupee banknote flat about 15 centimeters below your phone camera. Drishti AI identifies ₹10, ₹20, ₹50, ₹100, ₹200, and ₹500 denominations with spoken announcements.',
    spokenText:
      'Banknote recognition. Place the currency note flat on a table. Hold your phone flat about 15 centimeters above the note. Drishti AI identifies 10, 20, 50, 100, 200, and 500 rupee notes, and immediately announces: This is an Indian rupee note with the recognized value.',
    icon: Camera,
    accentColor: 'from-amber-500 to-orange-500',
  },
  {
    id: 'voice-controls',
    title: 'Voice-First Controls',
    subtitle: 'Push-to-Talk Spoken Commands',
    description:
      'Tap "Push to Talk" to speak commands: "Scan Currency", "Capture", "Repeat Result", "Scan Again", "Stop Speaking", "Open History", or "Help". Touch buttons are also provided.',
    spokenText:
      'Voice-first controls. You can tap Push to Talk and say commands: Scan Currency, Capture, Repeat Result, Scan Again, Stop Speaking, Open History, or Help. Accessible touch buttons are always available if you prefer not to use the microphone.',
    icon: Mic,
    accentColor: 'from-cyan-400 to-blue-500',
  },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const { completeOnboarding } = useApp();
  const { speak, triggerHaptic } = useVoice();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  // Spoken instructions on step change
  useEffect(() => {
    speak(step.spokenText);
  }, [currentStep, step.spokenText, speak]);

  const handleNext = () => {
    triggerHaptic('selection');
    if (isLast) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleComplete = () => {
    completeOnboarding();
    triggerHaptic('success');
    speak(
      `Welcome to Drishti AI Home. Running in ${
        settings.accessibilityMode === 'voice' ? 'Voice Mode' : 'Visual Mode'
      }. Tap Scan Currency to begin.`
    );
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-[#0a1633] text-white flex flex-col justify-between p-4 max-w-lg mx-auto">
      {/* Header bar with Brand and Skip */}
      <header className="flex items-center justify-between pt-2 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Eye className="w-5 h-5 text-navy-950 font-bold" aria-hidden="true" />
          </div>
          <span className="font-extrabold tracking-wider bg-gradient-to-r from-cyan-300 to-teal-300 bg-clip-text text-transparent text-lg">
            DRISHTI AI
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/help')}
            className="text-cyan-400 hover:text-cyan-300 font-bold text-xs p-2 rounded-xl hover:bg-white/5 transition-colors focus:ring-2 focus:ring-cyan-400 min-h-[44px] flex items-center gap-1"
            aria-label="Open accessibility help guide"
          >
            <HelpCircle className="w-4 h-4" aria-hidden="true" />
            <span>Help</span>
          </button>

          {!isLast && (
            <button
              type="button"
              onClick={handleComplete}
              className="text-gray-300 hover:text-white font-bold text-xs px-3 py-2 rounded-xl hover:bg-white/5 transition-colors focus:ring-2 focus:ring-cyan-400 min-h-[44px] flex items-center"
              aria-label="Skip onboarding setup and go directly to home screen"
            >
              Skip
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main
        className="flex-1 flex flex-col items-center justify-center my-4 text-center"
        role="region"
        aria-label={`Onboarding Step ${currentStep + 1} of ${steps.length}: ${step.title}`}
      >
        {/* Step Icon Badge */}
        <div className="relative mb-4">
          <div
            className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${step.accentColor} flex items-center justify-center shadow-2xl shadow-cyan-500/20`}
          >
            <step.icon className="w-10 h-10 text-navy-950" aria-hidden="true" />
          </div>
          <div className="absolute -inset-2 bg-cyan-400/20 blur-xl rounded-full -z-10" />
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1.5 leading-tight">
          {step.title}
        </h1>
        <p className="text-cyan-300 font-bold text-sm mb-3 tracking-wide">
          {step.subtitle}
        </p>

        {/* Description Box */}
        <div className="bg-navy-900/80 border border-cyan-500/30 rounded-2xl p-4 text-left text-xs sm:text-sm text-gray-200 leading-relaxed max-w-sm mb-4">
          <p>{step.description}</p>
        </div>

        {/* Step 1 Specific: Accessibility Mode Choice */}
        {step.id === 'welcome' && (
          <div className="w-full max-w-sm mb-2">
            <AccessibilityModeToggle />
          </div>
        )}

        {/* Step 2 Specific: TalkBack Gestures quick guide */}
        {step.id === 'talkback' && (
          <div className="w-full max-w-sm bg-navy-950/90 border border-teal-500/40 rounded-xl p-3 text-left text-xs text-teal-200 space-y-1 mb-2">
            <div className="font-extrabold text-white">TalkBack Gestures:</div>
            <div>• <strong>Swipe Right:</strong> Next item</div>
            <div>• <strong>Swipe Left:</strong> Previous item</div>
            <div>• <strong>Double-Tap:</strong> Activate focused element</div>
            <div className="text-[11px] text-gray-400 pt-1">
              *Note: TalkBack is an Android system service enabled in Android Accessibility Settings.
            </div>
          </div>
        )}

        {/* Step 3 Specific: Permissions list */}
        {step.id === 'permissions' && (
          <div className="w-full max-w-sm bg-navy-950/90 border border-blue-500/40 rounded-xl p-3 text-left text-xs text-blue-200 space-y-1.5 mb-2">
            <div>📷 <strong>Camera:</strong> To scan and identify currency banknotes</div>
            <div>🎙️ <strong>Microphone:</strong> To listen for push-to-talk voice commands</div>
            <div className="text-[11px] text-gray-400 pt-1">
              *Note: Android will display system permission dialogs. Drishti AI never bypasses permissions.
            </div>
          </div>
        )}

        {/* Step 4 Specific: Home screen & Voice Assistant */}
        {step.id === 'launching' && (
          <div className="w-full max-w-sm bg-navy-950/90 border border-violet-500/40 rounded-xl p-3 text-left text-xs text-violet-200 space-y-1.5 mb-2">
            <div>📱 <strong>Home Screen:</strong> Browser Menu → Add to Home screen</div>
            <div>🗣️ <strong>Google Assistant:</strong> Say &quot;Hey Google, open Drishti AI&quot;</div>
            <div className="text-[11px] text-gray-400 pt-1">
              *Note: Requires Google Assistant and app installation on device.
            </div>
          </div>
        )}

        {/* Step 5 Specific: Supported Denominations */}
        {step.id === 'scanning' && (
          <div className="flex flex-wrap justify-center gap-2 mb-2" aria-label="Supported denominations: ₹10, ₹20, ₹50, ₹100, ₹200, ₹500">
            {['₹10', '₹20', '₹50', '₹100', '₹200', '₹500'].map((denom) => (
              <span
                key={denom}
                className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-xs font-bold shadow-sm"
              >
                {denom}
              </span>
            ))}
          </div>
        )}

        {/* Step 6 Specific: Voice commands list */}
        {step.id === 'voice-controls' && (
          <div className="w-full max-w-sm bg-navy-950/90 border border-cyan-500/30 rounded-xl p-3 text-left space-y-1 text-xs text-cyan-200 mb-2">
            <div className="font-extrabold text-white">Supported Voice Commands:</div>
            <div>• &quot;Scan Currency&quot; | &quot;Capture&quot;</div>
            <div>• &quot;Repeat Result&quot; | &quot;Scan Again&quot;</div>
            <div>• &quot;Stop Speaking&quot; | &quot;Open History&quot; | &quot;Help&quot;</div>
          </div>
        )}

        {/* Read Step Aloud Button */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('selection');
            speak(step.spokenText);
          }}
          className="text-xs text-cyan-300 hover:text-cyan-200 hover:underline flex items-center gap-1.5 py-1 min-h-[44px]"
          aria-label="Replay spoken instructions for this step"
        >
          <Volume2 className="w-4 h-4" aria-hidden="true" />
          <span>Hear This Step Again</span>
        </button>
      </main>

      {/* Footer navigation */}
      <footer className="space-y-3 pb-3">
        {/* Progress Indicator */}
        <div
          className="flex items-center justify-center gap-2"
          role="tablist"
          aria-label={`Step ${currentStep + 1} of ${steps.length}`}
        >
          {steps.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setCurrentStep(idx);
              }}
              className={`h-2 rounded-full transition-all duration-300 min-h-[32px] px-1 flex items-center justify-center ${
                idx === currentStep ? 'w-7 bg-cyan-400' : 'w-3 bg-gray-700 hover:bg-gray-600'
              }`}
              aria-label={`Step ${idx + 1}: ${s.title}`}
              aria-selected={idx === currentStep}
            >
              <span className="sr-only">Step {idx + 1}</span>
            </button>
          ))}
        </div>

        {/* Action Button */}
        <div className="w-full">
          <Button
            variant="primary"
            size="xl"
            fullWidth
            onClick={handleNext}
            iconRight={
              isLast ? (
                <Check className="w-6 h-6 text-navy-950" aria-hidden="true" />
              ) : (
                <ArrowRight className="w-6 h-6 text-navy-950" aria-hidden="true" />
              )
            }
            className="py-4 text-navy-950 font-black text-lg bg-gradient-to-r from-cyan-400 to-teal-400 min-h-[56px]"
            aria-label={isLast ? 'Complete onboarding and start using Drishti AI' : 'Continue to next step'}
          >
            {isLast ? 'Start Drishti AI' : 'Continue'}
          </Button>
        </div>
      </footer>
    </div>
  );
}
