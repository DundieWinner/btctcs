import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { s3AccessKey, s3Secret } from "@/config/environment-be";

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
export const fetchCompanyImages = async (
  companyId: string,
): Promise<string[]> => {
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
