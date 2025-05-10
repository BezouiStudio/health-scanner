'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Leaf, MinusCircle, AlertTriangle, ShieldAlert, HelpCircle, Sparkles, AlertCircle } from 'lucide-react';
import { analyzeIngredients, type AnalyzeIngredientsInput, type AnalyzeIngredientsOutput } from '@/ai/flows/analyze-ingredients-flow';
import type { AnalyzedIngredient } from '@/lib/types';

interface IngredientsListProps {
  ingredients: string;
  productType?: 'food' | 'cosmetic' | 'unknown';
}

// Helper function to strip HTML tags
function stripHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Fallback for server-side rendering or environments where DOMParser is not available
    return html.replace(/<[^>]*>?/gm, '');
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
}

function SkeletonBadge() {
  return <Skeleton className="h-8 w-24 rounded-full" />;
}

export default function IngredientsList({ ingredients, productType = 'unknown' }: IngredientsListProps) {
  const [individualIngredients, setIndividualIngredients] = useState<string[]>([]);
  const [analyzedIngredients, setAnalyzedIngredients] = useState<AnalyzedIngredient[] | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    if (!ingredients || ingredients.trim() === "") {
      setIndividualIngredients([]);
      return;
    }
    const cleanedIngredientsText = stripHtml(ingredients);
    const parsedIngredients = cleanedIngredientsText
      .replace(/_/g, ' ')
      .replace(/\s*\[[^\]]*\]\s*/g, '')
      .split(/[,;](?!\s*\d)|\.$/)
      .map(ingredient => ingredient.trim().replace(/\.$/, '').trim())
      .filter(ingredient => ingredient.length > 1 && !/^\d+(\.\d+)?\s*%$/.test(ingredient))
      .map(ingredient => 
        ingredient
            .toLowerCase()
            .split(/(\s|-)/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('')
      )
      .filter((value, index, self) => self.indexOf(value) === index && value.toLowerCase() !== "ingredients" && value.toLowerCase() !== "contains");
    
    setIndividualIngredients(parsedIngredients);
  }, [ingredients]);

  useEffect(() => {
    if (individualIngredients.length === 0) {
      setAnalyzedIngredients(null); // Clear analysis if no ingredients
      return;
    }

    const fetchAnalysis = async () => {
      setIsLoadingAnalysis(true);
      setAnalysisError(null);
      try {
        const input: AnalyzeIngredientsInput = { ingredients: individualIngredients, productContext: productType };
        const result: AnalyzeIngredientsOutput = await analyzeIngredients(input);
        setAnalyzedIngredients(result.analyzedIngredients);
      } catch (error) {
        console.error("Error analyzing ingredients:", error);
        setAnalysisError("Failed to analyze ingredients. Please try again later.");
        // Fallback to unknown for all ingredients on error
        setAnalyzedIngredients(individualIngredients.map(name => ({
          ingredientName: name,
          category: 'unknown',
          reasoning: 'Analysis failed for this ingredient.'
        })));
      } finally {
        setIsLoadingAnalysis(false);
      }
    };

    fetchAnalysis();
  }, [individualIngredients, productType]);

  if (!ingredients || ingredients.trim() === "") {
    return (
      <Card className="bg-muted/30 shadow-inner border-dashed">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            No ingredients information available for this product.
          </p>        
        </CardContent>
      </Card>
    );
  }
  
  if (individualIngredients.length === 0 && !isLoadingAnalysis) {
     return (
      <Card className="bg-muted/30 shadow-inner border-dashed">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            Ingredients information could not be parsed or is not available in a recognizable format.
          </p>
        </CardContent>
      </Card>
    );
  }


  const getIngredientVisuals = (category: AnalyzedIngredient['category']): { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: React.ReactNode, colorClass: string } => {
    switch (category) {
      case 'beneficial':
        return { variant: 'default', icon: <Leaf className="h-3.5 w-3.5 mr-1.5" />, colorClass: 'text-primary-foreground' }; // Uses primary theme color
      case 'neutral':
        return { variant: 'secondary', icon: <MinusCircle className="h-3.5 w-3.5 mr-1.5" />, colorClass: 'text-secondary-foreground' };
      case 'caution':
        return { variant: 'outline', icon: <AlertTriangle className="h-3.5 w-3.5 mr-1.5 text-yellow-600 dark:text-yellow-500" />, colorClass: 'text-yellow-700 dark:text-yellow-400 border-yellow-500/50 hover:border-yellow-500' };
      case 'avoid':
        return { variant: 'destructive', icon: <ShieldAlert className="h-3.5 w-3.5 mr-1.5" />, colorClass: 'text-destructive-foreground' };
      case 'unknown':
      default:
        return { variant: 'outline', icon: <HelpCircle className="h-3.5 w-3.5 mr-1.5" />, colorClass: 'text-muted-foreground border-muted-foreground/30 hover:border-muted-foreground/70' };
    }
  };
  
  return (
    <TooltipProvider delayDuration={100}>
      <Card className="bg-card shadow-md border border-border/50 rounded-lg">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-primary" />
            Ingredient Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {analysisError && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center">
              <AlertCircle className="h-5 w-5 mr-2"/> {analysisError}
            </div>
          )}
          <div className="flex flex-wrap gap-2.5">
            {isLoadingAnalysis && individualIngredients.length > 0 &&
              individualIngredients.map((_, index) => <SkeletonBadge key={`skel-${index}`} />)
            }
            {!isLoadingAnalysis && analyzedIngredients && analyzedIngredients.map((analyzedIng, index) => {
              if (!analyzedIng) return null; // Should not happen with current logic but good for safety
              const visuals = getIngredientVisuals(analyzedIng.category);
              const badgeContent = (
                <Badge 
                  key={`${analyzedIng.ingredientName}-${index}`}
                  variant={visuals.variant} 
                  className={`text-xs sm:text-sm font-medium px-3 py-1.5 shadow-sm rounded-full flex items-center transition-all hover:shadow-md ${visuals.colorClass} ${visuals.variant === 'outline' ? 'border' : ''}`}
                >
                  {visuals.icon}
                  {analyzedIng.ingredientName}
                </Badge>
              );

              if (analyzedIng.reasoning && (analyzedIng.category === 'caution' || analyzedIng.category === 'avoid' || analyzedIng.category === 'beneficial' || analyzedIng.category === 'unknown')) {
                return (
                  <Tooltip key={`tooltip-${analyzedIng.ingredientName}-${index}`}>
                    <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
                    <TooltipContent className="max-w-xs text-sm" side="top">
                      <p className="font-semibold capitalize">{analyzedIng.category}</p>
                      <p>{analyzedIng.reasoning}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }
              return badgeContent;
            })}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
