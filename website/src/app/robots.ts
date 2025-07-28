import { MetadataRoute } from "next";
import { uiHost } from "@/config/environment";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    host: uiHost,
    sitemap: `${uiHost}/sitemap.xml`,
  };
}
