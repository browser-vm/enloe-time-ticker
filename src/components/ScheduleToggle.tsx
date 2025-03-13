
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ScheduleToggleProps {
  scheduleType: "aLunch" | "bLunch";
  onChange: (value: "aLunch" | "bLunch") => void;
  className?: string;
  style?: React.CSSProperties;
}

const ScheduleToggle = ({ scheduleType, onChange, className, style }: ScheduleToggleProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={cn("flex items-center justify-center space-x-2 p-2", className)} style={style}>
      <button
        onClick={() => onChange("aLunch")}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative",
          scheduleType === "aLunch"
            ? "bg-enloe-green text-white shadow-lg"
            : "bg-white/80 text-enloe-dark hover:bg-enloe-green/10"
        )}
      >
        A-Lunch
        {scheduleType === "aLunch" && (
          <span className="absolute inset-0 bg-enloe-yellow/20 rounded-full animate-pulse-subtle" />
        )}
      </button>
      
      <button
        onClick={() => onChange("bLunch")}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative",
          scheduleType === "bLunch"
            ? "bg-enloe-green text-white shadow-lg"
            : "bg-white/80 text-enloe-dark hover:bg-enloe-green/10"
        )}
      >
        B-Lunch
        {scheduleType === "bLunch" && (
          <span className="absolute inset-0 bg-enloe-yellow/20 rounded-full animate-pulse-subtle" />
        )}
      </button>
    </div>
  );
};

export default ScheduleToggle;
