"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface ImageBoardProps {
  images: string[];
  companyName: string;
  variant: "main-charts" | "accent-charts";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getImageTitle(imageUrl: string, index: number): string {
  const filename = imageUrl.split("/").pop() || "";
  const nameWithoutExtension = filename.replace(/\.[^/.]+$/, "");

  // Remove company prefix and clean up the name
  const cleanName = nameWithoutExtension
    .replace(/^[^_]*_/, "") // Remove company prefix
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalize words

  return cleanName || `Chart ${index + 1}`;
}

export default function ImageBoard({
  images,
  companyName,
  variant,
}: ImageBoardProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const closeModal = () => {
    setSelectedImage(null);
  };

  const openModal = (imageUrl: string) => {
    const index = images.indexOf(imageUrl);
    setCurrentIndex(index);
    setSelectedImage(imageUrl);
  };

  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setSelectedImage(images[newIndex]);
  }, [currentIndex, images]);

  const goToNext = useCallback(() => {
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    setSelectedImage(images[newIndex]);
  }, [currentIndex, images]);

  // Disable body scrolling when modal is open
  useEffect(() => {
    if (selectedImage) {
      // Store original overflow value
      const originalOverflow = document.body.style.overflow;
      // Disable scrolling
      document.body.style.overflow = "hidden";

      // Cleanup function to restore scrolling when modal closes
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [selectedImage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!selectedImage) return;

      switch (event.key) {
        case "Escape":
          closeModal();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [selectedImage, currentIndex, goToNext, goToPrevious]);

  if (images.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <p className="text-gray-300 text-lg">
          No images found for {companyName}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile: Horizontal Scroll, Desktop: Masonry Grid */}
      {/* Mobile Horizontal Scroll */}
      <div className="sm:hidden">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {images.map((imageUrl, index) => {
            return (
              <div
                key={imageUrl}
                className="flex-shrink-0 w-80 group cursor-pointer"
                onClick={() => openModal(imageUrl)}
              >
                <div className="relative overflow-hidden rounded-lg border border-gray-700 bg-gray-900/50">
                  <div className="relative">
                    <Image
                      src={imageUrl}
                      alt={`${companyName} chart ${index + 1}`}
                      width={800}
                      height={600}
                      className="w-full h-auto object-cover"
                      sizes="800px"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop: Pinterest-style Masonry Grid */}
      <div className="hidden sm:block">
        <div
          className={`columns-1 sm:columns-2 ${variant === "accent-charts" ? "lg:columns-3" : ""} gap-4 space-y-4`}
        >
          {images.map((imageUrl, index) => {
            return (
              <div
                key={imageUrl}
                className="break-inside-avoid mb-4 group cursor-pointer"
                onClick={() => openModal(imageUrl)}
              >
                <div className="relative overflow-hidden rounded-lg border border-gray-700 bg-gray-900/50">
                  <div className="relative">
                    <Image
                      src={imageUrl}
                      alt={`${companyName} chart ${index + 1}`}
                      width={400}
                      height={300}
                      className="w-full h-auto object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Full-screen Modal with Pinch-to-Zoom */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-30 bg-black/80 hover:bg-orange-500/20 text-white hover:text-orange-400 p-3 rounded-full transition-all duration-200 border border-gray-600 hover:border-orange-500 shadow-lg"
              title="Close (Esc)"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Navigation Buttons - Top Left */}
            <div className="absolute top-4 left-4 z-30 flex gap-2">
              {/* Previous Button */}
              <button
                onClick={goToPrevious}
                className="bg-black/80 hover:bg-orange-500/20 text-white hover:text-orange-400 p-3 rounded-full transition-all duration-200 border border-gray-600 hover:border-orange-500 shadow-lg"
                title="Previous (←)"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* Next Button */}
              <button
                onClick={goToNext}
                className="bg-black/80 hover:bg-orange-500/20 text-white hover:text-orange-400 p-3 rounded-full transition-all duration-200 border border-gray-600 hover:border-orange-500 shadow-lg"
                title="Next (→)"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Enhanced Image Container with Pinch-to-Zoom */}
            <div
              className="relative w-full h-full flex items-center justify-center p-4 sm:p-8 md:p-12 lg:p-16 overflow-hidden"
              style={{
                touchAction: "pan-x pan-y pinch-zoom",
              }}
            >
              <div
                className="relative w-full h-full flex items-center justify-center"
                style={{
                  maxWidth: "100vw",
                  maxHeight: "100vh",
                }}
              >
                <Image
                  src={selectedImage}
                  alt={`${companyName} chart`}
                  fill
                  className="object-contain rounded-lg shadow-2xl"
                  sizes="100vw"
                  priority
                  style={{
                    width: "100%",
                    height: "100%",
                    maxWidth: "none",
                    maxHeight: "none",
                  }}
                />
              </div>
            </div>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-black/80 text-gray-300 px-4 py-2 rounded-lg text-sm border border-gray-600 shadow-lg">
              <span>
                {currentIndex + 1} of {images.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
