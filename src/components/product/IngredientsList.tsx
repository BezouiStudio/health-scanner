
'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Leaf, MinusCircle, AlertTriangle, ShieldAlert, HelpCircle, Sparkles, AlertCircle, Info } from 'lucide-react';
import { analyzeIngredients, type AnalyzeIngredientsInput, type AnalyzeIngredientsOutput } from '@/ai/flows/analyze-ingredients-flow';
import type { AnalyzedIngredient } from '@/lib/types';
import { cn } from '@/lib/utils';

interface IngredientsListProps {
  ingredients: string;
  productType?: 'food' | 'cosmetic' | 'unknown';
}

// Helper function to strip HTML tags
function stripHtml(html: string): string {
  if (typeof window === 'undefined' || typeof document === 'undefined' || typeof DOMParser === 'undefined') {
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


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
    icon: React.ReactNode, 
    badgeClass: string,
    colorClass: string,
    variant: 'default' | 'secondary' | 'destructive' | 'outline',
    textColorClass: string,
    borderColorClass: string,
    tooltipHeaderClass: string,
  } => {
    switch (category) {
      case 'beneficial':
        return { 
            icon: <Leaf />, 
            badgeClass: 'bg-green-100 dark:bg-green-900/50 border-green-400 dark:border-green-600 hover:bg-green-200 dark:hover:bg-green-800/60',
            colorClass: 'text-green-700 dark:text-green-300',
            variant: 'outline',
            textColorClass: 'text-green-700 dark:text-green-300',
            borderColorClass: 'border-green-500/40 dark:border-green-500/60',
            tooltipHeaderClass: 'text-green-600 dark:text-green-400'
        };
      case 'neutral':
        return { 
            icon: <MinusCircle />, 
            badgeClass: 'bg-slate-100 dark:bg-slate-700/50 border-slate-400 dark:border-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600/60',
            colorClass: 'text-slate-700 dark:text-slate-300',
            variant: 'outline',
            textColorClass: 'text-slate-700 dark:text-slate-300',
            borderColorClass: 'border-slate-500/40 dark:border-slate-500/50',
            tooltipHeaderClass: 'text-slate-600 dark:text-slate-400'
        };
      case 'caution':
        return { 
            icon: <AlertTriangle />, 
            badgeClass: 'bg-yellow-100 dark:bg-yellow-700/40 border-yellow-500 dark:border-yellow-600 hover:bg-yellow-200 dark:hover:bg-yellow-600/50',
            colorClass: 'text-yellow-700 dark:text-yellow-400',
            variant: 'outline',
            textColorClass: 'text-yellow-700 dark:text-yellow-400',
            borderColorClass: 'border-yellow-500/40 dark:border-yellow-500/60',
            tooltipHeaderClass: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'avoid':
        return { 
            icon: <ShieldAlert />, 
            badgeClass: 'bg-red-100 dark:bg-red-900/50 border-red-500 dark:border-red-600 hover:bg-red-200 dark:hover:bg-red-800/60',
            colorClass: 'text-red-700 dark:text-red-300',
            variant: 'outline',
            textColorClass: 'text-red-700 dark:text-red-300',
            borderColorClass: 'border-red-500/40 dark:border-red-500/60',
            tooltipHeaderClass: 'text-red-600 dark:text-red-400'
        };
      case 'unknown':
      default:
        return { 
            icon: <HelpCircle />, 
            badgeClass: 'bg-gray-100 dark:bg-gray-700/50 border-gray-400 dark:border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600/60',
            colorClass: 'text-gray-700 dark:text-gray-400',
            variant: 'outline',
            textColorClass: 'text-gray-700 dark:text-gray-400',
            borderColorClass: 'border-gray-500/30 dark:border-gray-500/50',
            tooltipHeaderClass: 'text-gray-500 dark:text-gray-400'
        };
    }
  };
  
  return (
    <TooltipProvider delayDuration={isMobile ? 50 : 0}>
      <Card className="bg-card shadow-xl border border-border/60 rounded-xl">
        <CardHeader className="pb-4 pt-6 px-5 sm:px-6">
          <CardTitle className="text-xl md:text-2xl font-semibold flex items-center text-foreground">
            <Sparkles className="w-6 h-6 mr-3 text-primary animate-pulse" />
            Ingredient Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          {analysisError && (
            <div className="mb-4 p-3.5 rounded-lg bg-destructive/10 text-destructive-foreground text-sm flex items-center shadow border border-destructive/30">
              <AlertCircle className="h-5 w-5 mr-2.5 shrink-0 text-destructive"/> {analysisError}
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
                className: cn('h-3.5 w-3.5 mr-1.5 shrink-0', visuals.colorClass)
              });

              const badgeInnerContent = (
                <>
                  {badgeIcon}
                  <span className={cn("truncate", 
                    "max-w-[100px] xs:max-w-[120px] sm:max-w-[150px] md:max-w-[120px] lg:max-w-[150px] xl:max-w-[180px]" 
                  )}>
                    {analyzedIng.ingredientName}
                  </span>
                </>
              );
              
              const currentKey = `${analyzedIng.ingredientName}-${index}`;
              const commonBadgeProps = {
                variant: visuals.variant,
                className: cn(
                  `text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 sm:py-1.5 shadow-sm rounded-full flex items-center transition-all hover:shadow-md border cursor-pointer focus:ring-2 focus:ring-ring focus:ring-offset-1`,
                   visuals.colorClass, 
                   visuals.badgeClass
                ),
              };

              const tooltipIcon = React.cloneElement(visuals.icon as React.ReactElement, { 
                  className: cn('h-4 w-4 mr-1.5 shrink-0', visuals.tooltipHeaderClass)
              });

              const tooltipOrDialogContent = (
                <>
                  <div className={cn("font-semibold capitalize text-base mb-1.5 flex items-center", visuals.tooltipHeaderClass)}>
                     {tooltipIcon}
                    {analyzedIng.category}
                  </div>
                  <p className="text-xs text-muted-foreground">{analyzedIng.reasoning}</p>
                  {analyzedIng.ingredientName.length > 25 && 
                    <p className="text-xs text-muted-foreground mt-1 italic">Full: {analyzedIng.ingredientName}</p>
                  }
                </>
              );
              
              const hasReasoning = analyzedIng.reasoning && (analyzedIng.category === 'caution' || analyzedIng.category === 'avoid' || analyzedIng.category === 'beneficial' || analyzedIng.category === 'unknown');

              if (isMobile && hasReasoning) {
                return (
                  <Dialog key={`dialog-${currentKey}`}>
                    <DialogTrigger asChild>
                       <Badge key={currentKey} {...commonBadgeProps}>
                        {badgeInnerContent}
                      </Badge>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className={cn("capitalize flex items-center", visuals.tooltipHeaderClass)}>
                           {React.cloneElement(visuals.icon as React.ReactElement, { className: `h-5 w-5 mr-2 shrink-0 ${visuals.tooltipHeaderClass}`})}
                           {analyzedIng.ingredientName}
                        </DialogTitle>
                      </DialogHeader>
                      <DialogDescription asChild>
                        <div>{tooltipOrDialogContent}</div>
                      </DialogDescription>
                    </DialogContent>
                  </Dialog>
                );
              }


              if (hasReasoning) {
                return (
                  <Tooltip key={`tooltip-${currentKey}`}>
                    <TooltipTrigger asChild>
                      <Badge key={currentKey} {...commonBadgeProps} tabIndex={0}>
                        {badgeInnerContent}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent 
                        className="max-w-xs text-sm bg-popover text-popover-foreground p-3 rounded-lg shadow-xl border border-border" 
                        side="top" 
                        align="center"
                    >
                      {tooltipOrDialogContent}
                    </TooltipContent>
                  </Tooltip>
                );
              }
              return (
                <Badge key={currentKey} {...commonBadgeProps}>
                  {badgeInnerContent}
                </Badge>
              );
            })}
            {!isLoadingAnalysis && analyzedIngredients?.length === 0 && individualIngredients.length > 0 && (
                <p className="text-sm text-muted-foreground w-full">No specific analysis available for these ingredients from the AI.</p>
            )}
          </div>
           {!isLoadingAnalysis && !analysisError && (
            <div className="mt-6 p-4 bg-secondary/50 border border-dashed border-border rounded-lg text-xs text-muted-foreground">
              <Info className="inline-block h-4 w-4 mr-1.5 text-accent align-text-bottom" />
              Ingredient analysis is AI-generated and for informational purposes. Classifications are based on general knowledge and typical product contexts. For specific health concerns or allergies, consult a professional.
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

