import { Octokit } from "octokit";

let octokit: Octokit;

const GITHUB_CLIENT_ID = "your_github_client_id"; // Replace with your actual GitHub OAuth App client ID
const GITHUB_REDIRECT_URI = `${window.location.origin}/`;

export const initializeOctokit = (token?: string) => {
  octokit = new Octokit({
    auth: token,
    retry: {
      enabled: true,
      retries: 3,
    },
    throttle: {
      onRateLimit: (retryAfter: number, options: any) => {
        console.warn(`Request quota exhausted for request ${options.method} ${options.url}`);
        if (options.request.retryCount <= 2) {
          console.log(`Retrying after ${retryAfter} seconds!`);
          return true;
        }
      },
      onSecondaryRateLimit: (retryAfter: number, options: any) => {
        console.warn(`Secondary rate limit hit for request ${options.method} ${options.url}`);
        if (options.request.retryCount <= 2) {
          console.log(`Retrying after ${retryAfter} seconds!`);
          return true;
        }
      },
    },
  });
};

export const initiateGitHubLogin = () => {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_REDIRECT_URI,
    scope: 'read:user repo',
  });
  
  window.location.href = `https://github.com/login/oauth/authorize?${params}`;
};

export const handleOAuthCallback = async (code: string) => {
  try {
    const response = await fetch('your_backend_endpoint/github/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });
    
    const data = await response.json();
    if (data.access_token) {
      localStorage.setItem('github_token', data.access_token);
      initializeOctokit(data.access_token);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error during GitHub OAuth:', error);
    return false;
  }
};

// Initialize on load with existing token
initializeOctokit(localStorage.getItem("github_token") || undefined);

export { octokit };

export const isAuthenticated = () => {
  return !!localStorage.getItem("github_token");
};

export const logout = () => {
  localStorage.removeItem("github_token");
  window.location.reload();
};