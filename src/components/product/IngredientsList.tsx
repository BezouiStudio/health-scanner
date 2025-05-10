
'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Leaf, MinusCircle, AlertTriangle, ShieldAlert, HelpCircle, Sparkles, AlertCircle, Info, ChevronRight, CheckCircle, Ban, Package } from 'lucide-react';
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
    // Fallback for server-side rendering or environments without DOMParser
    // Basic regex approach, less robust but avoids DOMParser errors on server.
    const tagRegex = /<[^>]*>?/gm;
    const spaceRegex = /\s+/g;
    return html.replace(tagRegex, '').replace(spaceRegex, ' ').trim();
  }
  try {
    // This will only run on the client-side
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return (doc.body.textContent || "").replace(/\s+/g, ' ').trim();
  } catch (e) {
    // Fallback if DOMParser fails for some reason, though unlikely on client.
    const tagRegex = /<[^>]*>?/gm;
    const spaceRegex = /\s+/g;
    return html.replace(tagRegex, '').replace(spaceRegex, ' ').trim();
  }
}


function SkeletonBadge() {
  return <Skeleton className="h-9 w-28 rounded-full bg-muted/70 shadow-sm" />;
}

export default function IngredientsList({ ingredients, productType = 'unknown' }: IngredientsListProps) {
  const [individualIngredients, setIndividualIngredients] = useState<string[]>([]);
  const [analyzedIngredients, setAnalyzedIngredients] = useState<AnalyzedIngredient[] | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    if (typeof window !== 'undefined') {
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);


  useEffect(() => {
    if (!ingredients || ingredients.trim() === "") {
      setIndividualIngredients([]);
      return;
    }
    const cleanedIngredientsText = stripHtml(ingredients);
    const parsedIngredients = cleanedIngredientsText
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/\s*\[[^\]]*\]\s*/g, '') // Remove text in square brackets like [maltodextrin]
      .split(/[,;](?!\s*\d{1,3}(?:\.\d+)?%?)|(?<!e)\.(?!\d)|:|•/) // Split by common delimiters, avoid splitting e.g. E-numbers or percentages
      .map(ingredient => ingredient.replace(/\([^)]*\)/g, '').trim().replace(/\.$/, '').trim()) // Remove content in parentheses and trailing dots
      .filter(ingredient => ingredient.length > 1 && !/^\d+(\.\d+)?\s*%$/.test(ingredient) && ingredient.toLowerCase() !== 'ingredients') // Filter out short strings, percentages, and "ingredients"
      .map(ingredient => 
        ingredient
            .toLowerCase()
            // Capitalize first letter of each word, preserve hyphens and spaces
            .split(/(\s+|-)/) 
            .map((word) => {
              if (word === '-' || word.match(/^\s+$/)) return word; 
              return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join('')
      )
      // Remove duplicates and common non-ingredient terms
      .filter((value, index, self) => self.indexOf(value) === index && value.toLowerCase() !== "contains" && value.toLowerCase() !== "traces of" && value.toLowerCase() !== "may contain");
    
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
        
        // Ensure that all original ingredients have an entry
        const enrichedAnalyzedIngredients = individualIngredients.map(originalIngName => {
          const foundAnalysis = result.analyzedIngredients.find(
            ai => ai.ingredientName.toLowerCase() === originalIngName.toLowerCase()
          );
          if (foundAnalysis) {
            return foundAnalysis;
          }
          return {
            ingredientName: originalIngName,
            category: 'unknown' as const,
            reasoning: 'AI analysis did not provide details for this specific ingredient.'
          };
        });
        setAnalyzedIngredients(enrichedAnalyzedIngredients);

      } catch (error) {
        console.error("Error analyzing ingredients:", error);
        setAnalysisError("Failed to analyze ingredients. The AI assistant might be unavailable or an error occurred with the request.");
        // Fallback: mark all as unknown with error message
        setAnalyzedIngredients(individualIngredients.map(name => ({
          ingredientName: name,
          category: 'unknown',
          reasoning: 'Analysis failed for this ingredient due to a system error.'
        })));
      } finally {
        setIsLoadingAnalysis(false);
      }
    };

    fetchAnalysis();
  }, [individualIngredients, productType]);

  if (!ingredients || ingredients.trim() === "") {
    return (
      <Card className="bg-card shadow-lg border border-border/40 rounded-xl">
        <CardContent className="p-6 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/60 mb-4" />
          <CardTitle className="text-lg font-semibold text-foreground">No Ingredients Listed</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1.5">
            This product does not have ingredients information available in our database.
          </CardDescription>        
        </CardContent>
      </Card>
    );
  }
  
  if (individualIngredients.length === 0 && !isLoadingAnalysis) {
     return (
      <Card className="bg-card shadow-lg border border-border/40 rounded-xl">
        <CardContent className="p-6 text-center">
          <Info className="mx-auto h-12 w-12 text-muted-foreground/60 mb-4" />
           <CardTitle className="text-lg font-semibold text-foreground">Parsing Issue</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1.5">
            Ingredients could not be parsed, are not in a standard format, or none were provided.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

const getIngredientVisuals = (category: AnalyzedIngredient['category']): { 
    icon: React.ReactNode, 
    badgeClass: string, 
    textColorClass: string, 
    tooltipHeaderClass: string,
    variant: 'default' | 'secondary' | 'destructive' | 'outline' | null;
  } => {
    switch (category) {
      case 'beneficial':
        return { 
            icon: <CheckCircle />, 
            badgeClass: 'border-green-400/80 dark:border-green-500/70 bg-green-50 dark:bg-green-900/30 hover:bg-green-100/80 dark:hover:bg-green-800/40 focus:bg-green-100/90 dark:focus:bg-green-800/50',
            textColorClass: 'text-green-700 dark:text-green-300',
            tooltipHeaderClass: 'text-green-600 dark:text-green-400',
            variant: 'outline',
        };
      case 'neutral':
        return { 
            icon: <MinusCircle />, 
            badgeClass: 'border-slate-400/70 dark:border-slate-500/60 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100/80 dark:hover:bg-slate-700/40 focus:bg-slate-100/90 dark:focus:bg-slate-700/50',
            textColorClass: 'text-slate-600 dark:text-slate-400',
            tooltipHeaderClass: 'text-slate-500 dark:text-slate-300',
            variant: 'outline',
        };
      case 'caution':
        return { 
            icon: <AlertTriangle />, 
            badgeClass: 'border-amber-400/80 dark:border-amber-500/70 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100/80 dark:hover:bg-amber-800/40 focus:bg-amber-100/90 dark:focus:bg-amber-800/50',
            textColorClass: 'text-amber-700 dark:text-amber-400',
            tooltipHeaderClass: 'text-amber-600 dark:text-amber-300',
            variant: 'outline', 
        };
      case 'avoid':
        return { 
            icon: <Ban />, 
            badgeClass: 'border-red-400/80 dark:border-red-500/70 bg-red-50 dark:bg-red-900/30 hover:bg-red-100/80 dark:hover:bg-red-800/40 focus:bg-red-100/90 dark:focus:bg-red-800/50',
            textColorClass: 'text-red-700 dark:text-red-400',
            tooltipHeaderClass: 'text-red-600 dark:text-red-300',
            variant: 'outline',
        };
      case 'unknown':
      default:
        return { 
            icon: <HelpCircle />, 
            badgeClass: 'border-gray-400/70 dark:border-gray-500/60 bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100/80 dark:hover:bg-gray-700/40 focus:bg-gray-100/90 dark:focus:bg-gray-700/50',
            textColorClass: 'text-gray-600 dark:text-gray-400',
            tooltipHeaderClass: 'text-gray-500 dark:text-gray-300',
            variant: 'outline',
        };
    }
  };
  
  return (
    <TooltipProvider delayDuration={isMobile ? 50 : 150}>
      <Card className="bg-card shadow-xl border border-border/50 rounded-2xl overflow-hidden">
        <CardHeader className="pb-5 pt-7 px-5 sm:px-7 bg-gradient-to-br from-primary/5 via-background to-background border-b border-border/40">
          <CardTitle className="text-2xl md:text-3xl font-bold flex items-center text-foreground">
            <Sparkles className="w-8 h-8 mr-3.5 text-primary animate-pulse" />
            Ingredient Analysis
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground mt-1.5">
            {isMobile ? 'Tap' : 'Hover over'} an ingredient for AI-powered insights. Color codes indicate potential impact.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 sm:p-7 bg-background">
          {analysisError && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive-foreground text-sm flex items-start shadow-sm border border-destructive/30">
              <AlertCircle className="h-5 w-5 mr-3 mt-0.5 shrink-0 text-destructive"/> 
              <div>
                <p className="font-semibold">Analysis Error</p>
                <p>{analysisError}</p>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            {isLoadingAnalysis && individualIngredients.length > 0 &&
              Array.from({ length: Math.min(individualIngredients.length, 10) }).map((_, index) => <SkeletonBadge key={`skel-${index}`} />)
            }
            {!isLoadingAnalysis && analyzedIngredients && analyzedIngredients.map((analyzedIng, index) => {
              if (!analyzedIng) return null; 
              const visuals = getIngredientVisuals(analyzedIng.category);
              const currentKey = `ingredient-${analyzedIng.ingredientName}-${index}`;
              
              const baseIconElement = visuals.icon as React.ReactElement;

              const keyedIcon = React.cloneElement(baseIconElement, {
                key: `icon-${currentKey}`, 
                className: cn('h-4 w-4 mr-1.5 shrink-0', visuals.textColorClass)
              });

              const keyedSpan = (
                <span
                  key={`text-${currentKey}`}
                  className={cn(
                    "truncate font-medium",
                    visuals.textColorClass,
                    "max-w-[90px] xs:max-w-[100px] sm:max-w-[120px] md:max-w-[100px] lg:max-w-[120px] xl:max-w-[140px]" // Adjusted max-widths
                )}>
                  {analyzedIng.ingredientName}
                </span>
              );
              
              const badgeInnerContent = (
                <>
                  {keyedIcon}
                  {keyedSpan}
                </>
              );
              
              const commonBadgeProps = {
                variant: visuals.variant || 'outline' as const, 
                className: cn(
                  `text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-1.5 sm:py-2 shadow-sm rounded-full flex items-center transition-all hover:shadow-md border cursor-pointer focus:ring-2 focus:ring-ring focus:ring-offset-1 hover:brightness-110 dark:hover:brightness-125 focus:brightness-110 dark:focus:brightness-125`,
                   visuals.badgeClass, 
                   visuals.textColorClass
                ),
              };


              const tooltipIcon = React.cloneElement(visuals.icon as React.ReactElement, { 
                  className: cn('h-5 w-5 mr-1.5 shrink-0', visuals.tooltipHeaderClass)
              });

              const tooltipOrDialogContent = (
                <>
                  <div className={cn("font-semibold capitalize text-base mb-1 flex items-center", visuals.tooltipHeaderClass)}>
                     {tooltipIcon}
                    {analyzedIng.category}
                  </div>
                  <p className="text-xs text-popover-foreground/80 leading-relaxed">{analyzedIng.reasoning || "No specific reasoning provided by AI."}</p>
                  {analyzedIng.ingredientName.length > 15 &&  // Show full name if truncated
                    <p className="text-xs text-popover-foreground/70 mt-1.5 italic">Full name: {analyzedIng.ingredientName}</p>
                  }
                </>
              );
              
              const hasReasoning = analyzedIng.reasoning && (analyzedIng.category === 'caution' || analyzedIng.category === 'avoid' || analyzedIng.category === 'beneficial' || (analyzedIng.category === 'unknown' && analyzedIng.reasoning !== 'AI analysis did not provide details for this specific ingredient.') || (analyzedIng.category === 'neutral' && analyzedIng.reasoning.length > 10) );

              if (isMobile && hasReasoning) {
                return (
                  <Dialog key={`dialog-wrapper-${currentKey}`}>
                    <DialogTrigger asChild>
                       <Badge {...commonBadgeProps} key={currentKey}>
                        {badgeInnerContent}
                         <ChevronRight key="chevron-icon" className={cn("h-4 w-4 ml-1 sm:ml-1.5 shrink-0 opacity-70", visuals.textColorClass)} />
                      </Badge>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-lg p-5 bg-popover shadow-2xl border-border">
                      <DialogHeader className="mb-2">
                        <DialogTitle className={cn("text-lg flex items-center font-semibold", visuals.tooltipHeaderClass)}>
                           {React.cloneElement(visuals.icon as React.ReactElement, { className: `h-5 w-5 mr-2 shrink-0 ${visuals.tooltipHeaderClass}`})}
                           {analyzedIng.ingredientName}
                        </DialogTitle>
                      </DialogHeader>
                      <DialogDescription asChild>
                        <div className="text-sm">{tooltipOrDialogContent}</div>
                      </DialogDescription>
                    </DialogContent>
                  </Dialog>
                );
              }

              if (hasReasoning) {
                return (
                  <Tooltip key={`tooltip-wrapper-${currentKey}`}>
                    <TooltipTrigger asChild>
                      <Badge {...commonBadgeProps} key={currentKey} tabIndex={0}>
                        {badgeInnerContent}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent 
                        className="max-w-xs text-sm bg-popover text-popover-foreground p-3 rounded-lg shadow-xl border border-border/50" 
                        side="top" 
                        align="center"
                    >
                      {tooltipOrDialogContent}
                    </TooltipContent>
                  </Tooltip>
                );
              }
              return (
                <Badge {...commonBadgeProps} key={currentKey}>
                  {badgeInnerContent}
                </Badge>
              );
            })}
            {!isLoadingAnalysis && analyzedIngredients?.length === 0 && individualIngredients.length > 0 && (
                <p className="text-sm text-muted-foreground w-full p-4 bg-muted/30 rounded-md text-center shadow-sm border border-dashed border-border/40">No specific AI analysis available for these ingredients.</p>
            )}
          </div>
           {!isLoadingAnalysis && !analysisError && (
            <div className="mt-8 p-4 bg-muted/30 border border-dashed border-border/50 rounded-lg text-xs text-muted-foreground shadow-inner">
              <Info className="inline-block h-4 w-4 mr-1.5 text-accent align-text-bottom" />
              Ingredient analysis is AI-generated and for informational purposes. Classifications are based on general knowledge and typical product contexts. For specific health concerns or allergies, consult a professional.
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

