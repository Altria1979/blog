import { handleTrafficRequest } from "@/lib/traffic-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV !== "production") {
    return Response.json({ error: "Traffic statistics unavailable" }, {
      status: 403, headers: { "Cache-Control": "no-store" },
    });
  }
  return handleTrafficRequest(request);
}
