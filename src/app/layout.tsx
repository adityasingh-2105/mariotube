import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: {
    default: "MarioTube - Premium Video Streaming",
    template: "%s | MarioTube",
  },
  description: "A premium video streaming application built on official YouTube APIs with watch history, playlists, search, subscriptions and favorites.",
  keywords: ["video streaming", "youtube player", "watch history", "favorites", "subscriptions", "mariotube"],
  authors: [{ name: "MarioTube Team" }],
  creator: "MarioTube",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "MarioTube",
    title: "MarioTube - Premium Video Streaming",
    description: "Discover, stream, and manage your favorite YouTube content on a premium user interface.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MarioTube Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MarioTube - Premium Video Streaming",
    description: "Discover and stream YouTube content on a sleek dashboard.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${plusJakartaSans.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        <SessionProvider>
          <ThemeProvider>
            <QueryProvider>
              <TooltipProvider>
                {children}
                <Toaster closeButton position="top-right" richColors />
              </TooltipProvider>
            </QueryProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
