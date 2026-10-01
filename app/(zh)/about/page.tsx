import Content from "@/app/_pages/about";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata("about", "zh");
export default function Page() { return <Content locale="zh" />; }
