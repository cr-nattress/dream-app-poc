'use client';

import Image from 'next/image';

export function Header() {
  return (
    <header className="bg-gradient-to-r from-primary-600 to-secondary-600 shadow-lg" role="banner">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center">
          <Image
            src="/dreamit-logo.png"
            alt="DreamIt - AI Dream Videos"
            width={200}
            height={48}
            className="h-12 w-auto"
            priority
          />
        </div>
      </div>
    </header>
  );
}
