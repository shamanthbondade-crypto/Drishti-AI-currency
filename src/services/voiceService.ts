// ============================================================
// Voice Service - Android Native TTS + Web Speech API Wrapper
// Accessibility-first speech synthesis for Drishti AI
// ============================================================

import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export interface SpeakOptions {
  speed?: number;
  lang?: string;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
}

class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private lastSpokenText: string = '';
  private speed: number = 1.0;
  private enabled: boolean = true;
  private currentLanguage: string = 'en-IN';
  private isNative: boolean = false;

  constructor() {
    this.isNative = typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  isSupported(): boolean {
    return this.isNative || this.synth !== null;
  }

  isAvailable(): boolean {
    return this.isSupported();
  }

  /**
   * Trigger haptic vibration for blind users to confirm actions
   */
  async triggerHaptic(type: 'selection' | 'success' | 'warning' | 'error' = 'selection'): Promise<void> {
    try {
      if (type === 'success') {
        await Haptics.notification({ type: NotificationType.Success });
      } else if (type === 'warning' || type === 'error') {
        await Haptics.notification({ type: NotificationType.Warning });
      } else {
        await Haptics.impact({ style: ImpactStyle.Medium });
      }
    } catch {
      // Haptics unavailable on desktop web – safely ignored
    }
  }

  async speak(
    text: string,
    optionsOrSpeed?: SpeakOptions | number,
    lang?: string,
  ): Promise<void> {
    if (!this.enabled || !text) {
      return;
    }

    let speed = this.speed;
    let language = this.currentLanguage;
    let onEndCallback: (() => void) | undefined;
    let onErrorCallback: ((err: unknown) => void) | undefined;

    if (typeof optionsOrSpeed === 'number') {
      speed = optionsOrSpeed;
      if (lang) language = lang;
    } else if (optionsOrSpeed && typeof optionsOrSpeed === 'object') {
      if (optionsOrSpeed.speed !== undefined) speed = optionsOrSpeed.speed;
      if (optionsOrSpeed.lang !== undefined) language = optionsOrSpeed.lang;
      onEndCallback = optionsOrSpeed.onEnd;
      onErrorCallback = optionsOrSpeed.onError;
    }

    this.lastSpokenText = text;

    // 1. Try Native Android Text-to-Speech if running natively
    if (this.isNative) {
      try {
        await TextToSpeech.stop().catch(() => {});
        await TextToSpeech.speak({
          text,
          lang: language,
          rate: Math.max(0.5, Math.min(speed, 2.0)),
          pitch: 1.0,
          volume: 1.0,
          category: 'ambient',
        });
        if (onEndCallback) onEndCallback();
        return;
      } catch (err) {
        console.warn('Native TTS failed, attempting Web Speech fallback:', err);
      }
    }

    // 2. Web Speech API Fallback
    return new Promise((resolve) => {
      if (!this.synth) {
        if (onErrorCallback) onErrorCallback(new Error('TTS not supported'));
        resolve();
      } else {
        try {
          this.synth.cancel();
        } catch {
          // ignore
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = Math.max(0.5, Math.min(speed, 2.0));
        utterance.lang = language;

        const voices = this.synth.getVoices ? this.synth.getVoices() : [];
        const preferredVoice = voices.find(
          (v) => v.lang.startsWith(language.slice(0, 2)) || v.lang === language,
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onend = () => {
          if (onEndCallback) onEndCallback();
          resolve();
        };

        utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
          if (event.error === 'canceled' || event.error === 'interrupted') {
            resolve();
            return;
          }
          if (onErrorCallback) onErrorCallback(event);
          resolve();
        };

        this.synth.speak(utterance);
      }
    });
  }

  stop(): void {
    if (this.isNative) {
      TextToSpeech.stop().catch(() => {});
    }
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // ignore
      }
    }
  }

  repeat(): void {
    if (this.lastSpokenText) {
      this.speak(this.lastSpokenText);
    }
  }

  setSpeed(speed: number): void {
    this.speed = Math.max(0.5, Math.min(speed, 2.0));
  }

  setLanguage(lang: string): void {
    this.currentLanguage = lang;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  /**
   * Spoken announcement format per project requirement:
   * "This is an Indian five hundred rupee note."
   */
  announceDenomination(denomination: string, _confidence?: number): void {
    const clean = denomination.replace('₹', '').trim();

    // Human-readable denomination words for clear spoken synthesis
    const WORDS_EN: Record<string, string> = {
      '10': 'ten',
      '20': 'twenty',
      '50': 'fifty',
      '100': 'one hundred',
      '200': 'two hundred',
      '500': 'five hundred',
    };
    const WORDS_HI: Record<string, string> = {
      '10': 'दस',
      '20': 'बीस',
      '50': 'पचास',
      '100': 'एक सौ',
      '200': 'दो सौ',
      '500': 'पांच सौ',
    };

    const wordEn = WORDS_EN[clean] || clean;
    const wordHi = WORDS_HI[clean] || clean;

    let text = `This is an Indian ${wordEn} rupee note.`;
    if (this.currentLanguage.startsWith('hi')) {
      text = `यह भारतीय ${wordHi} रुपये का नोट है।`;
    }

    this.triggerHaptic('success');
    this.speak(text);
  }

  announceError(message: string = 'Unable to identify the currency clearly. Please try again.'): void {
    this.triggerHaptic('warning');
    this.speak(message);
  }
}

export const voiceService = new VoiceService();
export default voiceService;
export { VoiceService };
