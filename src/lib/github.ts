import { Octokit } from "@octokit/rest";

export function getOctokit() {
  const token = localStorage.getItem("github_token");

  if (!token) {
    throw new Error("No GitHub token found");
  }

  return new Octokit({
    auth: token,
  });
}

export async function fetchUserData() {
  const octokit = getOctokit();
  try {
    const { data } = await octokit.rest.users.getAuthenticated();
    return data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}
