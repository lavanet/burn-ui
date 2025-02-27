// components/mobile-navigation.tsx
'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@burn/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@burn/components/ui/sheet';
import Image from 'next/image';
import lavaLogo from "@burn/public/lava.webp";

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <Image src={lavaLogo} alt="Lava Network" className="w-24 shrink-0 md:hidden" />
      <SheetContent side="left">
        <nav className="grid gap-6 text-lg font-medium">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
              <Image src={lavaLogo} alt="Lava Network" className='w-24' />
              <span className="sr-only">Lava Network</span>
            </Link>
          </Link>
          <Link href="/" className="hover:text-foreground">
            Burn Stats
          </Link>
          <Link href="/burn-rate" className="hover:text-foreground">
            Burn Rate
          </Link>
          <Link href="https://rewards.lavanet.xyz" className="hover:text-foreground">
            Network Rewards
          </Link>
          <Link href="https://info.mainnet.lavanet.xyz" className="hover:text-foreground">
            Network Info
          </Link>
          <Link href="https://stats.lavanet.xyz" className="hover:text-foreground">
            Network Stats
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}