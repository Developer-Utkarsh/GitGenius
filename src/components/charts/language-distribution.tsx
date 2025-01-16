import { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ChartPie,
  List,
  SortAsc,
  SortDesc,
  Code2,
  FileCode2,
  GitBranch,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Repository } from "@/types/github";
import { cardGradientClasses } from "../ui/card-gradient";
import { statsButtonClasses } from "@/components/ui/stats-button";
import { cn } from "@/lib/utils";

interface LanguageDistributionProps {
  languages: Record<string, number>;
  repositories: Repository[];
  selectedYear: string;
  isAllTime: boolean;
}

const COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  Ruby: "#701516",
  Go: "#00ADD8",
  Rust: "#dea584",
  CSS: "#563d7c",
  HTML: "#e34c26",
  PHP: "#4F5D95",
  Other: "#8884d8",
};

export const LanguageDistribution = ({
  languages,
  repositories,
  selectedYear,
  isAllTime,
}: LanguageDistributionProps) => {
  const [viewType, setViewType] = useState<"pie" | "list">("pie");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const stats = useMemo(() => {
    return {
      totalLines: Object.values(languages).reduce((sum, val) => sum + val, 0),
      topLanguage: Object.entries(languages).sort((a, b) => b[1] - a[1])[0],
      languagesByRepo: repositories.reduce((acc, repo) => {
        if (repo.languages) {
          Object.keys(repo.languages).forEach((lang) => {
            acc[lang] = (acc[lang] || 0) + 1;
          });
        }
        return acc;
      }, {} as Record<string, number>),
      averageLinesPerLanguage: Math.round(
        Object.values(languages).reduce((sum, val) => sum + val, 0) /
          Object.keys(languages).length
      ),
      mostUsedInRepos: Object.entries(
        repositories.reduce((acc, repo) => {
          if (repo.languages) {
            Object.keys(repo.languages).forEach((lang) => {
              acc[lang] = (acc[lang] || 0) + 1;
            });
          }
          return acc;
        }, {} as Record<string, number>)
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    };
  }, [languages, repositories]);

  const data = Object.entries(languages)
    .map(([name, value]) => ({
      name,
      value,
      color: COLORS[name as keyof typeof COLORS] || COLORS.Other,
    }))
    .sort((a, b) => {
      const comparison = b.value - a.value;
      return sortOrder === "desc" ? comparison : -comparison;
    })
    .slice(0, 8);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const formattedData = data.map((item) => ({
    ...item,
    percentage: ((item.value / total) * 100).toFixed(1),
    formattedSize: `${(item.value / 1024).toFixed(2)} KB`,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={cardGradientClasses.wrapper}>
        {cardGradientClasses.gradients.map((className, i) => (
          <div key={i} className={className} />
        ))}

        <CardHeader className="relative space-y-0 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Language Analytics
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className={statsButtonClasses.icon}
                onClick={() =>
                  setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                }
              >
                {sortOrder === "asc" ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={statsButtonClasses.icon}
                onClick={() =>
                  setViewType((prev) => (prev === "pie" ? "list" : "pie"))
                }
              >
                {viewType === "pie" ? (
                  <List className="h-4 w-4" />
                ) : (
                  <ChartPie className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative grid md:grid-cols-[2fr,1fr] gap-6 p-6">
          <div className="h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={viewType}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                {viewType === "pie" ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={formattedData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={80}
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                      >
                        {formattedData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={entry.color}
                            opacity={
                              activeIndex === null || activeIndex === index
                                ? 1
                                : 0.3
                            }
                            className="transition-opacity duration-200"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-lg bg-black/80 backdrop-blur-md p-3 border border-white/10 shadow-xl"
                              >
                                <p className="font-medium text-white">
                                  {data.name}
                                </p>
                                <p className="text-sm text-gray-300">
                                  {data.percentage}%
                                </p>
                                <p className="text-sm text-gray-300">
                                  {data.formattedSize}
                                </p>
                              </motion.div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={72}
                        content={({ payload }) => (
                          <div className="grid grid-cols-2 gap-2 mt-4">
                            {payload?.map((entry: any, index) => (
                              <motion.div
                                key={`legend-${index}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={cn(
                                  "flex items-center gap-2 px-2 py-1 rounded-md transition-colors",
                                  activeIndex === null || activeIndex === index
                                    ? "bg-white/5"
                                    : "opacity-50"
                                )}
                                onMouseEnter={() => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(null)}
                              >
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                <div className="flex items-center justify-between flex-1">
                                  <span className="text-sm font-medium text-white">
                                    {entry.value}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {formattedData[index].percentage}%
                                  </span>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="space-y-3 pt-4 h-full overflow-auto">
                    {formattedData.map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-400">
                            {item.percentage}%
                          </span>
                          <span className="text-sm text-gray-400">
                            {item.formattedSize}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-white/80">
                <Code2 className="h-4 w-4" />
                Primary Language
              </h3>
              <div className="bg-white/5 p-4 rounded-lg backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{stats.topLanguage[0]}</span>
                  <span className="text-sm text-gray-400">
                    {((stats.topLanguage[1] / stats.totalLines) * 100).toFixed(
                      1
                    )}
                    %
                  </span>
                </div>
                <Progress
                  value={(stats.topLanguage[1] / stats.totalLines) * 100}
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-white/80">
                <GitBranch className="h-4 w-4" />
                Most Used in Repositories
              </h3>
              <div className="space-y-2">
                {stats.mostUsedInRepos.map(([lang, count]) => (
                  <div
                    key={lang}
                    className="flex items-center justify-between bg-white/5 p-2 rounded-lg"
                  >
                    <span className="text-sm">{lang}</span>
                    <span className="text-sm text-gray-400">
                      {count} {count === 1 ? "repo" : "repos"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-white/80">
                <FileCode2 className="h-4 w-4" />
                Language Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded-lg backdrop-blur-sm">
                  <p className="text-sm text-gray-400">Avg. Lines/Language</p>
                  <p className="text-lg font-semibold">
                    {(stats.averageLinesPerLanguage / 1024).toFixed(1)}k
                  </p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg backdrop-blur-sm">
                  <p className="text-sm text-gray-400">Total Languages</p>
                  <p className="text-lg font-semibold">
                    {Object.keys(languages).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
