interface LoadingDashboardProps {
  companyName: string;
}

export default function LoadingDashboard({
  companyName,
}: LoadingDashboardProps) {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
              style={{ borderColor: "rgb(249, 115, 22)" }}
            ></div>
            <p className="text-gray-300">
              Loading the {companyName} dashboard...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
