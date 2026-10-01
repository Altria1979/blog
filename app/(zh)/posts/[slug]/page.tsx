import Content, { postMetadata } from "@/app/_pages/post";
import { getPosts } from "@/lib/posts";
type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = true;
export function generateStaticParams() { return getPosts().map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props) { return postMetadata((await params).slug, "zh"); }
export default async function Page({ params }: Props) { return <Content slug={(await params).slug} locale="zh" />; }
