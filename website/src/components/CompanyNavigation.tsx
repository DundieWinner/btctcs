import Link from "next/link";
import { companies } from "@/config/companies";

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

      <div className="max-w-7xl mx-auto mb-8">
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-4">
          {otherCompanies.map((company) => (
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
    </div>
  );
}
