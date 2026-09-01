/**
 * Vercel serverless proxy for the National Park Service API.
 * Keeps NPS_API_KEY server-side (never expose via VITE_).
 *
 * Client continues to call /nps/... ; vercel.json rewrites that to this function.
 * Successful GETs are CDN-cached so repeat searches / Field Log loads
 * do not each burn an NPS API call.
 */
/// <reference types="node" />

export const config = {
  runtime: "edge",
};

const NPS_API_BASE = "https://developer.nps.gov/api/v1";

/** Fresh at the CDN for 1 hour; may serve stale up to 24h while revalidating. */
const CACHE_CONTROL =
  "public, s-maxage=3600, stale-while-revalidate=86400";

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers: { Allow: "GET" } },
    );
  }

  const apiKey = process.env.NPS_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "NPS_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const incoming = new URL(request.url);
  // Rewrite may leave pathname as /nps/parks or /api/nps/parks depending on runtime.
  const resourcePath = incoming.pathname
    .replace(/^\/api\/nps\/?/i, "")
    .replace(/^\/nps\/?/i, "")
    .replace(/\/+/g, "/")
    .replace(/^\//, "");

  if (!resourcePath || resourcePath.includes("..")) {
    return Response.json(
      {
        error: "Invalid path",
        pathname: incoming.pathname,
      },
      { status: 400 },
    );
  }

  const upstream = new URL(`${NPS_API_BASE}/${resourcePath}`);
  incoming.searchParams.forEach((value, key) => {
    upstream.searchParams.append(key, value);
  });

  try {
    const response = await fetch(upstream.toString(), {
      headers: {
        Accept: "application/json",
        "X-Api-Key": apiKey,
      },
    });

    const body = await response.text();
    const headers: Record<string, string> = {
      "Content-Type":
        response.headers.get("Content-Type") ?? "application/json",
    };

    // Only cache successful upstream responses (keyed by full request URL).
    if (response.ok) {
      headers["Cache-Control"] = CACHE_CONTROL;
      headers["Vercel-CDN-Cache-Control"] = "max-age=3600";
    } else {
      headers["Cache-Control"] = "no-store";
    }

    return new Response(body, {
      status: response.status,
      headers,
    });
  } catch {
    return Response.json(
      { error: "Upstream NPS request failed" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
