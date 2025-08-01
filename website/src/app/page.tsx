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
      <div className="w-full max-w-6xl mx-auto px-8 flex-1">
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
        <div className="pb-8">
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-4">
            {companies.map((company) => (
              <li key={company.id}>
                <Link
                  href={`/c/${company.id}`}
                  className="flex items-center text-lg md:text-xl text-gray-300 hover:text-orange-500 transition-colors duration-200"
                >
                  <span className="mr-3">{company.emoji}</span>
                  <span>{company.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Project Description */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <p className="text-sm md:text-lg text-gray-300 leading-relaxed">
            These dashboards are an open project with volunteer curators helping
            keep the company data up to date. Learn more about contributing{" "}
            <a
              href="/contributing"
              className="text-orange-500 hover:text-orange-400 transition-colors duration-200"
            >
              here
            </a>
          </p>
        </div>

        {/* Lead Generation Section */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-8 text-center max-w-2xl mx-auto">
          <p className="text-gray-300 text-sm mb-4">
            Are you a Bitcoin treasury company operator looking for a custom
            dashboard solution? Get in touch at{" "}
            <a
              href="mailto:jared@btctcs.com"
              className="text-orange-500 hover:text-orange-400 transition-colors duration-200"
            >
              jared@btctcs.com
            </a>{" "}
            for a free consultation.
          </p>
          <a
            href="mailto:jared@btctcs.com"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200 inline-flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Get in Touch
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
