'use client';

export function Header() {
  return (
    <header className="bg-gradient-to-r from-primary-600 to-secondary-600 shadow-lg" role="banner">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center">
          <img
            src="/dreamit-logo.png"
            alt="DreamIt - AI Dream Videos"
            className="h-16 w-auto"
          />
        </div>
      </div>
    </header>
  );
}
