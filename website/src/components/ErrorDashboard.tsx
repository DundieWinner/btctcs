import Link from "next/link";

interface ErrorDashboardProps {
  companyName: string;
  error?: Error;
}

export default function ErrorDashboard({
  companyName,
  error,
}: ErrorDashboardProps) {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-screen-2xl mx-auto">
        <div className="text-center">
          <h1
            className="text-4xl font-bold mb-4"
            style={{ color: "rgb(249, 115, 22)" }}
          >
            Error Loading Dashboard
          </h1>
          <p className="text-red-400 mb-4">
            Failed to load images for {companyName}. Please check your S3
            configuration.
          </p>
          {error && (
            <p className="text-gray-400 text-sm mb-4">Error: {error.message}</p>
          )}
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-md font-medium transition-colors hover:bg-orange-600"
            style={{ backgroundColor: "rgb(249, 115, 22)", color: "white" }}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
