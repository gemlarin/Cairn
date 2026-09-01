/**
 * Vercel serverless proxy for the National Park Service API.
 * Keeps NPS_API_KEY server-side (never expose via VITE_).
 *
 * Client continues to call /nps/... ; vercel.json rewrites that to this function.
 */
export const config = {
  runtime: "edge",
};

const NPS_API_BASE = "https://developer.nps.gov/api/v1";

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
    return new Response(body, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch {
    return Response.json(
      { error: "Upstream NPS request failed" },
      { status: 502 },
    );
  }
}
