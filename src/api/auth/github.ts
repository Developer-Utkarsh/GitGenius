import type { VercelRequest, VercelResponse } from "@vercel/node";

interface TokenResponse {
  access_token?: string;
}

const handler = async (request: VercelRequest, response: VercelResponse) => {
  // Set CORS headers
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader(
    "Access-Control-Allow-Origin",
    process.env.VITE_DEV_CLIENT_URL || "http://localhost:8080"
  );
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (request.method === "OPTIONS") {
    return response.status(200).end();
  }

  if (request.method === "POST") {
    try {
      const { code } = request.body;

      if (!code) {
        return response.status(400).json({
          success: false,
          error: "Missing code parameter",
        });
      }

      // ... rest of your GitHub OAuth logic ...

      return response.status(200).json({
        success: true,
      });
    } catch (error) {
      console.error("GitHub OAuth Error:", error);
      return response.status(500).json({
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return response.status(405).json({
    success: false,
    error: "Method not allowed",
  });
};

export default handler;
