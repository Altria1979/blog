export const defaultImageBaseUrl = "https://altria-blog-images-5225758.oss-cn-hongkong.aliyuncs.com";

/** Public image origin only. An explicitly empty override restores local paths. */
export function imageBaseUrl(value = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? defaultImageBaseUrl): string {
  if (!value?.trim()) return "";
  const url = new URL(value.trim());
  if (
    url.protocol !== "https:" || url.username || url.password || url.port ||
    url.pathname !== "/" || url.search || url.hash || url.hostname.includes("*")
  ) {
    throw new Error("NEXT_PUBLIC_IMAGE_BASE_URL must be an HTTPS origin without a path, port, credentials, query, or fragment.");
  }
  return url.origin;
}

/** Keep Markdown paths stable when switching to an external image origin. */
export function imageUrl(src: string, base = imageBaseUrl()): string {
  if (!base || !src.startsWith("/images/")) return src;
  if (/[\\\s?#]/.test(src) || /%2f|%5c/i.test(src)) return src;
  const parsed = new URL(src, "https://local.invalid");
  if (parsed.pathname !== src) return src;
  return `${imageBaseUrl(base)}${src}`;
}

export function imageRemotePatterns(base = imageBaseUrl()) {
  if (!base) return [];
  return [{
    protocol: "https" as const,
    hostname: new URL(imageBaseUrl(base)).hostname,
    port: "",
    pathname: "/images/**",
    search: "",
  }];
}

export type ImageAsset = {
  width: number;
  height: number;
  bytes: number;
  sha256: string;
  contentType: string;
};

export type ImageAssets = Record<string, ImageAsset>;

export function imageAssetDimensions(src: string, assets: ImageAssets) {
  const asset = assets[src];
  if (!asset || !Number.isInteger(asset.width) || !Number.isInteger(asset.height) ||
    asset.width <= 0 || asset.height <= 0) return undefined;
  return { width: asset.width, height: asset.height };
}
