import { notFound } from "next/navigation";
import Content from "@/app/_pages/anime";
import { isLocale } from "@/lib/i18n";
import { animeMetadata } from "@/lib/metadata";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ range?: string | string[] }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "zh") notFound();
  return animeMetadata(locale);
}

export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "zh") notFound();
  return <Content locale={locale} rangeValue={(await searchParams).range} />;
}
