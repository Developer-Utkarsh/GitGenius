import { Octokit } from "octokit";

let octokit: Octokit;

export const initializeOctokit = () => {
  const token = localStorage.getItem("github_token");
  octokit = new Octokit({
    auth: token,
  });
};

// Initialize on load
initializeOctokit();

export { octokit };

export const isAuthenticated = () => {
  return !!localStorage.getItem("github_token");
};

export const setGithubToken = (token: string) => {
  localStorage.setItem("github_token", token);
  initializeOctokit();
  window.location.reload();
};