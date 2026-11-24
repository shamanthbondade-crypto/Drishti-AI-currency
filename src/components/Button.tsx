import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  children: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary: `
    bg-gradient-to-r from-cyan-500 to-teal-500
    hover:from-cyan-400 hover:to-teal-400
    active:from-cyan-600 active:to-teal-600
    text-white shadow-lg shadow-cyan-500/20
  `,
  secondary: `
    bg-[#0f2347] border border-white/10
    hover:bg-[#152d5a] active:bg-[#0a1a3a]
    text-white
  `,
  danger: `
    bg-red-600 hover:bg-red-500 active:bg-red-700
    text-white shadow-lg shadow-red-600/20
  `,
  ghost: `
    bg-transparent hover:bg-white/5 active:bg-white/10
    text-white/80 hover:text-white
  `,
};

const sizeStyles: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5 min-h-[36px] rounded-lg gap-1.5',
  md: 'text-base px-5 py-2.5 min-h-[44px] rounded-xl gap-2',
  lg: 'text-lg px-6 py-3 min-h-[48px] rounded-xl gap-2.5',
  xl: 'text-xl px-8 py-4 min-h-[56px] rounded-2xl gap-3',
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  iconLeft,
  iconRight,
  children,
  disabled,
  className = '',
  ...rest
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center
        font-semibold tracking-wide
        transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1633]
        disabled:opacity-50 disabled:cursor-not-allowed
        min-h-[48px]
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...rest}
    >
      {loading ? (
        <Loader2
          className="w-5 h-5 animate-spin"
          aria-hidden="true"
        />
      ) : (
        iconLeft && (
          <span className="flex-shrink-0" aria-hidden="true">
            {iconLeft}
          </span>
        )
      )}

      <span>{children}</span>

      {!loading && iconRight && (
        <span className="flex-shrink-0" aria-hidden="true">
          {iconRight}
        </span>
      )}
    </button>
  );
};

export default Button;
