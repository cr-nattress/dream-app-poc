import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: {
    default: 'Dream Video Generator',
    template: '%s | Dream Video Generator',
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
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">
        <div className="min-h-screen">
          <Header />
          <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
