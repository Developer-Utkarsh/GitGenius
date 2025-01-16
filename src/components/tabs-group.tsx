"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ProfileOverview } from "./profile/profile-overview";
import { RepositoryInsights } from "./stats/repository-insights";
import { RepositoryList } from "./repository/repository-list";
import { ContributionTimeline } from "./stats/contribution-timeline";
import { LanguageEvolution } from "./stats/language-evolution";
import { MonthlyCodeActivity } from "./stats/monthly-code-activity";
import { LanguageDistribution } from "./charts/language-distribution";
import { GitHubStats, GitHubUser, Repository } from "@/types/github";
import {
  Activity,
  Code2,
  GitFork,
  Layout,
  MessageSquareCode,
} from "lucide-react";
import { AiChat } from "@/components/AiChat";

interface TabsGroupProps {
  repositories: Repository[];
  selectedYear: string;
  userData: GitHubUser;
  stats: GitHubStats;
  onYearChange: (year: string) => void;
  aggregatedLanguages: Record<string, number>;
  isAllTime: boolean;
}

const tabs = [
  {
    id: "overview",
    label: "Overview",
    icon: <Layout className="w-4 h-4" />,
  },
  {
    id: "repositories",
    label: "Repositories",
    icon: <GitFork className="w-4 h-4" />,
  },
  {
    id: "activity",
    label: "Activity",
    icon: <Activity className="w-4 h-4" />,
  },
  {
    id: "languages",
    label: "Languages",
    icon: <Code2 className="w-4 h-4" />,
  },
  {
    id: "ai-chat",
    label: "AI Chat",
    icon: <MessageSquareCode className="w-4 h-4" />,
    highlight: true,
    gradient: true,
  },
];

export function TabsGroup({
  repositories,
  selectedYear,
  userData,
  stats,
  onYearChange,
  aggregatedLanguages,
  isAllTime,
}: TabsGroupProps) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const navRef = useRef<HTMLDivElement>(null);

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <ProfileOverview
            user={userData}
            repositories={repositories}
            stats={stats}
          />
        );
      case "repositories":
        return (
          <div className="space-y-6">
            <RepositoryInsights repositories={repositories} />
            <RepositoryList repositories={repositories} />
          </div>
        );
      case "activity":
        return (
          <div className="space-y-6">
            <ContributionTimeline
              repositories={repositories}
              selectedYear={selectedYear}
              accountCreatedYear={parseInt(userData.created_at.split("-")[0])}
              onYearChange={onYearChange}
            />
            <MonthlyCodeActivity
              repositories={repositories}
              selectedYear={selectedYear}
              isAllTime={isAllTime}
            />
          </div>
        );
      case "languages":
        return (
          <div className="space-y-6">
            <LanguageEvolution
              repositories={repositories}
              selectedYear={selectedYear}
              isAllTime={isAllTime}
            />
            <LanguageDistribution
              languages={aggregatedLanguages}
              repositories={repositories}
              selectedYear={selectedYear}
              isAllTime={isAllTime}
            />
          </div>
        );
      case "ai-chat":
        return (
          <AiChat
            userData={userData}
            stats={stats}
            repositories={repositories}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <motion.div
          className="relative rounded-2xl overflow-hidden backdrop-blur-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Subtle gradient backgrounds */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-background/10 to-primary/5" />
          <div className="absolute inset-0 bg-black/40" />

          {/* Navigation */}
          <nav
            ref={navRef}
            className="relative flex items-center px-1.5 py-1.5"
          >
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2.5 transition-all",
                  activeTab === tab.id
                    ? "text-primary"
                    : "text-gray-400 hover:text-primary hover:border-b hover:border-primary",
                  tab.highlight && "animate-pulse-subtle hover:animate-none"
                )}
                whileHover={{
                  //   backgroundColor: "rgba(255, 255, 255, 0.03)",
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.span
                  className={cn(
                    "relative z-10 flex items-center gap-2",
                    tab.gradient &&
                      "bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent"
                  )}
                  initial={false}
                  animate={{
                    color: activeTab === tab.id ? "var(--primary)" : "",
                  }}
                >
                  {tab.icon}
                  <span className="font-medium">
                    {tab.label}
                    {tab.highlight && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                        New
                      </span>
                    )}
                  </span>
                </motion.span>
                {activeTab === tab.id && (
                  <>
                    <motion.div
                      layoutId="active-tab-bg"
                      className="absolute inset-0 rounded-lg bg-white/5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                    <motion.div
                      layoutId="active-tab-border"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-primary via-primary/80 to-primary"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </>
                )}
              </motion.button>
            ))}
          </nav>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.3,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="relative w-full"
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
