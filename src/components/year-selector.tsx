import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-white/5 hover:bg-white/10">
          <Calendar className="h-4 w-4" />
          {selectedYear === "all" ? "All Time" : selectedYear}
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card">
        <DialogHeader>
          <DialogTitle className="text-gradient">Select Year</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-2 p-4">
          <Button
            key="all"
            variant={selectedYear === "all" ? "default" : "outline"}
            onClick={() => onYearChange("all")}
            className="bg-white/5 hover:bg-white/10"
          >
            All Time
          </Button>
          {years
            .filter((year) => year >= accountCreatedYear)
            .map((year) => (
              <Button
                key={year}
                variant={selectedYear === year.toString() ? "default" : "outline"}
                onClick={() => onYearChange(year.toString())}
                className="bg-white/5 hover:bg-white/10"
              >
                {year}
              </Button>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};