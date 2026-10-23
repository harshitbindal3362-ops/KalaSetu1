import https from "https";
import { NormalizedMarketProduct } from "./demandPredictor.js";

export class TinyFishService {
  private apiKey: string | null = null;

  constructor(customKey?: string) {
    this.apiKey = customKey || process.env.TINYFISH_API_KEY || null;
  }

  public isConfigured(): boolean {
    const key = this.apiKey || process.env.TINYFISH_API_KEY;
    return Boolean(key && key.trim() !== "" && !key.includes("placeholder"));
  }

  public async searchMarketCompetitors(query: string): Promise<NormalizedMarketProduct[]> {
    const key = (this.apiKey || process.env.TINYFISH_API_KEY || "").trim();
    if (!key) return [];

    return new Promise((resolve) => {
      const sanitizedQuery = encodeURIComponent(query.trim());
      // Target an Indian craft directory or marketplace
      const targetUrl = `https://html.duckduckgo.com/html/?q=${sanitizedQuery}+price+india+amazon+flipkart`;
      const goal = `Find top 4 distinct handcrafted products matching "${query}". Extract their title, price in INR, and seller source (e.g. Amazon, Flipkart, Etsy, CraftsVilla). Output valid JSON array with objects containing title, price, source, and url.`;

      let completedResult = "";
      let isResolved = false;

      const safeResolve = (products: NormalizedMarketProduct[]) => {
        if (!isResolved) {
          isResolved = true;
          resolve(products);
        }
      };

      // Set 12s timeout for fast response
      const timeoutTimer = setTimeout(() => {
        safeResolve([]);
      }, 12000);

      try {
        const postData = JSON.stringify({
          url: targetUrl,
          goal,
        });

        const req = https.request(
          "https://agent.tinyfish.ai/v1/automation/run-sse",
          {
            method: "POST",
            headers: {
              "X-API-Key": key,
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(postData),
            },
          },
          (res) => {
            res.on("data", (chunk: Buffer) => {
              const text = chunk.toString();
              if (text.includes('"type":"COMPLETE"') || text.includes('"result"')) {
                const match = text.match(/"result":\s*({.*?}|\[.*?\])/s);
                if (match) {
                  completedResult = match[1];
                }
              }
            });

            res.on("end", () => {
              clearTimeout(timeoutTimer);
              try {
                if (completedResult) {
                  const parsed = JSON.parse(completedResult);
                  const items = Array.isArray(parsed) ? parsed : parsed.result || parsed.items || [];
                  const normalized: NormalizedMarketProduct[] = items.map((p: any, idx: number) => ({
                    source: p.source || "TinyFish Live Web Search",
                    title: p.title || `${query} Handcrafted Authentic Art`,
                    url: p.url || "https://amazon.in",
                    price: typeof p.price === "number" ? p.price : parseFloat(String(p.price).replace(/[^0-9.]/g, "")) || 899,
                    currency: "INR",
                    rating: p.rating || 4.5,
                    reviews: p.reviews || 24,
                    position: idx + 1,
                    thumbnail: null,
                    match_type: "organic",
                    availability: "available",
                    query,
                  }));
                  safeResolve(normalized);
                  return;
                }
              } catch (e) {
                // fall through
              }
              safeResolve([]);
            });
          }
        );

        req.on("error", () => {
          clearTimeout(timeoutTimer);
          safeResolve([]);
        });

        req.write(postData);
        req.end();
      } catch (err) {
        clearTimeout(timeoutTimer);
        safeResolve([]);
      }
    });
  }
}

export const tinyfishService = new TinyFishService();
