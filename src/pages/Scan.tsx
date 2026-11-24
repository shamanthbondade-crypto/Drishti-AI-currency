import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  RefreshCw,
  Check,
  RotateCcw,
  AlertTriangle,
  ArrowLeft,
  Volume2,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useVoice } from '../contexts/VoiceContext';
import { useSettings } from '../contexts/SettingsContext';
import { requestCamera, stopCamera, captureFrame } from '../services/cameraService';
import Button from '../components/Button';
import VoiceCommandBar from '../components/VoiceCommandBar';

export default function Scan() {
  const navigate = useNavigate();
  const { setCapturedImage } = useApp();
  const { speak, announceError, triggerHaptic } = useVoice();
  const { settings } = useSettings();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraState, setCameraState] = useState<'requesting' | 'active' | 'denied' | 'unavailable'>('requesting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedPreviewUrl, setCapturedPreviewUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [qualityFeedback, setQualityFeedback] = useState<string>('');

  // Spoken positioning guidance
  const speakGuidance = () => {
    triggerHaptic('selection');
    speak(
      'Positioning guide: Place the currency note flat on a table. Hold your phone flat, parallel to the table, about 15 to 20 centimeters above the note. Ensure good lighting without harsh shadows.'
    );
  };

  // Initialize camera
  useEffect(() => {
    let isActive = true;

    async function initCamera() {
      setCameraState('requesting');
      setErrorMessage('');

      try {
        const stream = await requestCamera(facingMode);
        if (!isActive) {
          stopCamera(stream);
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        setCameraState('active');
        triggerHaptic('selection');
        speak(
          'Rear camera ready. Hold your phone flat about 15 centimeters above the banknote. Say Capture or tap the large Capture button.'
        );
      } catch (err: any) {
        if (!isActive) return;

        triggerHaptic('error');
        if (err.type === 'PERMISSION_DENIED' || err.name === 'NotAllowedError') {
          setCameraState('denied');
          setErrorMessage('Camera access was denied. Please allow camera permissions in your device settings.');
          announceError('Camera permission was denied. Please enable camera in device settings or use Demo Mode.');
        } else {
          setCameraState('unavailable');
          setErrorMessage('Unable to access camera on this device. You can upload an image or use Demo Mode.');
          announceError('Camera is unavailable. You can upload an image or test with Demo Mode.');
        }
      }
    }

    initCamera();

    return () => {
      isActive = false;
      if (streamRef.current) {
        stopCamera(streamRef.current);
        streamRef.current = null;
      }
    };
  }, [facingMode, speak, announceError, triggerHaptic]);

  // Analyze captured frame quality (brightness and clarity)
  const assessFrameQuality = (canvas: HTMLCanvasElement): { isOk: boolean; message: string } => {
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return { isOk: true, message: '' };

      const sampleSize = 64;
      const sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = sampleSize;
      sampleCanvas.height = sampleSize;
      const sCtx = sampleCanvas.getContext('2d');
      if (!sCtx) return { isOk: true, message: '' };

      sCtx.drawImage(canvas, 0, 0, sampleSize, sampleSize);
      const imgData = sCtx.getImageData(0, 0, sampleSize, sampleSize);
      const data = imgData.data;

      let totalBrightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        totalBrightness += lum;
      }
      const avgBrightness = totalBrightness / (sampleSize * sampleSize);

      if (avgBrightness < 35) {
        return {
          isOk: false,
          message: 'Lighting is too dark. Please move to a brighter spot or turn on a light.',
        };
      }
      if (avgBrightness > 235) {
        return {
          isOk: false,
          message: 'Too much glare detected. Please tilt phone slightly away from light reflections.',
        };
      }

      return { isOk: true, message: 'Good lighting detected.' };
    } catch {
      return { isOk: true, message: '' };
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || cameraState !== 'active' || isCapturing) return;

    try {
      setIsCapturing(true);
      triggerHaptic('selection');
      speak('Capturing banknote image.');

      const blob = await captureFrame(videoRef.current);
      setCapturedBlob(blob);

      // Create preview object URL
      const preview = URL.createObjectURL(blob);
      setCapturedPreviewUrl(preview);

      // Check quality
      const tempImg = new Image();
      tempImg.onload = () => {
        const c = document.createElement('canvas');
        c.width = tempImg.width;
        c.height = tempImg.height;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.drawImage(tempImg, 0, 0);
          const quality = assessFrameQuality(c);
          setQualityFeedback(quality.message);
          if (!quality.isOk) {
            triggerHaptic('warning');
            speak(`${quality.message} Tap Retake to shoot again, or Identify to proceed.`);
          } else {
            triggerHaptic('success');
            speak('Note captured clearly. Tap Identify Note to recognize value, or tap Retake.');
          }
        }
      };
      tempImg.src = preview;
    } catch {
      announceError('Failed to capture frame. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    if (capturedPreviewUrl) {
      URL.revokeObjectURL(capturedPreviewUrl);
    }
    setCapturedBlob(null);
    setCapturedPreviewUrl(null);
    setQualityFeedback('');
    triggerHaptic('selection');
    speak('Retaking photo. Camera is active. Point at banknote and tap Capture.');
  };

  const handleConfirm = () => {
    if (!capturedBlob || !capturedPreviewUrl) return;

    triggerHaptic('selection');
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      setCapturedImage(base64data);
      speak('Analyzing banknote with AI.');
      navigate('/recognition');
    };
    reader.readAsDataURL(capturedBlob);
  };

  const toggleFacingMode = () => {
    if (streamRef.current) {
      stopCamera(streamRef.current);
      streamRef.current = null;
    }
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    triggerHaptic('selection');
    speak(`Switching to ${nextFacing === 'environment' ? 'rear' : 'front'} camera.`);
  };

  return (
    <div className="min-h-screen bg-[#0a1633] text-white flex flex-col justify-between max-w-lg mx-auto p-4 select-none pb-28">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between pb-3">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white min-w-[48px] min-h-[48px] flex items-center justify-center focus:ring-2 focus:ring-cyan-400"
          aria-label="Back to home dashboard"
        >
          <ArrowLeft className="w-6 h-6" aria-hidden="true" />
        </button>

        <h1 className="font-extrabold text-lg text-cyan-300 tracking-wide uppercase">
          Currency Scanner
        </h1>

        <div className="flex items-center gap-2">
          {/* Position Guidance Audio Button */}
          <button
            type="button"
            onClick={speakGuidance}
            aria-label="Hear note positioning instructions"
            className="p-3 rounded-2xl bg-cyan-900/40 border border-cyan-500/40 hover:bg-cyan-800/50 active:scale-95 transition-all text-cyan-300 min-w-[48px] min-h-[48px] flex items-center justify-center focus:ring-2 focus:ring-cyan-400"
          >
            <Info className="w-5 h-5" aria-hidden="true" />
          </button>

          {cameraState === 'active' && !capturedPreviewUrl && (
            <button
              type="button"
              onClick={toggleFacingMode}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-cyan-300 min-w-[48px] min-h-[48px] flex items-center justify-center focus:ring-2 focus:ring-cyan-400"
              aria-label={`Switch camera. Currently using ${facingMode === 'environment' ? 'rear' : 'front'} camera.`}
            >
              <RotateCcw className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </header>

      {/* Main Viewfinder / Captured Preview Area */}
      <main className="flex-1 flex flex-col items-center justify-center relative my-2 overflow-hidden rounded-3xl bg-black border-2 border-cyan-500/30 shadow-2xl min-h-[360px]">
        {/* If photo captured, show preview */}
        {capturedPreviewUrl ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
            <img
              src={capturedPreviewUrl}
              alt="Captured currency note preview"
              className="w-full h-full object-contain max-h-[400px]"
            />
            {qualityFeedback && (
              <div className="absolute top-4 left-4 right-4 bg-navy-900/90 backdrop-blur-md px-4 py-2 rounded-xl text-center border border-cyan-400/40">
                <span className="text-xs font-bold text-cyan-300">
                  {qualityFeedback}
                </span>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Live Camera Video Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover min-h-[360px] ${cameraState === 'active' ? 'block' : 'hidden'}`}
              aria-label="Live camera viewfinder for banknote detection"
            />

            {/* High-Contrast Viewfinder Overlay Box */}
            {cameraState === 'active' && (
              <div
                className="absolute inset-x-6 inset-y-12 border-2 border-dashed border-cyan-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-4"
                aria-hidden="true"
              >
                <div className="flex justify-between">
                  <div className="w-7 h-7 border-t-4 border-l-4 border-cyan-400" />
                  <div className="w-7 h-7 border-t-4 border-r-4 border-cyan-400" />
                </div>
                <div className="text-center bg-navy-950/80 backdrop-blur-sm py-2 px-4 rounded-xl mx-auto text-xs font-extrabold text-cyan-300 tracking-wider border border-cyan-400/30">
                  HOLD PHONE 15-20 CM ABOVE NOTE
                </div>
                <div className="flex justify-between">
                  <div className="w-7 h-7 border-b-4 border-l-4 border-cyan-400" />
                  <div className="w-7 h-7 border-b-4 border-r-4 border-cyan-400" />
                </div>
              </div>
            )}

            {/* Loading / Requesting Permission State */}
            {cameraState === 'requesting' && (
              <div className="flex flex-col items-center gap-4 p-6 text-center">
                <div className="w-14 h-14 rounded-full border-4 border-cyan-400/20 border-t-cyan-400 animate-spin" />
                <p className="text-cyan-300 font-bold text-base">
                  Starting Rear Camera…
                </p>
                <p className="text-gray-300 text-xs max-w-xs">
                  Please tap "Allow" if prompted for camera permission.
                </p>
              </div>
            )}

            {/* Permission Denied State */}
            {cameraState === 'denied' && (
              <div className="flex flex-col items-center gap-4 p-6 text-center max-w-xs">
                <ShieldAlert className="w-16 h-16 text-amber-400" aria-hidden="true" />
                <h2 className="text-lg font-bold text-white">Camera Access Denied</h2>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {errorMessage}
                </p>
                <div className="space-y-3 w-full pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={() => navigate('/upload')}
                    aria-label="Upload an image from your files instead"
                  >
                    Upload Image Instead
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    fullWidth
                    onClick={() => navigate('/home')}
                    aria-label="Use Demo Mode to explore denominations"
                  >
                    Use Demo Mode
                  </Button>
                </div>
              </div>
            )}

            {/* Camera Unavailable State */}
            {cameraState === 'unavailable' && (
              <div className="flex flex-col items-center gap-4 p-6 text-center max-w-xs">
                <AlertTriangle className="w-16 h-16 text-red-400" aria-hidden="true" />
                <h2 className="text-lg font-bold text-white">No Camera Found</h2>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {errorMessage}
                </p>
                <div className="space-y-3 w-full pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={() => navigate('/upload')}
                    aria-label="Upload banknote image from device"
                  >
                    Upload Image
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    fullWidth
                    onClick={() => navigate('/home')}
                    aria-label="Return to home and test demo mode"
                  >
                    Use Demo Mode
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Control Actions Bottom Bar */}
      <footer className="pt-2 pb-2">
        {capturedPreviewUrl ? (
          /* Confirm / Retake Actions */
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={handleRetake}
              iconLeft={<RefreshCw className="w-5 h-5" aria-hidden="true" />}
              className="py-4 font-bold min-h-[56px]"
              aria-label="Retake photo"
            >
              Retake
            </Button>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleConfirm}
              iconLeft={<Check className="w-6 h-6 text-navy-950" aria-hidden="true" />}
              className="py-4 font-extrabold text-navy-950 bg-gradient-to-r from-cyan-400 to-teal-400 min-h-[56px]"
              aria-label="Confirm and identify banknote value"
            >
              Identify Note
            </Button>
          </div>
        ) : (
          /* Camera Capture Controls */
          cameraState === 'active' && (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleCapture}
                disabled={isCapturing}
                className="w-full py-4 px-6 rounded-2xl bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-navy-950 font-black text-xl tracking-wide shadow-2xl shadow-cyan-400/40 flex items-center justify-center gap-3 min-h-[64px] border-2 border-white"
                aria-label="Capture currency photo now"
              >
                <Camera className="w-8 h-8 text-navy-950" aria-hidden="true" />
                <span>CAPTURE NOTE</span>
              </button>

              <button
                type="button"
                onClick={speakGuidance}
                className="text-xs text-cyan-300 hover:underline py-2 min-h-[44px] flex items-center gap-1.5"
                aria-label="Hear spoken guidance for holding phone"
              >
                <Volume2 className="w-4 h-4" aria-hidden="true" />
                <span>Hear Positioning Instructions</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/upload')}
                className="text-xs text-gray-400 hover:text-cyan-300 py-2 min-h-[44px] flex items-center gap-1.5 transition-colors"
                aria-label="Upload a saved photo of a banknote instead of using camera"
              >
                <ArrowLeft className="w-3.5 h-3.5 rotate-180" aria-hidden="true" />
                <span>Upload saved photo instead</span>
              </button>
            </div>
          )
        )}
      </footer>

      {/* Voice Command Bar for Push-to-Talk and Commands Sheet */}
      <VoiceCommandBar onCaptureRequested={handleCapture} />
    </div>
  );
}
