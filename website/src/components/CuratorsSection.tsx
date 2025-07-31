import React from "react";
import Link from "next/link";
import { getCompanyById } from "@/config/companies";

interface CuratorsSectionProps {
  companyData: ReturnType<typeof getCompanyById>;
}

export default function CuratorsSection({ companyData }: CuratorsSectionProps) {
  if (!companyData?.curators || companyData.curators.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-x-0 gap-y-1 items-center">
      <div className="text-gray-400">
        Curator{companyData.curators.length > 1 && "s"}:
      </div>
      {companyData.curators.map((curator, index) => (
        <React.Fragment key={`${curator.name}-${index}`}>
          <span className={index === 0 ? "ml-2" : ""}>
            {index > 0 && ", "}
            <Link
              href={
                curator.x
                  ? `https://x.com/${curator.x}`
                  : `https://github.com/${curator.github}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:text-orange-400 transition-colors"
              title={
                curator.x ? `${curator.name} on X` : `${curator.name} on GitHub`
              }
            >
              {curator.name}
            </Link>
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}
