import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Sliders,
  Eye,
  Type,
  Cpu,
  Trash2,
  RotateCcw,
  Vibrate,
  Languages,
  Sun,
  Moon,
} from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import AccessibilityModeToggle from '../components/AccessibilityModeToggle';
import { useSettings } from '../contexts/SettingsContext';
import { useVoice } from '../contexts/VoiceContext';
import { useApp } from '../contexts/AppContext';
import { historyService } from '../services/historyService';
import { recognitionService } from '../services/recognitionService';

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: React.ReactNode;
}

function Toggle({ label, description, checked, onChange, icon }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex items-start gap-3">
        {icon && <span className="text-cyan-400 mt-0.5" aria-hidden="true">{icon}</span>}
        <div>
          <div className="font-bold text-white text-sm">{label}</div>
          {description && (
            <div className="text-xs text-gray-400 mt-0.5 leading-snug">{description}</div>
          )}
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#0a1633]
          ${checked ? 'bg-cyan-500' : 'bg-gray-700'}
        `}
        aria-label={label}
      >
        <span
          className={`
            pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0
            transition duration-200 ease-in-out
            ${checked ? 'translate-x-6' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
}

export default function Settings() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { speak, triggerHaptic } = useVoice();
  const { recognitionMode } = useApp();

  const [modelStatus, setModelStatus] = useState<{ available: boolean; modelName: string }>({
    available: false,
    modelName: 'currency-vision-v1',
  });
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [clearHistoryModalOpen, setClearHistoryModalOpen] = useState(false);

  useEffect(() => {
    recognitionService.checkModelStatus().then((status) => {
      setModelStatus({
        available: status.available,
        modelName: status.modelName,
      });
    });
  }, []);

  const handleTestVoice = () => {
    triggerHaptic('selection');
    speak(
      `This is a Drishti AI voice test at speech rate ${settings.speechSpeed} times normal. Mode: ${
        settings.accessibilityMode === 'voice' ? 'Voice Mode' : 'Visual Mode'
      }. Theme: ${settings.theme === 'light' ? 'Light Theme' : 'Dark Theme'}.`
    );
  };

  const handleResetSettings = () => {
    resetSettings();
    setResetModalOpen(false);
    triggerHaptic('selection');
    speak('Settings reset to default values.');
  };

  const handleClearHistory = () => {
    historyService.clearHistory();
    setClearHistoryModalOpen(false);
    triggerHaptic('selection');
    speak('Scan history cleared.');
  };

  return (
    <Layout title="Application Settings" showBack>
      <div className="space-y-6">
        {/* Accessibility Mode Selector */}
        <section aria-label="Accessibility Mode Selection" className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 px-1">
            <Eye className="w-4 h-4" aria-hidden="true" />
            Accessibility Mode
          </h2>
          <AccessibilityModeToggle />
        </section>

        {/* Theme Selector (Dark vs Light Theme) */}
        <section aria-label="Visual Theme Settings" className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 px-1">
            <Sun className="w-4 h-4" aria-hidden="true" />
            Display Theme
          </h2>

          <Card padding="sm">
            <div
              className="grid grid-cols-2 gap-2 p-1 bg-gray-900/90 rounded-xl border border-white/10"
              role="radiogroup"
              aria-label="Select display theme"
            >
              <button
                type="button"
                role="radio"
                aria-checked={settings.theme !== 'light'}
                onClick={() => {
                  updateSettings({ theme: 'dark' });
                  triggerHaptic('selection');
                  speak('Dark theme enabled.');
                }}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-xs font-bold transition-all min-h-[48px] ${
                  settings.theme !== 'light'
                    ? 'bg-cyan-500 text-gray-950 shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
                aria-label="Dark Theme. Deep navy background with cyan and yellow accents."
              >
                <Moon className="w-4 h-4" aria-hidden="true" />
                <span>Dark Theme</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={settings.theme === 'light'}
                onClick={() => {
                  updateSettings({ theme: 'light' });
                  triggerHaptic('selection');
                  speak('Light theme enabled.');
                }}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-xs font-bold transition-all min-h-[48px] ${
                  settings.theme === 'light'
                    ? 'bg-amber-400 text-gray-950 shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
                aria-label="Light Theme. High contrast light background with bold dark text."
              >
                <Sun className="w-4 h-4" aria-hidden="true" />
                <span>Light Theme</span>
              </button>
            </div>
          </Card>
        </section>

        {/* Voice Assistance Section */}
        <section aria-label="Voice Feedback Settings" className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 px-1">
            <Volume2 className="w-4 h-4" aria-hidden="true" />
            Voice Assistance & Speech
          </h2>

          <Card padding="md" className="space-y-4">
            <Toggle
              label="Spoken Announcements"
              description="Automatically announce currency value and screen instructions aloud"
              checked={settings.voiceEnabled}
              onChange={(val) => {
                updateSettings({ voiceEnabled: val });
                triggerHaptic('selection');
                if (val) speak('Voice assistance enabled.');
              }}
            />

            <hr className="border-white/10" />

            {/* Speech Speed Slider */}
            <div className="space-y-2 py-1">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-white">Speech Speed</span>
                <span className="text-cyan-400 font-bold">{settings.speechSpeed}x</span>
              </div>

              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.25"
                value={settings.speechSpeed}
                onChange={(e) => updateSettings({ speechSpeed: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-gray-700 rounded-lg min-h-[44px]"
                aria-label="Adjust speech speed rate"
              />

              <div className="flex justify-between text-[11px] text-gray-400">
                <span>0.5x (Slow)</span>
                <span>1.0x (Normal)</span>
                <span>2.0x (Fast)</span>
              </div>
            </div>

            <hr className="border-white/10" />

            {/* Text Size Selector */}
            <div className="space-y-2 py-1">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-white flex items-center gap-2">
                  <Type className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                  Text Size Scale
                </span>
                <span className="text-cyan-400 font-bold">
                  {settings.fontSize === 0.85 ? 'Small' : settings.fontSize === 1.0 ? 'Normal' : settings.fontSize === 1.15 ? 'Large' : 'Extra Large'}
                </span>
              </div>
              <div
                className="grid grid-cols-4 gap-1 rounded-xl bg-gray-900/90 p-1 border border-white/10"
                role="radiogroup"
                aria-label="Select text size"
              >
                {[
                  { label: 'Small', value: 0.85 },
                  { label: 'Normal', value: 1.0 },
                  { label: 'Large', value: 1.15 },
                  { label: 'XL', value: 1.3 },
                ].map(({ label, value }) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={settings.fontSize === value}
                    onClick={() => {
                      updateSettings({ fontSize: value });
                      triggerHaptic('selection');
                      speak(`Text size set to ${label}.`);
                    }}
                    className={`py-2 rounded-lg text-xs font-bold transition-all min-h-[44px] ${
                      settings.fontSize === value
                        ? 'bg-cyan-500 text-gray-950 shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-white/10" />

            {/* Language Preference */}
            <div className="space-y-1.5">
              <label htmlFor="language-select" className="text-sm font-bold text-white flex items-center gap-2">
                <Languages className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                Spoken Language Preference
              </label>
              <select
                id="language-select"
                value={settings.language}
                onChange={(e) => {
                  const lang = e.target.value;
                  updateSettings({ language: lang });
                  triggerHaptic('selection');
                  speak(lang.startsWith('hi') ? 'भाषा बदलकर हिंदी कर दी गई है।' : `Language set to ${lang}`);
                }}
                className="w-full bg-navy-900 border border-cyan-500/40 text-white rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-cyan-400 min-h-[48px]"
                aria-label="Select voice announcement language"
              >
                <option value="en-IN">English (India - en-IN)</option>
                <option value="en-US">English (US - en-US)</option>
                <option value="hi-IN">हिन्दी (Hindi - hi-IN)</option>
                <option value="ta-IN">தமிழ் (Tamil - ta-IN)</option>
                <option value="te-IN">తెలుగు (Telugu - te-IN)</option>
              </select>
            </div>

            <hr className="border-white/10" />

            {/* Test Voice Button */}
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={handleTestVoice}
              iconLeft={<Volume2 className="w-4 h-4 text-cyan-400" aria-hidden="true" />}
              aria-label="Test voice speech output"
            >
              Test Voice Feedback
            </Button>
          </Card>
        </section>

        {/* Tactile & Display Settings */}
        <section aria-label="Visual and Display Settings" className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 px-1">
            <Vibrate className="w-4 h-4" aria-hidden="true" />
            Tactile Feedback & Visual Display
          </h2>

          <Card padding="md" className="space-y-3">
            <Toggle
              label="Haptic Vibrations"
              description="Vibrates on camera capture, button taps, and recognition success for tactile confirmation"
              checked={settings.hapticFeedback}
              icon={<Vibrate className="w-4 h-4 text-cyan-400" aria-hidden="true" />}
              onChange={(val) => {
                updateSettings({ hapticFeedback: val });
                if (val) triggerHaptic('success');
                speak(`Haptic vibration ${val ? 'enabled' : 'disabled'}`);
              }}
            />

            <hr className="border-white/10" />

            <Toggle
              label="High Contrast Mode"
              description="Maximizes element borders and contrast for low-vision readability"
              checked={settings.highContrast}
              onChange={(val) => {
                updateSettings({ highContrast: val });
                triggerHaptic('selection');
                speak(`High contrast mode ${val ? 'enabled' : 'disabled'}`);
              }}
            />

            <hr className="border-white/10" />

            <Toggle
              label="Large Text Mode"
              description="Increases overall typography scale across all screens"
              checked={settings.largeText}
              onChange={(val) => {
                updateSettings({ largeText: val });
                triggerHaptic('selection');
                speak(`Large text mode ${val ? 'enabled' : 'disabled'}`);
              }}
            />
          </Card>
        </section>

        {/* AI Engine & Backend Section */}
        <section aria-label="AI Engine Status" className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 px-1">
            <Cpu className="w-4 h-4" aria-hidden="true" />
            AI Engine Configuration
          </h2>

          <Card padding="md" className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">Current Mode</div>
                <div className="text-xs text-gray-400">
                  {recognitionMode === 'demo' ? 'Sample demonstration notes' : 'Live camera or uploaded image'}
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                recognitionMode === 'demo'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}>
                {recognitionMode.toUpperCase()} MODE
              </span>
            </div>

            <hr className="border-white/10" />

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300 font-semibold">Backend Service</span>
              <span className={modelStatus.available ? 'text-teal-400 font-bold' : 'text-amber-400 font-bold'}>
                {modelStatus.available ? '● Connected' : '○ Standalone / Demo'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300 font-semibold">Recognition Model</span>
              <span className="text-gray-400">{modelStatus.modelName}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300 font-semibold">Supported Notes</span>
              <span className="text-cyan-300 font-bold">₹10, ₹20, ₹50, ₹100, ₹200, ₹500</span>
            </div>
          </Card>
        </section>

        {/* Data & Reset Actions */}
        <section aria-label="Data and Defaults Management" className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 px-1">
            <Sliders className="w-4 h-4" aria-hidden="true" />
            Data & Privacy
          </h2>

          <div className="space-y-2">
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => setClearHistoryModalOpen(true)}
              iconLeft={<Trash2 className="w-4 h-4 text-red-400" aria-hidden="true" />}
              aria-label="Clear scan history"
            >
              Clear Recognition History
            </Button>

            <Button
              variant="ghost"
              size="md"
              fullWidth
              onClick={() => setResetModalOpen(true)}
              iconLeft={<RotateCcw className="w-4 h-4" aria-hidden="true" />}
              aria-label="Reset settings to factory defaults"
            >
              Reset Settings to Defaults
            </Button>
          </div>
        </section>

        {/* About App & Legal Disclaimer */}
        <Card padding="md" className="space-y-2 text-center text-xs text-gray-400">
          <div className="font-bold text-white text-sm">DRISHTI AI v1.0.0 (Android & PWA)</div>
          <p>
            AI Currency Recognition Assistant for Visually Impaired People.
          </p>
          <p className="text-[11px] text-gray-500 pt-1">
            Disclaimer: Drishti AI identifies Indian currency denominations for accessibility purposes only and does not verify authenticity or detect counterfeit currency.
          </p>
        </Card>

        {/* Reset Confirmation Modal */}
        <Modal
          open={resetModalOpen}
          onClose={() => setResetModalOpen(false)}
          title="Reset All Settings"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-300">
              Reset speech speed, voice guidance, and display settings to their default values?
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button variant="secondary" onClick={() => setResetModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleResetSettings}>
                Reset
              </Button>
            </div>
          </div>
        </Modal>

        {/* Clear History Modal */}
        <Modal
          open={clearHistoryModalOpen}
          onClose={() => setClearHistoryModalOpen(false)}
          title="Clear History"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-300">
              Are you sure you want to delete all saved scan history?
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button variant="secondary" onClick={() => setClearHistoryModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleClearHistory}>
                Delete All
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
