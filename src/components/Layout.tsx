import React, { ReactNode } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import Header from './Header';
import BottomNav from './BottomNav';
import VoiceCommandBar from './VoiceCommandBar';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showNav?: boolean;
  showBack?: boolean;
  onCaptureRequested?: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  showNav = true,
  showBack = false,
  onCaptureRequested,
}) => {
  const { settings } = useSettings();
  const { highContrast, largeText, accessibilityMode } = settings;
  const isVisual = accessibilityMode === 'visual';

  return (
    <div
      className={`
        min-h-screen bg-[#0a1633] text-white selection:bg-cyan-500 selection:text-black
        ${highContrast || isVisual ? 'contrast-125 font-medium' : ''}
        ${largeText || isVisual ? 'text-lg' : 'text-base'}
      `}
    >
      {/* Skip to Main Content Link for TalkBack and Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:p-3 focus:bg-cyan-400 focus:text-navy-950 focus:font-extrabold focus:rounded-xl"
      >
        Skip to main content
      </a>

      <div className="max-w-lg mx-auto flex flex-col min-h-screen relative">
        <Header title={title} showBack={showBack} compact={!!title} />

        <main
          id="main-content"
          role="main"
          className={`
            flex-1 px-4 ${showNav ? 'pb-36' : 'pb-8'} pt-3
            animate-[fadeSlideIn_0.25s_ease-out_forwards]
          `}
        >
          {children}
        </main>

        {showNav && (
          <>
            <VoiceCommandBar onCaptureRequested={onCaptureRequested} />
            <BottomNav />
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
