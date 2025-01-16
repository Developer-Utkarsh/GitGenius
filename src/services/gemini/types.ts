import { Repository } from "@/types/github";

export interface Streak {
  count: number;
  startDate: string;
  endDate: string;
}

export interface CodeMetrics {
  complexity: number;
  documentation: number;
  testCoverage: number;
}

export interface ReviewMetrics {
  prMergeRate: number;
  avgReviewTime: number;
  issueResolutionTime: number;
}

export interface ActivityMetrics {
  monthlyContributions: Record<string, number>;
  peakHours: Record<number, number>;
  weekdayActivity: Record<string, number>;
}

export interface LanguageStats {
  [key: string]: {
    bytes: number;
    percentage: number;
  };
}

export interface GeminiConfig {
  temperature: number;
  topK: number;
  topP: number;
  maxOutputTokens: number;
}

export interface SystemContext {
  userData: any;
  stats: {
    totalRepos: number;
    totalStars: number;
    topLanguage: string;
    recentlyActive: boolean;
  };
  metrics: {
    activity: ActivityMetrics;
    languages: LanguageStats;
    recentActivity: Array<{
      name: string;
      language: string | null;
      stars: number | undefined;
      lastPush: string | undefined;
    }>;
    topRepositories: Array<{
      name: string;
      stars: number | undefined;
      description: string | null;
    }>;
  };
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  id?: string;
}
