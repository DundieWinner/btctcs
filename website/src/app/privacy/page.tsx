import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";
import { baseUrl, getAbsoluteUrl } from "@/config/environment";
import { btctcsOrange } from "@/config/colors";

export const metadata: Metadata = {
  title: "Privacy Policy - BTCTCs",
  description:
    "Privacy policy for BTCTCs - Bitcoin treasury charts and analytics. Learn about our data collection practices and how we protect visitor information.",
  keywords: [
    "privacy policy",
    "bitcoin",
    "treasury",
    "data protection",
    "btctcs",
  ],
  authors: [{ name: "@DunderHodl", url: "https://x.com/DunderHodl" }],
  creator: "@DunderHodl",
  openGraph: {
    title: "Privacy Policy - BTCTCs",
    description:
      "Privacy policy for BTCTCs - Bitcoin treasury charts and analytics.",
    type: "website",
    siteName: "BTCTCs",
    url: `${baseUrl}/privacy`,
    images: [
      {
        url: getAbsoluteUrl("/images/feature-image.png"),
        width: 1200,
        height: 630,
        alt: "BTCTCs - Privacy Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy - BTCTCs",
    description:
      "Privacy policy for BTCTCs - Bitcoin treasury charts and analytics.",
    creator: "@DunderHodl",
    images: [getAbsoluteUrl("/images/feature-image.png")],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: `${baseUrl}/privacy`,
  },
};

export default function PrivacyPolicy() {
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
                <span className="text-gray-300 font-medium">
                  Privacy Policy
                </span>
              </nav>
            </div>

            <h1
              className="text-4xl md:text-6xl font-bold mb-4"
              style={{ color: btctcsOrange }}
            >
              Privacy Policy
            </h1>
          </header>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <div className="text-gray-300 space-y-8">
              <div className="mb-6">
                <p className="text-lg">
                  At BTC Treasury Charts, we respect the privacy of our
                  visitors. This Privacy Policy outlines what information we
                  collect, how we use it, and how we protect it.
                </p>
              </div>

              <section>
                <h2
                  className="text-2xl font-bold mb-4"
                  style={{ color: btctcsOrange }}
                >
                  Information Collection
                </h2>
                <p className="mb-4">
                  We collect information from you in two ways: directly when you
                  provide information through our site, and automatically
                  through technology like cookies when you visit our site. The
                  information we collect depends on how you use our site.
                </p>

                <div className="ml-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-white">
                      Log Files:
                    </h3>
                    <p>
                      Like many websites, we automatically log certain
                      information about all visitors to our site. This can
                      include IP addresses, browser type, ISP, referring/exit
                      pages, operating system, date/time stamps, and related
                      data. We use this to analyze trends, administer the site,
                      track user movements, and gather broad demographic
                      information. This data is not linked to personally
                      identifiable information.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-white">
                      Cookies and Web Beacons:
                    </h3>
                    <p>
                      We use cookies to store visitors&apos; preferences and
                      record session information. Third party services like
                      Google AdSense may use cookies or other technologies like
                      web beacons to deliver relevant ads on our site and track
                      their performance. You can control the use of cookies
                      through your browser settings.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2
                  className="text-2xl font-bold mb-4"
                  style={{ color: btctcsOrange }}
                >
                  Use of Information
                </h2>
                <p>
                  We use the information we collect to operate and improve our
                  website, customize content for visitors, show relevant
                  advertising, and for other business purposes. We do not share
                  personally identifiable information with third parties.
                </p>
              </section>

              <section>
                <h2
                  className="text-2xl font-bold mb-4"
                  style={{ color: btctcsOrange }}
                >
                  Data Protection
                </h2>
                <p>
                  We take reasonable precautions to protect the loss, misuse,
                  and alteration of information we collect online. However, no
                  internet transmission is completely secure, so we cannot
                  guarantee protection. You transmit information to us at your
                  own risk.
                </p>
              </section>

              <section>
                <h2
                  className="text-2xl font-bold mb-4"
                  style={{ color: btctcsOrange }}
                >
                  Changes to Policy
                </h2>
                <p>
                  We may occasionally update this Privacy Policy as needed. We
                  encourage you to periodically review this page for the latest
                  information on our privacy practices.
                </p>
              </section>

              <section>
                <h2
                  className="text-2xl font-bold mb-4"
                  style={{ color: btctcsOrange }}
                >
                  Contact Us
                </h2>
                <p>
                  If you have any questions about this Privacy Policy or our
                  data practices, please send a DM to{" "}
                  <a
                    href="https://x.com/DunderHodl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:text-orange-400 underline"
                  >
                    @DunderHodl
                  </a>{" "}
                  on X.
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
