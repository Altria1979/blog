import Content from "@/app/_pages/anime";
import { animeMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return animeMetadata("zh");
}

export default function Page() {
  return <Content locale="zh" />;
}
