import { StatsCard } from "@/components/stats-card";
import { Code2, FileCode, GitBranch, Languages } from "lucide-react";

interface StatsDisplayProps {
  reposCount: number;
  languagesCount: number;
  totalLoc: number;
  averageLoc: number;
}

export const StatsDisplay = ({ reposCount, languagesCount, totalLoc, averageLoc }: StatsDisplayProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatsCard
        title="Total Repositories"
        value={reposCount}
        icon={<GitBranch className="h-4 w-4 text-blue-500" />}
      />
      <StatsCard
        title="Languages Used"
        value={languagesCount}
        icon={<Languages className="h-4 w-4 text-purple-500" />}
      />
      <StatsCard
        title="Total Lines of Code"
        value={totalLoc.toLocaleString()}
        icon={<Code2 className="h-4 w-4 text-green-500" />}
      />
      <StatsCard
        title="Average LOC/Repo"
        value={Math.round(averageLoc).toLocaleString()}
        icon={<FileCode className="h-4 w-4 text-pink-500" />}
      />
    </div>
  );
};