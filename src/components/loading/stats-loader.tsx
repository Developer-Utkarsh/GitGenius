import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const devFacts = [
  "Did you know? The first computer bug was an actual bug - a moth found in the Harvard Mark II computer in 1947.",
  "JavaScript was created in just 10 days by Brendan Eich in 1995.",
  "The first programmer in history was Ada Lovelace, who wrote the first algorithm in 1843.",
  "Git was created by Linus Torvalds, who also created Linux.",
  "The term 'debugging' was coined by Grace Hopper after removing a moth from a computer.",
];

export const StatsLoader = () => {
  const randomFact = devFacts[Math.floor(Math.random() * devFacts.length)];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8 relative z-10 max-w-2xl mx-auto p-8"
      >
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
          <div className="relative bg-gradient-to-br from-primary/80 to-purple-500/80 p-5 rounded-full">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Analyzing GitHub Profile
          </h3>
          <p className="text-gray-400 text-lg">{randomFact}</p>
        </div>

        <div className="flex gap-3 justify-center">
          <div
            className="w-3 h-3 rounded-full bg-primary/50 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-3 h-3 rounded-full bg-primary/50 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-3 h-3 rounded-full bg-primary/50 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </motion.div>
    </div>
  );
};
