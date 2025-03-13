
import { useEffect, useState } from "react";
import { Period } from "@/types/schedule";
import { cn } from "@/lib/utils";

interface TimeCardProps {
  title: string;
  time: string | null;
  subtitle?: string;
  period?: Period | null;
  progress?: number;
  className?: string;
  isActive?: boolean;
  style?: React.CSSProperties;
}

const TimeCard = ({
  title,
  time,
  subtitle,
  period,
  progress = 0,
  className,
  isActive = false,
  style,
}: TimeCardProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const timeout = setTimeout(() => {
      setMounted(true);
    }, 100);
    
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className={cn(
        "glass-card p-6 transition-all duration-500 overflow-hidden",
        isActive ? "border-enloe-yellow/50 shadow-lg" : "border-white/20",
        mounted ? "opacity-100 transform-none" : "opacity-0 translate-y-4",
        className
      )}
      style={style}
    >
      <div className="space-y-2">
        <h3 className={cn(
          "text-sm font-medium uppercase tracking-wider",
          isActive ? "text-enloe-yellow" : "text-enloe-green/80"
        )}>
          {title}
        </h3>
        
        <div className={cn(
          "text-3xl md:text-4xl font-bold transition-all duration-300",
          isActive ? "timer-text enloe-yellow-gradient-text" : "timer-text enloe-gradient-text"
        )}>
          {time || "--:--"}
        </div>
        
        {subtitle && (
          <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
        )}
        
        {period && (
          <div className="mt-2 text-sm">
            <span className="font-medium">{period.name}</span>
            <span className="text-gray-500 text-xs ml-2">
              {period.startTime} - {period.endTime}
            </span>
          </div>
        )}
        
        {progress > 0 && (
          <div className="mt-3">
            <div className="progress-bar-container">
              <div 
                className="progress-bar"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1 text-right">
              {Math.round(progress)}% complete
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeCard;
