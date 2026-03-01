import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Inter,
  Manrope,
  Space_Grotesk,
  Bricolage_Grotesque,
  Instrument_Serif,
} from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "nutriAI",
  description: "nutrition-first ai app",
  metadataBase: new URL("https://makesomething.so"),
  openGraph: {
    title: "nutriAI",
    description: "nutrition-first ai app",
    siteName: "nutriAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "nutriAI",
    description: "nutrition-first ai app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${manrope.variable} ${spaceGrotesk.variable} ${bricolageGrotesque.variable} ${instrumentSerif.variable} min-h-screen bg-background font-[family-name:var(--font-inter)] text-foreground antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

