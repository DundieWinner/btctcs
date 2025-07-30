import type { Metadata } from "next";
import { getCompanyById } from "@/config/companies";
import { baseUrl } from "@/config/environment";
import { fetchCompanyImages } from "@/services/s3Images";

// Generate metadata for each company page
export async function generateCompanyMetadata(
  company: string,
): Promise<Metadata> {
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
  const title = `${companyData.emoji} ${companyData.name} - BTCTCs`;
  const description = `Bitcoin treasury charts and analytics for ${companyData.name}. ${companyData.disclosure || ""} Curated by ${curatorNames}.`;

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
