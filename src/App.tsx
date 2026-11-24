import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { SettingsProvider } from './contexts/SettingsContext';
import { VoiceProvider } from './contexts/VoiceContext';
import { AppProvider, useApp } from './contexts/AppContext';

// ---------------------------------------------------------------------------
// Lazy-loaded page components
// ---------------------------------------------------------------------------
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Home = lazy(() => import('./pages/Home'));
const Scan = lazy(() => import('./pages/Scan'));
const Upload = lazy(() => import('./pages/Upload'));
const Recognition = lazy(() => import('./pages/Recognition'));
const Result = lazy(() => import('./pages/Result'));
const History = lazy(() => import('./pages/History'));
const Settings = lazy(() => import('./pages/Settings'));
const Help = lazy(() => import('./pages/Help'));

// ---------------------------------------------------------------------------
// Loading fallback shown while a lazy page is being fetched
// ---------------------------------------------------------------------------
function LoadingFallback() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#0a1633]"
      role="status"
      aria-label="Loading page"
    >
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="h-16 w-16 rounded-full border-4 border-cyan-400/20 border-t-cyan-400 animate-spin" />
        <p className="text-lg font-medium text-cyan-300">Loading Drishti AI…</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Initial route redirect helper
// ---------------------------------------------------------------------------
function InitialRoute() {
  const { hasCompletedOnboarding } = useApp();
  if (hasCompletedOnboarding) {
    return <Navigate to="/home" replace />;
  }
  return <Onboarding />;
}

// ---------------------------------------------------------------------------
// App root
// ---------------------------------------------------------------------------
export default function App() {
  return (
    <SettingsProvider>
      <VoiceProvider>
        <AppProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<InitialRoute />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/home" element={<Home />} />
                <Route path="/scan" element={<Scan />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/recognition" element={<Recognition />} />
                <Route path="/result" element={<Result />} />
                <Route path="/history" element={<History />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/help" element={<Help />} />
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AppProvider>
      </VoiceProvider>
    </SettingsProvider>
  );
}
