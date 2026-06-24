import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { cn } from "@/5-shared/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/5-shared/lib/auth/provider";
import { ThemeProvider } from "@/5-shared/theme/ThemeProvider";
import { BfcacheHandler } from "@/5-shared/ui/BfcacheHandler";
import { fontVariables } from "@/5-shared/lib/fonts/fontLoader";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "SoSS Engine",
  description: "SaaS of SaaSs — Multi-tenant website factory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable, fontVariables)}
      suppressHydrationWarning
    >
      <head>
        {/* Blocking script — applies palette class before first paint to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var p = localStorage.getItem('soos-palette') || 'ocean';
              document.documentElement.classList.add('theme-' + p);
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            {children}
            </AuthProvider>
          <Toaster position="top-right" />
          <BfcacheHandler />
        </ThemeProvider>
      </body>
    </html>
  );
}
