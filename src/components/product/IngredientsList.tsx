
'use client';

import React, { useEffect, useState } from 'react';
import { Badge, badgeVariants } from '@/components/ui/badge';
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

// Helper function to strip HTML tags - ensure it runs client-side or in environment with DOMParser
function stripHtml(html: string): string {
  if (typeof window === 'undefined' || typeof document === 'undefined' || typeof DOMParser === 'undefined') {
    // Fallback for server-side rendering or environments without DOMParser
    // This is a basic regex and might not cover all cases perfectly.
    return html.replace(/<[^>]*>?/gm, '');
  }
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  } catch (e) {
    // Fallback if DOMParser fails for some reason
    return html.replace(/<[^>]*>?/gm, '');
  }
}


function SkeletonBadge() {
  return <Skeleton className="h-9 w-28 rounded-full bg-muted/60" />;
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
        <CardContent className="p-6 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/70 mb-4" />
          <CardTitle className="text-lg font-semibold">No Ingredients Listed</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            This product does not have ingredients information available.
          </CardDescription>        
        </CardContent>
      </Card>
    );
  }
  
  if (individualIngredients.length === 0 && !isLoadingAnalysis) {
     return (
      <Card className="bg-card shadow-lg border border-border/50 rounded-xl">
        <CardContent className="p-6 text-center">
          <Info className="mx-auto h-12 w-12 text-muted-foreground/70 mb-4" />
           <CardTitle className="text-lg font-semibold">Parsing Issue</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            Ingredients could not be parsed or are not in a standard format.
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
            badgeClass: 'bg-green-500/15 border-green-500/40 hover:bg-green-500/25 dark:bg-green-400/20 dark:border-green-400/50 dark:hover:bg-green-400/30',
            textColorClass: 'text-green-700 dark:text-green-300',
            tooltipHeaderClass: 'text-green-600 dark:text-green-400',
            variant: null, // Custom styling applied
        };
      case 'neutral':
        return { 
            icon: <MinusCircle />, 
            badgeClass: 'bg-slate-500/15 border-slate-500/40 hover:bg-slate-500/25 dark:bg-slate-400/20 dark:border-slate-400/50 dark:hover:bg-slate-400/30',
            textColorClass: 'text-slate-700 dark:text-slate-300',
            tooltipHeaderClass: 'text-slate-600 dark:text-slate-400',
            variant: 'secondary',
        };
      case 'caution':
        return { 
            icon: <AlertTriangle />, 
            badgeClass: 'bg-amber-500/15 border-amber-500/40 hover:bg-amber-500/25 dark:bg-amber-400/20 dark:border-amber-400/50 dark:hover:bg-amber-400/30',
            textColorClass: 'text-amber-700 dark:text-amber-300',
            tooltipHeaderClass: 'text-amber-600 dark:text-amber-400',
            variant: null, // Custom styling applied
        };
      case 'avoid':
        return { 
            icon: <Ban />, 
            badgeClass: 'bg-red-500/15 border-red-500/40 hover:bg-red-500/25 dark:bg-red-400/20 dark:border-red-400/50 dark:hover:bg-red-400/30',
            textColorClass: 'text-red-700 dark:text-red-300',
            tooltipHeaderClass: 'text-red-600 dark:text-red-400',
            variant: 'destructive',
        };
      case 'unknown':
      default:
        return { 
            icon: <HelpCircle />, 
            badgeClass: 'bg-gray-500/15 border-gray-500/40 hover:bg-gray-500/25 dark:bg-gray-400/20 dark:border-gray-400/50 dark:hover:bg-gray-400/30',
            textColorClass: 'text-gray-700 dark:text-gray-400',
            tooltipHeaderClass: 'text-gray-500 dark:text-gray-400',
            variant: 'outline',
        };
    }
  };
  
  return (
    <TooltipProvider delayDuration={isMobile ? 50 : 100}>
      <Card className="bg-card shadow-xl border border-border/60 rounded-xl">
        <CardHeader className="pb-4 pt-6 px-5 sm:px-6">
          <CardTitle className="text-xl md:text-2xl font-semibold flex items-center text-foreground">
            <Sparkles className="w-7 h-7 mr-3 text-primary" />
            Ingredient Analysis
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {isMobile ? 'Tap' : 'Hover over'} an ingredient for details. AI-powered insights.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          {analysisError && (
            <div className="mb-4 p-3.5 rounded-lg bg-destructive/10 text-destructive-foreground text-sm flex items-center shadow border border-destructive/30">
              <AlertCircle className="h-5 w-5 mr-2.5 shrink-0 text-destructive"/> {analysisError}
            </div>
          )}
          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            {isLoadingAnalysis && individualIngredients.length > 0 &&
              individualIngredients.map((_, index) => <SkeletonBadge key={`skel-${index}`} />)
            }
            {!isLoadingAnalysis && analyzedIngredients && analyzedIngredients.map((analyzedIng, index) => {
              if (!analyzedIng) return null; 
              const visuals = getIngredientVisuals(analyzedIng.category);
              const badgeIcon = React.cloneElement(visuals.icon as React.ReactElement, { 
                className: cn('h-4 w-4 mr-1.5 shrink-0', visuals.textColorClass)
              });

              const badgeInnerContent = (
                <>
                  {badgeIcon}
                  <span className={cn("truncate font-medium", 
                     visuals.textColorClass,
                    "max-w-[100px] xs:max-w-[120px] sm:max-w-[140px] md:max-w-[110px] lg:max-w-[130px] xl:max-w-[160px]" 
                  )}>
                    {analyzedIng.ingredientName}
                  </span>
                </>
              );
              
              const currentKey = `ingredient-${analyzedIng.ingredientName}-${index}`;
              const commonBadgeProps = {
                key: currentKey, // Pass key directly here
                variant: visuals.variant || 'outline' as const, 
                className: cn(
                  `text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 sm:py-1.5 shadow-sm rounded-full flex items-center transition-all hover:shadow-md border cursor-pointer focus:ring-2 focus:ring-ring focus:ring-offset-1`,
                   visuals.badgeClass, // This will handle bg, border, hover bg
                   visuals.textColorClass // Ensure text color is applied correctly
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
                  <p className="text-xs text-muted-foreground leading-relaxed">{analyzedIng.reasoning}</p>
                  {analyzedIng.ingredientName.length > 18 && // Show full name if truncated
                    <p className="text-xs text-muted-foreground mt-1.5 italic">Full name: {analyzedIng.ingredientName}</p>
                  }
                </>
              );
              
              const hasReasoning = analyzedIng.reasoning && (analyzedIng.category === 'caution' || analyzedIng.category === 'avoid' || analyzedIng.category === 'beneficial' || analyzedIng.category === 'unknown');

              if (isMobile && hasReasoning) {
                return (
                  <Dialog key={`dialog-${currentKey}`}>
                    <DialogTrigger asChild>
                       <Badge {...commonBadgeProps}>
                        {badgeInnerContent}
                         <ChevronRight className={cn("h-4 w-4 ml-1 sm:ml-1.5 shrink-0 opacity-70", visuals.textColorClass)} />
                      </Badge>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-lg p-5">
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
                  <Tooltip key={`tooltip-${currentKey}`}>
                    <TooltipTrigger asChild>
                      <Badge {...commonBadgeProps} tabIndex={0}>
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
                <Badge {...commonBadgeProps}>
                  {badgeInnerContent}
                </Badge>
              );
            })}
            {!isLoadingAnalysis && analyzedIngredients?.length === 0 && individualIngredients.length > 0 && (
                <p className="text-sm text-muted-foreground w-full p-4 bg-secondary/50 rounded-md text-center">No specific AI analysis available for these ingredients.</p>
            )}
          </div>
           {!isLoadingAnalysis && !analysisError && (
            <div className="mt-6 p-4 bg-secondary/40 border border-dashed border-border/60 rounded-lg text-xs text-muted-foreground">
              <Info className="inline-block h-4 w-4 mr-1.5 text-accent align-text-bottom" />
              Ingredient analysis is AI-generated and for informational purposes. Classifications are based on general knowledge and typical product contexts. For specific health concerns or allergies, consult a professional.
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

