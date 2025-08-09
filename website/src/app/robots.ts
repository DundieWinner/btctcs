import { MetadataRoute } from "next";
import { baseUrl } from "@/config/environment";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    host: baseUrl,
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
