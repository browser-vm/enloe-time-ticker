
import { useState, useEffect } from 'react';
import { Code } from 'lucide-react';
import { cn } from '@/lib/utils';

const LinesOfCodeCounter = ({ className }: { className?: string }) => {
  const [linesOfCode, setLinesOfCode] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This is a simulated count that would normally come from an API
    // In a real app, you would fetch this from your backend
    const simulatedCount = 2630; // Example count
    
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLinesOfCode(simulatedCount);
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <Code className="h-4 w-4 text-enloe-green dark:text-enloe-yellow" />
      <span className="font-medium">
        {isLoading ? (
          <span className="animate-pulse">Counting lines...</span>
        ) : (
          <>
            <span className="font-bold">{linesOfCode?.toLocaleString()}</span> lines of code
          </>
        )}
      </span>
    </div>
  );
};

export default LinesOfCodeCounter;
