import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Repository } from "@/types/github";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { BarChart3, SortAsc, SortDesc, Search, Code2 } from "lucide-react";
import { cardGradientClasses } from "@/components/ui/card-gradient";
import { statsButtonClasses } from "@/components/ui/stats-button";

interface RepositoryInsightsProps {
  repositories: Repository[];
}

export function RepositoryInsights({ repositories }: RepositoryInsightsProps) {
  const [currentMetric, setCurrentMetric] = useState<
    "size" | "stars" | "forks" | "loc"
  >("size");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [hoveredRepo, setHoveredRepo] = useState<string | null>(null);

  const metrics = {
    size: {
      label: "Repository Sizes",
      format: (value: number) => `${(value / 1024).toFixed(1)} MB`,
      icon: <BarChart3 className="w-4 h-4" />,
    },
    loc: {
      label: "Lines of Code",
      format: (value: number) => `${(value / 1000).toFixed(1)}k lines`,
      icon: <Code2 className="w-4 h-4" />,
    },
    stars: {
      label: "Star Count",
      format: (value: number) => value.toLocaleString(),
      icon: <span className="text-sm">⭐</span>,
    },
    forks: {
      label: "Fork Count",
      format: (value: number) => value.toLocaleString(),
      icon: <span className="text-sm">🔱</span>,
    },
  };

  const chartData = useMemo(() => {
    return repositories
      .filter((repo) =>
        repo.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((repo) => {
        const totalLOC = repo.languages
          ? Object.values(repo.languages).reduce((sum, lines) => sum + lines, 0)
          : 0;

        return {
          name: repo.name,
          size: repo.size || 0,
          stars: repo.stargazers_count || 0,
          forks: repo.forks_count || 0,
          loc: totalLOC,
        };
      })
      .sort((a, b) => {
        const comparison = b[currentMetric] - a[currentMetric];
        return sortDirection === "asc" ? -comparison : comparison;
      })
      .slice(0, 10);
  }, [repositories, currentMetric, searchTerm, sortDirection]);

  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEEAD",
    "#D4A5A5",
    "#9B59B6",
    "#3498DB",
    "#E67E22",
    "#2ECC71",
  ];

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

        <CardHeader className="relative space-y-4 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Repository Insights
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                <Input
                  placeholder="Search repositories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-9 ${statsButtonClasses.search}`}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className={statsButtonClasses.icon}
                onClick={() =>
                  setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
                }
              >
                {sortDirection === "asc" ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-wrap gap-2">
              {Object.entries(metrics).map(([key, { label, icon }]) => (
                <Button
                  key={key}
                  variant={currentMetric === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentMetric(key as typeof currentMetric)}
                  className={
                    currentMetric === key
                      ? statsButtonClasses.default
                      : statsButtonClasses.outline
                  }
                >
                  {icon}
                  <span className="ml-2">{label}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative p-6">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const value = payload[0].value;
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-lg bg-background/95 p-2 shadow-md border"
                        >
                          <p className="font-medium">
                            {payload[0].payload.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {metrics[currentMetric].format(value as number)}
                          </p>
                        </motion.div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey={currentMetric}
                  radius={[4, 4, 4, 4]}
                  className="animate-in fade-in duration-1000"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                      opacity={
                        hoveredRepo === null || hoveredRepo === entry.name
                          ? 1
                          : 0.3
                      }
                      onMouseEnter={() => setHoveredRepo(entry.name)}
                      onMouseLeave={() => setHoveredRepo(null)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
