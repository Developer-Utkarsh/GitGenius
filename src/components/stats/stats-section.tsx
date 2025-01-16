import { useState, useEffect } from "react";
import { StatsDisplay } from "@/components/stats-display";
import { LanguageDistribution } from "@/components/charts/language-distribution";
import { RepositoryList } from "@/components/repository/repository-list";
import { Repository } from "@/types/github";
import { ProfileOverview } from "@/components/profile/profile-overview";
import { LanguageEvolution } from "./language-evolution";
import { MonthlyCodeActivity } from "./monthly-code-activity";
import { RepositoryInsights } from "./repository-insights";
import { ContributionTimeline } from "./contribution-timeline";
import { TabsGroup } from "@/components/tabs-group";

interface StatsSectionProps {
  reposData: Repository[];
  selectedYear: string;
  aggregatedLanguages: Record<string, number>;
  userData: any;
  onYearChange: (year: string) => void;
}

export const StatsSection = ({
  reposData,
  selectedYear,
  aggregatedLanguages,
  userData,
  onYearChange,
}: StatsSectionProps) => {
  const [effectiveYear, setEffectiveYear] = useState(
    new Date().getFullYear().toString()
  );

  useEffect(() => {
    if (selectedYear === "all") {
      setEffectiveYear(new Date().getFullYear().toString());
    } else {
      setEffectiveYear(selectedYear);
    }
  }, [selectedYear]);

  const contributions = reposData.flatMap((repo) =>
    Array.isArray(repo.commits) ? repo.commits : []
  );

  const stats = {
    reposCount:
      selectedYear === "all"
        ? reposData.length
        : reposData.filter(
            (repo) =>
              new Date(repo.created_at).getFullYear().toString() ===
              effectiveYear
          ).length,
    languagesCount: Object.keys(aggregatedLanguages).length,
    totalLoc: Object.values(aggregatedLanguages).reduce((a, b) => a + b, 0),
    averageLoc:
      Object.values(aggregatedLanguages).reduce((a, b) => a + b, 0) /
      reposData.length,
    totalStars: reposData.reduce(
      (acc, repo) => acc + (repo.stargazers_count || 0),
      0
    ),
    totalPRs: reposData.reduce((acc, repo) => acc + (repo.pulls || 0), 0),
    totalCommits: reposData.reduce((acc, repo) => {
      if (Array.isArray(repo.commits)) {
        return (
          acc + repo.commits.reduce((sum, commit) => sum + commit.count, 0)
        );
      }
      return acc + (repo.commits || 0);
    }, 0),
  };

  return (
    <TabsGroup
      repositories={reposData}
      selectedYear={effectiveYear}
      userData={userData}
      stats={stats}
      onYearChange={onYearChange}
      aggregatedLanguages={aggregatedLanguages}
      isAllTime={selectedYear === "all"}
    />
  );
};
