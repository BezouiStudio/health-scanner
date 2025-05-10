
'use client';

import React, { useEffect, useState } from 'react';
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
  return <Skeleton className="h-8 w-24 rounded-full bg-muted/50" />;
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
            .split(/(\s+|-)/) 
            .map((word) => {
              if (word === '-' || word.match(/^\s+$/)) return word; 
              return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join('')
      )
      .filter((value, index, self) => self.indexOf(value) === index && value.toLowerCase() !== "ingredients" && value.toLowerCase() !== "contains" && value.toLowerCase() !== "traces of");
    
    setIndividualIngredients(parsedIngredients);
  }, [ingredients]);

  useEffect(() => {
    if (individualIngredients.length === 0) {
      setAnalyzedIngredients(null); 
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
        setAnalysisError("Failed to analyze ingredients. The AI assistant might be unavailable.");
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
      <Card className="bg-card shadow-lg border border-border/50 rounded-xl">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground text-center">
            No ingredients information provided for this product.
          </p>        
        </CardContent>
      </Card>
    );
  }
  
  if (individualIngredients.length === 0 && !isLoadingAnalysis) {
     return (
      <Card className="bg-card shadow-lg border border-border/50 rounded-xl">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground text-center">
            Ingredients could not be parsed or are not available in a standard format.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getIngredientVisuals = (category: AnalyzedIngredient['category']): { 
    variant: 'default' | 'secondary' | 'destructive' | 'outline', 
    icon: React.ReactNode, 
    colorClass: string, 
    badgeClass?: string,
    textColorClass?: string,
    borderColorClass?: string,
    tooltipHeaderClass?: string,
  } => {
    switch (category) {
      case 'beneficial':
        return { 
            variant: 'default', 
            icon: <Leaf className="h-3.5 w-3.5" />, 
            colorClass: 'text-green-600 dark:text-green-400', 
            badgeClass: 'bg-green-500/10 hover:bg-green-500/20',
            textColorClass: 'text-green-700 dark:text-green-300',
            borderColorClass: 'border-green-500/40',
            tooltipHeaderClass: 'text-green-600 dark:text-green-400'
        };
      case 'neutral':
        return { 
            variant: 'secondary', 
            icon: <MinusCircle className="h-3.5 w-3.5" />, 
            colorClass: 'text-slate-600 dark:text-slate-400',
            badgeClass: 'bg-slate-500/10 hover:bg-slate-500/20',
            textColorClass: 'text-slate-700 dark:text-slate-300',
            borderColorClass: 'border-slate-500/40',
            tooltipHeaderClass: 'text-slate-600 dark:text-slate-400'
        };
      case 'caution':
        return { 
            variant: 'outline', 
            icon: <AlertTriangle className="h-3.5 w-3.5" />, 
            colorClass: 'text-yellow-600 dark:text-yellow-400',
            badgeClass: 'bg-yellow-500/10 hover:bg-yellow-500/20',
            textColorClass: 'text-yellow-700 dark:text-yellow-300',
            borderColorClass: 'border-yellow-500/40',
            tooltipHeaderClass: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'avoid':
        return { 
            variant: 'destructive', 
            icon: <ShieldAlert className="h-3.5 w-3.5" />, 
            colorClass: 'text-red-600 dark:text-red-400',
            badgeClass: 'bg-red-500/10 hover:bg-red-500/20',
            textColorClass: 'text-red-700 dark:text-red-300',
            borderColorClass: 'border-red-500/40',
            tooltipHeaderClass: 'text-red-600 dark:text-red-400'
        };
      case 'unknown':
      default:
        return { 
            variant: 'outline', 
            icon: <HelpCircle className="h-3.5 w-3.5" />, 
            colorClass: 'text-gray-500 dark:text-gray-400',
            badgeClass: 'bg-gray-500/10 hover:bg-gray-500/20',
            textColorClass: 'text-gray-700 dark:text-gray-300',
            borderColorClass: 'border-gray-500/30',
            tooltipHeaderClass: 'text-gray-500 dark:text-gray-400'
        };
    }
  };
  
  return (
    <TooltipProvider delayDuration={100}>
      <Card className="bg-card shadow-xl border border-border/60 rounded-xl">
        <CardHeader className="pb-4 pt-6 px-5 sm:px-6">
          <CardTitle className="text-xl md:text-2xl font-semibold flex items-center text-foreground">
            <Sparkles className="w-6 h-6 mr-3 text-primary" />
            Ingredient Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          {analysisError && (
            <div className="mb-4 p-3.5 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center shadow border border-destructive/30">
              <AlertCircle className="h-5 w-5 mr-2.5 shrink-0"/> {analysisError}
            </div>
          )}
          <div className="flex flex-wrap gap-2.5">
            {isLoadingAnalysis && individualIngredients.length > 0 &&
              individualIngredients.map((_, index) => <SkeletonBadge key={`skel-${index}`} />)
            }
            {!isLoadingAnalysis && analyzedIngredients && analyzedIngredients.map((analyzedIng, index) => {
              if (!analyzedIng) return null; 
              const visuals = getIngredientVisuals(analyzedIng.category);
              const badgeIcon = React.cloneElement(visuals.icon as React.ReactElement, { 
                className: cn('h-3.5 w-3.5 mr-1.5 shrink-0', visuals.textColorClass)
              });

              const badgeContent = (
                <Badge 
                  key={`${analyzedIng.ingredientName}-${index}`}
                  variant={'outline'} // Use outline for all, custom styling via classes
                  className={cn(
                    `text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-1.5 shadow-sm rounded-full flex items-center transition-all hover:shadow-md border`,
                    visuals.badgeClass,
                    visuals.textColorClass,
                    visuals.borderColorClass
                  )}
                >
                  {badgeIcon}
                  <span className="truncate max-w-[150px] sm:max-w-[200px]">{analyzedIng.ingredientName}</span>
                </Badge>
              );

              if (analyzedIng.reasoning && (analyzedIng.category === 'caution' || analyzedIng.category === 'avoid' || analyzedIng.category === 'beneficial' || analyzedIng.category === 'unknown')) {
                const tooltipIcon = React.cloneElement(visuals.icon as React.ReactElement, { 
                    className: cn('h-4 w-4 mr-1.5 shrink-0', visuals.tooltipHeaderClass)
                });
                return (
                  <Tooltip key={`tooltip-${analyzedIng.ingredientName}-${index}`}>
                    <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
                    <TooltipContent className="max-w-xs text-sm bg-popover text-popover-foreground p-3 rounded-lg shadow-xl border border-border" side="top">
                      <p className={cn("font-bold capitalize text-base mb-1.5 flex items-center", visuals.tooltipHeaderClass)}>
                        {tooltipIcon}
                        {analyzedIng.category}
                      </p>
                      <p className="text-xs text-muted-foreground">{analyzedIng.reasoning}</p>
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

