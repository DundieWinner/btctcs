import { MetadataRoute } from "next";
import { baseUrl } from "@/config/environment";
import { companies } from "@/config/companies";

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemap: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contributing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  for (let i = companies.length - 1; i >= 0; i--) {
    const c = companies[i];
    sitemap.push({
      url: `${baseUrl}/c/${c.id}`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    });
  }

  return sitemap;
}
