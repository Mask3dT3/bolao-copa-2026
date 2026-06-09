import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Bolão Copa 2026",
  description: "Bolão da Copa do Mundo 2026 entre amigos — palpites, pontos e zoeira.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bolão Copa",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0e1a" },
    { media: "(prefers-color-scheme: light)", color: "#f5f5f0" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('bolao-theme');
                if (t) document.documentElement.setAttribute('data-theme', t);
                else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                  document.documentElement.setAttribute('data-theme', 'light');
                } else {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
