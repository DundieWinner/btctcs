import Footer from "@/components/Footer";
import Button from "@/components/Button";

export default function PrivacyPolicy() {
  return (
    <>
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <div className="mb-6">
              <Button href="/">← Back to Home</Button>
            </div>

            <h1
              className="text-4xl md:text-6xl font-bold mb-4"
              style={{ color: "rgb(249, 115, 22)" }}
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
                  style={{ color: "rgb(249, 115, 22)" }}
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
                  style={{ color: "rgb(249, 115, 22)" }}
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
                  style={{ color: "rgb(249, 115, 22)" }}
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
                  style={{ color: "rgb(249, 115, 22)" }}
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
                  style={{ color: "rgb(249, 115, 22)" }}
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
