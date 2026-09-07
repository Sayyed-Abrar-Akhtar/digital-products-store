import type { Metadata, Viewport } from "next";
import { SITE_CONFIG } from "@/lib/config/site";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfd" },
    { media: "(prefers-color-scheme: dark)", color: "#090d16" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} — Premium Digital Products & Tools`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    "Digital Products",
    "Next.js Starters",
    "Developer Tools",
    "Design Systems",
    "Web Development",
    "Software Architecture",
  ],
  authors: [{ name: SITE_CONFIG.author.name, url: SITE_CONFIG.author.url }],
  creator: SITE_CONFIG.author.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground flex flex-col min-h-screen antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
