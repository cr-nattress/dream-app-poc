import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'DreamIt',
    template: '%s | DreamIt',
  },
  description: 'Generate AI videos from your dream descriptions using Sora 2',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-neutral-50 text-neutral-900 font-sans">
        {/* Skip to main content link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Skip to main content
        </a>

        <ErrorBoundary>
          <div className="min-h-screen">
            <Header />
            <main id="main-content" className="max-w-4xl mx-auto px-4 py-8" role="main" aria-label="Main content">
              {children}
            </main>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}
