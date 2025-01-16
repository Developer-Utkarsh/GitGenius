import type { VercelRequest, VercelResponse } from "@vercel/node";

const handler = async (request: VercelRequest, response: VercelResponse) => {
  // Set CORS headers
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader(
    "Access-Control-Allow-Origin",
    process.env.VITE_DEV_CLIENT_URL || "http://localhost:8080"
  );
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  if (request.method === "POST") {
    try {
      const { code } = request.body || {};

      if (!code) {
        return response.status(400).json({
          success: false,
          error: "Missing code parameter",
        });
      }

      // Exchange code for token
      const tokenResponse = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            client_id: process.env.VITE_GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: process.env.VITE_GITHUB_REDIRECT_URI,
          }),
        }
      );

      const data = await tokenResponse.json();

      if (data.access_token) {
        return response.status(200).json({
          success: true,
          token: data.access_token,
        });
      }

      return response.status(400).json({
        success: false,
        error: "Failed to get access token",
      });
    } catch (error) {
      console.error("GitHub OAuth Error:", error);
      return response.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  return response.status(405).json({
    success: false,
    error: "Method not allowed",
  });
};

export default handler;
