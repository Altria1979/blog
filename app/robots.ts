import type { MetadataRoute } from "next";
import { blogConfig } from "@/blog.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${blogConfig.url}/sitemap.xml`,
    host: blogConfig.url,
  };
}
