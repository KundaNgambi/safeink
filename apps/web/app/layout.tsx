import type { Metadata } from 'next';
import './globals.css';

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
      <body className="dark" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
