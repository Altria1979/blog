import Content from "@/app/_pages/home";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata("home", "zh");
export default function Page() { return <Content locale="zh" />; }
