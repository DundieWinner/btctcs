import Link from "next/link";
import Image from "next/image";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { Suspense } from "react";
import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import { getCompanyById } from "@/config/companies";
import { baseUrl } from "@/config/environment";
import { s3AccessKey, s3Secret } from "@/config/environment-be";

// Revalidate this page every 10 minutes (600 seconds)
export const revalidate = 600;

interface CompanyPageProps {
  params: Promise<{
    company: string;
  }>;
}

// Generate metadata for each company page
export async function generateMetadata({
  params,
}: CompanyPageProps): Promise<Metadata> {
  const { company } = await params;
  const companyData = getCompanyById(company);

  // Fetch the first image for the feature image
  let featureImage: string | undefined;
  try {
    const images = await fetchCompanyImages(company);
    featureImage = images.length > 0 ? images[0] : undefined;
  } catch (error) {
    console.error("Error fetching images for metadata:", error);
    featureImage = undefined;
  }

  if (!companyData) {
    const baseMetadata = {
      title: `${company.toUpperCase()} - BTCTCs`,
      description: `Bitcoin treasury charts and data for ${company.toUpperCase()}`,
    };

    if (featureImage) {
      return {
        ...baseMetadata,
        openGraph: {
          ...baseMetadata,
          type: "website",
          siteName: "BTCTCs",
          url: `${baseUrl}/c/${company}`,
          images: [{ url: featureImage }],
        },
        twitter: {
          card: "summary_large_image",
          ...baseMetadata,
          images: [featureImage],
        },
      };
    }

    return baseMetadata;
  }

  const curatorNames = companyData.curators.map((c) => c.name).join(", ");
  const title = `${companyData.name} ${companyData.emoji} - BTCTCs`;
  const description = `Bitcoin treasury charts and analytics for ${companyData.name}. ${companyData.description || ""} Curated by ${curatorNames}.`;

  const baseMetadata = {
    title,
    description,
    keywords: [
      "bitcoin",
      "treasury",
      "charts",
      "analytics",
      companyData.name.toLowerCase(),
      "btc",
      "cryptocurrency",
      "corporate treasury",
    ],
  };

  if (featureImage) {
    return {
      ...baseMetadata,
      openGraph: {
        title,
        description,
        type: "website",
        siteName: "BTCTCs",
        url: `${baseUrl}/c/${company}`,
        images: [{ url: featureImage }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [featureImage],
      },
    };
  }

  return {
    ...baseMetadata,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "BTCTCs",
      url: `${baseUrl}/c/${company}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// Configure S3 client for DigitalOcean Spaces
const s3Client = new S3Client({
  endpoint: "https://nyc3.digitaloceanspaces.com",
  region: "nyc3",
  credentials: {
    accessKeyId: s3AccessKey,
    secretAccessKey: s3Secret,
  },
});

// Function to fetch images from DigitalOcean Spaces
const fetchCompanyImages = async (companyId: string): Promise<string[]> => {
  const baseUrl = "https://btctcs.nyc3.cdn.digitaloceanspaces.com";

  try {
    const command = new ListObjectsV2Command({
      Bucket: "btctcs",
      Prefix: `charts/${companyId}/`,
      MaxKeys: 100,
    });

    const response = await s3Client.send(command);

    if (!response.Contents) {
      console.log(`No objects found for company: ${companyId}`);
      return [];
    }

    // Filter for image files and create full URLs
    const imageUrls = response.Contents.filter((obj) => {
      const key = obj.Key || "";
      return (
        key.match(/\.(png|jpg|jpeg|gif|webp)$/i) && obj.Size && obj.Size > 0
      );
    })
      .map((obj) => `${baseUrl}/${obj.Key}`)
      .sort(); // Sort alphabetically

    console.log(`Found ${imageUrls.length} images for company: ${companyId}`);
    return imageUrls;
  } catch (error) {
    console.error("Error fetching images from S3:", error);

    // If S3 credentials are not configured, return placeholder images
    if (!s3AccessKey || !s3Secret) {
      console.warn(
        "DigitalOcean Spaces credentials not configured. Using placeholder images.",
      );
      return [
        `https://via.placeholder.com/400x300/1f2937/f97316?text=${companyId.toUpperCase()}+Chart+1`,
        `https://via.placeholder.com/400x300/1f2937/f97316?text=${companyId.toUpperCase()}+Chart+2`,
        `https://via.placeholder.com/400x300/1f2937/f97316?text=${companyId.toUpperCase()}+Chart+3`,
      ];
    }

    throw error;
  }
};

// Loading component
function LoadingDashboard({ companyName }: { companyName: string }) {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
              style={{ borderColor: "rgb(249, 115, 22)" }}
            ></div>
            <p className="text-gray-300">Loading {companyName} dashboard...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main dashboard component
async function CompanyDashboard({ company }: { company: string }) {
  const companyData = getCompanyById(company);
  const companyName = companyData?.name.toUpperCase() || company.toUpperCase();

  try {
    const images = await fetchCompanyImages(company);

    return (
      <div className="min-h-screen p-8">
        <div className="max-w-screen-2xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <Button href="/">← Back to Home</Button>
            </div>

            <h1
              className="text-4xl md:text-6xl font-bold"
              style={{ color: "rgb(249, 115, 22)" }}
            >
              {companyName}
            </h1>

            {/* Curators */}
            {companyData?.curators && companyData.curators.length > 0 && (
              <div className="mt-4 mb-8">
                <p className="text-gray-400 text-sm mb-2">Curated by:</p>
                <div className="flex flex-wrap gap-4">
                  {companyData.curators.map((curator, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className="text-gray-300">{curator.name}</span>
                      <div className="flex gap-1">
                        <a
                          href={`https://github.com/${curator.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-500 hover:text-orange-400 transition-colors"
                          title={`${curator.name} on GitHub`}
                        >
                          GitHub
                        </a>
                        {curator.x && (
                          <>
                            <span className="text-gray-500">•</span>
                            <a
                              href={`https://x.com/${curator.x}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange-500 hover:text-orange-400 transition-colors"
                              title={`${curator.name} on X`}
                            >
                              X
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </header>

          {/* Images Grid */}
          {images.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-300 text-lg">
                No images found for {companyName}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Images will appear here once they are uploaded to the S3 bucket
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {images.map((imageUrl, index) => (
                <div
                  key={imageUrl}
                  className="rounded-lg overflow-hidden border border-gray-700 hover:border-orange-500 transition-colors"
                  style={{ backgroundColor: "rgb(3, 7, 18, 0.9)" }}
                >
                  <div className="relative">
                    <Image
                      src={imageUrl}
                      alt={`${companyName} chart ${index + 1}`}
                      width={800}
                      height={600}
                      className="w-full h-auto object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in CompanyDashboard:", error);

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
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { company } = await params;
  const companyName = company.toUpperCase();

  return (
    <>
      <Suspense fallback={<LoadingDashboard companyName={companyName} />}>
        <CompanyDashboard company={company} />
      </Suspense>
      <Footer />
    </>
  );
}
