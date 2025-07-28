import Link from "next/link";
import Footer from '@/components/Footer';
import { companies } from '@/config/companies';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-screen-2xl mx-auto px-8 flex-1">
        {/* Header */}
        <header className="text-center mb-16 pt-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ color: 'rgb(249, 115, 22)' }}>
            BTC Treasury Charts
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Charting the BTCTCs taking the world by storm 🌪️
          </p>
        </header>

        {/* Companies List */}
        <div className="max-w-md mx-auto pb-8">
          <ul className="space-y-4">
            {companies.map((company) => (
              <li key={company.id}>
                <Link 
                  href={`/c/${company.id}`}
                  className="flex items-center text-xl text-gray-300 hover:text-orange-500 transition-colors duration-200"
                >
                  <span className="mr-3 text-2xl">{company.emoji}</span>
                  <span>{company.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
}
