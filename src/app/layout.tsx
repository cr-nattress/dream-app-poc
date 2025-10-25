import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ThemeProvider } from '@/contexts/ThemeContext';

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
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#8b5cf6" />
      </head>
      <body className="antialiased bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-base overflow-hidden" suppressHydrationWarning>
        {/* Skip to main content link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Skip to main content
        </a>

        <ThemeProvider>
          <ErrorBoundary>
            <div className="h-screen flex flex-col">
              <Header />
              <main id="main-content" className="flex-1 overflow-y-auto max-w-4xl w-full mx-auto px-4 py-4" role="main" aria-label="Main content">
                {children}
              </main>
            </div>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
