'use client';

import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';

import { TooltipProvider } from '@/components/ui/tooltip';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SessionProvider>
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
