import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/api/image",
  method: "GET",
  handler: httpAction(async (_ctx, request) => {
    const url = new URL(request.url);
    const prompt = url.searchParams.get("prompt");
    const seed = url.searchParams.get("seed") || Math.floor(Math.random() * 9999999).toString();

    if (!prompt) {
      return new Response("Missing 'prompt' parameter", {
        status: 400,
        headers: new Headers({
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "text/plain"
        })
      });
    }

    const cleanPrompt = prompt.replace(/[^a-zA-Z0-9\s,]/g, '');
    
    // We try multiple channels from the server side as well, to bypass any IP blocking on AWS.
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?seed=${seed}&nologo=true&width=512&height=512&model=turbo`;
    const channels = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(pollinationsUrl)}`,
      `https://wsrv.nl/?url=${encodeURIComponent(pollinationsUrl)}&we=1&il=1&t=${seed}`,
      pollinationsUrl // Direct as last resort
    ];
    
    let lastError: any = null;

    for (const fetchUrl of channels) {
      console.log(`Convex Proxy Endpoint: Fetching via channel: ${fetchUrl.substring(0, 40)}...`);

      try {
        const response = await fetch(fetchUrl);

        if (!response.ok) {
          throw new Error(`Channel HTTP error! Status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type") || "image/png";
        
        // Ensure we actually got an image back, not a JSON error or HTML block page
        if (!contentType.includes("image")) {
          throw new Error(`Invalid content type returned: ${contentType}`);
        }

        const body = response.body;

        console.log(`Convex Proxy Endpoint: Successfully fetched image!`);
        return new Response(body, {
          headers: new Headers({
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400",
            "Access-Control-Allow-Origin": "*",
          }),
        });
      } catch (error: any) {
        console.warn(`Convex Proxy Endpoint channel failed: ${error.message}`);
        lastError = error;
      }
    }

    console.error(`Convex Proxy Endpoint Error: Failed after trying all models. Last error: ${lastError?.message}`);
    return new Response(`Proxy Error: Failed after trying all models. Last error: ${lastError?.message}`, {
      status: 500,
      headers: new Headers({
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/plain"
      })
    });
  }),
});

// Handle OPTIONS CORS preflight requests
http.route({
  path: "/api/image",
  method: "OPTIONS",
  handler: httpAction(async (_ctx, _request) => {
    return new Response(null, {
      status: 204,
      headers: new Headers({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      }),
    });
  }),
});

export default http;
