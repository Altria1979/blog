import { SiteLayout, siteMetadata, siteViewport } from "@/components/site-layout";
export const metadata = siteMetadata("zh");
export const viewport = siteViewport;
export default function Layout({ children }: { children: React.ReactNode }) {
  return <SiteLayout locale="zh">{children}</SiteLayout>;
}
