import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

import { AlertCircleIcon, CheckCircleIcon, InfoIcon } from './icons';

type AlertVariant = 'error' | 'success' | 'info';

const ALERT_STYLES: Record<AlertVariant, string> = {
  error: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  info: 'border-brand-200 bg-brand-50 text-brand-900',
};

const ALERT_ICONS: Record<AlertVariant, ReactNode> = {
  error: <AlertCircleIcon className='size-5 shrink-0 text-red-500' />,
  success: <CheckCircleIcon className='size-5 shrink-0 text-emerald-500' />,
  info: <InfoIcon className='size-5 shrink-0 text-brand-600' />,
};

type AlertProps = {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex gap-3 rounded-xl border px-4 py-3.5 text-sm leading-relaxed animate-fade-up',
        ALERT_STYLES[variant],
        className,
      )}
    >
      {ALERT_ICONS[variant]}
      <div className='flex flex-col gap-0.5'>
        {title && <p className='font-semibold'>{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}
