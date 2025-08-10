import Link from "next/link";
import MarkdownLinkParser from "./MarkdownLinkParser";
import { getCompanyById } from "@/config/companies";
import React from "react";
import CuratorsSection from "@/components/CuratorsSection";
import { btctcsOrange } from "@/config/colors";

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
        style={{ color: btctcsOrange }}
      >
        {companyData?.emoji} {companyName}
      </h1>
      <div className={"flex flex-col gap-2 text-xs sm:text-sm lg:text-md "}>
        {companyData?.disclosure && (
          <MarkdownLinkParser
            text={companyData.disclosure}
            className="mt-4 text-gray-300"
          />
        )}

        {/* Curators */}
        <CuratorsSection companyData={companyData} />
      </div>
    </header>
  );
}
