import Link from "next/link";
import MarkdownLinkParser from "./MarkdownLinkParser";
import { getCompanyById } from "@/config/companies";

interface CompanyHeaderProps {
  company: string;
  companyData: ReturnType<typeof getCompanyById>;
  companyName: string;
}

export default function CompanyHeader({
  companyData,
  companyName,
}: CompanyHeaderProps) {
  return (
    <header className="mb-6 sm:mb-8">
      <div className="flex items-center mb-4 sm:mb-6">
        <nav className="flex items-center space-x-2 text-md text-gray-400">
          <Link href="/" className="hover:text-orange-500 transition-colors">
            Home
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-gray-300 font-medium">
            {companyData?.emoji} {companyName}
          </span>
        </nav>
      </div>

      <h1
        className="text-3xl sm:text-4xl md:text-6xl font-bold"
        style={{ color: "rgb(249, 115, 22)" }}
      >
        {companyData?.emoji} {companyName}
      </h1>
      {companyData?.disclosure && (
        <MarkdownLinkParser
          text={companyData.disclosure}
          className="mt-4 text-xs sm:text-sm lg:text-md text-gray-300"
        />
      )}
    </header>
  );
}
