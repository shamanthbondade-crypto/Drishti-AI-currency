import React from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  message?: string;
  className?: string;
}

const sizeMap: Record<SpinnerSize, { spinner: string; text: string }> = {
  sm: { spinner: 'w-5 h-5 border-2', text: 'text-xs' },
  md: { spinner: 'w-8 h-8 border-[3px]', text: 'text-sm' },
  lg: { spinner: 'w-12 h-12 border-4', text: 'text-base' },
  xl: { spinner: 'w-16 h-16 border-4', text: 'text-lg' },
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message,
  className = '',
}) => {
  const { spinner, text } = sizeMap[size];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      {/* Dual-ring spinner */}
      <div className="relative">
        <div
          className={`
            ${spinner} rounded-full
            border-cyan-400/20 border-t-cyan-400
            animate-spin
          `}
        />
        {/* Inner glow ring for premium feel */}
        {(size === 'lg' || size === 'xl') && (
          <div
            className={`
              absolute inset-1 rounded-full
              border-2 border-teal-400/10 border-b-teal-400/50
              animate-spin
            `}
            style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
            aria-hidden="true"
          />
        )}
      </div>

      {message && (
        <p className={`${text} text-white/70 font-medium text-center`}>
          {message}
        </p>
      )}

      <span className="sr-only">{message || 'Loading…'}</span>
    </div>
  );
};

export default LoadingSpinner;
