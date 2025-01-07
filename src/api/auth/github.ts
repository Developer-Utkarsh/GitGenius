import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method === "POST") {
    const { code } = request.body;

    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");

    try {
      const tokenResponse = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
          }),
        }
      );

      const data = await tokenResponse.json();
      if (data.access_token) {
        return response.status(200).json({ token: data.access_token });
      }

      return response.status(400).json({ error: "Failed to get access token" });
    } catch (error) {
      console.error("GitHub OAuth Error:", error);
      return response.status(500).json({ error: "Internal server error" });
    }
  }

  return response.status(405).json({ error: "Method not allowed" });
}
