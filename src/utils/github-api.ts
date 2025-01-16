import { getOctokit } from "./github";

const octokit = getOctokit();

export interface RateLimitInfo {
  remaining: number;
  limit: number;
  reset: Date;
}

export async function checkGitHubAccess() {
  try {
    const [rateLimit, userResponse] = await Promise.all([
      octokit.request("GET /rate_limit"),
      octokit.request("GET /user"),
    ]);

    const rateLimitInfo: RateLimitInfo = {
      remaining: rateLimit.data.rate.remaining,
      limit: rateLimit.data.rate.limit,
      reset: new Date(rateLimit.data.rate.reset * 1000),
    };

    return {
      isAuthenticated: true,
      scope: userResponse.headers["x-oauth-scopes"]?.split(", ") || [],
      rateLimit: rateLimitInfo,
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      scope: [],
      rateLimit: null,
    };
  }
}
