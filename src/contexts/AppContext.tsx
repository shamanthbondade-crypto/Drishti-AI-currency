import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { RecognitionResult } from '../types';
import { recognitionService } from '../services/recognitionService';

const ONBOARDING_KEY = 'drishti_onboarding_completed';

type RecognitionMode = 'demo' | 'real';

interface AppContextValue {
  recognitionMode: RecognitionMode;
  setRecognitionMode: (mode: RecognitionMode) => void;
  currentResult: RecognitionResult | null;
  setCurrentResult: (result: RecognitionResult | null) => void;
  isModelAvailable: boolean;
  refreshModelAvailability: (force?: boolean) => Promise<boolean>;
  capturedImage: string | null;
  setCapturedImage: (image: string | null) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [recognitionMode, setRecognitionModeState] = useState<RecognitionMode>('demo');
  const [userOverrodeMode, setUserOverrodeMode] = useState(false);
  const [currentResult, setCurrentResult] = useState<RecognitionResult | null>(null);
  const [isModelAvailable, setIsModelAvailable] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    try {
      return localStorage.getItem(ONBOARDING_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const setRecognitionMode = useCallback((mode: RecognitionMode) => {
    setUserOverrodeMode(true);
    setRecognitionModeState(mode);
  }, []);

  const refreshModelAvailability = useCallback(
    async (force = false): Promise<boolean> => {
      try {
        const available = await recognitionService.isModelAvailable(force);
        setIsModelAvailable(available);
        if (available && !userOverrodeMode) {
          setRecognitionModeState('real');
        }
        return available;
      } catch {
        setIsModelAvailable(false);
        return false;
      }
    },
    [userOverrodeMode]
  );

  // Check model availability on mount; auto-enable Real AI mode when backend is ready
  useEffect(() => {
    void refreshModelAvailability();
  }, [refreshModelAvailability]);

  const completeOnboarding = useCallback(() => {
    setHasCompletedOnboarding(true);
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {
      // Storage unavailable – state still updated in memory
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        recognitionMode,
        setRecognitionMode,
        currentResult,
        setCurrentResult,
        isModelAvailable,
        refreshModelAvailability,
        capturedImage,
        setCapturedImage,
        isProcessing,
        setIsProcessing,
        hasCompletedOnboarding,
        completeOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export { AppContext };
