import { Octokit } from "octokit";

// Initialize Octokit with authentication
export const octokit = new Octokit({
  auth: localStorage.getItem("github_token"),
});

export const isAuthenticated = () => {
  return !!localStorage.getItem("github_token");
};

export const setGithubToken = (token: string) => {
  localStorage.setItem("github_token", token);
  window.location.reload(); // Reload to reinitialize Octokit with the token
};