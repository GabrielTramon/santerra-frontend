import type { ComponentProps } from 'react';

import { cn } from '@/lib/cn';

import { Spinner } from './spinner';

type ButtonVariant = 'primary' | 'secondary';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 hover:shadow-brand-600/35 focus-visible:ring-brand-500/35',
  secondary:
    'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 focus-visible:ring-brand-500/20',
};

export function buttonStyles(variant: ButtonVariant = 'primary', className?: string): string {
  return cn(
    'inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-[15px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-70',
    BUTTON_VARIANTS[variant],
    className,
  );
}

type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant;
  loading?: boolean;
  loadingText?: string;
};

export function Button({
  variant = 'primary',
  loading = false,
  loadingText,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonStyles(variant, className)}
      {...props}
    >
      {loading ? (
        <>
          <Spinner />
          {loadingText ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
