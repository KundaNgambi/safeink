import type { Metadata, Viewport } from 'next';
import './globals.css';
import AuthProvider from '@/components/providers/AuthProvider';
import ServiceWorkerRegistration from '@/components/providers/ServiceWorker';

export const viewport: Viewport = {
  themeColor: '#1B263B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Obscura — Hidden by design.',
  description: 'Cross-platform encrypted notes application, hidden by design.',
  icons: { icon: '/icons/icon-192.png', apple: '/icons/icon-512.png' },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Obscura',
  },
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
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="dark" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
