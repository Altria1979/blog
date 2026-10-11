import Content from "@/app/_pages/diary";
import { diaryMetadata } from "@/lib/metadata";

type Props = { searchParams: Promise<{ page?: string | string[] }> };

export async function generateMetadata({ searchParams }: Props) {
  return diaryMetadata("zh", (await searchParams).page);
}

export default async function Page({ searchParams }: Props) {
  return <Content locale="zh" pageValue={(await searchParams).page} />;
}
