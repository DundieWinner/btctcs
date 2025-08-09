// Base URL for the application
export const baseUrl =
  process.env.NEXT_PUBLIC_HOST ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NODE_ENV === "production"
      ? "https://btctcs.com"
      : "http://localhost:3000");

// Helper function to create absolute URLs
export const getAbsoluteUrl = (path: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${baseUrl}/${cleanPath}`;
};
