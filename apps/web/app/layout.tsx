import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'Safeink — Your thoughts, encrypted.',
  description: 'Cross-platform encrypted notes application with end-to-end encryption.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=Manrope:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="dark" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
