import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { Repository } from "@/types/github";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { cardGradientClasses } from "../ui/card-gradient";
import { statsButtonClasses } from "@/components/ui/stats-button";

interface LanguageEvolutionProps {
  repositories: Repository[];
  selectedYear: string;
  isAllTime: boolean;
}

export function LanguageEvolution({
  repositories,
  selectedYear,
  isAllTime,
}: LanguageEvolutionProps) {
  const allLanguages = new Set(
    repositories.flatMap((repo) =>
      repo.languages ? Object.keys(repo.languages) : []
    )
  );

  const topLanguages = Array.from(allLanguages)
    .map((lang) => ({
      language: lang,
      total: repositories.reduce(
        (sum, repo) => sum + (repo.languages?.[lang] || 0),
        0
      ),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map(({ language }) => language);

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showPercentage, setShowPercentage] = useState(false);
  const [activeLanguages, setActiveLanguages] = useState<Set<string>>(
    new Set(topLanguages)
  );

  const yearlyData = Array.from(
    new Set(repositories.map((repo) => new Date(repo.created_at).getFullYear()))
  ).sort((a, b) => b - a);

  const languageTimeline = repositories
    .filter((repo) => new Date(repo.created_at).getFullYear() === currentYear)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    .reduce((acc, repo) => {
      const date = new Date(repo.created_at);
      const month = date.toLocaleString("default", { month: "short" });

      if (repo.languages) {
        const monthTotal = Object.values(repo.languages).reduce(
          (sum, bytes) => sum + Number(bytes),
          0
        );
        Object.entries(repo.languages).forEach(([lang, bytes]) => {
          if (activeLanguages.has(lang)) {
            const existing = acc.find((item) => item.month === month);
            const value = showPercentage
              ? (Number(bytes) / monthTotal) * 100
              : Number(bytes);
            if (existing) {
              existing[lang] = (Number(existing[lang]) || 0) + value;
            } else {
              acc.push({
                month,
                [lang]: value,
              });
            }
          }
        });
      }
      return acc;
    }, [] as Array<{ month: string; [key: string]: number | string }>);

  const colors = {
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
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className={cardGradientClasses.wrapper}>
        {cardGradientClasses.gradients.map((className, i) => (
          <div key={i} className={className} />
        ))}

        <CardHeader className="relative space-y-0 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Language Evolution
            </CardTitle>
            <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                className={statsButtonClasses.icon}
                onClick={() => {
                  const currentIndex = yearlyData.indexOf(currentYear);
                  if (currentIndex < yearlyData.length - 1) {
                    setCurrentYear(yearlyData[currentIndex + 1]);
                  }
                }}
                disabled={
                  yearlyData.indexOf(currentYear) === yearlyData.length - 1
                }
              >
                <ChevronLeft className="h-4 w-4 text-white" />
              </Button>
              <span className="font-medium text-white px-2">{currentYear}</span>
              <Button
                variant="ghost"
                size="icon"
                className={statsButtonClasses.icon}
                onClick={() => {
                  const currentIndex = yearlyData.indexOf(currentYear);
                  if (currentIndex > 0) {
                    setCurrentYear(yearlyData[currentIndex - 1]);
                  }
                }}
                disabled={yearlyData.indexOf(currentYear) === 0}
              >
                <ChevronRight className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className={`${statsButtonClasses.outline} min-w-[120px] justify-center`}
              onClick={() => setShowPercentage(!showPercentage)}
            >
              <span className="text-white">
                {showPercentage ? "Show Absolute" : "Show Percentage"}
              </span>
            </Button>
            {topLanguages.map((lang) => (
              <Button
                key={lang}
                variant={activeLanguages.has(lang) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const newActive = new Set(activeLanguages);
                  if (newActive.has(lang)) {
                    newActive.delete(lang);
                  } else {
                    newActive.add(lang);
                  }
                  setActiveLanguages(newActive);
                }}
                className={cn(
                  "transition-all font-medium",
                  activeLanguages.has(lang)
                    ? statsButtonClasses.default
                    : statsButtonClasses.outline,
                  "flex items-center gap-2"
                )}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      colors[lang as keyof typeof colors] ||
                      `hsl(${
                        Object.keys(colors).indexOf(lang) * 60
                      }, 70%, 50%)`,
                  }}
                />
                <span className="text-white">{lang}</span>
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="relative p-6">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={languageTimeline}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#888", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#888", fontSize: 12 }}
                  width={60}
                  tickFormatter={(value) =>
                    showPercentage
                      ? `${value.toFixed(0)}%`
                      : `${(value / 1024).toFixed(0)}k`
                  }
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-lg bg-black/80 backdrop-blur-md p-3 border border-white/10 shadow-xl"
                        >
                          <p className="font-medium text-white">{`${label} ${currentYear}`}</p>
                          <div className="space-y-1 mt-1">
                            {payload.map((entry, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-sm text-gray-300">
                                  {entry.name}:{" "}
                                  {showPercentage
                                    ? `${Number(entry.value).toFixed(1)}%`
                                    : `${(Number(entry.value) / 1024).toFixed(
                                        1
                                      )}k`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      );
                    }
                    return null;
                  }}
                />
                {topLanguages.map((language, index) => (
                  <Line
                    key={language}
                    type="monotone"
                    dataKey={language}
                    stroke={
                      colors[language as keyof typeof colors] ||
                      `hsl(${index * 60}, 70%, 50%)`
                    }
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2 }}
                    opacity={activeLanguages.has(language) ? 1 : 0}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
