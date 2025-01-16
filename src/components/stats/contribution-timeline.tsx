import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  format,
  startOfWeek,
  addDays,
  subDays,
  isSameDay,
  parseISO,
} from "date-fns";
import { useMemo, useState } from "react";
import { Activity, Flame, Trophy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Repository } from "@/types/github";
import { YearSelector } from "../year-selector";

interface ContributionTimelineProps {
  repositories: Repository[];
  selectedYear: string;
  accountCreatedYear: number;
  onYearChange: (year: string) => void;
}

export function ContributionTimeline({
  repositories,
  selectedYear,
  accountCreatedYear,
  onYearChange,
}: ContributionTimelineProps) {
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentYear = new Date().getFullYear().toString();
  const currentYearNum = parseInt(currentYear);

  // Calculate contribution data
  const contributionData = useMemo(() => {
    const commits = repositories.flatMap((repo) =>
      Array.isArray(repo.commits) ? repo.commits : []
    );

    const commitsByDate = new Map<string, number>();

    commits.forEach((commit) => {
      if (!commit.date) return;
      const date = commit.date.split("T")[0];
      const commitYear = date.split("-")[0];

      // Filter by selected year
      if (selectedYear !== "all" && commitYear !== selectedYear) return;

      commitsByDate.set(date, (commitsByDate.get(date) || 0) + commit.count);
    });

    return commitsByDate;
  }, [repositories, selectedYear]);

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date();
    const dates = Array.from(contributionData.keys()).sort();

    // Calculate current streak
    let currentStreak = 0;
    let currentDate = today;

    while (true) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const count = contributionData.get(dateStr) || 0;

      if (count === 0) break;
      currentStreak++;
      currentDate = subDays(currentDate, 1);
    }

    // Calculate max streak
    let maxStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    dates
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .forEach((dateStr) => {
        const count = contributionData.get(dateStr) || 0;
        const currentDate = parseISO(dateStr);

        if (count > 0) {
          if (!prevDate || isSameDay(addDays(prevDate, 1), currentDate)) {
            tempStreak++;
            maxStreak = Math.max(maxStreak, tempStreak);
          } else {
            tempStreak = 1;
          }
          prevDate = currentDate;
        } else {
          tempStreak = 0;
          prevDate = null;
        }
      });

    // Calculate total commits
    const totalCommits = Array.from(contributionData.values()).reduce(
      (sum, count) => sum + count,
      0
    );

    return {
      totalCommits,
      currentStreak,
      maxStreak,
    };
  }, [contributionData]);

  // Generate calendar data
  const calendarData = useMemo(() => {
    const year = parseInt(selectedYear);
    const startDate = new Date(year, 0, 1);
    const endDate =
      selectedYear === currentYear ? new Date() : new Date(year, 11, 31);

    const firstSunday = startOfWeek(startDate);
    const weeks: (Date | null)[][] = [];
    let currentDate = firstSunday;

    while (currentDate <= endDate) {
      const week: (Date | null)[] = [];
      for (let i = 0; i < 7; i++) {
        const date = addDays(currentDate, i);
        // Only include dates from the selected year
        if (date.getFullYear() === year && date <= endDate) {
          week.push(date);
        } else {
          week.push(null);
        }
      }
      if (week.some((date) => date !== null)) {
        weeks.push(week);
      }
      currentDate = addDays(currentDate, 7);
    }

    return weeks;
  }, [selectedYear, currentYear]);

  // Generate month labels
  const monthLabels = useMemo(() => {
    const months: { month: string; index: number }[] = [];
    let currentMonth = -1;

    calendarData.forEach((week, weekIndex) => {
      // Check if week has valid dates
      if (week && week[0]) {
        const monthIndex = week[0].getMonth();
        if (monthIndex !== currentMonth) {
          months.push({
            month: format(week[0], "MMM"),
            index: weekIndex,
          });
          currentMonth = monthIndex;
        }
      }
    });

    return months;
  }, [calendarData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="overflow-hidden border-0 relative shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-primary/10 to-blue-500/20 backdrop-blur-xl animate-gradient" />
        <div className="absolute inset-0 bg-black/30" />

        <CardHeader className="relative space-y-0 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Contribution Timeline
            </CardTitle>
            <YearSelector
              years={Array.from(
                { length: currentYearNum - accountCreatedYear + 1 },
                (_, i) => currentYearNum - i
              )}
              selectedYear={selectedYear}
              onYearChange={onYearChange}
              accountCreatedYear={accountCreatedYear}
            />
          </div>
        </CardHeader>

        <CardContent className="relative space-y-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/5">
              <Activity className="w-4 h-4 mb-2 text-primary" />
              <span className="text-sm text-muted-foreground">
                Total Commits
              </span>
              <span className="text-2xl font-bold">{stats.totalCommits}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/5">
              <Flame className="w-4 h-4 mb-2 text-orange-400" />
              <span className="text-sm text-muted-foreground">
                Current Streak
              </span>
              <span className="text-2xl font-bold">
                {stats.currentStreak} days
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/5">
              <Trophy className="w-4 h-4 mb-2 text-yellow-400" />
              <span className="text-sm text-muted-foreground">
                Longest Streak
              </span>
              <span className="text-2xl font-bold">{stats.maxStreak} days</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 ">
            <div className="flex mt-4">
              <div className="grid grid-cols-1 gap-0 mr-2 text-xs text-gray-400">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="h-0 flex items-center p-0 m-0 text-xs -mt-0"
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <div className="relative flex gap-[6px] ">
                  {calendarData.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-rows-7 gap-[6px]">
                      {week.map((date, dayIndex) => {
                        if (!date) {
                          // Render empty space for dates outside selected year
                          return (
                            <div
                              key={`empty-${dayIndex}`}
                              className="w-[14px] h-[14px]"
                            />
                          );
                        }

                        const dateStr = format(date, "yyyy-MM-dd");
                        const count = contributionData.get(dateStr) || 0;
                        const level = getContributionLevel(count);

                        return (
                          <TooltipProvider key={dateStr}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                {date.getFullYear() ===
                                  parseInt(selectedYear) && (
                                  <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                      delay: weekIndex * 0.01 + dayIndex * 0.01,
                                    }}
                                    className={cn(
                                      "w-[14px] h-[14px] rounded-full cursor-pointer transition-all duration-200",
                                      level === 0 &&
                                        "bg-[#161b22] hover:bg-[#161b22]/80",
                                      level === 1 &&
                                        "bg-[#0e4429] hover:bg-[#0e4429]/80",
                                      level === 2 &&
                                        "bg-[#006d32] hover:bg-[#006d32]/80",
                                      level === 3 &&
                                        "bg-[#26a641] hover:bg-[#26a641]/80",
                                      level === 4 &&
                                        "bg-[#39d353] hover:bg-[#39d353]/80",
                                      activeDay === dateStr &&
                                        "ring-2 ring-primary ring-offset-1"
                                    )}
                                    onMouseEnter={() => setActiveDay(dateStr)}
                                    onMouseLeave={() => setActiveDay(null)}
                                  />
                                )}
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-xs">
                                  <p className="font-medium">
                                    {format(date, "MMM dd, yyyy")}
                                  </p>
                                  <p>{count} commits</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </div>
                  ))}
                </div>
                {/* Month labels */}
                <div className="flex mt-1 ml-5">
                  {monthLabels.map(({ month, index }, i) => (
                    <div
                      key={`${month}-${index}`}
                      className="text-xs text-gray-400"
                      style={{
                        position: "relative",
                        left: `${index * 7}px`, // 10px (box width) + 3px (gap)
                        marginRight:
                          i === monthLabels.length - 1 ? "0" : "41px",
                      }}
                    >
                      {month}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 text-xs text-gray-400 mt-4">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "w-[10px] h-[10px] rounded-sm",
                    level === 0 && "bg-[#161b22]",
                    level === 1 && "bg-[#0e4429]",
                    level === 2 && "bg-[#006d32]",
                    level === 3 && "bg-[#26a641]",
                    level === 4 && "bg-[#39d353]"
                  )}
                />
              ))}
              <span>More</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function getContributionLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}
