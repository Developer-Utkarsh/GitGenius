import { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method === "POST") {
    response.setHeader(
      "Set-Cookie",
      "github_token=; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
    );
    return response.status(200).json({ success: true });
  }

  return response.status(405).json({ error: "Method not allowed" });
}
