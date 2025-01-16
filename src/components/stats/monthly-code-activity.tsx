import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cardGradientClasses } from "../ui/card-gradient";

interface Repository {
  created_at: string;
  size?: number;
  languages_url?: string;
}

interface MonthlyCodeActivityProps {
  repositories: Repository[];
  selectedYear: string;
  isAllTime: boolean;
}

export function MonthlyCodeActivity({
  repositories,
  selectedYear: globalYear,
  isAllTime,
}: MonthlyCodeActivityProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(parseInt(globalYear));
  }, [globalYear]);

  const yearlyData = useMemo(() => {
    const years = new Set(
      repositories.map((repo) => new Date(repo.created_at).getFullYear())
    );
    return Array.from(years).sort((a, b) => b - a);
  }, [repositories]);

  const monthlyData = useMemo(() => {
    return repositories
      .filter((repo) => new Date(repo.created_at).getFullYear() === currentYear)
      .reduce((acc, repo) => {
        const month = new Date(repo.created_at).getMonth();
        acc[month] = (acc[month] || 0) + (repo.size || 0);
        return acc;
      }, {} as Record<number, number>);
  }, [repositories, currentYear]);

  const chartData = useMemo(() => {
    return Array.from({ length: 12 }, (_, month) => ({
      month: new Date(2000, month).toLocaleString("default", {
        month: "short",
      }),
      loc: monthlyData[month] || 0,
    }));
  }, [monthlyData]);

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
              Monthly Code Activity
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="border-white/10 hover:border-white/20"
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
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium text-white/80">{currentYear}</span>
              <Button
                variant="outline"
                size="icon"
                className="border-white/10 hover:border-white/20"
                onClick={() => {
                  const currentIndex = yearlyData.indexOf(currentYear);
                  if (currentIndex > 0) {
                    setCurrentYear(yearlyData[currentIndex - 1]);
                  }
                }}
                disabled={yearlyData.indexOf(currentYear) === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative p-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
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
                  tickFormatter={(value) => `${(value / 1024).toFixed(1)}k`}
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
                          <p className="text-sm text-gray-300">
                            {`${((payload[0].value as number) / 1024).toFixed(
                              1
                            )}k lines`}
                          </p>
                        </motion.div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="loc" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`hsl(${index * 30}, 70%, 50%)`}
                      className="opacity-80 hover:opacity-100 transition-opacity"
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
