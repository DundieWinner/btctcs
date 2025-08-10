import Link from "next/link";
import { companies } from "@/config/companies";
import { darkBackgroundMedium } from "@/config/colors";

interface CompanyNavigationProps {
  currentCompanyId: string;
}

export default function CompanyNavigation({
  currentCompanyId,
}: CompanyNavigationProps) {
  const otherCompanies = companies.filter((c) => c.id !== currentCompanyId);

  return (
    <div className="mt-12 sm:mt-16 pt-8 border-t border-gray-800">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-300 mb-2">
          Explore Other Companies
        </h2>
        <p className="text-gray-400">
          Navigate to other Bitcoin treasury companies
        </p>
      </div>

      <div className="max-w-4xl mx-auto mb-8">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherCompanies.map((company) => (
            <li key={company.id}>
              <Link
                href={`/c/${company.id}`}
                className="flex items-center p-4 rounded-lg border border-gray-700 hover:border-orange-500 hover:bg-gray-800/30 transition-all duration-200 group"
                style={{ backgroundColor: darkBackgroundMedium }}
              >
                <span className="mr-3 text-2xl group-hover:scale-110 transition-transform duration-200">
                  {company.emoji}
                </span>
                <div className="flex-1">
                  <span className="text-lg text-gray-300 group-hover:text-orange-500 transition-colors duration-200">
                    {company.name}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
