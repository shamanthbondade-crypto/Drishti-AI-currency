import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ArrowLeft, Volume2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useVoice } from '../contexts/VoiceContext';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  compact?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  compact = false,
}) => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const { speak, triggerHaptic } = useVoice();
  const isVoiceMode = settings.accessibilityMode === 'voice';

  const toggleAccessibilityMode = () => {
    const nextMode = isVoiceMode ? 'visual' : 'voice';
    updateSettings({
      accessibilityMode: nextMode,
      highContrast: nextMode === 'visual',
      largeText: nextMode === 'visual',
    });
    triggerHaptic('selection');
    if (nextMode === 'voice') {
      speak('Switched to Voice Mode for blind users.');
    } else {
      speak('Switched to Visual Mode for low-vision users.');
    }
  };

  return (
    <header
      className={`
        relative flex items-center justify-between
        ${compact ? 'py-3 px-4' : 'py-5 px-4'}
        transition-all duration-300 border-b border-cyan-500/10
      `}
    >
      {/* Back button or placeholder */}
      <div className="w-12 flex items-center">
        {showBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              p-2 rounded-xl
              text-white/80 hover:text-white
              hover:bg-white/10 active:bg-white/20
              transition-colors duration-200
              min-w-[48px] min-h-[48px]
              flex items-center justify-center
            "
            aria-label="Go back to previous screen"
          >
            <ArrowLeft className="w-6 h-6" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Branding / Title */}
      <div className="flex items-center justify-center gap-2 select-none flex-1 text-center">
        {!compact && (
          <div className="relative">
            <Eye
              className="w-7 h-7 text-cyan-400"
              aria-hidden="true"
            />
            <div className="absolute inset-0 blur-md bg-cyan-400/30 rounded-full" />
          </div>
        )}

        <h1
          className={`
            font-extrabold tracking-wide
            bg-gradient-to-r from-cyan-400 to-teal-400
            bg-clip-text text-transparent
            ${compact ? 'text-lg' : 'text-xl'}
          `}
        >
          {title || 'DRISHTI AI'}
        </h1>
      </div>

      {/* Mode Toggle Button */}
      <div className="w-auto flex items-center justify-end">
        <button
          type="button"
          onClick={toggleAccessibilityMode}
          aria-label={`Accessibility mode is currently ${
            isVoiceMode ? 'Voice Mode for blind users' : 'Visual Mode for low-vision users'
          }. Tap to switch mode.`}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-black transition-all min-h-[44px] border ${
            isVoiceMode
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 hover:bg-cyan-500/30'
              : 'bg-yellow-400/20 text-yellow-300 border-yellow-400/50 hover:bg-yellow-400/30'
          }`}
        >
          {isVoiceMode ? (
            <>
              <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>VOICE</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              <span>VISUAL</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
