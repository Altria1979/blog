import Content from "@/app/_pages/archives";
import { pageMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "zh") notFound();
  return pageMetadata("archives", locale);
}
export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "zh") notFound();
  return <Content locale={locale} />;
}
