export interface Repository {
  id: number;
  name: string;
  description: string | null;
  language?: string;
  stargazers_count?: number;
  forks_count?: number;
  updated_at?: string;
  created_at: string;
  commits?: number | { date: string; count: number }[];
  pulls?: number;
  languages?: { [key: string]: number };
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  homepage?: string;
}

export interface GitHubStats {
  reposCount: number;
  languagesCount: number;
  totalLoc: number;
  averageLoc: number;
  totalStars: number;
  totalPRs: number;
  totalCommits: number;
}

export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string;
  bio: string;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
  location?: string;
  blog?: string;
  twitter_username?: string;
  company?: string;
}

export interface ContributionsResponse {
  viewer: {
    contributionsCollection: {
      totalCommitContributions: number;
      totalIssueContributions: number;
      totalPullRequestContributions: number;
      contributionCalendar: {
        totalContributions: number;
        weeks: {
          contributionDays: {
            contributionCount: number;
            date: string;
          }[];
        }[];
      };
    };
  };
}
