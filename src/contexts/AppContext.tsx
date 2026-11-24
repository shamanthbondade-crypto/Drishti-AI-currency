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
  const [recognitionMode, setRecognitionMode] = useState<RecognitionMode>('demo');
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

  // Check model availability on mount
  useEffect(() => {
    let cancelled = false;

    const checkModel = async () => {
      try {
        const available = await recognitionService.isModelAvailable();
        if (!cancelled) {
          setIsModelAvailable(available);
        }
      } catch {
        if (!cancelled) {
          setIsModelAvailable(false);
        }
      }
    };

    checkModel();

    return () => {
      cancelled = true;
    };
  }, []);

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
