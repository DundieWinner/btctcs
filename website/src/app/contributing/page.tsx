import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";
import { baseUrl, getAbsoluteUrl } from "@/config/environment";

export const metadata: Metadata = {
  title: "Contributing - BTCTCs",
  description:
    "Help maintain Bitcoin treasury company data. No technical knowledge required! Volunteer to keep Google Sheets updated or contribute to the open-source project.",
  keywords: [
    "bitcoin",
    "treasury",
    "contributing",
    "volunteer",
    "open source",
    "data curation",
    "google sheets",
    "btctcs",
  ],
  authors: [{ name: "@DunderHodl", url: "https://x.com/DunderHodl" }],
  creator: "@DunderHodl",
  openGraph: {
    title: "Contributing - BTCTCs",
    description:
      "Help maintain Bitcoin treasury company data. No technical knowledge required! Volunteer to keep data updated.",
    type: "website",
    siteName: "BTCTCs",
    url: `${baseUrl}/contributing`,
    images: [
      {
        url: getAbsoluteUrl("/images/feature-image.png"),
        width: 1200,
        height: 630,
        alt: "BTCTCs - Contributing to Bitcoin Treasury Data",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contributing - BTCTCs",
    description:
      "Help maintain Bitcoin treasury company data. No technical knowledge required!",
    creator: "@DunderHodl",
    images: [getAbsoluteUrl("/images/feature-image.png")],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: `${baseUrl}/contributing`,
  },
};

export default function Contributing() {
  return (
    <>
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center mb-4 sm:mb-6">
              <nav className="flex items-center space-x-2 text-md text-gray-400">
                <Link
                  href="/"
                  className="hover:text-orange-500 transition-colors"
                >
                  Home
                </Link>
                <span className="text-gray-600">/</span>
                <span className="text-gray-300 font-medium">Contributing</span>
              </nav>
            </div>

            <h1
              className="text-4xl md:text-6xl font-bold mb-4"
              style={{ color: "rgb(249, 115, 22)" }}
            >
              Contributing
            </h1>
          </header>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <div className="text-gray-300 space-y-8">
              <div className="mb-6">
                <p className="text-lg">
                  This site is intended to be a group project. I need volunteers
                  to help keep Bitcoin treasury company data up to date.
                  <strong> No technical knowledge required!</strong>
                </p>
              </div>

              <section>
                <h2
                  className="text-2xl font-bold mb-4"
                  style={{ color: "rgb(249, 115, 22)" }}
                >
                  What is Needed
                </h2>
                <ul className="space-y-3 ml-4">
                  <li>
                    • <strong>Data curators</strong> - Keep source data up to
                    date. The chart tooling and this website have been built to
                    be very flexible. It can consume treasury data from an API
                    or a Google sheet or anything else really. I just need
                    others to help keep this source data updated.
                  </li>
                  <li>
                    • <strong>Developers</strong> - If you are techinical, I
                    welcome all improvements to the Python-generated charts and
                    the Next.js web app
                  </li>
                </ul>
              </section>

              <section>
                <h2
                  className="text-2xl font-bold mb-4"
                  style={{ color: "rgb(249, 115, 22)" }}
                >
                  How to Help
                </h2>

                <div className="space-y-4">
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2 text-white">
                      💬 DM me on X
                    </h3>
                    <p>
                      <a
                        href="https://x.com/DunderHodl"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:text-orange-400 underline font-semibold"
                      >
                        @DunderHodl
                      </a>{" "}
                      - Tell me what company or companies you want to work on.I
                      will get you set up and answer any questions.
                    </p>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2 text-white">
                      🛠️ Contribute on GitHub
                    </h3>
                    <p>
                      <a
                        href="https://github.com/DundieWinner/btctcs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:text-orange-400 underline font-semibold"
                      >
                        github.com/DundieWinner/btctcs
                      </a>{" "}
                      - Submit issues or pull requests
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <p className="text-gray-400">
                  Contributors get credited on company dashboards with links to
                  their GitHub and X profiles.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
