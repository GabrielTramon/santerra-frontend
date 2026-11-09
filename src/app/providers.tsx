'use client';

import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';

import { TooltipProvider } from '@/components/ui/tooltip';

const SESSION_REFETCH_INTERVAL_IN_SECONDS = 60;

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SessionProvider refetchInterval={SESSION_REFETCH_INTERVAL_IN_SECONDS}>
      <ThemeProvider
        attribute='class'
        defaultTheme='light'
        disableTransitionOnChange
        forcedTheme={pathname.startsWith('/auth') ? 'light' : undefined}
      >
        <TooltipProvider>{children}</TooltipProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
