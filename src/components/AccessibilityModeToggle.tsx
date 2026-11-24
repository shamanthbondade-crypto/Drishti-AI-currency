import React from 'react';
import { Volume2, Eye } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useVoice } from '../contexts/VoiceContext';
import type { AccessibilityMode } from '../types';

interface AccessibilityModeToggleProps {
  compact?: boolean;
}

export const AccessibilityModeToggle: React.FC<AccessibilityModeToggleProps> = ({ compact = false }) => {
  const { settings, updateSettings } = useSettings();
  const { speak, triggerHaptic } = useVoice();
  const currentMode = settings.accessibilityMode || 'voice';

  const handleSelect = (mode: AccessibilityMode) => {
    if (mode === currentMode) return;

    updateSettings({
      accessibilityMode: mode,
      // If visual mode selected, also ensure high contrast is enabled by default for low vision
      highContrast: mode === 'visual' ? true : settings.highContrast,
      largeText: mode === 'visual' ? true : settings.largeText,
    });

    triggerHaptic('selection');

    if (mode === 'voice') {
      speak('Switched to Voice Mode for blind users. Audio announcements and voice commands enabled.');
    } else {
      speak('Switched to Visual Mode for low-vision users. High contrast and extra large display enabled.');
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Select Accessibility Mode"
      className={`w-full bg-navy-900/90 p-1.5 rounded-2xl border-2 border-cyan-500/40 shadow-lg ${
        compact ? 'mb-2' : 'mb-4'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          role="radio"
          aria-checked={currentMode === 'voice'}
          aria-label="Voice Mode for blind users. Spoken audio feedback and voice commands."
          onClick={() => handleSelect('voice')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold transition-all min-h-[52px] ${
            currentMode === 'voice'
              ? 'bg-cyan-500 text-navy-950 shadow-md shadow-cyan-500/30 ring-2 ring-white scale-[1.02]'
              : 'bg-navy-800/80 text-cyan-200 hover:bg-navy-800'
          }`}
        >
          <Volume2 className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          <div className="text-left">
            <div className="text-sm font-extrabold leading-tight">Voice Mode</div>
            {!compact && <div className="text-[11px] opacity-90 leading-tight">For Blind Users</div>}
          </div>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={currentMode === 'visual'}
          aria-label="Visual Mode for low vision users. High contrast and extra large text."
          onClick={() => handleSelect('visual')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold transition-all min-h-[52px] ${
            currentMode === 'visual'
              ? 'bg-yellow-400 text-navy-950 shadow-md shadow-yellow-400/30 ring-2 ring-white scale-[1.02]'
              : 'bg-navy-800/80 text-yellow-200 hover:bg-navy-800'
          }`}
        >
          <Eye className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          <div className="text-left">
            <div className="text-sm font-extrabold leading-tight">Visual Mode</div>
            {!compact && <div className="text-[11px] opacity-90 leading-tight">For Low Vision</div>}
          </div>
        </button>
      </div>
    </div>
  );
};

export default AccessibilityModeToggle;
