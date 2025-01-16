import type { Repository } from "@/types/github";
import type { SystemContext } from "./types";
import {
  calculateStreaks,
  calculateActivityMetrics,
  calculateLanguageStats,
  calculateCodeMetrics,
  calculateReviewMetrics,
} from "./metrics";
import { SYSTEM_PROMPT_TEMPLATE } from "./config";

export function buildSystemContext(
  userData: any,
  stats: any,
  repositories: Repository[]
): SystemContext {
  // Focus on key metrics that matter most with null checks
  const keyMetrics = {
    activity: calculateActivityMetrics(repositories),
    languages: calculateLanguageStats(repositories),
    recentActivity: repositories
      .filter(repo => repo !== null)
      .sort((a, b) => {
        const bTime = b.pushed_at ? new Date(b.pushed_at).getTime() : 0;
        const aTime = a.pushed_at ? new Date(a.pushed_at).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 5)
      .map(repo => ({
        name: repo.name || 'Unnamed Repository',
        language: repo.language || null,
        stars: repo.stargazers_count || 0,
        lastPush: repo.pushed_at || null
      })),
    topRepositories: repositories
      .filter(repo => repo !== null)
      .sort((a, b) => ((b.stargazers_count || 0) - (a.stargazers_count || 0)))
      .slice(0, 3)
      .map(repo => ({
        name: repo.name || 'Unnamed Repository',
        stars: repo.stargazers_count || 0,
        description: repo.description || null
      }))
  };

  // Ensure we have valid data with defaults
  return {
    userData: userData || {},
    stats: {
      totalRepos: repositories.length,
      totalStars: repositories.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0),
      topLanguage: Object.entries(calculateLanguageStats(repositories))
        .sort(([, a], [, b]) => b.bytes - a.bytes)[0]?.[0] || 'Unknown',
      recentlyActive: repositories.some(repo => {
        if (!repo.pushed_at) return false;
        return new Date(repo.pushed_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
      })
    },
    metrics: keyMetrics
  };
}

export function generateSystemPrompt(context: SystemContext): string {
  const { userData, stats, metrics } = context;

  // Create a more focused context
  const focusedUserProfile = {
    name: userData.name || userData.login,
    bio: userData.bio,
    location: userData.location,
    followers: userData.followers,
    following: userData.following,
    publicRepos: userData.public_repos,
    createdAt: userData.created_at
  };

  return SYSTEM_PROMPT_TEMPLATE
    .replace("{userName}", userData.name || userData.login)
    .replace("{userProfile}", JSON.stringify(focusedUserProfile, null, 2))
    .replace("{repoStats}", JSON.stringify(stats, null, 2))
    .replace("{activityMetrics}", JSON.stringify(metrics.activity, null, 2))
    .replace("{languageStats}", JSON.stringify(metrics.languages, null, 2));
}
