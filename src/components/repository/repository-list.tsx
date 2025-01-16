import { RepositoryCard } from "@/components/repository-card";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Repository {
  id: number;
  name: string;
  description: string | null;
  language?: string;
  stargazers_count?: number;
  created_at: string;
  commits?: number;
  languages?: { [key: string]: number };
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

interface RepositoryListProps {
  repositories: Repository[];
}

export const RepositoryList = ({ repositories }: RepositoryListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRepos = repositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.language?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Filter repositories..."
          className="pl-10 w-full bg-white/5 border-gray-700/50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRepos.map((repo) => (
          <RepositoryCard
            key={repo.id}
            name={repo.name}
            description={repo.description || "No description available"}
            stars={repo.stargazers_count || 0}
            language={repo.language || "Unknown"}
            branches={1}
            created_at={repo.created_at}
            commits={
              Array.isArray(repo.commits)
                ? repo.commits
                : [{ date: new Date().toISOString(), count: repo.commits || 0 }]
            }
            languages={repo.languages || {}}
            loc={Object.values(repo.languages || {}).reduce(
              (acc, curr) => acc + curr,
              0
            )}
          />
        ))}
      </div>
    </div>
  );
};
