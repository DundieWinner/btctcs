import React, { Suspense } from "react";
import type { Metadata } from "next";
import Footer from "@/components/Footer";
import ImageBoard from "@/components/ImageGallery";
import { GenericChart } from "@/components/GenericChart";
import KeyStatistics from "@/components/KeyStatistics";
import GoogleSheetsSection from "@/components/GoogleSheetsSection";
import CompanyNavigation from "@/components/CompanyNavigation";
import CompanyHeader from "@/components/CompanyHeader";
import CuratorsSection from "@/components/CuratorsSection";
import LoadingDashboard from "@/components/LoadingDashboard";
import ErrorDashboard from "@/components/ErrorDashboard";
import { getCompanyById } from "@/config/companies";
import { type KeyStatistic } from "@/config/types";
import {
  type ProcessedExtraction,
  processGoogleSheetExtractions,
} from "@/services/googleSheets";
import { fetchCompanyImages } from "@/services/s3Images";
import { getChartExtractions } from "@/utils/chartHelpers";
import { generateCompanyMetadata } from "@/utils/metadataHelpers";

// Revalidate this page every 5 minutes (300 seconds)
export const revalidate = 300;

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
  return generateCompanyMetadata(company);
}

// Main dashboard component
async function CompanyDashboard({ company }: { company: string }) {
  const companyData = getCompanyById(company);
  const companyName = companyData?.name || company;

  try {
    // Fetch both S3 images and Google Sheets data
    const images = await fetchCompanyImages(company);

    // Check if this company has Google Sheets configuration
    let extractedData: ProcessedExtraction[] = [];

    if (companyData?.googleSheet?.extractions) {
      extractedData = await processGoogleSheetExtractions(
        companyData.googleSheet.extractions,
      );
    }

    // Separate extractions by render location
    const topExtractions = extractedData.filter((extraction) => {
      const config = companyData?.googleSheet?.extractions.find(
        (e) => e.id === extraction.id,
      );
      return !config?.renderLocation || config.renderLocation === "top";
    });

    const sidebarExtractions = extractedData.filter((extraction) => {
      const config = companyData?.googleSheet?.extractions.find(
        (e) => e.id === extraction.id,
      );
      return config?.renderLocation === "sidebar";
    });

    const bottomExtractions = extractedData.filter((extraction) => {
      const config = companyData?.googleSheet?.extractions.find(
        (e) => e.id === extraction.id,
      );
      return config?.renderLocation === "bottom";
    });

    // Collect all key statistics from all extractions
    const allKeyStatistics: KeyStatistic[] = [];
    extractedData.forEach((extraction) => {
      if (extraction.keyStatistics) {
        allKeyStatistics.push(...extraction.keyStatistics);
      }
    });

    // Get chart extractions
    const chartExtractions = getChartExtractions(extractedData, companyData);

    return (
      <div className="min-h-screen p-3 sm:py-8">
        <div className="max-w-[115rem] mx-auto px-2 sm:px-6 lg:px-8">
          {/* Header */}
          <CompanyHeader
            company={company}
            companyData={companyData}
            companyName={companyName}
          />

          {/* Key Statistics from all extractions */}
          {allKeyStatistics.length > 0 && (
            <KeyStatistics keyStatistics={allKeyStatistics} />
          )}

          {/* Top Google Sheets Data */}
          {topExtractions.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <GoogleSheetsSection extractions={topExtractions} />
            </div>
          )}

          {/* Main Content Area with Responsive Layout */}
          <div className={"flex flex-col xl:flex-row gap-6 lg:gap-8"}>
            {/* Main Content */}
            <div className={"flex-1"}>
              {/* Generic Charts */}
              {chartExtractions.map(({ extraction, config }) => (
                <GenericChart
                  key={extraction.id}
                  data={extraction.data!}
                  config={config}
                  title={extraction.title}
                />
              ))}

              {/* Images Swiper */}
              <ImageBoard images={images} companyName={companyName} />
            </div>

            {/* Sidebar - Responsive */}
            <div className="w-full xl:w-96 2xl:w-130 flex-shrink-0 flex flex-col gap-6">
              {sidebarExtractions.length > 0 && (
                <GoogleSheetsSection extractions={sidebarExtractions} />
              )}

              {/* Curators */}
              <CuratorsSection companyData={companyData} />
            </div>
          </div>

          {/* Bottom Google Sheets Data */}
          {bottomExtractions.length > 0 && (
            <div className="mt-6 sm:mt-8">
              <GoogleSheetsSection extractions={bottomExtractions} />
            </div>
          )}

          {/* Company Navigation Grid */}
          <CompanyNavigation currentCompanyId={company} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in CompanyDashboard:", error);
    return <ErrorDashboard companyName={companyName} error={error as Error} />;
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
