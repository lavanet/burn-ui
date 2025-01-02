import {
  Twitter,
  MessageCircle,
  Send,
  Globe,
  FileText,
  Coins
} from "lucide-react";
import React from 'react';

export default function Footer() {
  return (
    <footer className="flex items-center justify-between h-16 border-t bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <div className="group relative">
          <a
            href="https://twitter.com/lavanetxyz"
            target="_blank"
            rel="noopener"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Twitter"
          >
            <Twitter className="h-5 w-5" />
          </a>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs bg-popover px-2 py-1 rounded whitespace-nowrap">
            Twitter
          </span>
        </div>

        <div className="group relative">
          <a
            href="https://discord.gg/lavanetxyz"
            target="_blank"
            rel="noopener"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Discord"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs bg-popover px-2 py-1 rounded whitespace-nowrap">
            Discord
          </span>
        </div>

        <div className="group relative">
          <a
            href="https://t.me/officiallavanetwork"
            target="_blank"
            rel="noopener"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Telegram"
          >
            <Send className="h-5 w-5" />
          </a>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs bg-popover px-2 py-1 rounded whitespace-nowrap">
            Telegram
          </span>
        </div>

        <div className="group relative">
          <a
            href="https://lavanet.xyz"
            target="_blank"
            rel="noopener"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Website"
          >
            <Globe className="h-5 w-5" />
          </a>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs bg-popover px-2 py-1 rounded whitespace-nowrap">
            Website
          </span>
        </div>

        <div className="group relative">
          <a
            href="https://lavanet.xyz/whitepaper"
            target="_blank"
            rel="noopener"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Whitepaper"
          >
            <FileText className="h-5 w-5" />
          </a>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs bg-popover px-2 py-1 rounded whitespace-nowrap">
            Whitepaper
          </span>
        </div>

        <div className="group relative">
          <a
            href="https://docs.lavanet.xyz/token"
            target="_blank"
            rel="noopener"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Tokenomics"
          >
            <Coins className="h-5 w-5" />
          </a>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs bg-popover px-2 py-1 rounded whitespace-nowrap">
            Tokenomics
          </span>
        </div>
      </div>

      <span className="text-sm text-muted-foreground">
        Made with ❤️ by <a
          href='https://x.com/magmadevs'
          target='_blank'
          rel='noopener'
          className="hover:text-white transition-colors"
        >
          Magmadevs
        </a>
      </span>
    </footer>
  );
}