import { Octokit } from "octokit";

let octokit: Octokit | null = null;

const isDevelopment = import.meta.env.VITE_ENV === "development";
const API_URL = isDevelopment
  ? import.meta.env.VITE_DEV_API_URL
  : import.meta.env.VITE_PROD_API_URL;

const TOKEN_KEY = "github_token";

export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  initializeOctokit(token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  octokit = null;
};

export const initializeOctokit = (token?: string) => {
  const authToken = token || getToken();
  if (!authToken) return null;

  octokit = new Octokit({
    auth: authToken,
    retry: { enabled: true, retries: 3 },
  });

  return octokit;
};

export const getOctokit = () => {
  if (!octokit) {
    const token = getToken();
    if (token) {
      initializeOctokit(token);
    }
  }
  return octokit;
};

export const isAuthenticated = () => {
  const token = getToken();
  if (token && !octokit) {
    initializeOctokit(token);
  }
  return !!token;
};

export { octokit };

export const handleOAuthCallback = async (code: string) => {
  try {
    const response = await fetch(`${API_URL}/auth/github`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const { token } = await response.json();
    if (token) {
      setToken(token);
      return true;
    }
    return false;
  } catch (error) {
    console.error("GitHub OAuth Error:", error);
    return false;
  }
};

export const logout = () => {
  clearToken();
  window.location.href = "/";
};

export const initiateGitHubLogin = () => {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_GITHUB_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_GITHUB_REDIRECT_URI,
    scope: "read:user repo",
  });

  window.location.href = `https://github.com/login/oauth/authorize?${params}`;
};
