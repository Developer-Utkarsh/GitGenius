import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface YearSelectorProps {
  years: number[];
  selectedYear: string;
  onYearChange: (year: string) => void;
  accountCreatedYear: number;
}

export const YearSelector = ({
  years,
  selectedYear,
  onYearChange,
  accountCreatedYear,
}: YearSelectorProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="relative group flex items-center gap-2 px-4 py-2 bg-background/50 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300"
        >
          <Calendar className="h-4 w-4 text-primary" />
          <span className="font-medium">
            {selectedYear === "all" ? "All Time" : selectedYear}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:translate-y-0.5 transition-transform duration-300" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"
            initial={false}
            animate={{ opacity: [0, 0.2, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[200px] backdrop-blur-xl bg-background/95 border border-white/10"
        align="end"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <DropdownMenuItem
            className={`flex items-center gap-2 ${
              selectedYear === "all"
                ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-primary"
                : ""
            }`}
            onClick={() => onYearChange("all")}
          >
            <Calendar className="h-4 w-4" />
            <span>All Time</span>
          </DropdownMenuItem>
          {years
            .filter((year) => year >= accountCreatedYear)
            .map((year, index) => (
              <DropdownMenuItem
                key={year}
                className={`${
                  selectedYear === year.toString()
                    ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-primary"
                    : ""
                }`}
                onClick={() => onYearChange(year.toString())}
              >
                {year}
              </DropdownMenuItem>
            ))}
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
