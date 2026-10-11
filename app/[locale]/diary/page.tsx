import { notFound } from "next/navigation";
import Content from "@/app/_pages/diary";
import { isLocale } from "@/lib/i18n";
import { diaryMetadata } from "@/lib/metadata";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

export async function generateMetadata({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "zh") notFound();
  return diaryMetadata(locale, (await searchParams).page);
}

export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "zh") notFound();
  return <Content locale={locale} pageValue={(await searchParams).page} />;
}
