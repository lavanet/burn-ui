// components/navigation.tsx
'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import lavaLogo from "@/public/lava.webp";

export default function Navigation() {  
  return (
    <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
        <Image src={lavaLogo} alt="Lava Network" className='w-24' />
        <span className="sr-only">Lava Network</span>
      </Link>
      <Link href="/" className="text-foreground transition-colors hover:text-foreground">
        Home
      </Link>
    </nav>
  );
}