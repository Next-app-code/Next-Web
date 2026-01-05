import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Next - Solana Visual Execution Builder',
  description: 'Build and execute Solana transactions visually with a node-based interface',
  icons: {
    icon: '/minilogo.png',
    shortcut: '/minilogo.png',
    apple: '/minilogo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/minilogo.png" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

