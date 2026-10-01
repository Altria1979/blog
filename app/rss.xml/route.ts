import { rssResponse } from "@/lib/rss";
export const dynamic = "force-static";
export function GET() { return rssResponse("zh"); }
