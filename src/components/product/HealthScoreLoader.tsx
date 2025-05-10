'use client';

import { useEffect, useState } from 'react';
import { generateHealthScore, type GenerateHealthScoreInput, type GenerateHealthScoreOutput } from '@/ai/flows/generate-health-score';
import ScoreDisplay from './ScoreDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Info, Activity, ShieldCheck } from 'lucide-react';
import AlternativeProductsLoader from './AlternativeProductsLoader';

interface HealthScoreLoaderProps {
  productName: string;
  ingredients: string;
  productCategories?: string;
  productType: 'food' | 'cosmetic' | 'unknown';
}

const LOW_SCORE_THRESHOLD = 5; // Products with score < 5 will show alternatives

export default function HealthScoreLoader({ productName, ingredients, productCategories, productType }: HealthScoreLoaderProps) {
  const [healthScoreData, setHealthScoreData] = useState<GenerateHealthScoreOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchScore() {
      if (!isMounted) return;

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
        const input: GenerateHealthScoreInput = { productName, ingredients, productType }; // Pass productType
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
  }, [productName, ingredients, productType]);

  if (loading) {
    return (
      <div className="p-4 md:p-6 border border-dashed border-border/70 rounded-xl bg-secondary/30 shadow-inner">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 flex items-center text-foreground/80">
          <Activity className="w-7 h-7 mr-3 text-accent animate-spin" />
          Health Score & Analysis
        </h2>
        <div className="animate-pulse">
            <p className="text-sm text-muted-foreground mb-5">Generating AI-powered health score, please wait...</p>
            <div className="flex items-center gap-x-5 gap-y-3 mb-5 flex-wrap">
                <Skeleton className="h-20 w-20 rounded-full bg-muted/70" />
                <div className="space-y-2.5 flex-1 min-w-[150px]">
                  <Skeleton className="h-8 w-48 bg-muted/70" />
                  <Skeleton className="h-5 w-32 bg-muted/60" />
                </div>
            </div>
            <Skeleton className="h-6 w-1/3 mb-3 bg-muted/70" />
            <Skeleton className="h-4 w-full mb-2 bg-muted/60" />
            <Skeleton className="h-4 w-5/6 mb-2 bg-muted/60" />
            <Skeleton className="h-4 w-3/4 bg-muted/60" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4 shadow-lg rounded-xl p-5">
        <AlertCircle className="h-6 w-6" />
        <AlertTitle className="text-lg">Health Score Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!healthScoreData || typeof healthScoreData.healthScore !== 'number') {
    return (
       <Alert variant="default" className="my-4 shadow-md rounded-xl border-dashed p-5">
        <Info className="h-6 w-6 text-accent" />
        <AlertTitle className="text-lg">Health Score Not Available</AlertTitle>
        <AlertDescription>
          The health score for this product could not be determined. This might be due to missing information or an issue with the AI analysis.
        </AlertDescription>
      </Alert>
    );
  }

  const showAlternatives = healthScoreData.healthScore < LOW_SCORE_THRESHOLD && productName !== 'Unknown Product';

  return (
    <>
      <div className="p-4 md:p-6 border rounded-xl bg-card shadow-xl mb-8">
        <h2 className="text-xl md:text-2xl font-bold mb-5 flex items-center text-foreground">
          <ShieldCheck className="w-7 h-7 mr-3 text-primary opacity-90" />
          AI Health Score & Analysis
        </h2>
        <ScoreDisplay score={healthScoreData.healthScore} explanation={healthScoreData.explanation} />
      </div>

      {showAlternatives && (
        <AlternativeProductsLoader
          productName={productName}
          productCategories={productCategories}
          productIngredients={ingredients}
          productType={productType}
          currentHealthScore={healthScoreData.healthScore}
        />
      )}
    </>
  );
}
