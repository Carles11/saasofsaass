import { AuthProvider } from "@/5-shared/lib/auth/provider";
import { fontVariables } from "@/5-shared/lib/fonts/fontLoader";
import { isRtl } from "@/5-shared/lib/next/rtl";
import { cn } from "@/5-shared/lib/utils";
import { ThemeProvider } from "@/5-shared/theme/ThemeProvider";
import { BfcacheHandler } from "@/5-shared/ui/BfcacheHandler";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { Geist, Geist_Mono, Inter } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "SoSS Engine",
  description: "SaaS of SaaSs — Multi-tenant website factory",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolved from request context (set by proxy.ts middleware), available at
  // any server-component depth — this is the only layout with access to the
  // <html> tag, so it's where lang/dir must be applied for the whole document.
  // Falls back to "en"/ltr on failure — this is the one component that, if it
  // threw, would break every page on the site.
  let locale = "en";
  try {
    locale = await getLocale();
  } catch {}
  const dir = isRtl(locale) ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
        fontVariables,
      )}
      suppressHydrationWarning
    >
      <head>
        {/* Blocking script — applies palette class before first paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (function() {
            try {
              var p = localStorage.getItem('soos-palette') || 'ocean';
              document.documentElement.classList.add('theme-' + p);
            } catch(e) {}
          })();
        `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
          <Toaster position="top-right" />
          <BfcacheHandler />
        </ThemeProvider>
      </body>
    </html>
  );
}
