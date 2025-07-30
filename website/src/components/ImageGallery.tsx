"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

interface ImageBoardProps {
  images: string[];
  companyName: string;
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

export default function ImageBoard({ images, companyName }: ImageBoardProps) {
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
      {/* Pinterest-style Masonry Grid */}
      <div className="columns-1 sm:columns-2 xl:columns-3 gap-4 space-y-4">
        {images.map((imageUrl, index) => {
          return (
            <div
              key={imageUrl}
              className="break-inside-avoid mb-4 group cursor-pointer"
              onClick={() => openModal(imageUrl)}
            >
              <div className="relative overflow-hidden rounded-lg border border-gray-700 bg-gray-900/50 ">
                <div className="relative">
                  <Image
                    src={imageUrl}
                    alt={`${companyName} chart ${index + 1}`}
                    width={400}
                    height={300}
                    className="w-full h-auto object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
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

      {/* Enhanced Full-screen Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-20 bg-black/70 hover:bg-orange-500/20 text-white hover:text-orange-400 p-3 rounded-full transition-all duration-200 border border-gray-600 hover:border-orange-500"
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

            {/* Previous Button */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/70 hover:bg-orange-500/20 text-white hover:text-orange-400 p-3 rounded-full transition-all duration-200 border border-gray-600 hover:border-orange-500"
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
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/70 hover:bg-orange-500/20 text-white hover:text-orange-400 p-3 rounded-full transition-all duration-200 border border-gray-600 hover:border-orange-500"
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

            {/* Main Image Container */}
            <div className="relative w-full h-full flex items-center justify-center p-16">
              <div className="relative max-w-full max-h-full">
                <Image
                  src={selectedImage}
                  alt={`${companyName} chart`}
                  width={1200}
                  height={800}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  sizes="100vw"
                  priority
                />
              </div>
            </div>
            {/* Keyboard Hints */}
            <div className="absolute top-4 left-4 z-20 bg-black/70 text-gray-300 px-3 py-2 rounded-lg text-sm border border-gray-600">
              <div className="flex gap-4">
                <span>← → Navigate</span>
                <span>Esc Close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
