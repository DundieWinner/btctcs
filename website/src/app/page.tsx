import Link from "next/link";
import type { Metadata } from "next";
import Footer from "@/components/Footer";
import { companies } from "@/config/companies";
import { baseUrl, getAbsoluteUrl } from "@/config/environment";

// Metadata for the homepage
export const metadata: Metadata = {
  title: "BTCTCs - Tracking and charting the BTCTCs taking the world by storm",
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
  openGraph: {
    title:
      "BTCTCs - Tracking and charting the BTCTCs taking the world by storm",
    description:
      "Track and analyze Bitcoin treasury holdings across leading companies. Real-time charts and data for corporate Bitcoin adoption.",
    type: "website",
    siteName: "BTCTCs",
    url: baseUrl,
    images: [
      {
        url: getAbsoluteUrl("/images/feature-image.png"),
        width: 1200,
        height: 630,
        alt: "BTCTCs - Corporate Bitcoin Holdings Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "BTCTCs - Tracking and charting the BTCTCs taking the world by storm",
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
      <div className="max-w-screen-6xl mx-auto px-8 flex-1">
        {/* Header */}
        <header className="text-center mb-4 pt-8">
          <h1
            className="text-4xl md:text-6xl font-bold mb-4"
            style={{ color: "rgb(249, 115, 22)" }}
          >
            BTCTCs
          </h1>
          <p className="text-sm md:text-lg text-gray-300">
            Tracking and charting the Bitcoin treasury companies taking the
            world by storm 🌪️
          </p>
        </header>

        {/* Companies List */}
        <div className="md:max-w-4xl lg:max-w-4xl pb-8">
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

        {/* Project Description */}
        <div className="max-w-4xl mb-12">
          <p className="text-md text-gray-300 leading-relaxed">
            These dashboards are an open project with volunteer curators helping
            keep the company data up to date. Interested volunteers can contact
            me via DM on X{" "}
            <a
              href="https://x.com/DunderHodl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:text-orange-400 transition-colors duration-200"
            >
              @DunderHodl
            </a>{" "}
            or check out the project&apos;s GitHub to learn more:{" "}
            <a
              href="https://github.com/DundieWinner/btctcs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:text-orange-400 transition-colors duration-200"
            >
              github.com/DundieWinner/btctcs
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
