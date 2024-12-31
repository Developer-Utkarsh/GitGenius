import { Code2, FileCode, GitBranch, Languages } from "lucide-react";
import { RepositorySearch } from "@/components/repository-search";
import { RepositoryCard } from "@/components/repository-card";
import { StatsCard } from "@/components/stats-card";

const Index = () => {
  const mockRepositories = [
    {
      name: "react",
      description: "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
      stars: 200543,
      language: "JavaScript",
      branches: 3,
    },
    {
      name: "typescript",
      description: "TypeScript is a superset of JavaScript that compiles to clean JavaScript output.",
      stars: 89234,
      language: "TypeScript",
      branches: 2,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4 animate-in">
            <h1 className="text-4xl font-bold tracking-tight">
              GitHub LOC Counter
            </h1>
            <p className="text-lg text-gray-400">
              Analyze your repositories with precision
            </p>
          </div>

          <RepositorySearch />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatsCard
              title="Total Repositories"
              value="128"
              icon={<GitBranch className="h-4 w-4 text-primary" />}
            />
            <StatsCard
              title="Lines of Code"
              value="1.2M"
              icon={<Code2 className="h-4 w-4 text-primary" />}
            />
            <StatsCard
              title="Languages"
              value="12"
              icon={<Languages className="h-4 w-4 text-primary" />}
            />
            <StatsCard
              title="Files"
              value="8.4K"
              icon={<FileCode className="h-4 w-4 text-primary" />}
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Repositories</h2>
            <div className="grid grid-cols-1 gap-4">
              {mockRepositories.map((repo) => (
                <RepositoryCard key={repo.name} {...repo} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;