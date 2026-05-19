import { action } from "./_generated/server";
import { v } from "convex/values";

function uint8ArrayToBase64(uint8: Uint8Array): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  const len = uint8.length;
  for (let i = 0; i < len; i += 3) {
    const chunk = (uint8[i] << 16) | 
                  (i + 1 < len ? uint8[i + 1] << 8 : 0) | 
                  (i + 2 < len ? uint8[i + 2] : 0);
                  
    result += chars[(chunk >> 18) & 63];
    result += chars[(chunk >> 12) & 63];
    result += i + 1 < len ? chars[(chunk >> 6) & 63] : '=';
    result += i + 2 < len ? chars[chunk & 63] : '=';
  }
  return result;
}

export const generateAndStoreImage = action({
  args: { 
    promptEn: v.string() 
  },
  handler: async (_ctx, args) => {
    const seed = Math.floor(Math.random() * 9999999);
    const cleanPrompt = args.promptEn.replace(/[^a-zA-Z0-9\s,]/g, '');

    const models = ["flux", "gptimage", "wan-image", ""];
    let lastError: any = null;

    for (const model of models) {
      const modelParam = model ? `&model=${model}` : '';
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?seed=${seed}&nologo=true&width=512&height=512${modelParam}`;

      console.log(`Generating image server-side via Pollinations (Model: "${model || 'default'}"): "${cleanPrompt}"`);

      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Pollinations HTTP error! Status: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Convert to Base64 using mathematically correct RFC 4648 encoder
        const base64String = uint8ArrayToBase64(uint8Array);
        const dataUrl = `data:image/png;base64,${base64String}`;

        console.log(`Successfully generated and converted image to Base64 string (Length: ${dataUrl.length}) using Model: "${model || 'default'}"`);
        return { dataUrl };
      } catch (err: any) {
        console.warn(`Attempt with Model "${model || 'default'}" failed: ${err.message}`);
        lastError = err;
        // Continue to the next model immediately
      }
    }

    throw new Error(`Failed to generate image after trying all models. Last error: ${lastError?.message}`);
  },
});
