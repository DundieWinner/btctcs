import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-4">
      <div className="max-w-screen-2xl mx-auto px-8">
        <div className="text-center text-gray-400 text-sm">
          <p>
            Data sourced from public company filings, announcements, treasury
            dashboards, and community-provided Google Sheets.
          </p>
          <p className="mt-1">
            This site is a creation of{" "}
            <Link
              href="https://x.com/DunderHodl"
              className="text-orange-500 hover:text-orange-400 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              @DunderHodl
            </Link>
            . All rights reserved.{" "}
            <Link
              href="/privacy"
              className="text-orange-500 hover:text-orange-400 underline"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
