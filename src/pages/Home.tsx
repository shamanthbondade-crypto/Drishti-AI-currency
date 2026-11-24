import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Upload,
  Volume2,
  VolumeX,
  History as HistoryIcon,
  Settings,
  HelpCircle,
  PlayCircle,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Sparkles,
  WifiOff,
  Wifi,
} from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Card from '../components/Card';
import DemoModeBanner from '../components/DemoModeBanner';
import AccessibilityModeToggle from '../components/AccessibilityModeToggle';
import { useApp } from '../contexts/AppContext';
import { useVoice } from '../contexts/VoiceContext';
import { useSettings } from '../contexts/SettingsContext';
import { historyService } from '../services/historyService';
import { recognitionService } from '../services/recognitionService';
import type { HistoryRecord, Denomination } from '../types';

const SAMPLE_DENOMINATIONS: { value: Denomination; label: string; details: string }[] = [
  { value: '₹10', label: 'Ten Rupees', details: 'Chocolate Brown Note' },
  { value: '₹20', label: 'Twenty Rupees', details: 'Greenish-Yellow Note' },
  { value: '₹50', label: 'Fifty Rupees', details: 'Fluorescent Blue Note' },
  { value: '₹100', label: 'One Hundred Rupees', details: 'Lavender Note' },
  { value: '₹200', label: 'Two Hundred Rupees', details: 'Bright Orange Note' },
  { value: '₹500', label: 'Five Hundred Rupees', details: 'Stone Grey Note' },
];

export default function Home() {
  const navigate = useNavigate();
  const { recognitionMode, setRecognitionMode } = useApp();
  const { speak } = useVoice();
  const { settings } = useSettings();
  const [recentScans, setRecentScans] = useState<HistoryRecord[]>([]);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    // Load recent scans
    const history = historyService.getHistory();
    setRecentScans(history.slice(0, 3));

    // Welcome announcement per spec
    speak('Welcome to Drishti AI. Your currency recognition assistant is ready. Tap Scan Currency to begin scanning banknotes.');

    // Probe backend reachability
    recognitionService
      .isBackendReachable()
      .then(setBackendOnline)
      .catch(() => setBackendOnline(false));
  }, []);

  const handleStartDemoScan = (denom: Denomination) => {
    speak(`Demo scan selected for ${denom}`);
    navigate(`/recognition?demo=${encodeURIComponent(denom)}`);
  };

  const handleNavigateScan = () => {
    speak('Opening live camera scanner.');
    navigate('/scan');
  };

  const handleNavigateUpload = () => {
    speak('Opening image upload.');
    navigate('/upload');
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout>
      <div className="space-y-5">
        {/* Quick Accessibility Mode Switcher */}
        <AccessibilityModeToggle compact />

        {/* Hero Branding Card */}
        <section
          aria-label="Welcome and App Overview"
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c2452] via-[#0b1f44] to-[#07132a] border border-cyan-500/20 p-6 shadow-xl shadow-cyan-950/40"
        >
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Drishti Assistant
              </span>

              {/* Voice Status Pill */}
              <button
                type="button"
                onClick={() =>
                  speak(
                    settings.voiceEnabled
                      ? 'Voice assistance is active.'
                      : 'Voice assistance is turned off.'
                  )
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  settings.voiceEnabled
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}
                aria-label={`Voice assistance is ${settings.voiceEnabled ? 'enabled' : 'disabled'}`}
              >
                {settings.voiceEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5" />
                )}
                <span>Voice {settings.voiceEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Currency Recognition
            </h1>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Recognize Currency. Hear the Value. Gain Independence.
            </p>
          </div>
          <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* Mode Selector Toggle */}
        <section
          aria-label="Recognition Engine Mode"
          className="rounded-2xl bg-[#0f2347]/60 border border-white/10 p-4"
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Engine Mode
              </span>
            </div>

            {/* Mode switch */}
            <div
              className="flex rounded-xl bg-gray-900/90 p-1 border border-white/10"
              role="radiogroup"
              aria-label="Select recognition mode"
            >
              <button
                type="button"
                role="radio"
                aria-checked={recognitionMode === 'demo'}
                onClick={() => {
                  setRecognitionMode('demo');
                  speak('Switched to Demo Mode.');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[48px] ${
                  recognitionMode === 'demo'
                    ? 'bg-amber-500 text-gray-950 shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                DEMO MODE
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={recognitionMode === 'real'}
                onClick={() => {
                  setRecognitionMode('real');
                  speak('Switched to Real AI Mode.');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[48px] ${
                  recognitionMode === 'real'
                    ? 'bg-cyan-500 text-gray-950 shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                REAL AI
              </button>
            </div>
          </div>

          {/* Mode description & status */}
          {recognitionMode === 'demo' ? (
            <div className="flex items-start gap-2 pt-1 text-xs text-amber-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
              <span>
                <strong>Demo Mode Active:</strong> Test all 6 denominations with spoken feedback without requiring the Python AI service.
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 pt-1 text-xs">
              {backendOnline === null ? (
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Wifi className="w-4 h-4 flex-shrink-0 animate-pulse" />
                  <span>Checking AI backend connection…</span>
                </div>
              ) : backendOnline ? (
                <div className="flex items-center gap-1.5 text-teal-300">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span>AI Inference Service Connected (FastAPI + Vision Engine)</span>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <WifiOff className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>
                      <strong>AI Backend Unavailable:</strong> Run Python service on port 8000/3001.
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-300 pl-5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>Switch to Demo Mode to test full voice and UI features.</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {recognitionMode === 'demo' && <DemoModeBanner />}

        {/* Primary Action Buttons */}
        <section aria-label="Scan and Upload Actions" className="space-y-4">
          <Button
            variant="primary"
            size="xl"
            fullWidth
            onClick={handleNavigateScan}
            iconLeft={<Camera className="w-7 h-7 text-gray-950" />}
            className="shadow-2xl shadow-cyan-500/20 py-5 text-xl font-extrabold text-gray-950 bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-300 hover:from-cyan-300 hover:to-teal-300"
            aria-label="Scan Currency using live camera"
          >
            SCAN CURRENCY NOTE
          </Button>

          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={handleNavigateUpload}
            iconLeft={<Upload className="w-6 h-6 text-cyan-400" />}
            className="py-4 font-bold border-cyan-500/30 hover:border-cyan-400 text-cyan-200"
            aria-label="Upload currency note image from device"
          >
            Upload Banknote Image
          </Button>
        </section>

        {/* Quick Demo Denomination Selector (in demo mode) */}
        {recognitionMode === 'demo' && (
          <section aria-label="Demo Denomination Selector" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-amber-400" />
                Quick Demo: Select Banknote
              </h2>
              <span className="text-xs text-amber-400/90 font-medium">Select note to test</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SAMPLE_DENOMINATIONS.map(({ value, label, details }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleStartDemoScan(value)}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#0f2347] border border-cyan-500/30 hover:border-cyan-400 hover:bg-[#163569] active:scale-95 transition-all text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 min-h-[56px]"
                  aria-label={`Test demo recognition for ${label}, ${details}`}
                >
                  <span className="text-2xl font-black bg-gradient-to-r from-cyan-300 to-teal-300 bg-clip-text text-transparent">
                    {value}
                  </span>
                  <span className="text-xs text-gray-300 font-medium mt-1">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Recent Scans Section */}
        <section aria-label="Recent Scans" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <HistoryIcon className="w-4 h-4 text-cyan-400" />
              Recent Scans
            </h2>
            <button
              type="button"
              onClick={() => navigate('/history')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold focus:ring-1 focus:ring-cyan-400 rounded px-2 py-1 min-h-[44px] flex items-center"
              aria-label="View all recognition history"
            >
              View All
            </button>
          </div>

          {recentScans.length > 0 ? (
            <div className="space-y-2">
              {recentScans.map((record) => (
                <Card
                  key={record.id}
                  padding="sm"
                  onClick={() => {
                    speak(`Previous scan: ${record.denomination}`);
                    navigate('/result');
                  }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-lg font-black text-cyan-300">
                      {record.denomination}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          Indian Rupee Note
                        </span>
                        {record.isDemo && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            DEMO
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatTime(record.timestamp)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speak(`This is an Indian ${record.denomination.replace('₹', '')} rupee note.`);
                    }}
                    className="p-2.5 rounded-xl text-cyan-400 hover:bg-cyan-500/10 min-w-[48px] min-h-[48px] flex items-center justify-center"
                    aria-label={`Hear denomination ${record.denomination} aloud`}
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </Card>
              ))}
            </div>
          ) : (
            <Card padding="md" className="text-center py-6 text-gray-400">
              <p className="text-sm font-medium">No previous scans yet.</p>
              <p className="text-xs text-gray-500 mt-1">
                Tap 'Scan Currency Note' or try a quick demo note above.
              </p>
            </Card>
          )}
        </section>

        {/* Quick Accessibility Shortcuts */}
        <section aria-label="Help and Settings Shortcuts" className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-[#0f2347] border border-white/10 hover:border-cyan-500/30 text-left transition-colors focus:ring-2 focus:ring-cyan-400 min-h-[52px]"
            aria-label="Open Settings to adjust voice, language, and theme"
          >
            <Settings className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Settings</div>
              <div className="text-[11px] text-gray-400">Voice & Display</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/help')}
            className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-[#0f2347] border border-white/10 hover:border-cyan-500/30 text-left transition-colors focus:ring-2 focus:ring-cyan-400 min-h-[52px]"
            aria-label="Open Help and TalkBack Guide"
          >
            <HelpCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Help Guide</div>
              <div className="text-[11px] text-gray-400">TalkBack & Tips</div>
            </div>
          </button>
        </section>
      </div>
    </Layout>
  );
}
