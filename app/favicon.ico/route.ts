import { blogConfig } from "@/blog.config";

// Browsers may request the fallback icon while a locale navigation updates metadata.
export function GET(request: Request) {
  return Response.redirect(new URL(blogConfig.avatar, request.url), 307);
}
