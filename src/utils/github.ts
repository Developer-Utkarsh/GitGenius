import { Octokit } from "octokit";

let octokit: Octokit;

export const initializeOctokit = () => {
  const token = localStorage.getItem("github_token");
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