import type { Repository, GitHubUser } from "@/types/github";

export interface ProcessedGitHubData {
  basicProfile: {
    username: string;
    avatarUrl: string;
    bio: string;
    location?: string;
    website?: string;
    followers: number;
    following: number;
    organizations?: string[];
  };

  repositories: {
    total: number;
    owned: number;
    forked: number;
    starredTotal: number;
    topLanguages: Array<[string, number]>;
    popularRepos: Repository[];
    languageDistribution: Record<string, number>;
    commitActivity: {
      totalCommits: number;
      commitsByDay: Record<string, number>;
      peakCommitHours: number[];
    };
  };

  contributions: {
    totalCommits: number;
    totalPRs: number;
    totalIssues: number;
    contributionStreak: number;
    maxStreak: number;
    averageCommitsPerDay: number;
    contributionCalendar: {
      total: number;
      weeks: Array<{
        days: Array<{
          count: number;
          date: string;
        }>;
      }>;
    };
  };

  codeQuality: {
    averageIssueResolutionTime: number;
    prMergeRate: number;
    documentationRate: number;
    maintainedRepos: number;
    complexityMetrics: {
      averageFileSize: number;
      totalBranches: number;
      averageCommitDensity: number;
    };
  };

  communityEngagement: {
    issueComments: number;
    prReviews: number;
    discussionParticipation: number;
    collaboratorNetwork: Array<{
      username: string;
      collaborations: number;
    }>;
  };
}

export function processDataForGemini(rawData: any): ProcessedGitHubData {
  if (!rawData?.stats) {
    throw new Error("Missing stats data");
  }

  return {
    basicProfile: {
      username: rawData.stats?.login || "N/A",
      avatarUrl: rawData.stats?.avatar_url || "N/A",
      bio: rawData.stats?.bio || "N/A",
      location: rawData.stats?.location || "N/A",
      website: rawData.stats?.blog || "N/A",
      followers: rawData.stats?.followers || 0,
      following: rawData.stats?.following || 0,
      organizations: rawData.stats?.organizations || [],
    },
    contributions: {
      totalCommits: rawData.stats?.totalCommits || 0,
      totalPRs: rawData.stats?.totalPRs || 0,
      totalIssues: rawData.stats?.contributions?.totalIssueContributions || 0,
      contributionStreak: calculateContributionStreak(
        rawData.stats?.contributions?.weeks || []
      ),
      maxStreak: calculateMaxStreak(rawData.stats?.contributions?.weeks || []),
      averageCommitsPerDay: (rawData.stats?.totalCommits || 0) / 365,
      contributionCalendar: {
        total: rawData.stats?.contributions?.totalContributions || 0,
        weeks: rawData.stats?.contributions?.weeks || [],
      },
    },
    repositories: {
      total: rawData.repositories?.length || 0,
      owned: rawData.repositories?.filter((r) => !r.fork)?.length || 0,
      forked: rawData.repositories?.filter((r) => r.fork)?.length || 0,
      starredTotal:
        rawData.repositories?.reduce(
          (acc, r) => acc + (r.stargazers_count || 0),
          0
        ) || 0,
      topLanguages: calculateTopLanguages(rawData.repositories || []),
      popularRepos: (rawData.repositories || [])
        .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
        .slice(0, 5),
      languageDistribution: calculateLanguageDistribution(
        rawData.repositories || []
      ),
      commitActivity: {
        totalCommits:
          rawData.repositories?.reduce(
            (acc, repo) => acc + (repo.commits?.length || 0),
            0
          ) || 0,
        commitsByDay: {},
        peakCommitHours: [],
      },
    },
    codeQuality: {
      averageIssueResolutionTime: 0,
      prMergeRate: 0,
      documentationRate: 0,
      maintainedRepos: 0,
      complexityMetrics: {
        averageFileSize: 0,
        totalBranches: 0,
        averageCommitDensity: 0,
      },
    },
    communityEngagement: {
      issueComments: 0,
      prReviews: 0,
      discussionParticipation: 0,
      collaboratorNetwork: [],
    },
  };
}

// Helper functions
function calculateContributionStreak(contributions: any): number {
  try {
    if (!contributions?.contributionCalendar?.weeks) {
      return 0;
    }

    return contributions.contributionCalendar.weeks.reduce(
      (streak: number, week: any) => {
        if (!week?.contributionDays) return streak;

        const hasContributions = week.contributionDays.some(
          (day: any) => (day?.contributionCount || 0) > 0
        );
        return hasContributions ? streak + 1 : 0;
      },
      0
    );
  } catch (error) {
    console.error("Error calculating contribution streak:", error);
    return 0;
  }
}

function calculateMaxStreak(contributions: any): number {
  try {
    if (!contributions?.contributionCalendar?.weeks) {
      return 0;
    }

    let maxStreak = 0;
    let currentStreak = 0;

    contributions.contributionCalendar.weeks.forEach((week: any) => {
      if (!week?.contributionDays) return;

      week.contributionDays.forEach((day: any) => {
        if ((day?.contributionCount || 0) > 0) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      });
    });

    return maxStreak;
  } catch (error) {
    console.error("Error calculating max streak:", error);
    return 0;
  }
}

function calculateAverageCommits(contributions: any): number {
  const totalContributions =
    contributions?.contributionsCollection?.contributionCalendar
      ?.totalContributions || 0;
  const totalDays = 365; // Assuming we're looking at a year's worth of data
  return totalContributions / totalDays;
}

function calculateTopLanguages(repositories: any[]): Array<[string, number]> {
  if (!repositories?.length) return [];

  const langMap = new Map<string, number>();
  repositories.forEach((repo) => {
    if (repo.languages) {
      Object.entries(repo.languages).forEach(([lang, bytes]: [string, any]) => {
        langMap.set(lang, (langMap.get(lang) || 0) + Number(bytes));
      });
    }
  });

  return Array.from(langMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);
}

function calculateTotalCommits(repositories: any[]): number {
  return repositories.reduce(
    (total, repo) =>
      total +
      (repo.activity_stats?.code_frequency?.reduce(
        (sum: number, [, additions]: number[]) => sum + additions,
        0
      ) || 0),
    0
  );
}

function calculateCommitsByDay(repositories: any[]): Record<string, number> {
  const commitsByDay: Record<string, number> = {};
  repositories.forEach((repo) => {
    repo.activity_stats?.code_frequency?.forEach(
      ([timestamp, additions]: number[]) => {
        const date = new Date(timestamp * 1000).toISOString().split("T")[0];
        commitsByDay[date] = (commitsByDay[date] || 0) + additions;
      }
    );
  });
  return commitsByDay;
}

function calculatePeakHours(repositories: any[]): number[] {
  const hourCounts = new Array(24).fill(0);
  repositories.forEach((repo) => {
    repo.activity_stats?.punch_card?.forEach(([, hour, count]: number[]) => {
      hourCounts[hour] += count;
    });
  });
  return hourCounts
    .map((count, hour) => ({ hour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(({ hour }) => hour);
}

function calculateLanguageDistribution(
  repositories: any[]
): Record<string, number> {
  const distribution: Record<string, number> = {};
  repositories?.forEach((repo) => {
    if (repo.languages) {
      Object.entries(repo.languages).forEach(([lang, bytes]: [string, any]) => {
        distribution[lang] = (distribution[lang] || 0) + Number(bytes);
      });
    }
  });
  return distribution;
}

function calculateCodeQuality(repositories: any[]) {
  const totalIssues = repositories.reduce(
    (acc, repo) => acc + (repo.activity_stats?.issues?.length || 0),
    0
  );
  const closedIssues = repositories.reduce(
    (acc, repo) =>
      acc +
      (repo.activity_stats?.issues?.filter((i: any) => i.state === "closed")
        ?.length || 0),
    0
  );

  return {
    averageIssueResolutionTime: calculateAverageResolutionTime(repositories),
    prMergeRate: calculatePRMergeRate(repositories),
    documentationRate:
      repositories.filter((r) => r.readme).length / repositories.length,
    maintainedRepos: repositories.filter(
      (r) =>
        !r.archived &&
        new Date(r.pushed_at || r.updated_at).getTime() >
          Date.now() - 180 * 24 * 60 * 60 * 1000
    ).length,
    complexityMetrics: {
      averageFileSize:
        repositories.reduce((acc, r) => acc + (r.size || 0), 0) /
        repositories.length,
      totalBranches: repositories.reduce(
        (acc, r) => acc + (r.branches?.length || 0),
        0
      ),
      averageCommitDensity:
        repositories.reduce(
          (acc, r) =>
            acc +
            (r.activity_stats?.code_frequency?.length || 0) / (r.size || 1),
          0
        ) / repositories.length,
    },
  };
}

function calculateCommunityEngagement(repositories: any[], social: any) {
  const collaborators = new Map<string, number>();

  repositories.forEach((repo) => {
    repo.activity_stats?.contributors?.forEach((contributor: any) => {
      const username = contributor.login;
      collaborators.set(
        username,
        (collaborators.get(username) || 0) + contributor.contributions
      );
    });
  });

  return {
    issueComments: repositories.reduce(
      (acc, repo) =>
        acc +
        (repo.activity_stats?.issues?.reduce(
          (sum: number, issue: any) => sum + (issue.comments || 0),
          0
        ) || 0),
      0
    ),
    prReviews: repositories.reduce(
      (acc, repo) =>
        acc +
        (repo.activity_stats?.pulls?.reduce(
          (sum: number, pr: any) => sum + (pr.review_comments || 0),
          0
        ) || 0),
      0
    ),
    discussionParticipation: repositories.reduce(
      (acc, repo) =>
        acc +
        (repo.activity_stats?.issues?.length || 0) +
        (repo.activity_stats?.pulls?.length || 0),
      0
    ),
    collaboratorNetwork: Array.from(collaborators.entries())
      .map(([username, collaborations]) => ({ username, collaborations }))
      .sort((a, b) => b.collaborations - a.collaborations)
      .slice(0, 10),
  };
}

function calculateAverageResolutionTime(repositories: any[]): number {
  let totalTime = 0;
  let totalIssues = 0;

  repositories.forEach((repo) => {
    const closedIssues =
      repo.activity_stats?.issues?.filter((i: any) => i.state === "closed") ||
      [];
    closedIssues.forEach((issue: any) => {
      const created = new Date(issue.created_at).getTime();
      const closed = new Date(issue.closed_at).getTime();
      totalTime += closed - created;
    });
    totalIssues += closedIssues.length;
  });

  return totalIssues > 0 ? totalTime / totalIssues : 0;
}

function calculatePRMergeRate(repositories: any[]): number {
  const totalPRs = repositories.reduce(
    (acc, repo) => acc + (repo.activity_stats?.pulls?.length || 0),
    0
  );
  const mergedPRs = repositories.reduce(
    (acc, repo) =>
      acc +
      (repo.activity_stats?.pulls?.filter((pr: any) => pr.merged_at)?.length ||
        0),
    0
  );

  return totalPRs > 0 ? mergedPRs / totalPRs : 0;
}

// Add other helper functions as needed...

// Add rate limiting and error handling wrapper
export async function safelyProcessData(
  rawData: any
): Promise<ProcessedGitHubData> {
  try {
    const startTime = Date.now();
    const result = processDataForGemini(rawData);
    const processingTime = Date.now() - startTime;

    console.log(`Data processing completed in ${processingTime}ms`);
    return result;
  } catch (error) {
    console.error("Error processing GitHub data:", error);
    throw new Error("Failed to process GitHub data for AI analysis");
  }
}

// Add helper functions for rate limit management
export function checkRateLimit(headers: any) {
  return {
    remaining: parseInt(headers["x-ratelimit-remaining"] || "0"),
    reset: new Date(parseInt(headers["x-ratelimit-reset"] || "0") * 1000),
    limit: parseInt(headers["x-ratelimit-limit"] || "0"),
  };
}

// Add documentation
/**
 * Processes raw GitHub data into a format optimized for Gemini AI analysis
 * @param rawData Raw GitHub API response data
 * @returns ProcessedGitHubData formatted for AI analysis
 * @throws Error if processing fails
 */
