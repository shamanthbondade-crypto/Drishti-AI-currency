import { Capacitor } from '@capacitor/core';
import type { RecognitionResult, ModelStatus, Denomination, EngineUsed } from '../types/index';

// In a Capacitor Android APK, window.location.origin is https://localhost (the WebView itself).
// Only use window.location.origin on non-native web browsers; on Android native, use VITE_API_BASE_URL
// or fall back to http://10.0.2.2:3001 (Android emulator host).
const isNative = typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform();
const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ||
  (!isNative && typeof window !== 'undefined' && window.location.origin.startsWith('http')
    ? window.location.origin
    : isNative
    ? 'http://10.0.2.2:3001'
    : 'http://localhost:3001');

export class RecognitionError extends Error {
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'RecognitionError';
    this.code = code;
  }
}

function normalizeDenomination(val: string): Denomination {
  const digits = val.replace(/[^0-9]/g, '');
  if (['10', '20', '50', '100', '200', '500'].includes(digits)) {
    return `₹${digits}` as Denomination;
  }
  return '₹500';
}

class RecognitionService {
  private baseUrl: string;
  private _backendOnline: boolean | null = null;
  private _lastProbeMs = 0;
  private readonly PROBE_TTL_MS = 8_000;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /** Quick health probe: is the backend service reachable? */
  async isBackendReachable(): Promise<boolean> {
    const now = Date.now();
    if (this._backendOnline !== null && now - this._lastProbeMs < this.PROBE_TTL_MS) {
      return this._backendOnline;
    }
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 2500);
      const r = await fetch(`${this.baseUrl}/api/health`, { signal: ctrl.signal });
      clearTimeout(tid);
      this._backendOnline = r.ok;
    } catch {
      this._backendOnline = false;
    }
    this._lastProbeMs = Date.now();
    return this._backendOnline;
  }

  private invalidateProbe() {
    this._backendOnline = null;
  }

  // ─── Demo Mode ───────────────────────────────────────────────

  async recognizeDemo(denomination?: string, _imageSource?: Blob | string): Promise<RecognitionResult> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const normalized = normalizeDenomination(denomination || '₹500');

    return {
      id: `demo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      denomination: normalized,
      confidence: 1.0,
      status: 'demo_simulated',
      isDemo: true,
      recognitionMode: 'demo',
      engineUsed: 'demo',
      timestamp: Date.now(),
    };
  }

  // ─── Real AI Mode ────────────────────────────────────────────

  async recognizeImage(imageFile: File | Blob): Promise<RecognitionResult> {
    // Step 1: Check backend reachability
    const backendAvailable = await this.isBackendReachable();

    if (!backendAvailable) {
      this.invalidateProbe();
      throw new RecognitionError(
        'AI model service is currently unavailable. Please start the backend service or switch to Demo Mode.',
        'MODEL_UNAVAILABLE',
      );
    }

    // Step 2: Perform AI model inference
    const formData = new FormData();
    formData.append('image', imageFile, 'banknote.jpg');

    let response: Response | null = null;
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 20000); // 20s timeout
      response = await fetch(`${this.baseUrl}/api/predict`, {
        method: 'POST',
        body: formData,
        signal: ctrl.signal,
      });
      clearTimeout(tid);
    } catch (err: any) {
      this.invalidateProbe();
      throw new RecognitionError(
        'Network error while connecting to AI model. Please check connection or use Demo Mode.',
        'NETWORK_ERROR',
      );
    }

    if (response && response.ok) {
      let payload: Record<string, any>;
      try {
        payload = await response.json();
      } catch {
        payload = {};
      }

      const data = payload.data && typeof payload.data === 'object' ? payload.data : payload;
      const rawDenomination = String(data.denomination || data.label || 'uncertain');
      const confidence = typeof data.confidence === 'number' ? data.confidence : 0;
      const status = String(data.status || (confidence >= 0.5 ? 'success' : 'uncertain'));

      if (rawDenomination === 'uncertain' || confidence < 0.5) {
        throw new RecognitionError(
          'Unable to identify the currency clearly. Please try again.',
          'UNCERTAIN_PREDICTION',
        );
      }

      return {
        id: `ai_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        denomination: normalizeDenomination(rawDenomination),
        confidence,
        status,
        isDemo: false,
        recognitionMode: 'real',
        engineUsed: (data.engine as EngineUsed) || 'ai-backend',
        timestamp: Date.now(),
      };
    }

    this.invalidateProbe();
    throw new RecognitionError(
      'Unable to identify the currency clearly. Please try again.',
      'UNCERTAIN_PREDICTION',
    );
  }

  async checkModelStatus(): Promise<ModelStatus> {
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 2500);
      const response = await fetch(`${this.baseUrl}/api/model/status`, { signal: ctrl.signal });
      clearTimeout(tid);

      if (!response.ok) {
        return {
          available: false,
          modelName: 'currency-vision-v1',
          status: 'unavailable',
          lastChecked: Date.now(),
        };
      }
      const data = await response.json();
      return {
        available: Boolean(data.available),
        modelName: data.modelName || 'currency-vision-v1',
        status: data.status || (data.available ? 'ready' : 'unavailable'),
        lastChecked: Date.now(),
      };
    } catch {
      return {
        available: false,
        modelName: 'currency-vision-v1',
        status: 'unavailable',
        lastChecked: Date.now(),
      };
    }
  }

  async isModelAvailable(): Promise<boolean> {
    try {
      const status = await this.checkModelStatus();
      return status.available;
    } catch {
      return false;
    }
  }
}

export const recognitionService = new RecognitionService();
export default recognitionService;
export { RecognitionService };
