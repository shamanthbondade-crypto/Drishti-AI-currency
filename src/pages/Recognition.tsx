import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  AlertTriangle,
  RotateCcw,
  ArrowLeft,
  XCircle,
  Eye,
  Settings,
} from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Card from '../components/Card';
import DemoModeBanner from '../components/DemoModeBanner';
import { useApp } from '../contexts/AppContext';
import { useVoice } from '../contexts/VoiceContext';
import { recognitionService, RecognitionError } from '../services/recognitionService';
import { historyService } from '../services/historyService';
import type { RecognitionResult } from '../types';

export default function Recognition() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { capturedImage, setCapturedImage, setCurrentResult, recognitionMode, setRecognitionMode } = useApp();
  const { speak, announceError, triggerHaptic } = useVoice();

  const demoDenomParam = searchParams.get('demo');
  const isDemo = recognitionMode === 'demo' || Boolean(demoDenomParam);

  const [statusText, setStatusText] = useState('Initializing banknote analysis…');
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const hasExecutedRef = useRef(false);

  useEffect(() => {
    if (hasExecutedRef.current) return;
    hasExecutedRef.current = true;

    async function processRecognition() {
      setIsProcessing(true);
      setError(null);

      try {
        if (demoDenomParam) {
          // Explicit sample note selected from Home dashboard quick demo grid
          const targetDenom = demoDenomParam;
          setStatusText(`Analyzing currency banknote [Demo: ${targetDenom}]…`);
          speak(`Demonstration mode for ${targetDenom}`);

          const result: RecognitionResult = await recognitionService.recognizeDemo(targetDenom);
          handleSuccess(result);
        } else if (capturedImage) {
          // User captured from Camera or uploaded an actual Banknote Image
          setStatusText('Analyzing banknote features with AI…');
          speak('Analyzing banknote image.');

          let result: RecognitionResult;
          if (isDemo) {
            result = await recognitionService.recognizeDemo(undefined, capturedImage);
          } else {
            const res = await fetch(capturedImage);
            const blob = await res.blob();
            result = await recognitionService.recognizeImage(blob);
          }

          result.imageUrl = capturedImage;
          handleSuccess(result);
        } else {
          navigate('/home');
          return;
        }
      } catch (err: any) {
        setIsProcessing(false);

        let errorMsg = 'Unable to identify the currency clearly. Please try again.';
        if (err instanceof RecognitionError) {
          errorMsg = err.message;
        } else if (err?.message) {
          errorMsg = err.message;
        }

        setError({ message: errorMsg, code: err?.code });
        announceError(errorMsg);
      }
    }

    processRecognition();
  }, [capturedImage, isDemo, demoDenomParam, navigate, speak, announceError]);

  const handleSuccess = (result: RecognitionResult) => {
    setIsProcessing(false);
    // Persist to history (sanitized, no images stored by default)
    historyService.addRecord(result);
    // Store in global app context
    setCurrentResult(result);
    // Navigate to Result screen
    navigate('/result');
  };

  const handleRetry = () => {
    triggerHaptic('selection');
    hasExecutedRef.current = false;
    setError(null);
    setIsProcessing(true);
    speak('Retrying identification.');
    navigate('/scan');
  };

  const handleSwitchToDemo = () => {
    triggerHaptic('selection');
    setRecognitionMode('demo');
    hasExecutedRef.current = false;
    setError(null);
    speak('Switched to Demo Mode. Opening camera scanner.');
    navigate('/scan');
  };

  return (
    <Layout title="AI Recognition" showBack>
      <div className="space-y-6 max-w-sm mx-auto text-center py-4">
        {isDemo && <DemoModeBanner />}

        {/* Processing State */}
        {isProcessing && (
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col items-center gap-6 py-8 animate-fade-in"
          >
            {/* Spinning AI Hologram Indicator */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-cyan-400 animate-pulse" aria-hidden="true" />
              </div>
              <div className="absolute inset-0 bg-cyan-400/10 blur-xl rounded-full" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-extrabold text-white">
                {statusText}
              </h1>
              <p className="text-sm text-cyan-300">
                Please wait a moment while the value is determined…
              </p>
            </div>

            {/* Optional Thumbnail preview */}
            {capturedImage && (
              <div className="w-40 h-24 rounded-2xl overflow-hidden border-2 border-cyan-500/30 bg-black shadow-lg">
                <img
                  src={capturedImage}
                  alt="Banknote being processed"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="flex flex-col items-center gap-4 py-6 animate-fade-in"
          >
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-8 h-8" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-extrabold text-white">
                Recognition Notice
              </h1>
              <p className="text-sm text-amber-200 leading-relaxed max-w-xs mx-auto">
                {error.message}
              </p>
            </div>

            <div className="space-y-3 w-full pt-4">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleRetry}
                iconLeft={<RotateCcw className="w-5 h-5 text-navy-950" aria-hidden="true" />}
                className="font-bold text-navy-950 bg-gradient-to-r from-cyan-400 to-teal-400 min-h-[52px]"
                aria-label="Scan note again"
              >
                Scan Again
              </Button>

              {(error.code === 'MODEL_UNAVAILABLE' ||
                error.code === 'BACKEND_NOT_CONFIGURED' ||
                error.code === 'NETWORK_ERROR') && (
                <>
                  <Button
                    variant="secondary"
                    size="lg"
                    fullWidth
                    onClick={() => navigate('/settings')}
                    iconLeft={<Settings className="w-5 h-5 text-cyan-400" aria-hidden="true" />}
                    className="font-bold border-cyan-500/40 text-cyan-200 min-h-[52px]"
                    aria-label="Open Settings to configure backend IP"
                  >
                    Configure Backend IP
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    fullWidth
                    onClick={handleSwitchToDemo}
                    iconLeft={<Eye className="w-5 h-5 text-amber-400" aria-hidden="true" />}
                    className="font-bold border-amber-500/40 text-amber-300 min-h-[52px]"
                    aria-label="Switch to Demo Mode to test denominations"
                  >
                    Use Demo Mode
                  </Button>
                </>
              )}

              <Button
                variant="ghost"
                size="md"
                fullWidth
                onClick={() => navigate('/home')}
                iconLeft={<ArrowLeft className="w-4 h-4" aria-hidden="true" />}
                aria-label="Return to home screen"
                className="min-h-[48px]"
              >
                Back to Home
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
