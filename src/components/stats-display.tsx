import { StatsCard } from "@/components/stats-card";
import { Code2, FileCode, GitBranch, Languages, Star, GitPullRequest, GitCommit } from "lucide-react";

interface StatsDisplayProps {
  reposCount: number;
  languagesCount: number;
  totalLoc: number;
  averageLoc: number;
  selectedYear: string;
  totalStars: number;
  totalPRs: number;
  totalCommits: number;
}

export const StatsDisplay = ({ 
  reposCount, 
  languagesCount, 
  totalLoc, 
  averageLoc,
  selectedYear,
  totalStars,
  totalPRs,
  totalCommits
}: StatsDisplayProps) => {
  const averageLocPerDay = Math.round(totalLoc / 365);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-center mb-6 animate-fade-up">
        Your GitHub Wrapped {selectedYear}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Repositories"
          value={reposCount}
          icon={<GitBranch className="h-4 w-4" />}
          tooltip="Total number of public repositories"
        />
        <StatsCard
          title="Languages Used"
          value={languagesCount}
          icon={<Languages className="h-4 w-4" />}
          tooltip="Number of programming languages used across all repositories"
        />
        <StatsCard
          title="Total Stars"
          value={totalStars}
          icon={<Star className="h-4 w-4" />}
          tooltip="Total number of stars received"
        />
        <StatsCard
          title="Total Pull Requests"
          value={totalPRs}
          icon={<GitPullRequest className="h-4 w-4" />}
          tooltip="Total number of pull requests created"
        />
        <StatsCard
          title="Total Lines of Code"
          value={totalLoc.toLocaleString()}
          icon={<Code2 className="h-4 w-4" />}
          description={`~${averageLocPerDay.toLocaleString()} lines/day`}
          tooltip="Total lines of code across all repositories"
        />
        <StatsCard
          title="Average LOC/Repo"
          value={Math.round(averageLoc).toLocaleString()}
          icon={<FileCode className="h-4 w-4" />}
          tooltip="Average lines of code per repository"
        />
        <StatsCard
          title="Total Commits"
          value={totalCommits.toLocaleString()}
          icon={<GitCommit className="h-4 w-4" />}
          description={`~${Math.round(totalCommits/365)} commits/day`}
          tooltip="Total number of commits made"
        />
      </div>
    </div>
  );
};