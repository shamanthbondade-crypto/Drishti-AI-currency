import React, { ReactNode } from 'react';

type Padding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  header?: ReactNode;
  icon?: ReactNode;
  padding?: Padding;
  className?: string;
}

const paddingStyles: Record<Padding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const Card: React.FC<CardProps> = ({
  children,
  onClick,
  header,
  icon,
  padding = 'md',
  className = '',
}) => {
  const isClickable = !!onClick;

  const cardContent = (
    <>
      {(header || icon) && (
        <div className="flex items-center gap-3 mb-3">
          {icon && (
            <span className="text-cyan-400 flex-shrink-0" aria-hidden="true">
              {icon}
            </span>
          )}
          {header && (
            <div className="font-semibold text-white text-lg">{header}</div>
          )}
        </div>
      )}
      {children}
    </>
  );

  const baseClasses = `
    rounded-2xl
    bg-[#0f2347]/80 border border-white/10
    transition-all duration-200
    ${paddingStyles[padding]}
    ${
      isClickable
        ? 'cursor-pointer hover:bg-[#152d5a]/90 hover:border-cyan-400/30 hover:shadow-lg hover:shadow-cyan-500/5 active:scale-[0.98]'
        : ''
    }
    ${className}
  `;

  if (isClickable) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseClasses} w-full text-left`}
        tabIndex={0}
      >
        {cardContent}
      </button>
    );
  }

  return <div className={baseClasses}>{cardContent}</div>;
};

export default Card;
