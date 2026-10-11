import Content from "@/app/_pages/anime";
import { animeMetadata } from "@/lib/metadata";

type Props = { searchParams: Promise<{ range?: string | string[] }> };

export function generateMetadata() {
  return animeMetadata("zh");
}

export default async function Page({ searchParams }: Props) {
  return <Content locale="zh" rangeValue={(await searchParams).range} />;
}
