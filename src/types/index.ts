// ============================================================
// Drishti AI - Type Definitions
// AI Currency Recognition Assistant for Visually Impaired People
// ============================================================

/** Supported Indian currency denominations */
export type Denomination = '₹10' | '₹20' | '₹50' | '₹100' | '₹200' | '₹500';

/** All available denominations as a constant array */
export const DENOMINATIONS: Denomination[] = [
  '₹10',
  '₹20',
  '₹50',
  '₹100',
  '₹200',
  '₹500',
];

/** Numeric values mapped to denominations */
export const DENOMINATION_VALUES: Record<Denomination, number> = {
  '₹10': 10,
  '₹20': 20,
  '₹50': 50,
  '₹100': 100,
  '₹200': 200,
  '₹500': 500,
};

/** Which inference engine produced this result */
export type EngineUsed = 'ai-backend' | 'demo';

/** Recognition mode: demo uses sample images, real uses camera/upload */
export type RecognitionMode = 'demo' | 'real';

/** Result of a currency recognition attempt */
export interface RecognitionResult {
  id: string;
  denomination: Denomination;
  confidence?: number;
  status?: string;
  timestamp: number;
  imageUrl?: string;
  isDemo: boolean;
  recognitionMode: RecognitionMode;
  engineUsed?: EngineUsed;
}

/** Two accessibility user modes */
export type AccessibilityMode = 'voice' | 'visual';

/** Application visual theme */
export type AppTheme = 'dark' | 'light';

/** User-configurable application settings */
export interface AppSettings {
  accessibilityMode: AccessibilityMode;
  theme: AppTheme;
  voiceEnabled: boolean;
  /** Speech rate multiplier (0.5 = half speed, 2 = double speed) */
  speechSpeed: number;
  language: string;
  highContrast: boolean;
  largeText: boolean;
  hapticFeedback: boolean;
  /** Font/text size scale: 0.85 = Small, 1.0 = Normal, 1.15 = Large, 1.3 = Extra Large */
  fontSize: number;
}

/** Default application settings */
export const DEFAULT_SETTINGS: AppSettings = {
  accessibilityMode: 'voice',
  theme: 'dark',
  voiceEnabled: true,
  speechSpeed: 1.0,
  language: 'en-IN',
  highContrast: false,
  largeText: false,
  hapticFeedback: true,
  fontSize: 1.0,
};

/** A history record extends the recognition result (photographs not stored by default) */
export interface HistoryRecord extends RecognitionResult {}

/** Status of the ML recognition model */
export interface ModelStatus {
  available: boolean;
  modelName: string;
  lastChecked: number;
  status?: string;
}

/** Camera permission and availability states */
export type CameraState =
  | 'idle'
  | 'requesting'
  | 'active'
  | 'denied'
  | 'unavailable';

/** Generic API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status?: string;
}
