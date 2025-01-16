import type { Repository } from "@/types/github";
import type {
  Streak,
  CodeMetrics,
  ReviewMetrics,
  ActivityMetrics,
  LanguageStats,
} from "./types";

export function calculateStreaks(repositories: Repository[]) {
  const current = calculateCurrentStreak(repositories);
  const longest = calculateLongestStreak(repositories);
  return { current, longest };
}

export function calculateActivityMetrics(repositories: Repository[] = []): ActivityMetrics {
  try {
    return {
      monthlyContributions: calculateMonthlyContributions(repositories),
      peakHours: calculatePeakHours(repositories),
      weekdayActivity: calculateWeekdayActivity(repositories),
    };
  } catch (error) {
    console.error('Error calculating activity metrics:', error);
    return {
      monthlyContributions: {},
      peakHours: {},
      weekdayActivity: {},
    };
  }
}

// Helper functions implementation (same as before)
function calculateCurrentStreak(repositories: Repository[]): Streak {
  // Implementation remains the same
}

function calculateLongestStreak(repositories: Repository[]): Streak {
  // Implementation remains the same
}

function calculateMonthlyContributions(repositories: Repository[] = []): Record<string, number> {
  try {
    const contributions: Record<string, number> = {};
    
    repositories.forEach(repo => {
      if (repo?.commits) {
        repo.commits.forEach(commit => {
          if (commit?.date) {
            const month = commit.date.substring(0, 7); // YYYY-MM format
            contributions[month] = (contributions[month] || 0) + (commit.count || 0);
          }
        });
      }
    });
    
    return contributions;
  } catch (error) {
    console.error('Error calculating monthly contributions:', error);
    return {};
  }
}

function calculatePeakHours(repositories: Repository[] = []): Record<number, number> {
  try {
    const hourCounts: Record<number, number> = {};
    
    repositories.forEach(repo => {
      if (repo?.commits) {
        repo.commits.forEach(commit => {
          if (typeof commit.hour === 'number' && !isNaN(commit.hour)) {
            hourCounts[commit.hour] = (hourCounts[commit.hour] || 0) + (commit.count || 0);
          }
        });
      }
    });
    
    return hourCounts;
  } catch (error) {
    console.error('Error calculating peak hours:', error);
    return {};
  }
}

function calculateWeekdayActivity(repositories: Repository[] = []): Record<string, number> {
  try {
    const weekdayCounts: Record<string, number> = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    repositories.forEach(repo => {
      if (repo?.commits) {
        repo.commits.forEach(commit => {
          if (typeof commit.weekday === 'number' && !isNaN(commit.weekday)) {
            const day = days[commit.weekday];
            weekdayCounts[day] = (weekdayCounts[day] || 0) + (commit.count || 0);
          }
        });
      }
    });
    
    return weekdayCounts;
  } catch (error) {
    console.error('Error calculating weekday activity:', error);
    return {};
  }
}

export function calculateLanguageStats(repositories: Repository[] = []): LanguageStats {
  try {
    const stats: LanguageStats = {};
    let totalBytes = 0;

    // Calculate total bytes first
    repositories.forEach(repo => {
      if (repo?.languages) {
        Object.entries(repo.languages).forEach(([, bytes]) => {
          totalBytes += Number(bytes) || 0;
        });
      }
    });

    // Calculate language stats with percentages
    repositories.forEach(repo => {
      if (repo?.languages) {
        Object.entries(repo.languages).forEach(([lang, bytes]) => {
          const numBytes = Number(bytes) || 0;
          if (!stats[lang]) {
            stats[lang] = { bytes: 0, percentage: 0 };
          }
          stats[lang].bytes += numBytes;
          stats[lang].percentage = totalBytes > 0 ? (stats[lang].bytes / totalBytes) * 100 : 0;
        });
      }
    });

    return stats;
  } catch (error) {
    console.error('Error calculating language stats:', error);
    return {};
  }
}

export function calculateCodeMetrics(repositories: Repository[]): CodeMetrics {
  // Implementation remains the same
}

export function calculateReviewMetrics(repositories: Repository[]): ReviewMetrics {
  // Implementation remains the same
}
