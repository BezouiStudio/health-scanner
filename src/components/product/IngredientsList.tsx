
'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Leaf, MinusCircle, AlertTriangle, ShieldAlert, HelpCircle, Sparkles, AlertCircle } from 'lucide-react';
import { analyzeIngredients, type AnalyzeIngredientsInput, type AnalyzeIngredientsOutput } from '@/ai/flows/analyze-ingredients-flow';
import type { AnalyzedIngredient } from '@/lib/types';
import { cn } from '@/lib/utils';

interface IngredientsListProps {
  ingredients: string;
  productType?: 'food' | 'cosmetic' | 'unknown';
}

// Helper function to strip HTML tags
function stripHtml(html: string): string {
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    // Fallback for server-side rendering or environments where DOMParser is not available
    // This regex is a basic attempt and might not cover all edge cases.
    return html.replace(/<[^>]*>?/gm, '');
  }
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  } catch (e) {
    // In case of parsing errors (e.g., in a very restricted environment)
    return html.replace(/<[^>]*>?/gm, '');
  }
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
      .replace(/\s*\[[^\]]*\]\s*/g, '') // Remove text in square brackets e.g. [Nano]
      .split(/[,;](?!\s*\d)|\.$/) // Split by comma, semicolon (not followed by number for e.g. E123), or period at end
      .map(ingredient => ingredient.trim().replace(/\.$/, '').trim()) // Trim whitespace and trailing periods
      .filter(ingredient => ingredient.length > 1 && !/^\d+(\.\d+)?\s*%$/.test(ingredient)) // Filter out percentages and very short strings
      .map(ingredient => 
        ingredient
            .toLowerCase()
            // Capitalize first letter of each word, also handling hyphens as word separators
            .split(/(\s+|-)/) // Split by space or hyphen, keeping the delimiter
            .map((word, index, arr) => {
              if (word === '-' || word.match(/^\s+$/)) return word; // Keep hyphens and spaces as is
              // Only capitalize if it's a word part
              return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join('')
      )
      // Remove duplicates and common non-ingredient terms
      .filter((value, index, self) => self.indexOf(value) === index && value.toLowerCase() !== "ingredients" && value.toLowerCase() !== "contains" && value.toLowerCase() !== "traces of");
    
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
      <Card className="bg-muted/30 shadow-inner border-dashed border-border/50">
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
      <Card className="bg-muted/30 shadow-inner border-dashed border-border/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            Ingredients information could not be parsed or is not available in a recognizable format.
          </p>
        </CardContent>
      </Card>
    );
  }


  const getIngredientVisuals = (category: AnalyzedIngredient['category']): { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: React.ReactNode, colorClass: string, badgeClass?: string } => {
    switch (category) {
      case 'beneficial':
        return { variant: 'default', icon: <Leaf className="h-3.5 w-3.5 mr-1.5 shrink-0" />, colorClass: 'text-primary-foreground', badgeClass: 'bg-green-500 hover:bg-green-600 border-green-600' };
      case 'neutral':
        return { variant: 'secondary', icon: <MinusCircle className="h-3.5 w-3.5 mr-1.5 shrink-0" />, colorClass: 'text-secondary-foreground', badgeClass: 'bg-slate-500 hover:bg-slate-600 border-slate-600 text-white' };
      case 'caution':
        return { variant: 'outline', icon: <AlertTriangle className="h-3.5 w-3.5 mr-1.5 text-yellow-600 dark:text-yellow-500 shrink-0" />, colorClass: 'text-yellow-700 dark:text-yellow-400 border-yellow-500/50 hover:border-yellow-500 hover:bg-yellow-500/10' };
      case 'avoid':
        return { variant: 'destructive', icon: <ShieldAlert className="h-3.5 w-3.5 mr-1.5 shrink-0" />, colorClass: 'text-destructive-foreground', badgeClass: 'bg-red-600 hover:bg-red-700 border-red-700' };
      case 'unknown':
      default:
        return { variant: 'outline', icon: <HelpCircle className="h-3.5 w-3.5 mr-1.5 shrink-0" />, colorClass: 'text-muted-foreground border-muted-foreground/30 hover:border-muted-foreground/70 hover:bg-muted/20' };
    }
  };
  
  return (
    <TooltipProvider delayDuration={100}>
      <Card className="bg-card shadow-xl border border-border/60 rounded-xl">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-xl font-semibold flex items-center text-foreground">
            <Sparkles className="w-5 h-5 mr-2.5 text-primary" />
            Ingredient Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          {analysisError && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center shadow">
              <AlertCircle className="h-5 w-5 mr-2 shrink-0"/> {analysisError}
            </div>
          )}
          <div className="flex flex-wrap gap-2.5">
            {isLoadingAnalysis && individualIngredients.length > 0 &&
              individualIngredients.map((_, index) => <SkeletonBadge key={`skel-${index}`} />)
            }
            {!isLoadingAnalysis && analyzedIngredients && analyzedIngredients.map((analyzedIng, index) => {
              if (!analyzedIng) return null; 
              const visuals = getIngredientVisuals(analyzedIng.category);
              const badgeContent = (
                <Badge 
                  key={`${analyzedIng.ingredientName}-${index}`}
                  variant={visuals.variant} 
                  className={cn(
                    `text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 sm:py-1.5 shadow-sm rounded-full flex items-center transition-all hover:shadow-md`,
                    visuals.colorClass,
                    visuals.badgeClass,
                    visuals.variant === 'outline' ? 'border' : 'border-transparent'
                  )}
                >
                  {visuals.icon}
                  <span className="truncate max-w-[150px] sm:max-w-[200px]">{analyzedIng.ingredientName}</span>
                </Badge>
              );

              if (analyzedIng.reasoning && (analyzedIng.category === 'caution' || analyzedIng.category === 'avoid' || analyzedIng.category === 'beneficial' || analyzedIng.category === 'unknown')) {
                return (
                  <Tooltip key={`tooltip-${analyzedIng.ingredientName}-${index}`}>
                    <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
                    <TooltipContent className="max-w-xs text-sm bg-popover text-popover-foreground p-3 rounded-lg shadow-xl border border-border" side="top">
                      <p className="font-bold capitalize text-base mb-1 flex items-center">
                        {React.cloneElement(visuals.icon as React.ReactElement, { className: `h-4 w-4 mr-1.5 shrink-0 ${visuals.colorClass?.includes('text-primary-foreground') || visuals.colorClass?.includes('text-destructive-foreground') || visuals.colorClass?.includes('text-white') ? 'text-inherit' : visuals.colorClass}`})}
                        {analyzedIng.category}
                      </p>
                      <p className="text-xs">{analyzedIng.reasoning}</p>
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

