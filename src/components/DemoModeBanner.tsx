import React, { useState } from 'react';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';

interface DemoModeBannerProps {
  onLearnMore?: () => void;
}

const DemoModeBanner: React.FC<DemoModeBannerProps> = ({ onLearnMore }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      role="alert"
      className="
        relative flex items-center gap-3
        mx-4 mt-2 px-4 py-3
        bg-amber-500/15 border border-amber-400/30
        rounded-xl text-amber-300
      "
    >
      <AlertTriangle
        className="w-5 h-5 flex-shrink-0 text-amber-400"
        aria-hidden="true"
      />

      <p className="flex-1 text-sm font-medium leading-snug">
        <span className="font-bold tracking-wide">DEMO MODE</span>
        <span className="mx-1">—</span>
        Results are simulated
      </p>

      {onLearnMore && (
        <button
          onClick={onLearnMore}
          className="
            flex items-center gap-1
            text-xs font-semibold text-amber-400
            hover:text-amber-300 underline underline-offset-2
            transition-colors duration-200
            min-h-[44px] px-1
          "
          aria-label="Learn more about demo mode"
        >
          Learn&nbsp;more
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      )}

      <button
        onClick={() => setDismissed(true)}
        className="
          p-1.5 rounded-lg
          text-amber-400/70 hover:text-amber-300 hover:bg-amber-400/10
          transition-colors duration-200
          min-w-[36px] min-h-[36px]
          flex items-center justify-center
        "
        aria-label="Dismiss demo mode banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default DemoModeBanner;
