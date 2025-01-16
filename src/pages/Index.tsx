import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  GitBranch,
  Github,
  Star,
  GitPullRequest,
  GitCommit,
  Sparkles,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getOctokit } from "@/utils/github";
import { GitHubAuth } from "@/components/github-auth";
import { StatsDisplay } from "@/components/stats-display";
import { GitHubSearch } from "@/components/search/github-search";
import { LanguageDistribution } from "@/components/charts/language-distribution";
import { RepositoryList } from "@/components/repository/repository-list";
import { AiChat } from "@/components/AiChat";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ContributionsResponse } from "@/types/github";

const MIN_USERNAME_LENGTH = 3;

const Index = () => {
  const [debouncedUsername, setDebouncedUsername] = useState("");
  const { user, isAuthenticated } = useAuth();
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["github-user", user?.login],
    queryFn: async () => {
      if (!user?.login) return null;
      const octokit = getOctokit();
      const response = await octokit.request("GET /users/{username}", {
        username: user.login,
      });
      return response.data;
    },
    enabled: !!user?.login && isAuthenticated,
  });

  const { data: reposData, isLoading: reposLoading } = useQuery({
    queryKey: ["github-repos", user?.login, selectedYear],
    queryFn: async () => {
      if (!user?.login) return null;
      const octokit = getOctokit();

      const response = await octokit.request("GET /users/{username}/repos", {
        username: user.login,
        per_page: 100,
        sort: "updated",
      });

      const reposWithDetails = await Promise.all(
        response.data.map(async (repo) => {
          try {
            const [languages, commits, pulls] = await Promise.all([
              octokit.request("GET /repos/{owner}/{repo}/languages", {
                owner: user.login,
                repo: repo.name,
              }),
              octokit.request("GET /repos/{owner}/{repo}/commits", {
                owner: user.login,
                repo: repo.name,
                since: `${selectedYear}-01-01T00:00:00Z`,
                until: `${selectedYear}-12-31T23:59:59Z`,
              }),
              octokit.request("GET /repos/{owner}/{repo}/pulls", {
                owner: user.login,
                repo: repo.name,
                state: "all",
              }),
            ]);

            return {
              ...repo,
              languages: languages.data,
              commits: commits.data.length,
              pulls: pulls.data.length,
              created_at: repo.created_at,
            };
          } catch (error) {
            console.error(`Error fetching details for ${repo.name}:`, error);
            return {
              ...repo,
              languages: {},
              commits: 0,
              pulls: 0,
              created_at: repo.created_at,
            };
          }
        })
      );

      return reposWithDetails;
    },
    enabled: !!userData && isAuthenticated,
  });

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  const aggregatedLanguages =
    reposData?.reduce((acc, repo) => {
      Object.entries(repo.languages || {}).forEach(([lang, bytes]) => {
        acc[lang] = (acc[lang] || 0) + (bytes as number);
      });
      return acc;
    }, {} as Record<string, number>) || {};

  const totalStars =
    reposData?.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0) ||
    0;
  const totalPRs =
    reposData?.reduce((acc, repo) => acc + (repo.pulls || 0), 0) || 0;
  const totalCommits =
    reposData?.reduce((acc, repo) => acc + (repo.commits || 0), 0) || 0;

  const { data: stats } = useQuery({
    queryKey: ["github-stats"],
    queryFn: async () => {
      const octokit = getOctokit();
      // Fetch contributions data using GraphQL
      const query = `query {
        viewer {
          contributionsCollection {
            totalCommitContributions
            totalIssueContributions
            totalPullRequestContributions
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }
        }
      }`;
      const response = (await octokit.graphql(query)) as ContributionsResponse;
      return {
        contributions: response.viewer.contributionsCollection,
      };
    },
    enabled: isAuthenticated,
  });

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020617]">
      {/* Enhanced Gradient Effects */}
      <div className="fixed inset-0 -z-10">
        {/* Primary gradient orb - adjusted for dark blue theme */}
        <div className="absolute top-0 left-1/3 w-[1000px] h-[1000px] rounded-full bg-gradient-to-r from-blue-950/50 to-blue-900/30 blur-[120px] opacity-40" />

        {/* Secondary gradient orbs */}
        <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-l from-slate-900/40 to-blue-950/30 blur-[100px] opacity-30" />
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-blue-900/20 to-slate-900/20 blur-[100px] opacity-20" />

        {/* Ambient gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(30,58,138,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.15),transparent_50%)]" />

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-grid-white/[0.01] bg-[size:50px_50px]" />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center space-y-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block p-3 bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 rounded-2xl mb-4 backdrop-blur-sm border border-white/10"
            >
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </motion.div>

            <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-br from-white via-primary/90 to-blue-400 bg-clip-text text-transparent">
              Unlock Your GitHub Insights with AI
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Discover powerful insights about your GitHub profile using
              advanced analytics and AI-powered analysis.
            </p>

            {!isAuthenticated ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center gap-4"
              >
                <GitHubAuth />
                <Button variant="outline" className="gap-2">
                  <Star className="h-4 w-4" />
                  Star on GitHub
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl mx-auto"
              >
                <GitHubSearch
                  onSearch={setDebouncedUsername}
                  isDisabled={!isAuthenticated}
                  minLength={MIN_USERNAME_LENGTH}
                />
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Results Section with Stats, Language Distribution, and AI Chat */}
      {isAuthenticated && (
        <AnimatePresence>
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="py-10"
          >
            <div className="container max-w-7xl">
              {userLoading || reposLoading ? (
                <LoadingState />
              ) : userData && reposData ? (
                <div className="flex flex-col gap-8">
                  {/* Stats Display */}
                  <div className="w-full">
                    <div className="bg-gradient-to-br from-slate-900/80 via-blue-950/50 to-slate-900/80 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                      <StatsDisplay
                        reposCount={reposData.length}
                        languagesCount={Object.keys(aggregatedLanguages).length}
                        totalLoc={Object.values(aggregatedLanguages).reduce(
                          (a, b) => a + b,
                          0
                        )}
                        averageLoc={
                          Object.values(aggregatedLanguages).reduce(
                            (a, b) => a + b,
                            0
                          ) / reposData.length
                        }
                        selectedYear={selectedYear}
                        totalStars={totalStars}
                        totalPRs={totalPRs}
                        totalCommits={totalCommits}
                      />
                    </div>
                  </div>

                  {/* GitHub Wrapped Section */}
                  <div className="w-full">
                    <div className="bg-gradient-to-br from-slate-900/80 via-blue-950/50 to-slate-900/80 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Your GitHub Wrapped
                      </h2>
                      <LanguageDistribution
                        languages={aggregatedLanguages}
                        repositories={reposData}
                        selectedYear={selectedYear}
                        isAllTime={false}
                      />
                    </div>
                  </div>

                  {/* Full-width AI Chat */}
                  <div className="w-full">
                    <AiChat
                      userData={userData}
                      stats={stats}
                      repositories={reposData}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </motion.section>
        </AnimatePresence>
      )}

      {/* Features Section with updated background */}
      {!isAuthenticated && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="py-20"
        >
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<GitCommit className="h-6 w-6" />}
                title="Contribution Analysis"
                description="Deep dive into your GitHub contributions with detailed statistics and trends."
              />
              <FeatureCard
                icon={<GitPullRequest className="h-6 w-6" />}
                title="AI-Powered Insights"
                description="Get intelligent insights about coding patterns and collaboration style."
              />
              <FeatureCard
                icon={<Github className="h-6 w-6" />}
                title="Repository Analytics"
                description="Analyze repository performance, language usage, and impact metrics."
              />
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
};

// Separate components
const LoadingState = () => (
  <div className="text-center">
    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
    <p className="text-muted-foreground mt-2">Loading your data...</p>
  </div>
);

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-background via-background/95 to-background/90 p-6 border border-border/50 hover:border-primary/50 transition-colors"
  >
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

    {/* Content */}
    <div className="relative z-10">
      <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  </motion.div>
);

export default Index;
