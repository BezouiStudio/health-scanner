'use client';

import { useEffect, useState } from 'react';
import { generateAlternatives, type GenerateAlternativesInput, type GenerateAlternativesOutput } from '@/ai/flows/generate-alternatives-flow';
import AlternativeProductsDisplay from './AlternativeProductsDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Lightbulb, Loader2, Sparkles } from 'lucide-react';

interface AlternativeProductsLoaderProps {
  productName: string;
  productCategories?: string;
  productIngredients?: string;
  productType: 'food' | 'cosmetic' | 'unknown';
  currentHealthScore: number;
}

export default function AlternativeProductsLoader({
  productName,
  productCategories,
  productIngredients,
  productType,
  currentHealthScore,
}: AlternativeProductsLoaderProps) {
  const [alternativesData, setAlternativesData] = useState<GenerateAlternativesOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchAlternatives() {
      if (!isMounted) return;
      setLoading(true);
      setError(null);

      try {
        const input: GenerateAlternativesInput = {
          productName,
          productCategories,
          productIngredients,
          productType,
          currentHealthScore,
          reasonForAlternative: `Current product has a health score of ${currentHealthScore}/10.`,
        };
        const output = await generateAlternatives(input);
        if (isMounted) {
          setAlternativesData(output);
        }
      } catch (err) {
        console.error('Error generating alternatives:', err);
        if (isMounted) {
          setError('Failed to generate alternative suggestions. The AI assistant might be busy or an error occurred.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchAlternatives();
    
    return () => {
      isMounted = false;
    };
  }, [productName, productCategories, productIngredients, productType, currentHealthScore]);

  if (loading) {
    return (
      <div className="mt-10 pt-8 border-t border-border/50">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center mb-8 text-foreground">
          <Loader2 className="mr-3.5 h-8 w-8 text-accent animate-spin" />
          Finding Better Options...
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="rounded-xl border bg-card text-card-foreground shadow-lg overflow-hidden p-5 space-y-4">
              <Skeleton className="h-8 w-3/4 rounded-md bg-muted/70" />
              <Skeleton className="h-4 w-full rounded-md bg-muted/60" />
              <Skeleton className="h-4 w-5/6 rounded-md bg-muted/60" />
              <Skeleton className="h-10 w-full mt-2 rounded-lg bg-muted/70" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-6 shadow-md">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>Suggestion Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!alternativesData || !alternativesData.alternatives) {
     return (
      <Alert variant="default" className="my-6 shadow-sm border-dashed">
        <Lightbulb className="h-5 w-5 text-accent" />
        <AlertTitle>No Alternatives Generated</AlertTitle>
        <AlertDescription>
          The AI could not generate alternative suggestions for this product at this time.
        </AlertDescription>
      </Alert>
    );
  }

  return <AlternativeProductsDisplay alternatives={alternativesData.alternatives} />;
}
