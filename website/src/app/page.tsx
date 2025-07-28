import Link from "next/link";
import type { Metadata } from "next";
import Footer from "@/components/Footer";
import { companies } from "@/config/companies";
import { baseUrl, getAbsoluteUrl } from "@/config/environment";

// Metadata for the homepage
export const metadata: Metadata = {
  title: "BTC Treasury Charts - Charting the BTCTCs taking the world by storm",
  description:
    "Track and analyze Bitcoin treasury holdings across leading companies. Real-time charts and data for corporate Bitcoin adoption and treasury management.",
  keywords: [
    "bitcoin",
    "treasury",
    "charts",
    "corporate bitcoin",
    "btc holdings",
    "cryptocurrency",
    "treasury management",
    "bitcoin adoption",
    "corporate treasury",
    "btctcs",
  ],
  authors: [{ name: "@DunderHodl", url: "https://x.com/DunderHodl" }],
  creator: "@DunderHodl",
  publisher: "BTC Treasury Charts",
  openGraph: {
    title:
      "BTC Treasury Charts - Charting the BTCTCs taking the world by storm",
    description:
      "Track and analyze Bitcoin treasury holdings across leading companies. Real-time charts and data for corporate Bitcoin adoption.",
    type: "website",
    siteName: "BTC Treasury Charts",
    url: baseUrl,
    images: [
      {
        url: getAbsoluteUrl("/images/feature-image.png"),
        width: 1200,
        height: 630,
        alt: "BTC Treasury Charts - Corporate Bitcoin Holdings Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "BTC Treasury Charts - Charting the BTCTCs taking the world by storm",
    description:
      "Track and analyze Bitcoin treasury holdings across leading companies. Real-time charts and data for corporate Bitcoin adoption.",
    creator: "@DunderHodl",
    images: [getAbsoluteUrl("/images/feature-image.png")],
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
  verification: {
    // Add verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-screen-2xl mx-auto px-8 flex-1">
        {/* Header */}
        <header className="text-center mb-16 pt-8">
          <h1
            className="text-4xl md:text-6xl font-bold mb-4"
            style={{ color: "rgb(249, 115, 22)" }}
          >
            BTC Treasury Charts
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Charting the BTCTCs taking the world by storm 🌪️
          </p>
        </header>

        {/* Companies List */}
        <div className="max-w-md mx-auto pb-8">
          <ul className="space-y-4">
            {companies.map((company) => (
              <li key={company.id}>
                <Link
                  href={`/c/${company.id}`}
                  className="flex items-center text-xl text-gray-300 hover:text-orange-500 transition-colors duration-200"
                >
                  <span className="mr-3 text-2xl">{company.emoji}</span>
                  <span>{company.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
}
