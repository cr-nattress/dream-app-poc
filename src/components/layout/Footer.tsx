'use client';

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between text-xs">
          <p className="text-white/80">
            &copy; {new Date().getFullYear()} DreamIt
          </p>
          <p className="text-white/60">
            Powered by Sora 2
          </p>
        </div>
      </div>
    </footer>
  );
}
