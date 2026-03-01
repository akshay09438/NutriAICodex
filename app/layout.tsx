import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

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
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

