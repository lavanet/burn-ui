import React from 'react';
import Navigation from './navigation';
import MobileNavigation from './mobile-navigation';

export default function Header() {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Navigation />
      <MobileNavigation />
    </header>
  );
}