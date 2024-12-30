import React from 'react';

export default function Footer() {
  return (
    <footer className="flex items-center justify-center h-16 border-t bg-background px-4 md:px-6">
      <span className="text-sm text-muted-foreground">
        <a href="https://lavanet.xyz" target='_blank' rel='noopener'>LAVA Token Burn Statistics</a>
      </span>
      <span className="ml-auto text-sm text-muted-foreground">
        Made with ❤️ by <a href='https://x.com/magmadevs' target='_blank' rel='noopener'>Magmadevs</a>
      </span>
    </footer>
  );
}