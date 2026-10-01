import { SiteLayout, siteMetadata, siteViewport } from "@/components/site-layout";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };
export const viewport = siteViewport;
export const dynamicParams = false;
export function generateStaticParams() { return [{ locale: "en" }, { locale: "ja" }]; }
export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "zh") notFound();
  return siteMetadata(locale);
}
export default async function Layout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "zh") notFound();
  return <SiteLayout locale={locale}>{children}</SiteLayout>;
}
