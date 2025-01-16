import { Octokit } from "@octokit/rest";
import { graphql } from "@octokit/graphql";

const isDevelopment = import.meta.env.VITE_ENV === "development";
const API_URL = isDevelopment
  ? import.meta.env.VITE_DEV_API_URL
  : import.meta.env.VITE_PROD_API_URL;

let octokitInstance: Octokit | null = null;

export const setToken = (token: string) => {
  localStorage.setItem("github_token", token);
  initializeOctokit(token);
};

export const getToken = () => localStorage.getItem("github_token");

export const clearToken = () => {
  localStorage.removeItem("github_token");
  octokitInstance = null;
};

export const initializeOctokit = (token?: string) => {
  const authToken = token || getToken();
  if (!authToken) return null;

  octokitInstance = new Octokit({
    auth: authToken,
    retry: { enabled: true, retries: 3 },
  });

  return octokitInstance;
};

export const getOctokit = () => {
  if (!octokitInstance) {
    const token = getToken();
    if (token) {
      initializeOctokit(token);
    }
  }
  return octokitInstance;
};

// Helper functions
const calculateAverageResolutionTime = (issues: any[]) => {
  if (!issues?.length) return 0;
  return (
    issues.reduce((acc, issue) => {
      if (issue.closed_at) {
        const created = new Date(issue.created_at);
        const closed = new Date(issue.closed_at);
        return acc + (closed.getTime() - created.getTime());
      }
      return acc;
    }, 0) / issues.filter((i) => i.closed_at).length
  );
};

function calculateComprehensiveStats(
  detailedRepos: any[],
  contributionsData: any,
  socialData: any
) {
  return {
    overview: {
      totalRepositories: detailedRepos.length,
      totalStars: detailedRepos.reduce(
        (acc, repo) => acc + (repo.stargazers_count || 0),
        0
      ),
      totalWatchers: detailedRepos.reduce(
        (acc, repo) => acc + (repo.watchers_count || 0),
        0
      ),
      totalForks: detailedRepos.reduce(
        (acc, repo) => acc + (repo.forks_count || 0),
        0
      ),
      totalSize: detailedRepos.reduce((acc, repo) => acc + (repo.size || 0), 0),
    },

    contributions: {
      total:
        contributionsData?.user?.contributionsCollection
          ?.totalCommitContributions || 0,
      commits:
        contributionsData?.user?.contributionsCollection
          ?.totalCommitContributions || 0,
      issues:
        contributionsData?.user?.contributionsCollection
          ?.totalIssueContributions || 0,
      pullRequests:
        contributionsData?.user?.contributionsCollection
          ?.totalPullRequestContributions || 0,
      reviews:
        contributionsData?.user?.contributionsCollection
          ?.totalPullRequestReviewContributions || 0,
      calendar:
        contributionsData?.user?.contributionsCollection
          ?.contributionCalendar || {},
    },

    repositories: {
      owned: detailedRepos.filter((repo) => !repo.fork).length,
      forked: detailedRepos.filter((repo) => repo.fork).length,
      private: detailedRepos.filter((repo) => repo.private).length,
      public: detailedRepos.filter((repo) => !repo.private).length,
      starredByUser: socialData?.starred?.length || 0,
    },

    languages: {
      primary: Object.entries(
        detailedRepos.reduce((acc, repo) => {
          if (repo.language) {
            acc[repo.language] = (acc[repo.language] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>)
      ).sort((a, b) => Number(b[1]) - Number(a[1])),

      distribution: detailedRepos.reduce((acc, repo) => {
        if (repo.detailed_languages) {
          Object.entries(repo.detailed_languages).forEach(([lang, bytes]) => {
            acc[lang] = (acc[lang] || 0) + Number(bytes);
          });
        }
        return acc;
      }, {} as Record<string, number>),

      evolution: detailedRepos.reduce((acc, repo) => {
        const year = new Date(repo.created_at).getFullYear();
        if (repo.language) {
          acc[year] = acc[year] || {};
          acc[year][repo.language] = (acc[year][repo.language] || 0) + 1;
        }
        return acc;
      }, {} as Record<number, Record<string, number>>),
    },

    activity: {
      commitFrequency: detailedRepos.reduce((acc, repo) => {
        if (repo.activity_stats?.code_frequency) {
          repo.activity_stats.code_frequency.forEach(
            ([timestamp, additions, deletions]: number[]) => {
              const date = new Date(timestamp * 1000)
                .toISOString()
                .split("T")[0];
              acc[date] = (acc[date] || 0) + additions - deletions;
            }
          );
        }
        return acc;
      }, {} as Record<string, number>),

      peakHours: detailedRepos.reduce((acc, repo) => {
        if (repo.activity_stats?.punch_card) {
          repo.activity_stats.punch_card.forEach(
            ([day, hour, count]: number[]) => {
              acc[hour] = (acc[hour] || 0) + count;
            }
          );
        }
        return acc;
      }, {} as Record<number, number>),

      participation: detailedRepos.reduce((acc, repo) => {
        if (repo.activity_stats?.participation?.all) {
          repo.activity_stats.participation.all.forEach(
            (count: number, week: number) => {
              acc[week] = (acc[week] || 0) + count;
            }
          );
        }
        return acc;
      }, {} as Record<number, number>),
    },

    codeQuality: {
      repositories: detailedRepos.map((repo) => ({
        name: repo.name,
        metrics: {
          complexity: {
            filesCount: repo.size,
            branchesCount: repo.detailed_branches?.length || 0,
            averageFileSize: repo.size / (repo.detailed_branches?.length || 1),
            commitDensity:
              (repo.detailed_commits?.length || 0) / (repo.size || 1),
          },
          documentation: {
            hasReadme: Boolean(repo.readme),
            readmeLength: repo.readme?.length || 0,
            hasWiki: repo.has_wiki,
            topics: repo.topics?.length || 0,
          },
          maintenance: {
            isArchived: repo.archived,
            daysSinceLastUpdate: Math.floor(
              (Date.now() -
                new Date(repo.pushed_at || repo.updated_at).getTime()) /
                (1000 * 60 * 60 * 24)
            ),
            openIssuesCount: repo.open_issues_count,
            hasLicense: Boolean(repo.license),
          },
        },
      })),

      overall: {
        averageIssueResolutionTime:
          detailedRepos.reduce(
            (acc, repo) =>
              acc + calculateAverageResolutionTime(repo.detailed_issues || []),
            0
          ) / detailedRepos.length,

        prMergeRate:
          detailedRepos.reduce((acc, repo) => {
            const total = repo.detailed_pulls?.length || 0;
            const merged =
              repo.detailed_pulls?.filter((pr: any) => pr.merged_at)?.length ||
              0;
            return acc + (total ? merged / total : 0);
          }, 0) / detailedRepos.length,

        documentationRate:
          detailedRepos.filter((repo) => repo.readme).length /
          detailedRepos.length,

        maintainedRepositories: detailedRepos.filter(
          (repo) =>
            !repo.archived &&
            new Date(repo.pushed_at || repo.updated_at).getTime() >
              Date.now() - 180 * 24 * 60 * 60 * 1000
        ).length,
      },
    },
  };
}

export function isAuthenticated(): boolean {
  const token = localStorage.getItem("github_token");
  return !!token;
}

export const handleOAuthCallback = async (code: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/auth/github`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();
    if (data.token) {
      localStorage.setItem("github_token", data.token);
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
    scope: "read:user repo user:email",
  });

  window.location.href = `https://github.com/login/oauth/authorize?${params}`;
};

// Add function to fetch comprehensive user data for Gemini AI
export const fetchUserDataForAI = async (username: string) => {
  const octokit = getOctokit();
  if (!octokit) throw new Error("Not authenticated");

  try {
    const [user, repos, contributions] = await Promise.all([
      octokit.users.getByUsername({ username }),
      octokit.repos.listForUser({ username, per_page: 100 }),
      fetchUserContributions(username),
    ]);

    return {
      profile: user.data,
      repositories: repos.data,
      contributions,
      // Add more data based on Model.md requirements
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

async function fetchUserContributions(username: string) {
  const octokit = getOctokit();
  if (!octokit) throw new Error("Not authenticated");

  const contributionsQuery = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
          restrictedContributionsCount
          hasAnyContributions
        }
        repositories(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}) {
          nodes {
            name
            languages(first: 10) {
              edges {
                size
                node {
                  name
                }
              }
            }
          }
        }
      }
    }
  `;

  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${getToken()}`,
    },
  });

  return await graphqlWithAuth(contributionsQuery, { username });
}

async function fetchDetailedRepoData(owner: string, repo: string) {
  const octokit = getOctokit();
  if (!octokit) throw new Error("Not authenticated");

  const [
    repoDetails,
    languages,
    commits,
    pulls,
    issues,
    contributors,
    readme,
    branches,
  ] = await Promise.all([
    octokit.repos.get({ owner, repo }),
    octokit.repos.listLanguages({ owner, repo }),
    octokit.repos.getCommitActivityStats({ owner, repo }),
    octokit.pulls.list({ owner, repo, state: "all" }),
    octokit.issues.listForRepo({ owner, repo, state: "all" }),
    octokit.repos.listContributors({ owner, repo }),
    octokit.repos.getReadme({ owner, repo }).catch(() => null),
    octokit.repos.listBranches({ owner, repo }),
  ]);

  return {
    ...repoDetails.data,
    detailed_languages: languages.data,
    activity_stats: {
      code_frequency: commits.data,
      pulls: pulls.data,
      issues: issues.data,
      contributors: contributors.data,
    },
    readme: readme?.data.content,
    branches: branches.data,
  };
}

interface ContributionsResponse {
  user: {
    contributionsCollection: {
      totalCommitContributions: number;
      totalIssueContributions: number;
      totalPullRequestContributions: number;
      contributionCalendar: {
        totalContributions: number;
        weeks: Array<{
          contributionDays: Array<{
            contributionCount: number;
            date: string;
          }>;
        }>;
      };
    };
  };
}

export async function fetchComprehensiveUserData(username: string) {
  const octokit = getOctokit();
  if (!octokit) throw new Error("Not authenticated");

  try {
    // Fetch user data and contributions using GraphQL
    const contributionsQuery = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            totalCommitContributions
            totalIssueContributions
            totalPullRequestContributions
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
            restrictedContributionsCount
            hasAnyContributions
          }
        }
      }
    `;

    const [
      userData,
      repositories,
      contributionsData,
      starred,
      followers,
      following,
    ] = await Promise.all([
      octokit.users.getByUsername({ username }),
      octokit.repos.listForUser({ username, per_page: 100 }),
      (await octokit.graphql(contributionsQuery, {
        username,
      })) as ContributionsResponse,
      octokit.activity.listReposStarredByUser({ username }),
      octokit.users.listFollowersForUser({ username }),
      octokit.users.listFollowingForUser({ username }),
    ]);

    return {
      profile: userData.data,
      repositories: repositories.data,
      contributions: contributionsData.user.contributionsCollection,
      social: {
        starred: starred.data,
        followers: followers.data,
        following: following.data,
      },
    };
  } catch (error) {
    console.error("Error fetching GitHub data:", error);
    throw error;
  }
}

export { calculateComprehensiveStats };
