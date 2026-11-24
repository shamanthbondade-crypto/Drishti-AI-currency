import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, MicOff, VolumeX, RotateCcw, Camera, History, HelpCircle, X, RefreshCw } from 'lucide-react';
import { useVoice } from '../contexts/VoiceContext';
import { useSettings } from '../contexts/SettingsContext';
import type { VoiceCommandAction } from '../services/speechRecognitionService';

interface VoiceCommandBarProps {
  onCaptureRequested?: () => void;
}

export const VoiceCommandBar: React.FC<VoiceCommandBarProps> = ({ onCaptureRequested }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettings();
  const {
    speak,
    stop,
    repeat,
    listenForCommand,
    isListening,
    isSpeaking,
    triggerHaptic,
    isRecognitionAvailable,
  } = useVoice();

  const [showCommandSheet, setShowCommandSheet] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const isScanScreen = location.pathname === '/scan';

  const executeAction = (action: VoiceCommandAction) => {
    triggerHaptic('selection');
    switch (action) {
      case 'scan_currency':
      case 'scan_again':
        navigate('/scan');
        break;
      case 'capture':
        if (isScanScreen && onCaptureRequested) {
          onCaptureRequested();
        } else {
          navigate('/scan');
        }
        break;
      case 'repeat_result':
        repeat();
        break;
      case 'stop_speaking':
        stop();
        break;
      case 'open_history':
        navigate('/history');
        break;
      case 'open_help':
        navigate('/help');
        break;
      case 'go_home':
        navigate('/home');
        break;
      case 'open_settings':
        navigate('/settings');
        break;
      default:
        break;
    }
  };

  const handleMicClick = async () => {
    triggerHaptic('selection');
    if (isListening) {
      stop();
      return;
    }

    if (!isRecognitionAvailable) {
      speak('Speech recognition is not available on this device. Please tap one of the accessible command buttons.');
      setShowCommandSheet(true);
      return;
    }

    setStatusMessage('Listening for voice command. Speak now.');
    const result = await listenForCommand();

    setIsProcessing(true);
    if (result) {
      setStatusMessage(`Heard command: "${result.transcript}"`);
      executeAction(result.action);
    } else {
      setStatusMessage('No command heard. Tap Push to Talk to try again.');
    }
    setIsProcessing(false);
  };

  return (
    <>
      {/* Floating Push-to-Talk Bar */}
      <aside
        aria-label="Voice Command Bar"
        className="fixed bottom-20 left-0 right-0 max-w-lg mx-auto px-4 z-40 pointer-events-none"
      >
        <div className="flex items-center justify-between gap-2 bg-navy-900/95 backdrop-blur-md border-2 border-cyan-400/50 rounded-2xl p-2 shadow-2xl pointer-events-auto">
          {/* Main Push to Talk Button */}
          <button
            type="button"
            onClick={handleMicClick}
            aria-label={
              isProcessing
                ? 'Processing your voice command.'
                : isListening
                ? 'Listening for your voice command. Speak now.'
                : 'Push to talk. Say a command like Scan Currency, Capture, Repeat Result, or Help'
            }
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold min-h-[52px] transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50 ring-2 ring-white'
                : 'bg-cyan-500 text-navy-950 hover:bg-cyan-400 active:scale-95 shadow-md shadow-cyan-500/30'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-6 h-6 animate-spin text-white" aria-hidden="true" />
                <span className="text-base font-extrabold">Listening... Tap to Stop</span>
              </>
            ) : (
              <>
                <Mic className="w-6 h-6 text-navy-950" aria-hidden="true" />
                <span className="text-base font-extrabold">
                  {settings.accessibilityMode === 'voice' ? 'Push to Talk Command' : 'Voice Command'}
                </span>
              </>
            )}
          </button>

          {/* Quick Repeat Button */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              repeat();
            }}
            aria-label="Repeat last spoken announcement"
            className="flex items-center justify-center w-12 h-[52px] bg-navy-800 hover:bg-navy-700 active:scale-95 rounded-xl text-cyan-300 border border-cyan-500/30"
          >
            <RotateCcw className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* Stop Speech Button */}
          {isSpeaking && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                stop();
              }}
              aria-label="Stop speaking"
              className="flex items-center justify-center w-12 h-[52px] bg-red-900/80 hover:bg-red-800 active:scale-95 rounded-xl text-red-200 border border-red-500/40 animate-pulse"
            >
              <VolumeX className="w-5 h-5" aria-hidden="true" />
            </button>
          )}

          {/* Accessible Commands Menu Button */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setShowCommandSheet(true);
            }}
            aria-label="Open voice command list"
            aria-expanded={showCommandSheet}
            className="flex items-center justify-center px-3 h-[52px] bg-navy-800 hover:bg-navy-700 active:scale-95 rounded-xl text-cyan-200 text-xs font-bold border border-cyan-500/30"
          >
            Commands
          </button>
        </div>

        {/* Transient Speech Status for TalkBack / Screen Readers */}
        <div aria-live="polite" className="sr-only">
          {statusMessage}
        </div>
      </aside>

      {/* Accessible Voice Command Sheet (Touch & TalkBack Alternative) */}
      {showCommandSheet && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="commands-sheet-title"
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center p-4"
        >
          <div className="w-full max-w-lg bg-navy-900 border-2 border-cyan-400 rounded-3xl p-5 shadow-2xl animate-[slideUp_0.2s_ease-out] text-white">
            <div className="flex items-center justify-between mb-4 border-b border-navy-800 pb-3">
              <div>
                <h2 id="commands-sheet-title" className="text-xl font-extrabold text-cyan-400">
                  Voice Commands & Actions
                </h2>
                <p className="text-xs text-gray-300">
                  Speak these words with Push to Talk, or tap directly:
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCommandSheet(false)}
                aria-label="Close voice commands sheet"
                className="w-10 h-10 flex items-center justify-center bg-navy-800 rounded-full text-gray-300 hover:text-white"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-4 max-h-[60vh] overflow-y-auto">
              {/* 1. Scan Currency */}
              <button
                type="button"
                onClick={() => {
                  setShowCommandSheet(false);
                  executeAction('scan_currency');
                }}
                className="flex items-center gap-3 p-3 bg-navy-800 hover:bg-navy-700 active:bg-cyan-900/40 rounded-xl border-2 border-cyan-500/40 text-left min-h-[52px]"
                aria-label="Scan Currency command. Opens rear camera scanner."
              >
                <Camera className="w-5 h-5 text-cyan-400 flex-shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-sm font-bold text-white">Scan Currency</div>
                  <div className="text-[11px] text-cyan-300">Say &quot;Scan Currency&quot;</div>
                </div>
              </button>

              {/* 2. Capture */}
              <button
                type="button"
                onClick={() => {
                  setShowCommandSheet(false);
                  executeAction('capture');
                }}
                className="flex items-center gap-3 p-3 bg-navy-800 hover:bg-navy-700 active:bg-cyan-900/40 rounded-xl border-2 border-emerald-500/40 text-left min-h-[52px]"
                aria-label="Capture command. Takes currency photograph."
              >
                <Camera className="w-5 h-5 text-emerald-400 flex-shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-sm font-bold text-white">Capture</div>
                  <div className="text-[11px] text-emerald-300">Say &quot;Capture&quot;</div>
                </div>
              </button>

              {/* 3. Repeat Result */}
              <button
                type="button"
                onClick={() => {
                  setShowCommandSheet(false);
                  executeAction('repeat_result');
                }}
                className="flex items-center gap-3 p-3 bg-navy-800 hover:bg-navy-700 active:bg-cyan-900/40 rounded-xl border-2 border-cyan-500/40 text-left min-h-[52px]"
                aria-label="Repeat Result command. Replays last recognized currency denomination."
              >
                <RotateCcw className="w-5 h-5 text-cyan-400 flex-shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-sm font-bold text-white">Repeat Result</div>
                  <div className="text-[11px] text-cyan-300">Say &quot;Repeat Result&quot;</div>
                </div>
              </button>

              {/* 4. Scan Again */}
              <button
                type="button"
                onClick={() => {
                  setShowCommandSheet(false);
                  executeAction('scan_again');
                }}
                className="flex items-center gap-3 p-3 bg-navy-800 hover:bg-navy-700 active:bg-cyan-900/40 rounded-xl border-2 border-teal-500/40 text-left min-h-[52px]"
                aria-label="Scan Again command. Returns to scanner for next banknote."
              >
                <RefreshCw className="w-5 h-5 text-teal-400 flex-shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-sm font-bold text-white">Scan Again</div>
                  <div className="text-[11px] text-teal-300">Say &quot;Scan Again&quot;</div>
                </div>
              </button>

              {/* 5. Stop Speaking */}
              <button
                type="button"
                onClick={() => {
                  setShowCommandSheet(false);
                  executeAction('stop_speaking');
                }}
                className="flex items-center gap-3 p-3 bg-navy-800 hover:bg-navy-700 active:bg-cyan-900/40 rounded-xl border-2 border-red-500/40 text-left min-h-[52px]"
                aria-label="Stop Speaking command. Immediately silences voice audio."
              >
                <VolumeX className="w-5 h-5 text-red-400 flex-shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-sm font-bold text-white">Stop Speaking</div>
                  <div className="text-[11px] text-red-300">Say &quot;Stop Speaking&quot;</div>
                </div>
              </button>

              {/* 6. Open History */}
              <button
                type="button"
                onClick={() => {
                  setShowCommandSheet(false);
                  executeAction('open_history');
                }}
                className="flex items-center gap-3 p-3 bg-navy-800 hover:bg-navy-700 active:bg-cyan-900/40 rounded-xl border-2 border-cyan-500/40 text-left min-h-[52px]"
                aria-label="Open History command. Shows past scans log."
              >
                <History className="w-5 h-5 text-cyan-400 flex-shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-sm font-bold text-white">Open History</div>
                  <div className="text-[11px] text-cyan-300">Say &quot;Open History&quot;</div>
                </div>
              </button>

              {/* 7. Help */}
              <button
                type="button"
                onClick={() => {
                  setShowCommandSheet(false);
                  executeAction('open_help');
                }}
                className="col-span-2 flex items-center gap-3 p-3 bg-navy-800 hover:bg-navy-700 active:bg-cyan-900/40 rounded-xl border-2 border-cyan-500/40 text-left min-h-[52px]"
                aria-label="Help command. Opens user guide and accessibility instructions."
              >
                <HelpCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-sm font-bold text-white">Help & User Guide</div>
                  <div className="text-[11px] text-cyan-300">Say &quot;Help&quot;</div>
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowCommandSheet(false)}
              className="w-full py-3 bg-cyan-500 text-navy-950 font-extrabold rounded-xl text-center min-h-[48px]"
              aria-label="Close voice commands sheet"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceCommandBar;
