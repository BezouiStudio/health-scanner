
'use client';

import { useEffect, useState } from 'react';
import { generateHealthScore, type GenerateHealthScoreInput, type GenerateHealthScoreOutput } from '@/ai/flows/generate-health-score';
import ScoreDisplay from './ScoreDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Info, Activity } from 'lucide-react'; // Added Activity icon

interface HealthScoreLoaderProps {
  productName: string;
  ingredients: string;
}

export default function HealthScoreLoader({ productName, ingredients }: HealthScoreLoaderProps) {
  const [healthScoreData, setHealthScoreData] = useState<GenerateHealthScoreOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchScore() {
      if (!productName || !ingredients) {
        if (isMounted) {
          setError('Product name or ingredients missing, cannot generate score.');
          setLoading(false);
        }
        return;
      }
      if (isMounted) {
        setLoading(true);
        setError(null);
      }
      try {
        const input: GenerateHealthScoreInput = { productName, ingredients };
        const output = await generateHealthScore(input);
        if (isMounted) {
          setHealthScoreData(output);
        }
      } catch (err) {
        console.error('Error generating health score:', err);
        if (isMounted) {
          setError('Failed to generate health score. The AI assistant might be unavailable or an error occurred.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchScore();
    
    return () => {
      isMounted = false;
    };
  }, [productName, ingredients]);

  if (loading) {
    return (
      <div className="p-4 md:p-6 border border-dashed border-border/70 rounded-lg bg-secondary/30 shadow-sm">
        <h2 className="text-xl font-semibold mb-3 flex items-center text-foreground/80">
          <Activity className="w-6 h-6 mr-2.5 text-accent animate-spin" />
          Health Score & Analysis
        </h2>
        <div className="animate-pulse">
            <p className="text-sm text-muted-foreground mb-4">Generating AI-powered health score, please wait...</p>
            <div className="flex items-center gap-4 mb-4">
                <Skeleton className="h-14 w-32 rounded-full bg-muted" />
                <Skeleton className="h-7 w-48 bg-muted" />
            </div>
            <Skeleton className="h-6 w-1/3 mb-2.5 bg-muted" />
            <Skeleton className="h-4 w-full mb-1.5 bg-muted" />
            <Skeleton className="h-4 w-5/6 mb-1.5 bg-muted" />
            <Skeleton className="h-4 w-3/4 bg-muted" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4 shadow-md">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>Health Score Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!healthScoreData || typeof healthScoreData.healthScore !== 'number') {
    return (
       <Alert variant="default" className="my-4 shadow-sm border-dashed">
        <Info className="h-5 w-5 text-accent" />
        <AlertTitle>Health Score Not Available</AlertTitle>
        <AlertDescription>
          The health score for this product could not be determined at this time. This might be due to missing information or an issue with the analysis.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-4 md:p-6 border rounded-lg bg-card shadow-lg">
      <h2 className="text-xl md:text-2xl font-semibold mb-3 flex items-center text-foreground">
        <Info className="w-6 h-6 mr-2.5 text-accent" />
        Health Score & Analysis
      </h2>
      <ScoreDisplay score={healthScoreData.healthScore} explanation={healthScoreData.explanation} />
    </div>
  );
}
