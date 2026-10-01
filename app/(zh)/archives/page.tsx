import Content from "@/app/_pages/archives";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata("archives", "zh");
export default function Page() { return <Content locale="zh" />; }
