// ============================================================
// Speech Recognition Service - Android Native + Web Speech API
// Push-to-talk voice commands for visually impaired navigation
// ============================================================

import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { voiceService } from './voiceService';

export type VoiceCommandAction =
  | 'scan_currency'
  | 'capture'
  | 'repeat_result'
  | 'scan_again'
  | 'stop_speaking'
  | 'open_history'
  | 'open_help'
  | 'go_home'
  | 'open_settings'
  | 'set_voice_mode'
  | 'set_visual_mode'
  | 'unknown';

export interface CommandMatch {
  action: VoiceCommandAction;
  transcript: string;
  feedbackText: string;
}

type CommandListener = (action: VoiceCommandAction, transcript: string) => void;

class SpeechRecognitionService {
  private isListeningState: boolean = false;
  private isNative: boolean = false;
  private webRecognition: any = null;
  private listeners: Set<CommandListener> = new Set();

  constructor() {
    this.isNative = typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform();
    if (typeof window !== 'undefined') {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        this.webRecognition = new SpeechRec();
        this.webRecognition.continuous = false;
        this.webRecognition.interimResults = false;
        this.webRecognition.lang = 'en-IN';
      }
    }
  }

  /**
   * Check if speech recognition is available on this device
   */
  async isAvailable(): Promise<boolean> {
    if (this.isNative) {
      try {
        const { available } = await SpeechRecognition.available();
        return !!available;
      } catch {
        return false;
      }
    }
    return !!this.webRecognition;
  }

  isListening(): boolean {
    return this.isListeningState;
  }

  /**
   * Register a callback for matched voice commands
   */
  onCommand(listener: CommandListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Parse spoken text into an application action
   */
  parseCommand(text: string): CommandMatch {
    const clean = text.toLowerCase().trim();

    if (
      clean.includes('scan again') ||
      clean.includes('another note') ||
      clean.includes('another scan')
    ) {
      return {
        action: 'scan_again',
        transcript: clean,
        feedbackText: 'Starting another scan.',
      };
    }

    if (
      clean.includes('scan currency') ||
      clean.includes('scan note') ||
      clean.includes('start scan') ||
      clean.includes('scan') ||
      clean.includes('camera')
    ) {
      return {
        action: 'scan_currency',
        transcript: clean,
        feedbackText: 'Opening scanner.',
      };
    }

    if (
      clean.includes('capture') ||
      clean.includes('take photo') ||
      clean.includes('take picture') ||
      clean.includes('click') ||
      clean.includes('shoot')
    ) {
      return {
        action: 'capture',
        transcript: clean,
        feedbackText: 'Capturing banknote.',
      };
    }

    if (
      clean.includes('repeat result') ||
      clean.includes('repeat') ||
      clean.includes('again') ||
      clean.includes('what was that') ||
      clean.includes('tell me again')
    ) {
      return {
        action: 'repeat_result',
        transcript: clean,
        feedbackText: 'Repeating last result.',
      };
    }

    if (
      clean.includes('stop speaking') ||
      clean.includes('stop') ||
      clean.includes('quiet') ||
      clean.includes('shut up') ||
      clean.includes('silence')
    ) {
      return {
        action: 'stop_speaking',
        transcript: clean,
        feedbackText: 'Stopped.',
      };
    }

    if (
      clean.includes('open history') ||
      clean.includes('history') ||
      clean.includes('past scans') ||
      clean.includes('recent scans')
    ) {
      return {
        action: 'open_history',
        transcript: clean,
        feedbackText: 'Opening history.',
      };
    }

    if (
      clean.includes('help') ||
      clean.includes('instructions') ||
      clean.includes('guide') ||
      clean.includes('how to use')
    ) {
      return {
        action: 'open_help',
        transcript: clean,
        feedbackText: 'Opening help instructions.',
      };
    }

    if (
      clean.includes('home') ||
      clean.includes('dashboard') ||
      clean.includes('main screen')
    ) {
      return {
        action: 'go_home',
        transcript: clean,
        feedbackText: 'Navigating to home.',
      };
    }

    if (
      clean.includes('settings') ||
      clean.includes('options') ||
      clean.includes('preferences')
    ) {
      return {
        action: 'open_settings',
        transcript: clean,
        feedbackText: 'Opening settings.',
      };
    }

    if (clean.includes('voice mode') || clean.includes('blind mode')) {
      return {
        action: 'set_voice_mode',
        transcript: clean,
        feedbackText: 'Switched to Voice Mode for blind users.',
      };
    }

    if (clean.includes('visual mode') || clean.includes('low vision')) {
      return {
        action: 'set_visual_mode',
        transcript: clean,
        feedbackText: 'Switched to Visual Mode for low-vision users.',
      };
    }

    return {
      action: 'unknown',
      transcript: clean,
      feedbackText: `Command "${clean}" not recognized. Say "Help" for a list of commands.`,
    };
  }

  /**
   * Start a push-to-talk listening session
   */
  async listenOnce(): Promise<CommandMatch | null> {
    if (this.isListeningState) {
      this.stop();
      return null;
    }

    const available = await this.isAvailable();
    if (!available) {
      await voiceService.announceError('Speech recognition is not available on this device.');
      return null;
    }

    await voiceService.triggerHaptic('selection');
    this.isListeningState = true;

    // 1. Native Android Speech Recognition
    if (this.isNative) {
      try {
        const { speechRecognition } = await SpeechRecognition.checkPermissions();
        if (speechRecognition !== 'granted') {
          const req = await SpeechRecognition.requestPermissions();
          if (req.speechRecognition !== 'granted') {
            this.isListeningState = false;
            await voiceService.announceError('Microphone permission was denied.');
            return null;
          }
        }

        const { matches } = await SpeechRecognition.start({
          language: 'en-IN',
          maxResults: 3,
          prompt: 'Say a command (e.g., Scan Currency, Repeat, History)',
          partialResults: false,
          popup: true,
        });

        this.isListeningState = false;

        if (matches && matches.length > 0) {
          const match = this.parseCommand(matches[0]);
          this.notifyListeners(match.action, match.transcript);
          return match;
        }

        return null;
      } catch (err: any) {
        this.isListeningState = false;
        console.warn('Native speech recognition error:', err);
        return null;
      }
    }

    // 2. Web Speech Recognition Fallback
    return new Promise((resolve) => {
      if (!this.webRecognition) {
        this.isListeningState = false;
        resolve(null);
        return;
      }

      this.webRecognition.onresult = (event: any) => {
        this.isListeningState = false;
        const transcript = event.results[0][0].transcript;
        const match = this.parseCommand(transcript);
        this.notifyListeners(match.action, match.transcript);
        resolve(match);
      };

      this.webRecognition.onerror = (event: any) => {
        this.isListeningState = false;
        console.warn('Web speech recognition error:', event);
        resolve(null);
      };

      this.webRecognition.onend = () => {
        this.isListeningState = false;
      };

      try {
        this.webRecognition.start();
      } catch {
        this.isListeningState = false;
        resolve(null);
      }
    });
  }

  stop(): void {
    this.isListeningState = false;
    if (this.isNative) {
      SpeechRecognition.stop().catch(() => {});
    } else if (this.webRecognition) {
      try {
        this.webRecognition.stop();
      } catch {
        // ignore
      }
    }
  }

  private notifyListeners(action: VoiceCommandAction, transcript: string): void {
    for (const listener of this.listeners) {
      try {
        listener(action, transcript);
      } catch (err) {
        console.error('Listener error in speech recognition:', err);
      }
    }
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
export default speechRecognitionService;
