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
    <div className="flex flex-col gap-1">
      <div className="text-gray-400 text-sm items-center">Curators:</div>
      <div className="flex flex-wrap gap-2 sm:gap-4">
        {companyData.curators.map((curator, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span className="text-gray-300">{curator.name}</span>
            <div className="flex gap-1">
              <Link
                href={`https://github.com/${curator.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 hover:text-orange-400 transition-colors"
                title={`${curator.name} on GitHub`}
              >
                GitHub
              </Link>
              {curator.x && (
                <>
                  <span className="text-gray-500">•</span>
                  <Link
                    href={`https://x.com/${curator.x}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:text-orange-400 transition-colors"
                    title={`${curator.name} on X`}
                  >
                    X
                  </Link>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
