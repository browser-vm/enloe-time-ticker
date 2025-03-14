import { useState, useEffect } from 'react';
import { Code } from 'lucide-react';
import { cn } from '@/lib/utils';

const LinesOfCodeCounter = ({ className }: { className?: string }) => {
  const [linesOfCode, setLinesOfCode] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const countLines = async () => {
      setIsLoading(true);
      try {
        // Use dynamic import to avoid blocking the main thread
        const glob = (await import('glob')).glob;
        const fs = await import('fs/promises');
        const path = await import('path');

        // Specify the files to include/exclude
        const includePatterns = [
          '**/*.ts',
          '**/*.tsx',
          '**/*.js',
          '**/*.jsx',
          '**/*.css',
        ];
        const excludePatterns = [
          'node_modules/**',
          '.next/**',
          '.git/**',
          'dist/**',
          'build/**',
        ];

        // Use glob to find all files matching the include patterns and not matching the exclude patterns
        const files = await glob(includePatterns, { ignore: excludePatterns, nodir: true });

        let totalLines = 0;
        for (const file of files) {
          const filePath = path.resolve(process.cwd(), file); // Ensure absolute path
          const fileContent = await fs.readFile(filePath, 'utf-8');
          totalLines += fileContent.split('\n').length;
        }

        setLinesOfCode(totalLines);
      } catch (error) {
        console.error("Failed to count lines of code:", error);
        setLinesOfCode(null); // or some error value
      } finally {
        setIsLoading(false);
      }
    };

    countLines();
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
