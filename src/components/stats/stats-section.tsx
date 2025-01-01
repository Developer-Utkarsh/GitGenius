import { StatsDisplay } from "@/components/stats-display";
import { LanguageDistribution } from "@/components/charts/language-distribution";
import { RepositoryList } from "@/components/repository/repository-list";
import { Repository } from "@/types/github";

interface StatsSectionProps {
  reposData: Repository[];
  selectedYear: string;
  aggregatedLanguages: Record<string, number>;
}

export const StatsSection = ({ reposData, selectedYear, aggregatedLanguages }: StatsSectionProps) => {
  return (
    <div className="space-y-8">
      <StatsDisplay
        reposCount={reposData.length}
        languagesCount={Object.keys(aggregatedLanguages).length}
        totalLoc={Object.values(aggregatedLanguages).reduce((a, b) => a + b, 0)}
        averageLoc={Object.values(aggregatedLanguages).reduce((a, b) => a + b, 0) / reposData.length}
        selectedYear={selectedYear}
        totalStars={reposData.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0)}
        totalPRs={reposData.reduce((acc, repo) => acc + (repo.pulls || 0), 0)}
        totalCommits={reposData.reduce((acc, repo) => acc + (repo.commits || 0), 0)}
      />

      <LanguageDistribution languages={aggregatedLanguages} />

      <RepositoryList repositories={reposData} />
    </div>
  );
};