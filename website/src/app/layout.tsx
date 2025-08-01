import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import PlausibleProvider from "next-plausible";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BTCTCs",
  description: "Tracking and charting the BTCTCs taking the world by storm",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen`}
      >
        <Script
          async={true}
          src={`https://www.googletagmanager.com/gtag/js?id=G-1E88GHMNQF`}
        />
        <Script id={"google-analytics"}>
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config','G-1E88GHMNQF');
        `}
        </Script>
        <PlausibleProvider domain="btctcs.com">{children}</PlausibleProvider>
      </body>
    </html>
  );
}
