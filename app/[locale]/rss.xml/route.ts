import { rssResponse } from "@/lib/rss";
import { isLocale } from "@/lib/i18n";
export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() { return [{ locale: "en" }, { locale: "ja" }]; }
export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "zh") return new Response(null, { status: 404 });
  return rssResponse(locale);
}
