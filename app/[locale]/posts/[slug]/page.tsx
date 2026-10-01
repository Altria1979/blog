import Content, { postMetadata } from "@/app/_pages/post";
import { getPosts } from "@/lib/posts";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
type Props = { params: Promise<{ locale: string; slug: string }> };
export const dynamicParams = true;
export function generateStaticParams({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) return [];
  return getPosts(undefined, params.locale).map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || locale === "zh") notFound();
  return postMetadata(slug, locale);
}
export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || locale === "zh") notFound();
  return <Content slug={slug} locale={locale} />;
}
