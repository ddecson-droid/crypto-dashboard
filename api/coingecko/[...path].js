// Vercel Serverless Function — proxies CoinGecko API requests
// Browser → Vercel (this function) → CoinGecko API
// This bypasses the GFW because Vercel servers are outside China

export default async function handler(req, res) {
  // Get the API path from the catch-all route
  // e.g., /api/coingecko/coins/markets → /coins/markets
  const apiPath = req.query.path.join("/");

  // Reconstruct the full CoinGecko URL with query parameters
  const queryString = new URLSearchParams(req.query).toString();
  // Remove the 'path' param since it's not part of the actual API query
  const cleanParams = new URLSearchParams(
    Object.entries(req.query).filter(([key]) => key !== "path")
  ).toString();

  const coinGeckoUrl = `https://api.coingecko.com/api/v3/${apiPath}${cleanParams ? "?" + cleanParams : ""}`;

  try {
    const response = await fetch(coinGeckoUrl, {
      headers: {
        // Mimicking a browser to avoid 403 from CoinGecko
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `CoinGecko returned ${response.status}`,
      });
    }

    const data = await response.json();

    // Set CORS headers so the browser can read the response
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, OPTIONS"
    );
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Failed to fetch from CoinGecko",
    });
  }
}
