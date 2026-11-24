import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { voiceService } from '../services/voiceService';
import { speechRecognitionService, type CommandMatch, type VoiceCommandAction } from '../services/speechRecognitionService';
import { useSettings } from './SettingsContext';

interface VoiceContextValue {
  speak: (text: string) => void;
  stop: () => void;
  repeat: () => void;
  announceDenomination: (denomination: string, confidence?: number) => void;
  announceError: (message: string) => void;
  triggerHaptic: (type?: 'selection' | 'success' | 'warning' | 'error') => void;
  listenForCommand: () => Promise<CommandMatch | null>;
  isSpeaking: boolean;
  isListening: boolean;
  isAvailable: boolean;
  isRecognitionAvailable: boolean;
  lastTranscript: string;
}

const VoiceContext = createContext<VoiceContextValue | undefined>(undefined);

interface VoiceProviderProps {
  children: ReactNode;
}

export const VoiceProvider: React.FC<VoiceProviderProps> = ({ children }) => {
  const { settings, updateSettings } = useSettings();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isRecognitionAvailable, setIsRecognitionAvailable] = useState(false);
  const [lastUtterance, setLastUtterance] = useState<string>('');
  const [lastTranscript, setLastTranscript] = useState<string>('');

  // Check voice and speech recognition availability on mount
  useEffect(() => {
    setIsAvailable(voiceService.isAvailable());
    speechRecognitionService.isAvailable().then(setIsRecognitionAvailable);
  }, []);

  // Sync speech speed and language with settings
  useEffect(() => {
    voiceService.setSpeed(settings.speechSpeed);
    voiceService.setLanguage(settings.language);
  }, [settings.speechSpeed, settings.language]);

  const speak = useCallback(
    (text: string) => {
      if (!settings.voiceEnabled || !isAvailable || !text) return;

      setLastUtterance(text);
      setIsSpeaking(true);

      voiceService.speak(text, {
        speed: settings.speechSpeed,
        lang: settings.language,
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    },
    [settings.voiceEnabled, settings.speechSpeed, settings.language, isAvailable],
  );

  const stop = useCallback(() => {
    voiceService.stop();
    speechRecognitionService.stop();
    setIsSpeaking(false);
    setIsListening(false);
  }, []);

  const repeat = useCallback(() => {
    if (lastUtterance) {
      speak(lastUtterance);
    } else {
      speak('No previous announcement to repeat.');
    }
  }, [lastUtterance, speak]);

  const announceDenomination = useCallback(
    (denomination: string, confidence?: number) => {
      if (!settings.voiceEnabled) return;
      setIsSpeaking(true);
      voiceService.announceDenomination(denomination, confidence);
      setTimeout(() => setIsSpeaking(false), 2000);
    },
    [settings.voiceEnabled],
  );

  const announceError = useCallback(
    (message: string) => {
      if (!settings.voiceEnabled) return;
      setIsSpeaking(true);
      voiceService.announceError(message);
      setTimeout(() => setIsSpeaking(false), 2000);
    },
    [settings.voiceEnabled],
  );

  const triggerHaptic = useCallback(
    (type: 'selection' | 'success' | 'warning' | 'error' = 'selection') => {
      if (settings.hapticFeedback) {
        voiceService.triggerHaptic(type);
      }
    },
    [settings.hapticFeedback],
  );

  const listenForCommand = useCallback(async (): Promise<CommandMatch | null> => {
    stop(); // stop any ongoing speech before listening
    setIsListening(true);
    try {
      const match = await speechRecognitionService.listenOnce();
      setIsListening(false);
      if (match) {
        setLastTranscript(match.transcript);
        // Handle mode switches immediately in context
        if (match.action === 'set_voice_mode') {
          updateSettings({ accessibilityMode: 'voice' });
        } else if (match.action === 'set_visual_mode') {
          updateSettings({ accessibilityMode: 'visual' });
        }
        if (match.feedbackText) {
          speak(match.feedbackText);
        }
      }
      return match;
    } catch {
      setIsListening(false);
      return null;
    }
  }, [stop, speak, updateSettings]);

  return (
    <VoiceContext.Provider
      value={{
        speak,
        stop,
        repeat,
        announceDenomination,
        announceError,
        triggerHaptic,
        listenForCommand,
        isSpeaking,
        isListening,
        isAvailable,
        isRecognitionAvailable,
        lastTranscript,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export function useVoice(): VoiceContextValue {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}

export { VoiceContext };
