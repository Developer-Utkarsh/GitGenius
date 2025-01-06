import { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== "GET") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  const token = request.cookies.github_token;
  const tokenHash = token
    ? Buffer.from(token.slice(-8)).toString("base64")
    : null;

  // Set CORS headers for development
  if (process.env.VITE_ENV === "development") {
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader(
      "Access-Control-Allow-Origin",
      process.env.VITE_DEV_CLIENT_URL || "http://localhost:8080"
    );
  }

  return response.status(200).json({
    authenticated: !!token,
    tokenHash,
  });
}
