import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';

import './globals.css';
import Providers from './providers';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: {
    default: 'Santerra',
    template: '%s | Santerra',
  },
  description: 'Sistema Santerra',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='pt-BR' className={jakarta.variable}>
      <body className='font-sans antialiased'>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
