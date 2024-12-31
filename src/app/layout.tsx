import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google"
import { cn } from "@burn/lib/utils"
import { ThemeProvider } from "@burn/components/theme-provider"
import Header from "@burn/components/layout/Header"
import Footer from "@burn/components/layout/Footer"
import { TooltipProvider } from "@radix-ui/react-tooltip";

import "@burn/styles/globals.css";
import "@burn/styles/modern.css";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "LAVA Token - Burn Statistics",
  description: "Burn statistics of the LAVA token",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
        >
          <TooltipProvider>
            <div className="flex min-h-screen mx-auto max-w-screen-2xl flex-col">
              <Header />
              <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                {children}
              </main>
              <Footer />
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}