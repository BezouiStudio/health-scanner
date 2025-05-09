
'use client';

import { useEffect, useState } from 'react';
import { generateHealthScore, type GenerateHealthScoreInput, type GenerateHealthScoreOutput } from '@/ai/flows/generate-health-score';
import ScoreDisplay from './ScoreDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';

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
        setError('Product name or ingredients missing, cannot generate score.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
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
      <div className="p-4 border rounded-lg bg-secondary/50">
        <h2 className="text-xl font-semibold mb-3 flex items-center">
          <Info className="w-5 h-5 mr-2 text-accent animate-pulse" />
          Health Score & Analysis
        </h2>
        <div className="animate-pulse">
            <p className="text-sm text-muted-foreground mb-3">Generating AI-powered health score...</p>
            <div className="flex items-center gap-3 mb-3">
                <Skeleton className="h-12 w-28 rounded-full" />
                <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-6 w-1/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-5/6 mb-1" />
            <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Health Score Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!healthScoreData || typeof healthScoreData.healthScore !== 'number') {
    return (
       <Alert variant="default" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Health Score Not Available</AlertTitle>
        <AlertDescription>
          The health score for this product could not be determined at this time.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-secondary/50">
      <h2 className="text-xl font-semibold mb-2 flex items-center">
        <Info className="w-5 h-5 mr-2 text-accent" />
        Health Score & Analysis
      </h2>
      <ScoreDisplay score={healthScoreData.healthScore} explanation={healthScoreData.explanation} />
    </div>
  );
}
