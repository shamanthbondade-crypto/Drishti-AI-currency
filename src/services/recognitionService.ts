import { Capacitor } from '@capacitor/core';
import type { RecognitionResult, ModelStatus, Denomination, EngineUsed } from '../types/index';

export const BACKEND_URL_STORAGE_KEY = 'drishti_backend_url';
const DEFAULT_BACKEND_PORT = '3001';

const isNative = typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform();

export type BackendUrlSource = 'custom' | 'env' | 'origin' | 'unconfigured';

/**
 * Normalize a user-supplied or env-supplied backend URL.
 * Accepts full URLs (http://10.109.37.70:3001) or shorthand IPs/hosts (10.109.37.70 or 10.109.37.70:3001).
 */
export function normalizeBackendUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (!trimmed) return '';

  const hasScheme = /^https?:\/\//i.test(trimmed);
  const withScheme = hasScheme ? trimmed : `http://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    throw new Error('Enter a valid IP or URL (for example: 10.109.37.70 or http://10.109.37.70:3001).');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Backend URL must start with http:// or https://.');
  }

  if (!parsed.hostname) {
    throw new Error('Backend URL is missing a host or IP address.');
  }

  // If the user entered a bare IP/host without an explicit port over HTTP, default to port 3001.
  if (!parsed.port && parsed.protocol === 'http:') {
    parsed.port = DEFAULT_BACKEND_PORT;
  }

  return parsed.origin + (parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/+$/, ''));
}

function getBuildTimeBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (!raw || !raw.trim()) return '';
  try {
    return normalizeBackendUrl(raw);
  } catch {
    return '';
  }
}

export function getCustomBackendUrl(): string {
  if (typeof window === 'undefined') return '';
  try {
    const raw = localStorage.getItem(BACKEND_URL_STORAGE_KEY) || '';
    if (!raw.trim()) return '';
    return normalizeBackendUrl(raw);
  } catch {
    return '';
  }
}

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
  private _backendOnline: boolean | null = null;
  private _lastProbeMs = 0;
  private readonly PROBE_TTL_MS = 8_000;

  isNativePlatform(): boolean {
    return isNative;
  }

  /**
   * Resolve the active backend base URL without silently falling back to an emulator or stale IP.
   * - Web browsers use the current origin (so Vite proxies /api in dev) unless overridden in Settings.
   * - Native Android uses: (1) runtime Settings URL in localStorage, else (2) build-time VITE_API_BASE_URL,
   *   else '' (explicitly unconfigured).
   */
  getEffectiveBaseUrl(): string {
    const custom = getCustomBackendUrl();
    if (custom) return custom;

    if (!isNative && typeof window !== 'undefined' && window.location.origin.startsWith('http')) {
      return window.location.origin;
    }

    const fromEnv = getBuildTimeBaseUrl();
    if (fromEnv) return fromEnv;

    if (!isNative) {
      return `http://localhost:${DEFAULT_BACKEND_PORT}`;
    }

    return '';
  }

  getUrlSource(): BackendUrlSource {
    if (getCustomBackendUrl()) return 'custom';
    if (!isNative && typeof window !== 'undefined' && window.location.origin.startsWith('http')) {
      return 'origin';
    }
    if (getBuildTimeBaseUrl()) return 'env';
    return isNative ? 'unconfigured' : 'origin';
  }

  getBuildDefaultUrl(): string {
    return getBuildTimeBaseUrl();
  }

  setCustomBaseUrl(rawUrl: string): string {
    const normalized = normalizeBackendUrl(rawUrl);
    if (typeof window !== 'undefined') {
      try {
        if (normalized) {
          localStorage.setItem(BACKEND_URL_STORAGE_KEY, normalized);
        } else {
          localStorage.removeItem(BACKEND_URL_STORAGE_KEY);
        }
      } catch {
        // Ignore storage write failure
      }
    }
    this.invalidateProbe();
    return this.getEffectiveBaseUrl();
  }

  clearCustomBaseUrl(): string {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(BACKEND_URL_STORAGE_KEY);
      } catch {
        // Ignore storage write failure
      }
    }
    this.invalidateProbe();
    return this.getEffectiveBaseUrl();
  }

  /** Quick health probe: is the backend service reachable? */
  async isBackendReachable(force = false): Promise<boolean> {
    const baseUrl = this.getEffectiveBaseUrl();
    if (!baseUrl) {
      this._backendOnline = false;
      this._lastProbeMs = Date.now();
      return false;
    }

    const now = Date.now();
    if (!force && this._backendOnline !== null && now - this._lastProbeMs < this.PROBE_TTL_MS) {
      return this._backendOnline;
    }

    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 3000);
      const r = await fetch(`${baseUrl}/api/health`, { signal: ctrl.signal });
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
    this._lastProbeMs = 0;
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
    const baseUrl = this.getEffectiveBaseUrl();
    if (!baseUrl) {
      throw new RecognitionError(
        'Backend server IP is not configured. Open Settings to enter your laptop hotspot IP (port 3001).',
        'BACKEND_NOT_CONFIGURED',
      );
    }

    // Step 1: Check backend reachability
    const backendAvailable = await this.isBackendReachable();

    if (!backendAvailable) {
      this.invalidateProbe();
      throw new RecognitionError(
        `Cannot reach AI backend at ${baseUrl}. Make sure the laptop server is running and update the IP in Settings if your hotspot IP changed.`,
        'MODEL_UNAVAILABLE',
      );
    }

    // Step 2: Perform AI model inference
    const formData = new FormData();
    formData.append('image', imageFile, 'banknote.jpg');

    let response: Response | null = null;
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 45000); // 45s timeout for CPU inference
      response = await fetch(`${baseUrl}/api/predict`, {
        method: 'POST',
        body: formData,
        signal: ctrl.signal,
      });
      clearTimeout(tid);
    } catch {
      this.invalidateProbe();
      throw new RecognitionError(
        `Network error connecting to ${baseUrl}. Check your phone hotspot connection or update the backend IP in Settings.`,
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

    if (response && response.status === 503) {
      this.invalidateProbe();
      throw new RecognitionError(
        `Node backend at ${baseUrl} responded, but the Python AI service on port 8000 is not running.`,
        'MODEL_UNAVAILABLE',
      );
    }

    if (response && response.status === 504) {
      throw new RecognitionError(
        'AI model took too long to respond. Hold the camera steady and try again.',
        'NETWORK_ERROR',
      );
    }

    this.invalidateProbe();
    throw new RecognitionError(
      'Unable to identify the currency clearly. Please try again.',
      'UNCERTAIN_PREDICTION',
    );
  }

  async checkModelStatus(force = false): Promise<ModelStatus> {
    const baseUrl = this.getEffectiveBaseUrl();
    if (!baseUrl) {
      return {
        available: false,
        modelName: 'currency-vision-v1',
        status: 'unconfigured',
        lastChecked: Date.now(),
      };
    }

    if (force) {
      this.invalidateProbe();
    }

    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 3000);
      const response = await fetch(`${baseUrl}/api/model/status`, { signal: ctrl.signal });
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

  async isModelAvailable(force = false): Promise<boolean> {
    try {
      const status = await this.checkModelStatus(force);
      return status.available;
    } catch {
      return false;
    }
  }
}

export const recognitionService = new RecognitionService();
export default recognitionService;
export { RecognitionService };
